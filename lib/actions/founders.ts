"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { founders } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function createFounder(startupId: number, data: {
  name: string;
  title?: string;
  email?: string;
  linkedin?: string;
  notes?: string;
}) {
  const [founder] = await db.insert(founders).values({ startupId, ...data }).returning();
  revalidatePath(`/startups/${startupId}`);
  return founder;
}

export async function updateFounder(id: number, startupId: number, data: Partial<typeof founders.$inferInsert>) {
  await db.update(founders).set(data).where(eq(founders.id, id));
  revalidatePath(`/startups/${startupId}`);
}

export async function deleteFounder(id: number, startupId: number) {
  await db.delete(founders).where(eq(founders.id, id));
  revalidatePath(`/startups/${startupId}`);
}
