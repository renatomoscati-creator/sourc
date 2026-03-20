"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { startups, founders, startupSources, sources } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
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
  contactEmail?: string;
  contactPhone?: string;
  contactLinkedin?: string;
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
      contactEmail: item.contactEmail?.trim() || null,
      contactPhone: item.contactPhone?.trim() || null,
      contactLinkedin: item.contactLinkedin?.trim() || null,
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

export interface StartupUpdate {
  startupName: string;
  startupId?: number;
  changes: {
    name?: string;
    website?: string;
    description?: string;
    sector?: string;
    stage?: string;
    foundedYear?: number;
    accelerator?: string;
    contactEmail?: string;
    contactPhone?: string;
    contactLinkedin?: string;
    problem?: string;
    product?: string;
    businessModel?: string;
    traction?: string;
    fundingStatus?: string;
  };
}

const UPDATE_QUEUE_PATH = path.join(process.cwd(), "data", "update-queue.json");

export async function readUpdateQueue(): Promise<StartupUpdate[]> {
  if (!fs.existsSync(UPDATE_QUEUE_PATH)) return [];
  try {
    const raw = fs.readFileSync(UPDATE_QUEUE_PATH, "utf-8");
    return JSON.parse(raw) as StartupUpdate[];
  } catch {
    return [];
  }
}

export async function clearUpdateQueue(): Promise<void> {
  if (fs.existsSync(UPDATE_QUEUE_PATH)) fs.unlinkSync(UPDATE_QUEUE_PATH);
}

export async function applyUpdate(update: StartupUpdate): Promise<{ success: boolean; error?: string }> {
  "use server";
  try {
    // Find startup by id or name
    let existing;
    if (update.startupId) {
      existing = await db.query.startups.findFirst({
        where: (s, { eq }) => eq(s.id, update.startupId!),
      });
    } else {
      existing = await db.query.startups.findFirst({
        where: (s, { sql }) => sql`lower(${s.name}) = lower(${update.startupName})`,
      });
    }
    if (!existing) return { success: false, error: `Startup "${update.startupName}" not found` };

    await db.update(startups)
      .set({ ...update.changes, updatedAt: new Date() })
      .where(eq(startups.id, existing.id));

    revalidatePath("/");
    revalidatePath("/startups");
    revalidatePath(`/startups/${existing.id}`);
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}
