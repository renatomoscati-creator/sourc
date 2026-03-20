import { db } from "@/lib/db";
import { sources } from "@/lib/db/schema";
import { desc } from "drizzle-orm";

export async function getSources() {
  return db.query.sources.findMany({
    orderBy: [desc(sources.createdAt)],
  });
}
