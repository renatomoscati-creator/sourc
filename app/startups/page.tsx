export const dynamic = "force-dynamic";

import Link from "next/link";
import { Suspense } from "react";
import { getStartups, getDistinctSectors, type SortField, type SortOrder } from "@/lib/db/queries/startups";
import { getSources } from "@/lib/db/queries/sources";
import { AddStartupDialog } from "@/components/add-startup-dialog";
import { StartupsFilters } from "@/components/startups-filters";
import { cn } from "@/lib/utils";
import { Mail, Phone, Linkedin, ChevronUp, ChevronDown } from "lucide-react";

const statusColors: Record<string, string> = {
  "New": "bg-zinc-800 text-zinc-400",
  "Researched": "bg-blue-950 text-blue-300",
  "Contacted": "bg-amber-950 text-amber-300",
  "Replied": "bg-yellow-950 text-yellow-300",
  "Call Scheduled": "bg-orange-950 text-orange-300",
  "Call Completed": "bg-teal-950 text-teal-300",
  "Under Review": "bg-purple-950 text-purple-300",
  "Selected for Presentation": "bg-emerald-950 text-emerald-300",
  "Rejected/Archived": "bg-zinc-900 text-zinc-600",
  "Hell No": "bg-red-950 text-red-700",
  "Already Sourced": "bg-zinc-900 text-zinc-600",
};

function SortIcon({ field, sortBy, sortOrder }: { field: SortField; sortBy?: SortField; sortOrder?: SortOrder }) {
  if (sortBy !== field) return <span className="w-3 h-3 inline-block" />;
  return sortOrder === "asc"
    ? <ChevronUp className="w-3 h-3 inline-block" />
    : <ChevronDown className="w-3 h-3 inline-block" />;
}

function SortHeader({ field, sortBy, sortOrder, href, children }: { field: SortField; sortBy?: SortField; sortOrder?: SortOrder; href: string; children: React.ReactNode }) {
  const isActive = sortBy === field;
  return (
    <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">
      <Link
        href={href}
        className={cn(
          "flex items-center gap-1 hover:text-zinc-200 transition-colors cursor-pointer",
          isActive && "text-zinc-200"
        )}
      >
        {children}
        <SortIcon field={field} sortBy={sortBy} sortOrder={sortOrder} />
      </Link>
    </th>
  );
}

interface Props {
  searchParams: Promise<{
    stage?: string;
    sector?: string;
    sourceId?: string;
    search?: string;
    hasContacts?: string;
    sortBy?: SortField;
    sortOrder?: SortOrder;
    showHidden?: string;
    status?: string;
  }>;
}

export default async function StartupsPage({ searchParams }: Props) {
  const params = await searchParams;

  const [startups, sectors, sources] = await Promise.all([
    getStartups({
      stage: params.stage,
      sector: params.sector,
      sourceId: params.sourceId ? Number(params.sourceId) : undefined,
      search: params.search,
      status: params.status,
      hasContacts: params.hasContacts === "1",
      sortBy: params.sortBy,
      sortOrder: params.sortOrder,
      showHidden: params.showHidden === "1",
    }),
    getDistinctSectors(),
    getSources(),
  ]);

  function buildSortUrl(field: SortField) {
    const p = new URLSearchParams();
    const isActive = params.sortBy === field;
    const nextOrder: SortOrder = (params.sortOrder === "asc" || !params.sortOrder) ? "desc" : "asc";
    const merged: Record<string, string> = { ...params as Record<string, string> };
    merged.sortBy = field;
    merged.sortOrder = isActive ? nextOrder : "desc";
    for (const [k, v] of Object.entries(merged)) {
      if (v) p.set(k, v);
    }
    return `/startups?${p.toString()}`;
  }

  return (
    <div className="max-w-screen-2xl mx-auto px-6 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-zinc-100">Startups</h1>
          <p className="text-sm text-zinc-500 mt-0.5">
            {startups.length} result{startups.length !== 1 ? "s" : ""}
          </p>
        </div>
        <AddStartupDialog sources={sources} />
      </div>

      {/* Filters (client component — handles localStorage persistence) */}
      <Suspense>
        <StartupsFilters sectors={sectors} sources={sources.map(s => ({ id: s.id, name: s.name }))} />
      </Suspense>

      {/* Table */}
      {startups.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-zinc-600">
          <p className="text-sm">No startups found.</p>
          <p className="text-xs mt-1">Try adjusting filters or adding a new startup.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-zinc-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900/60">
                <SortHeader field="name" sortBy={params.sortBy} sortOrder={params.sortOrder} href={buildSortUrl("name")}>Name</SortHeader>
                <SortHeader field="stage" sortBy={params.sortBy} sortOrder={params.sortOrder} href={buildSortUrl("stage")}>Stage</SortHeader>
                <SortHeader field="sector" sortBy={params.sortBy} sortOrder={params.sortOrder} href={buildSortUrl("sector")}>Sector</SortHeader>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">
                  Source
                </th>
                <SortHeader field="status" sortBy={params.sortBy} sortOrder={params.sortOrder} href={buildSortUrl("status")}>Status</SortHeader>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">
                  Contacts
                </th>
                <SortHeader field="priorityScore" sortBy={params.sortBy} sortOrder={params.sortOrder} href={buildSortUrl("priorityScore")}>Score</SortHeader>
              </tr>
            </thead>
            <tbody>
              {startups.map((s, i) => (
                <tr
                  key={s.id}
                  className={cn(
                    "border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors cursor-pointer",
                    i === startups.length - 1 && "border-b-0"
                  )}
                >
                  <td className="px-4 py-3">
                    <Link href={`/startups/${s.id}`} className="block">
                      <span className="font-medium text-zinc-100">{s.name}</span>
                      {s.website && (
                        <span className="ml-2 text-xs text-zinc-600">
                          {s.website.replace(/^https?:\/\//, "")}
                        </span>
                      )}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-zinc-400">{s.stage ?? "—"}</td>
                  <td className="px-4 py-3 text-zinc-400">{s.sector ?? "—"}</td>
                  <td className="px-4 py-3 text-zinc-500 text-xs">
                    {s.startupSources[0]?.source?.name ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium",
                        statusColors[s.status] ?? "bg-zinc-800 text-zinc-400"
                      )}
                    >
                      {s.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <Mail className={cn("h-3 w-3", s.contactEmail ? "text-emerald-400" : "text-zinc-800")} />
                      <Phone className={cn("h-3 w-3", s.contactPhone ? "text-emerald-400" : "text-zinc-800")} />
                      <Linkedin className={cn("h-3 w-3", s.contactLinkedin ? "text-emerald-400" : "text-zinc-800")} />
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-zinc-300">
                    {s.priorityScore != null ? s.priorityScore : <span className="text-zinc-700">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
