export const dynamic = "force-dynamic";

import { getStartupsGroupedByStatus, type StartupRow } from "@/lib/db/queries/startups";
import { getSources } from "@/lib/db/queries/sources";
import { PIPELINE_STAGES } from "@/lib/db/schema";
import { StartupCard } from "@/components/startup-card";
import { AddStartupDialog } from "@/components/add-startup-dialog";

export default async function PipelinePage() {
  const [grouped, sources] = await Promise.all([
    getStartupsGroupedByStatus(),
    getSources(),
  ]);

  const totalCount = Object.values(grouped).reduce((s, arr) => s + (arr as StartupRow[]).length, 0);

  return (
    <div className="max-w-screen-2xl mx-auto px-6 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-zinc-100">Pipeline</h1>
          <p className="text-sm text-zinc-500 mt-0.5">
            {totalCount} startup{totalCount !== 1 ? "s" : ""} tracked
          </p>
        </div>
        <AddStartupDialog sources={sources} />
      </div>

      {/* Kanban board */}
      <div className="flex gap-4 overflow-x-auto pb-6">
        {PIPELINE_STAGES.map((stage) => {
          const cards = (grouped[stage] ?? []) as StartupRow[];
          const isSelected = stage === "Selected for Presentation";
          return (
            <div key={stage} className="flex-shrink-0 w-52">
              {/* Column header */}
              <div className={`flex items-center justify-between mb-2 px-1 ${isSelected ? "text-emerald-400" : "text-zinc-400"}`}>
                <span className="text-xs font-medium uppercase tracking-wider truncate">
                  {isSelected ? "✦ " : ""}{stage}
                </span>
                <span className="text-xs text-zinc-600 ml-2 flex-shrink-0">{cards.length}</span>
              </div>

              {/* Cards */}
              <div className={`rounded-xl border p-2 min-h-32 space-y-2 ${
                isSelected
                  ? "border-emerald-800/30 bg-emerald-950/20"
                  : "border-zinc-800 bg-zinc-900/30"
              }`}>
                {cards.map((s) => (
                  <StartupCard key={s.id} startup={s} />
                ))}
                {cards.length === 0 && (
                  <div className="flex items-center justify-center h-16 text-xs text-zinc-700">
                    Empty
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
