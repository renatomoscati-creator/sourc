#!/usr/bin/env tsx
/**
 * Remove all unverified startups from the database.
 * Keeps only AI-evaluated startups with PASS or MAYBE verdict.
 * Also keeps pre-existing startups that were NOT bulk-imported (status != "New" from scraping).
 * 
 * Run: npx tsx scripts/keep-verified-only.ts
 */

import { db } from "@/lib/db";
import { startups, startupSources } from "@/lib/db/schema";
import { eq, sql, inArray, like } from "drizzle-orm";
import fs from "fs";
import path from "path";

const AI_EVAL_FILE = path.join(
  process.cwd(),
  "Agent for Scraping and Sourcing/registry-data/ai-evaluations/ai_evaluated.json"
);

async function main() {
  // Load verified names
  const aiData = JSON.parse(fs.readFileSync(AI_EVAL_FILE, "utf-8")) as Array<{
    name: string;
    flag: string;
    vcScore: number;
    website?: string;
    verdict: string;
    accelerator?: string;
  }>;

  const verifiedNames = aiData
    .filter((d) => d.flag === "PASS" || d.flag === "MAYBE")
    .map((d) => d.name.toLowerCase().trim());

  // Deduplicate names
  const uniqueVerifiedNames = [...new Set(verifiedNames)];
  console.log(`✓ Verified startups (PASS + MAYBE): ${uniqueVerifiedNames.length}\n`);

  // Get all "New" startups (bulk-imported ones)
  const allNew = await db.query.startups.findMany({
    where: eq(startups.status, "New"),
    columns: { id: true, name: true },
  });

  console.log(`Total "New" startups in DB: ${allNew.length}`);

  // Find which ones to keep (verified)
  const toKeep: number[] = [];
  const toRemove: number[] = [];

  for (const s of allNew) {
    if (uniqueVerifiedNames.includes(s.name.toLowerCase().trim())) {
      toKeep.push(s.id);
    } else {
      toRemove.push(s.id);
    }
  }

  console.log(`  Verified (keeping): ${toKeep.length}`);
  console.log(`  Unverified (removing): ${toRemove.length}\n`);

  if (toRemove.length === 0) {
    console.log("Nothing to remove. All verified startups are already in the database.");
    return;
  }

  // Remove in batches of 500 (SQLite limit)
  const BATCH_SIZE = 500;
  let deleted = 0;

  for (let i = 0; i < toRemove.length; i += BATCH_SIZE) {
    const batch = toRemove.slice(i, i + BATCH_SIZE);
    const result = await db
      .delete(startups)
      .where(inArray(startups.id, batch));
    deleted += result.changes ?? batch.length;
    console.log(`  Deleted batch ${Math.floor(i / BATCH_SIZE) + 1}: ${batch.length} rows`);
  }

  // Update verified ones: set status to "New" and store verdict in accelerator field
  for (const item of aiData) {
    if (item.flag !== "PASS" && item.flag !== "MAYBE") continue;
    const name = item.name.toLowerCase().trim();

    const found = await db.query.startups.findFirst({
      where: (s, { sql }) => sql`lower(${s.name}) = ${name}`,
    });

    if (found) {
      await db
        .update(startups)
        .set({
          status: "New",
          scoreRelevance: item.vcScore,
          accelerator: `AI ${item.flag} · ${item.accelerator || "Registro 2025"}`,
          updatedAt: new Date(),
        })
        .where(eq(startups.id, found.id));
    }
  }

  console.log(`\n✅ Cleanup complete!`);
  console.log(`   Removed: ${deleted} unverified startups`);

  // Final count
  const finalCount = await db.$count(startups);
  const byStatus = await db
    .select({ status: startups.status, count: sql<number>`count(*)` })
    .from(startups)
    .groupBy(startups.status);

  console.log(`   Total in database: ${finalCount}`);
  console.log(`   By status:`);
  for (const row of byStatus) {
    console.log(`     ${row.status}: ${row.count}`);
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
