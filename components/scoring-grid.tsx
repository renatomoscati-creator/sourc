"use client";

import { useTransition, useState } from "react";
import { updateStartup } from "@/lib/actions/startups";
import type { StartupWithRelations } from "@/lib/db/queries/startups";

type Startup = NonNullable<StartupWithRelations>;

const DIMENSIONS: { key: keyof Startup; label: string }[] = [
  { key: "scoreRelevance", label: "Relevance" },
  { key: "scoreStageFit", label: "Stage fit" },
  { key: "scoreSourceQuality", label: "Source quality" },
  { key: "scoreTeamQuality", label: "Team quality" },
  { key: "scoreProblemAttractiveness", label: "Problem attractiveness" },
  { key: "scoreProductClarity", label: "Product clarity" },
  { key: "scoreTractionQuality", label: "Traction quality" },
  { key: "scoreMarketPotential", label: "Market potential" },
  { key: "scoreFounderResponsiveness", label: "Founder responsiveness" },
  { key: "scoreOverallConviction", label: "Overall conviction" },
];

interface Props {
  startup: Startup;
}

export function ScoringGrid({ startup }: Props) {
  const [isPending, startTransition] = useTransition();
  const [localScores, setLocalScores] = useState<Record<string, number | null>>({});

  function handleChange(key: string, value: string) {
    const num = value === "" ? null : Math.min(10, Math.max(1, Number(value)));
    setLocalScores((prev) => ({ ...prev, [key]: num }));
  }

  function handleBlur(key: string) {
    const val = localScores[key];
    if (val === undefined) return;
    startTransition(() =>
      updateStartup(startup.id, { [key]: val } as Parameters<typeof updateStartup>[1])
    );
  }

  return (
    <div className="space-y-1.5">
      <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
        {DIMENSIONS.map(({ key, label }) => {
          const stored = startup[key] as number | null | undefined;
          const local = localScores[key as string];
          const display = local !== undefined ? (local ?? "") : (stored ?? "");
          return (
            <div key={key as string} className="flex items-center justify-between gap-2">
              <span className="text-xs text-zinc-500 truncate">{label}</span>
              <input
                type="number"
                min={1}
                max={10}
                step={0.5}
                value={display}
                onChange={(e) => handleChange(key as string, e.target.value)}
                onBlur={() => handleBlur(key as string)}
                placeholder="—"
                className="w-14 text-right text-xs font-mono bg-zinc-900 border border-zinc-700 rounded px-2 py-0.5 text-zinc-200 focus:outline-none focus:ring-1 focus:ring-zinc-500"
              />
            </div>
          );
        })}
      </div>
      {startup.priorityScore != null && (
        <div className="flex items-center justify-between pt-2 border-t border-zinc-800 mt-2">
          <span className="text-xs font-medium text-zinc-400">Priority score</span>
          <span className="text-sm font-mono font-semibold text-zinc-100">{startup.priorityScore}</span>
        </div>
      )}
      {isPending && <p className="text-xs text-zinc-600">Saving…</p>}
    </div>
  );
}
