import { db } from "@/lib/db";
import { startups, outreachEvents, callNotes } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

export type StartupWithRelations = Awaited<ReturnType<typeof getStartupById>>;
export type StartupRow = Awaited<ReturnType<typeof getStartups>>[0];

export async function getStartups(filters?: {
  stage?: string;
  sector?: string;
  sourceId?: number;
  search?: string;
  status?: string;
  hasContacts?: boolean;
}) {
  const rows = await db.query.startups.findMany({
    with: {
      founders: true,
      startupSources: { with: { source: true } },
    },
    orderBy: [desc(startups.updatedAt)],
  });

  let filtered = rows;

  if (filters?.stage) {
    filtered = filtered.filter((s) => s.stage === filters.stage);
  }
  if (filters?.sector) {
    filtered = filtered.filter((s) => s.sector === filters.sector);
  }
  if (filters?.status) {
    filtered = filtered.filter((s) => s.status === filters.status);
  }
  if (filters?.search) {
    const q = filters.search.toLowerCase();
    filtered = filtered.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.description?.toLowerCase().includes(q) ||
        s.sector?.toLowerCase().includes(q)
    );
  }
  if (filters?.sourceId) {
    filtered = filtered.filter((s) =>
      s.startupSources.some((ss) => ss.sourceId === filters.sourceId)
    );
  }
  if (filters?.hasContacts) {
    filtered = filtered.filter((s) => s.contactEmail || s.contactPhone || s.contactLinkedin);
  }

  return filtered;
}

export async function getStartupById(id: number) {
  return db.query.startups.findFirst({
    where: eq(startups.id, id),
    with: {
      founders: true,
      startupSources: { with: { source: true } },
      outreachEvents: {
        with: { founder: true },
        orderBy: [desc(outreachEvents.date)],
      },
      callNotes: { orderBy: [desc(callNotes.date)] },
    },
  });
}

export async function getStartupsGroupedByStatus() {
  const all = await getStartups();
  const grouped: Record<string, typeof all> = {};
  for (const s of all) {
    if (!grouped[s.status]) grouped[s.status] = [];
    grouped[s.status].push(s);
  }
  return grouped;
}

export async function getDistinctSectors(): Promise<string[]> {
  const rows = await db.query.startups.findMany({ columns: { sector: true } });
  const sectors = [...new Set(rows.map((r) => r.sector).filter(Boolean))] as string[];
  return sectors.sort();
}
