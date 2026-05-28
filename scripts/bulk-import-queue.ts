#!/usr/bin/env tsx
/**
 * Bulk import all startups from the import queue into the database.
 * Skips duplicates by name (case-insensitive).
 * 
 * Run: npx tsx scripts/bulk-import-queue.ts
 */

import { db } from "@/lib/db";
import { startups, founders, startupSources, sources } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import fs from "fs";
import path from "path";

const QUEUE_PATH = path.join(process.cwd(), "data", "import-queue.json");

interface QueueItem {
  name: string;
  website?: string;
  description?: string;
  sector?: string;
  stage?: string;
  foundedYear?: number;
  accelerator?: string;
  contactEmail?: string;
  contactPhone?: string;
  contactLinkedin?: string;
  city?: string;
  _score?: number;
  _aiVerdict?: string;
  _source?: string;
  _province?: string;
  _codiceFiscale?: string;
  _ateco?: string;
  founders?: { name: string; title?: string }[];
  sourceId?: number;
}

async function main() {
  if (!fs.existsSync(QUEUE_PATH)) {
    console.error("❌ No import queue found at:", QUEUE_PATH);
    process.exit(1);
  }

  const raw = fs.readFileSync(QUEUE_PATH, "utf-8");
  const items: QueueItem[] = JSON.parse(raw);
  console.log(`📦 Import queue: ${items.length} items\n`);

  // Count existing startups in DB
  const existingInDb = await db.$count(startups);
  console.log(`🗄️  Existing in database: ${existingInDb}\n`);

  let imported = 0;
  let skipped = 0;
  let errors = 0;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (!item.name?.trim()) { skipped++; continue; }

    try {
      // Deduplicate by name
      const existing = await db.query.startups.findFirst({
        where: (s, { sql }) => sql`lower(${s.name}) = lower(${item.name.trim()})`,
      });
      if (existing) { skipped++; continue; }

      // Build description from ATECO if available
      const desc = item.description || (item._ateco ? `ATECO ${item._ateco}` : null);

      // Insert
      const [startup] = await db.insert(startups).values({
        name: item.name.trim(),
        website: item.website?.trim() || null,
        description: desc?.trim() || null,
        sector: item.sector?.trim() || null,
        stage: item.stage?.trim() || null,
        foundedYear: item.foundedYear || null,
        accelerator: item.accelerator?.trim() || null,
        contactEmail: item.contactEmail?.trim() || null,
        contactPhone: item.contactPhone?.trim() || null,
        contactLinkedin: item.contactLinkedin?.trim() || null,
        city: item.city || "Milan",
        status: "New",
        updatedAt: new Date(),
        // Scoring
        scoreRelevance: item._score || null,
      }).returning();

      // Founders
      if (item.founders?.length && startup) {
        for (const f of item.founders) {
          await db.insert(founders).values({
            startupId: startup.id,
            name: f.name,
            title: f.title || null,
          });
        }
      }

      // Source link
      if (item.sourceId && startup) {
        await db.insert(startupSources).values({
          startupId: startup.id,
          sourceId: item.sourceId,
        }).onConflictDoNothing();
      }

      imported++;

      // Progress every 500
      if (imported % 500 === 0) {
        console.log(`  ... ${imported} imported, ${skipped} skipped so far`);
      }
    } catch (err) {
      errors++;
      if (errors <= 5) {
        console.error(`  ❌ Error importing "${item.name}":`, err);
      }
    }
  }

  console.log(`\n✅ Import complete!`);
  console.log(`   Imported: ${imported}`);
  console.log(`   Skipped (duplicates): ${skipped}`);
  console.log(`   Errors: ${errors}`);

  // Clear the queue
  fs.unlinkSync(QUEUE_PATH);
  console.log(`   Queue cleared: ${QUEUE_PATH}`);

  // Final count
  const finalCount = await db.$count(startups);
  console.log(`   Total in database: ${finalCount}`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
