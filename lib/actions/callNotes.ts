"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { callNotes } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function createCallNote(startupId: number, data: Omit<typeof callNotes.$inferInsert, "id" | "startupId" | "createdAt">) {
  const [note] = await db.insert(callNotes).values({ startupId, ...data }).returning();
  revalidatePath(`/startups/${startupId}`);
  return note;
}

export async function updateCallNote(id: number, startupId: number, data: Partial<typeof callNotes.$inferInsert>) {
  await db.update(callNotes).set(data).where(eq(callNotes.id, id));
  revalidatePath(`/startups/${startupId}`);
}

export async function deleteCallNote(id: number, startupId: number) {
  await db.delete(callNotes).where(eq(callNotes.id, id));
  revalidatePath(`/startups/${startupId}`);
}
