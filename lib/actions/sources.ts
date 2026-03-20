"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { sources } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function createSource(data: {
  name: string;
  type: string;
  url?: string;
  geographyRelevance?: string;
  notes?: string;
}) {
  const [source] = await db.insert(sources).values(data).returning();
  revalidatePath("/sources");
  return source;
}

export async function updateSource(id: number, data: Partial<typeof sources.$inferInsert>) {
  await db.update(sources).set(data).where(eq(sources.id, id));
  revalidatePath("/sources");
}

export async function deleteSource(id: number) {
  await db.delete(sources).where(eq(sources.id, id));
  revalidatePath("/sources");
}
