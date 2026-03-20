"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { startups, startupSources } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

type ScoringData = {
  scoreRelevance?: number | null;
  scoreStageFit?: number | null;
  scoreSourceQuality?: number | null;
  scoreTeamQuality?: number | null;
  scoreProblemAttractiveness?: number | null;
  scoreProductClarity?: number | null;
  scoreTractionQuality?: number | null;
  scoreMarketPotential?: number | null;
  scoreFounderResponsiveness?: number | null;
  scoreOverallConviction?: number | null;
};

function calcPriorityScore(data: ScoringData): number | null {
  const values = [
    data.scoreRelevance,
    data.scoreStageFit,
    data.scoreSourceQuality,
    data.scoreTeamQuality,
    data.scoreProblemAttractiveness,
    data.scoreProductClarity,
    data.scoreTractionQuality,
    data.scoreMarketPotential,
    data.scoreFounderResponsiveness,
    data.scoreOverallConviction,
  ].filter((v): v is number => v != null);
  if (values.length === 0) return null;
  return Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10;
}

export async function createStartup(formData: FormData) {
  const name = formData.get("name") as string;
  const website = formData.get("website") as string | null;
  const city = (formData.get("city") as string) || "Milan";
  const stage = formData.get("stage") as string | null;
  const sector = formData.get("sector") as string | null;
  const description = formData.get("description") as string | null;
  const accelerator = formData.get("accelerator") as string | null;
  const sourceId = formData.get("sourceId") ? Number(formData.get("sourceId")) : null;

  const [startup] = await db
    .insert(startups)
    .values({
      name,
      website,
      city,
      stage,
      sector,
      description,
      accelerator,
      status: "New",
      updatedAt: new Date(),
    })
    .returning();

  if (sourceId && startup) {
    await db.insert(startupSources).values({ startupId: startup.id, sourceId });
  }

  revalidatePath("/");
  revalidatePath("/startups");
  return startup;
}

export async function updateStartup(id: number, data: Partial<typeof startups.$inferInsert>) {
  const scoring = {
    scoreRelevance: data.scoreRelevance,
    scoreStageFit: data.scoreStageFit,
    scoreSourceQuality: data.scoreSourceQuality,
    scoreTeamQuality: data.scoreTeamQuality,
    scoreProblemAttractiveness: data.scoreProblemAttractiveness,
    scoreProductClarity: data.scoreProductClarity,
    scoreTractionQuality: data.scoreTractionQuality,
    scoreMarketPotential: data.scoreMarketPotential,
    scoreFounderResponsiveness: data.scoreFounderResponsiveness,
    scoreOverallConviction: data.scoreOverallConviction,
  };

  // Recalculate priority score if any scoring dimension is being updated
  const hasScoringUpdate = Object.values(scoring).some((v) => v !== undefined);
  if (hasScoringUpdate) {
    const current = await db.query.startups.findFirst({ where: eq(startups.id, id) });
    if (current) {
      const merged = { ...current, ...scoring };
      data.priorityScore = calcPriorityScore(merged) ?? undefined;
    }
  }

  await db
    .update(startups)
    .set({
      ...data,
      contactEmail: data.contactEmail?.trim() || null,
      contactPhone: data.contactPhone?.trim() || null,
      contactLinkedin: data.contactLinkedin?.trim() || null,
      updatedAt: new Date(),
    })
    .where(eq(startups.id, id));

  revalidatePath("/");
  revalidatePath("/startups");
  revalidatePath(`/startups/${id}`);
}

export async function updateStartupStatus(id: number, status: string) {
  await db
    .update(startups)
    .set({ status, updatedAt: new Date() })
    .where(eq(startups.id, id));
  revalidatePath("/");
  revalidatePath("/startups");
  revalidatePath(`/startups/${id}`);
}

export async function deleteStartup(id: number) {
  await db.delete(startups).where(eq(startups.id, id));
  revalidatePath("/");
  revalidatePath("/startups");
}

export async function linkSource(startupId: number, sourceId: number) {
  await db
    .insert(startupSources)
    .values({ startupId, sourceId })
    .onConflictDoNothing();
  revalidatePath(`/startups/${startupId}`);
}

export async function unlinkSource(startupId: number, sourceId: number) {
  await db
    .delete(startupSources)
    .where(
      eq(startupSources.startupId, startupId)
    );
  revalidatePath(`/startups/${startupId}`);
}
