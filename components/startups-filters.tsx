"use client";

import { useEffect, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Mail, Funnel } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SortField, SortOrder } from "@/lib/db/queries/startups";

const STORAGE_KEY = "startups-filters";

interface FiltersProps {
  sectors: string[];
  sources: { id: number; name: string }[];
}

type FilterParams = {
  stage?: string;
  sector?: string;
  sourceId?: string;
  search?: string;
  hasContacts?: string;
  showHidden?: string;
  status?: string;
  sortBy?: SortField;
  sortOrder?: SortOrder;
};

const FILTER_KEYS: (keyof FilterParams)[] = [
  "stage", "sector", "sourceId", "search", "hasContacts", "showHidden", "status",
];

export function StartupsFilters({ sectors, sources }: FiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentParams = Object.fromEntries(searchParams.entries()) as FilterParams;

  const hasActiveFilters = FILTER_KEYS.some((k) => !!currentParams[k]);

  // On mount: if no params in URL, restore from localStorage
  useEffect(() => {
    if (!searchParams.toString()) {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const p = JSON.parse(saved) as Record<string, string>;
          const qs = new URLSearchParams(p).toString();
          if (qs) router.replace(`${pathname}?${qs}`);
        }
      } catch {}
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save to localStorage whenever params change
  useEffect(() => {
    if (searchParams.toString()) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(currentParams));
      } catch {}
    }
  }, [searchParams, currentParams]);

  const buildUrl = useCallback(
    (overrides: Partial<FilterParams & Record<string, string | undefined>>) => {
      const p = new URLSearchParams();
      const merged = { ...currentParams, ...overrides };
      for (const [k, v] of Object.entries(merged)) {
        if (v) p.set(k, v);
      }
      return `${pathname}?${p.toString()}`;
    },
    [currentParams, pathname]
  );

  const clearAll = () => {
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
    router.push(pathname);
  };

  const STARTUP_STAGES = ["Pre-seed", "Seed", "Series A", "Unknown"];
  const PIPELINE_STATUSES = [
    "New", "Researched", "Contacted", "Replied",
    "Call Scheduled", "Call Completed", "Under Review",
    "Selected for Presentation", "Rejected/Archived", "Hell No", "Already Sourced",
  ];

  return (
    <div className="flex flex-col gap-3 mb-5">
      {/* Row 1: Search + funnel */}
      <div className="flex items-center gap-2">
        <form method="GET" action="/startups" className="flex-shrink-0">
          {currentParams.stage && <input type="hidden" name="stage" value={currentParams.stage} />}
          {currentParams.sector && <input type="hidden" name="sector" value={currentParams.sector} />}
          {currentParams.sourceId && <input type="hidden" name="sourceId" value={currentParams.sourceId} />}
          {currentParams.showHidden && <input type="hidden" name="showHidden" value={currentParams.showHidden} />}
          {currentParams.hasContacts && <input type="hidden" name="hasContacts" value={currentParams.hasContacts} />}
          {currentParams.status && <input type="hidden" name="status" value={currentParams.status} />}
          <input
            name="search"
            defaultValue={currentParams.search}
            placeholder="Search…"
            className="h-8 px-3 text-sm rounded-md bg-zinc-900 border border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 w-48"
          />
        </form>

        {/* Funnel / clear-all icon */}
        <button
          onClick={clearAll}
          title={hasActiveFilters ? "Clear all filters" : "No active filters"}
          className={cn(
            "flex items-center justify-center h-8 w-8 rounded-md border transition-colors",
            hasActiveFilters
              ? "border-amber-600 text-amber-400 hover:bg-amber-950/40"
              : "border-zinc-800 text-zinc-700 cursor-default"
          )}
        >
          <Funnel className="h-3.5 w-3.5" />
        </button>

        {/* Has contacts toggle */}
        <a
          href={buildUrl({ hasContacts: currentParams.hasContacts === "1" ? undefined : "1" })}
          className={cn(
            "flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-md border transition-colors h-8",
            currentParams.hasContacts === "1"
              ? "bg-emerald-950 border-emerald-700 text-emerald-300"
              : "border-zinc-700 text-zinc-400 hover:text-zinc-200"
          )}
        >
          <Mail className="h-3 w-3" />
          Has contacts
        </a>

        {/* Show hidden toggle */}
        <a
          href={buildUrl({ showHidden: currentParams.showHidden === "1" ? undefined : "1" })}
          className={cn(
            "flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-md border transition-colors h-8",
            currentParams.showHidden === "1"
              ? "bg-zinc-700 border-zinc-600 text-zinc-100"
              : "border-zinc-700 text-zinc-500 hover:text-zinc-400"
          )}
        >
          Show hidden
        </a>
      </div>

      {/* Row 2: Stage filter */}
      <div className="flex flex-col gap-1">
        <span className="text-[10px] uppercase tracking-wider text-zinc-600 font-medium px-0.5">Stage</span>
        <div className="flex gap-1 flex-wrap">
          <a href={buildUrl({ stage: undefined })}
            className={cn("px-2.5 py-1 text-xs rounded-md border transition-colors",
              !currentParams.stage ? "bg-zinc-700 border-zinc-600 text-zinc-100" : "border-zinc-700 text-zinc-400 hover:text-zinc-200")}>
            All
          </a>
          {STARTUP_STAGES.map((s) => (
            <a key={s} href={buildUrl({ stage: s })}
              className={cn("px-2.5 py-1 text-xs rounded-md border transition-colors",
                currentParams.stage === s ? "bg-zinc-700 border-zinc-600 text-zinc-100" : "border-zinc-700 text-zinc-400 hover:text-zinc-200")}>
              {s}
            </a>
          ))}
        </div>
      </div>

      {/* Row 3: Sector filter */}
      {sectors.length > 0 && (
        <div className="flex flex-col gap-1">
          <span className="text-[10px] uppercase tracking-wider text-zinc-600 font-medium px-0.5">Sector</span>
          <div className="flex gap-1 flex-wrap">
            <a href={buildUrl({ sector: undefined })}
              className={cn("px-2.5 py-1 text-xs rounded-md border transition-colors",
                !currentParams.sector ? "bg-zinc-700 border-zinc-600 text-zinc-100" : "border-zinc-700 text-zinc-400 hover:text-zinc-200")}>
              All
            </a>
            {sectors.map((s) => (
              <a key={s} href={buildUrl({ sector: s })}
                className={cn("px-2.5 py-1 text-xs rounded-md border transition-colors",
                  currentParams.sector === s ? "bg-zinc-700 border-zinc-600 text-zinc-100" : "border-zinc-700 text-zinc-400 hover:text-zinc-200")}>
                {s}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Row 4: Source filter */}
      {sources.length > 0 && (
        <div className="flex flex-col gap-1">
          <span className="text-[10px] uppercase tracking-wider text-zinc-600 font-medium px-0.5">Source</span>
          <div className="flex gap-1 flex-wrap">
            <a href={buildUrl({ sourceId: undefined })}
              className={cn("px-2.5 py-1 text-xs rounded-md border transition-colors",
                !currentParams.sourceId ? "bg-zinc-700 border-zinc-600 text-zinc-100" : "border-zinc-700 text-zinc-400 hover:text-zinc-200")}>
              All
            </a>
            {sources.map((s) => (
              <a key={s.id} href={buildUrl({ sourceId: String(s.id) })}
                className={cn("px-2.5 py-1 text-xs rounded-md border transition-colors",
                  currentParams.sourceId === String(s.id) ? "bg-zinc-700 border-zinc-600 text-zinc-100" : "border-zinc-700 text-zinc-400 hover:text-zinc-200")}>
                {s.name}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Row 5: Status filter */}
      <div className="flex flex-col gap-1">
        <span className="text-[10px] uppercase tracking-wider text-zinc-600 font-medium px-0.5">Status</span>
        <div className="flex gap-1 flex-wrap">
          <a href={buildUrl({ status: undefined })}
            className={cn("px-2.5 py-1 text-xs rounded-md border transition-colors",
              !currentParams.status ? "bg-zinc-700 border-zinc-600 text-zinc-100" : "border-zinc-700 text-zinc-400 hover:text-zinc-200")}>
            All
          </a>
          {PIPELINE_STATUSES.map((s) => (
            <a key={s} href={buildUrl({ status: s })}
              className={cn("px-2.5 py-1 text-xs rounded-md border transition-colors",
                currentParams.status === s ? "bg-zinc-700 border-zinc-600 text-zinc-100" : "border-zinc-700 text-zinc-400 hover:text-zinc-200")}>
              {s}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
