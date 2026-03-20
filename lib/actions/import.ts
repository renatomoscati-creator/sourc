"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { startups, founders, startupSources, sources } from "@/lib/db/schema";
import fs from "fs";
import path from "path";

export interface ImportedStartup {
  name: string;
  website?: string;
  description?: string;
  sector?: string;
  stage?: string;
  foundedYear?: number;
  accelerator?: string;
  founders?: { name: string; title?: string }[];
  sourceId?: number;
}

const QUEUE_PATH = path.join(process.cwd(), "data", "import-queue.json");

// Called from the web UI after user reviews and confirms
export async function confirmImport(items: ImportedStartup[]): Promise<{ imported: number; skipped: number }> {
  let imported = 0;
  let skipped = 0;

  for (const item of items) {
    if (!item.name?.trim()) { skipped++; continue; }

    // Deduplicate by name (case-insensitive)
    const existing = await db.query.startups.findFirst({
      where: (s, { sql }) => sql`lower(${s.name}) = lower(${item.name.trim()})`,
    });
    if (existing) { skipped++; continue; }

    const [startup] = await db.insert(startups).values({
      name: item.name.trim(),
      website: item.website?.trim() || null,
      description: item.description?.trim() || null,
      sector: item.sector?.trim() || null,
      stage: item.stage?.trim() || null,
      foundedYear: item.foundedYear || null,
      accelerator: item.accelerator?.trim() || null,
      city: "Milan",
      status: "New",
      updatedAt: new Date(),
    }).returning();

    if (item.founders?.length && startup) {
      for (const f of item.founders) {
        await db.insert(founders).values({
          startupId: startup.id,
          name: f.name,
          title: f.title || null,
        });
      }
    }

    if (item.sourceId && startup) {
      await db.insert(startupSources).values({
        startupId: startup.id,
        sourceId: item.sourceId,
      }).onConflictDoNothing();
    }

    imported++;
  }

  revalidatePath("/");
  revalidatePath("/startups");
  return { imported, skipped };
}

// Read queue written by Claude Code agent
export async function readImportQueue(): Promise<ImportedStartup[]> {
  if (!fs.existsSync(QUEUE_PATH)) return [];
  try {
    const raw = fs.readFileSync(QUEUE_PATH, "utf-8");
    return JSON.parse(raw) as ImportedStartup[];
  } catch {
    return [];
  }
}

// Clear queue after processing
export async function clearImportQueue(): Promise<void> {
  if (fs.existsSync(QUEUE_PATH)) {
    fs.unlinkSync(QUEUE_PATH);
  }
}
