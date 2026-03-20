export const dynamic = "force-dynamic";

import Link from "next/link";
import { getStartups, getDistinctSectors } from "@/lib/db/queries/startups";
import { getSources } from "@/lib/db/queries/sources";
import { PIPELINE_STAGES, STARTUP_STAGES } from "@/lib/db/schema";
import { AddStartupDialog } from "@/components/add-startup-dialog";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Mail, Phone, Linkedin } from "lucide-react";

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
};

interface Props {
  searchParams: Promise<{ stage?: string; sector?: string; sourceId?: string; search?: string; hasContacts?: string }>;
}

export default async function StartupsPage({ searchParams }: Props) {
  const params = await searchParams;
  const [startups, sectors, sources] = await Promise.all([
    getStartups({
      stage: params.stage,
      sector: params.sector,
      sourceId: params.sourceId ? Number(params.sourceId) : undefined,
      search: params.search,
      hasContacts: params.hasContacts === "1",
    }),
    getDistinctSectors(),
    getSources(),
  ]);

  function buildUrl(overrides: Record<string, string | undefined>) {
    const p = new URLSearchParams();
    const merged = { ...params, ...overrides };
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
          <p className="text-sm text-zinc-500 mt-0.5">{startups.length} result{startups.length !== 1 ? "s" : ""}</p>
        </div>
        <AddStartupDialog sources={sources} />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-5">
        {/* Search */}
        <form method="GET" action="/startups">
          {params.stage && <input type="hidden" name="stage" value={params.stage} />}
          {params.sector && <input type="hidden" name="sector" value={params.sector} />}
          {params.sourceId && <input type="hidden" name="sourceId" value={params.sourceId} />}
          <input
            name="search"
            defaultValue={params.search}
            placeholder="Search…"
            className="h-8 px-3 text-sm rounded-md bg-zinc-900 border border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 w-48"
          />
        </form>

        {/* Stage filter */}
        <div className="flex gap-1 flex-wrap">
          <Link href={buildUrl({ stage: undefined })}
            className={cn("px-2.5 py-1 text-xs rounded-md border transition-colors", !params.stage ? "bg-zinc-700 border-zinc-600 text-zinc-100" : "border-zinc-700 text-zinc-400 hover:text-zinc-200")}>
            All stages
          </Link>
          {STARTUP_STAGES.map((s) => (
            <Link key={s} href={buildUrl({ stage: s })}
              className={cn("px-2.5 py-1 text-xs rounded-md border transition-colors", params.stage === s ? "bg-zinc-700 border-zinc-600 text-zinc-100" : "border-zinc-700 text-zinc-400 hover:text-zinc-200")}>
              {s}
            </Link>
          ))}
        </div>

        {/* Sector filter */}
        {sectors.length > 0 && (
          <div className="flex gap-1 flex-wrap">
            <Link href={buildUrl({ sector: undefined })}
              className={cn("px-2.5 py-1 text-xs rounded-md border transition-colors", !params.sector ? "bg-zinc-700 border-zinc-600 text-zinc-100" : "border-zinc-700 text-zinc-400 hover:text-zinc-200")}>
              All sectors
            </Link>
            {sectors.map((s) => (
              <Link key={s} href={buildUrl({ sector: s })}
                className={cn("px-2.5 py-1 text-xs rounded-md border transition-colors", params.sector === s ? "bg-zinc-700 border-zinc-600 text-zinc-100" : "border-zinc-700 text-zinc-400 hover:text-zinc-200")}>
                {s}
              </Link>
            ))}
          </div>
        )}
        {/* Has contacts filter */}
        <Link
          href={buildUrl({ hasContacts: params.hasContacts === "1" ? undefined : "1" })}
          className={cn(
            "flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-md border transition-colors",
            params.hasContacts === "1"
              ? "bg-emerald-950 border-emerald-700 text-emerald-300"
              : "border-zinc-700 text-zinc-400 hover:text-zinc-200"
          )}
        >
          <Mail className="h-3 w-3" />
          Has contacts
        </Link>
      </div>

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
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Name</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Stage</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Sector</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Source</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Contacts</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Score</th>
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
                        <span className="ml-2 text-xs text-zinc-600">{s.website.replace(/^https?:\/\//, "")}</span>
                      )}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-zinc-400">{s.stage ?? "—"}</td>
                  <td className="px-4 py-3 text-zinc-400">{s.sector ?? "—"}</td>
                  <td className="px-4 py-3 text-zinc-500 text-xs">
                    {s.startupSources[0]?.source?.name ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn(
                      "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium",
                      statusColors[s.status] ?? "bg-zinc-800 text-zinc-400"
                    )}>
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
