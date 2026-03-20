"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { outreachEvents } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function createOutreachEvent(startupId: number, data: {
  date: string;
  channel?: string;
  status: string;
  messageType?: string;
  followUpDate?: string;
  founderId?: number;
  notes?: string;
}) {
  const [event] = await db.insert(outreachEvents).values({ startupId, ...data }).returning();
  revalidatePath(`/startups/${startupId}`);
  return event;
}

export async function updateOutreachEvent(id: number, startupId: number, data: Partial<typeof outreachEvents.$inferInsert>) {
  await db.update(outreachEvents).set(data).where(eq(outreachEvents.id, id));
  revalidatePath(`/startups/${startupId}`);
}

export async function deleteOutreachEvent(id: number, startupId: number) {
  await db.delete(outreachEvents).where(eq(outreachEvents.id, id));
  revalidatePath(`/startups/${startupId}`);
}
