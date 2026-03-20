import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { StartupRow } from "@/lib/db/queries/startups";

interface Props {
  startup: StartupRow;
}

const stageColors: Record<string, string> = {
  "Pre-seed": "bg-violet-500/10 text-violet-300 border-violet-500/20",
  "Seed": "bg-blue-500/10 text-blue-300 border-blue-500/20",
  "Series A": "bg-cyan-500/10 text-cyan-300 border-cyan-500/20",
  "Unknown": "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
};

export function StartupCard({ startup }: Props) {
  return (
    <Link href={`/startups/${startup.id}`}>
      <div className={cn(
        "rounded-lg border p-3 text-sm cursor-pointer transition-colors hover:border-zinc-600",
        startup.status === "Selected for Presentation"
          ? "bg-emerald-950/40 border-emerald-800/40 hover:border-emerald-700"
          : "bg-zinc-900 border-zinc-800"
      )}>
        <div className="font-medium text-zinc-100 mb-1 truncate">{startup.name}</div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {startup.stage && (
            <span className={cn(
              "text-xs px-1.5 py-0.5 rounded border",
              stageColors[startup.stage] ?? stageColors["Unknown"]
            )}>
              {startup.stage}
            </span>
          )}
          {startup.sector && (
            <span className="text-xs text-zinc-500 truncate">{startup.sector}</span>
          )}
        </div>
        {startup.priorityScore != null && (
          <div className="mt-2 text-xs text-zinc-500">
            Score: <span className="text-zinc-300 font-mono">{startup.priorityScore}</span>
          </div>
        )}
      </div>
    </Link>
  );
}
