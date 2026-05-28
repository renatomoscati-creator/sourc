"use client";

import { useState, useEffect, useCallback, useMemo, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { confirmImport } from "@/lib/actions/import";
import { ArrowUpDown, ChevronDown, ChevronUp } from "lucide-react";
import type { ScrapingDataItem } from "@/app/api/import/scraping/route";

const VERDICT_COLORS: Record<string, string> = {
  PASS: "bg-emerald-900/50 text-emerald-300",
  MAYBE: "bg-amber-900/50 text-amber-300",
  SKIP: "bg-red-900/50 text-red-300",
};

const SOURCE_COLORS: Record<string, string> = {
  "ai-evaluation": "bg-purple-900/50 text-purple-300",
  "creandum-scout": "bg-emerald-900/50 text-emerald-300",
  "milan-top": "bg-blue-900/50 text-blue-300",
  "italy-top": "bg-cyan-900/50 text-cyan-300",
  "filtered": "bg-zinc-800 text-zinc-400",
  "firecrawl-contacts": "bg-orange-900/50 text-orange-300",
  "polihub": "bg-pink-900/50 text-pink-300",
};

type SortField = "name" | "source" | "aiVerdict" | "score" | "sector" | "city" | "foundedYear";
type SortDirection = "asc" | "desc";

const VERDICT_ORDER: Record<string, number> = {
  PASS: 0,
  MAYBE: 1,
  SKIP: 2,
};

const SORT_LABELS: Record<SortField, string> = {
  name: "Name",
  source: "Source",
  aiVerdict: "Verdict",
  score: "Score",
  sector: "Sector",
  city: "City",
  foundedYear: "Founded",
};

function itemKey(item: ScrapingDataItem) {
  return `${item.source}:${item.name}:${item.website ?? ""}`;
}

function stringValue(value: string | undefined) {
  return value?.toLowerCase().trim() ?? "";
}

function compareItems(a: ScrapingDataItem, b: ScrapingDataItem, sortBy: SortField) {
  if (sortBy === "score") {
    return (a.score ?? -1) - (b.score ?? -1);
  }
  if (sortBy === "foundedYear") {
    return (a.foundedYear ?? 0) - (b.foundedYear ?? 0);
  }
  if (sortBy === "aiVerdict") {
    return (VERDICT_ORDER[a.aiVerdict ?? ""] ?? 99) - (VERDICT_ORDER[b.aiVerdict ?? ""] ?? 99);
  }
  return stringValue(a[sortBy]).localeCompare(stringValue(b[sortBy]));
}

function SortIcon({ active, direction }: { active: boolean; direction: SortDirection }) {
  if (!active) return <ArrowUpDown className="h-3 w-3 text-zinc-700" />;
  return direction === "asc"
    ? <ChevronUp className="h-3 w-3 text-zinc-200" />
    : <ChevronDown className="h-3 w-3 text-zinc-200" />;
}

function SortHeader({
  field,
  sortBy,
  sortDirection,
  onSort,
  children,
  className = "",
}: {
  field: SortField;
  sortBy: SortField;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
  children: ReactNode;
  className?: string;
}) {
  const active = sortBy === field;

  return (
    <th className={`text-left px-3 py-2 text-zinc-400 font-medium ${className}`}>
      <button
        type="button"
        onClick={() => onSort(field)}
        className={`inline-flex items-center gap-1 transition-colors hover:text-zinc-100 ${active ? "text-zinc-100" : ""}`}
      >
        {children}
        <SortIcon active={active} direction={sortDirection} />
      </button>
    </th>
  );
}

export function ImportScrapingClient() {
  const [data, setData] = useState<{
    items: ScrapingDataItem[];
    total: number;
    metadata: { generatedAt: string; sources?: { name: string; count?: number }[]; excludedSources?: string } | null;
    sources: string[];
    sectors: string[];
    verdicts: string[];
  } | null>(null);

  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");
  const [sectorFilter, setSectorFilter] = useState("");
  const [verdictFilter, setVerdictFilter] = useState("");
  const [sortBy, setSortBy] = useState<SortField>("score");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ imported: number; skipped: number } | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/import/scraping");
    const json = await res.json();
    setData(json);
    setSelected(new Set());
    setLoading(false);
  }, []);

  useEffect(() => {
    setTimeout(() => { void fetchData(); }, 0);
  }, [fetchData]);

  const filtered = useMemo(() => {
    const query = search.toLowerCase().trim();

    return [...(data?.items ?? [])]
      .filter((item) => {
        const searchable = [
          item.name,
          item.city,
          item.description,
          item.website,
          item.sector,
          item.fundingStatus,
          item.traction,
        ].join(" ").toLowerCase();

        if (query && !searchable.includes(query)) return false;
        if (sourceFilter && item.source !== sourceFilter) return false;
        if (sectorFilter && item.sector !== sectorFilter) return false;
        if (verdictFilter && item.aiVerdict !== verdictFilter) return false;
        return true;
      })
      .sort((a, b) => {
        const direction = sortDirection === "asc" ? 1 : -1;
        const primary = compareItems(a, b, sortBy);
        if (primary !== 0) return primary * direction;
        return stringValue(a.name).localeCompare(stringValue(b.name));
      });
  }, [data?.items, search, sourceFilter, sectorFilter, verdictFilter, sortBy, sortDirection]);

  const filteredKeys = useMemo(() => filtered.map(itemKey), [filtered]);
  const visibleSelectedCount = useMemo(
    () => filteredKeys.filter((key) => selected.has(key)).length,
    [filteredKeys, selected]
  );

  function handleSort(field: SortField) {
    if (sortBy === field) {
      setSortDirection((current) => current === "asc" ? "desc" : "asc");
      return;
    }
    setSortBy(field);
    setSortDirection(field === "name" || field === "source" || field === "sector" || field === "city" ? "asc" : "desc");
  }

  const toggleAll = () => {
    if (visibleSelectedCount === filteredKeys.length && filteredKeys.length > 0) {
      setSelected((prev) => {
        const next = new Set(prev);
        for (const key of filteredKeys) next.delete(key);
        return next;
      });
    } else {
      setSelected((prev) => new Set([...prev, ...filteredKeys]));
    }
  };

  const handleImport = async () => {
    const toImport = filtered
      .filter((e) => selected.has(itemKey(e)))
      .map((e) => ({
        name: e.name,
        website: e.website,
        description: e.description,
        sector: e.sector,
        stage: e.stage,
        foundedYear: e.foundedYear,
        accelerator: e.accelerator,
        fundingStatus: e.fundingStatus,
        traction: e.traction,
        notes: e.notes,
        priorityScore: e.score,
        contactEmail: e.contactEmail,
        contactPhone: e.contactPhone,
        contactLinkedin: e.contactLinkedin,
        city: e.city || "Milan",
      }));
    setImporting(true);
    const res = await confirmImport(toImport);
    setResult(res);
    setImporting(false);
    setSelected(new Set());
  };

  const selectByVerdict = (verdict: string) => {
    const query = search.toLowerCase().trim();
    const matches = (data?.items ?? []).filter((item) => {
      const searchable = [
        item.name,
        item.city,
        item.description,
        item.website,
        item.sector,
        item.fundingStatus,
        item.traction,
      ].join(" ").toLowerCase();

      if (query && !searchable.includes(query)) return false;
      if (sourceFilter && item.source !== sourceFilter) return false;
      if (sectorFilter && item.sector !== sectorFilter) return false;
      return item.aiVerdict === verdict;
    });
    setSelected(new Set(matches.map(itemKey)));
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-100">Import Scraping Data</h1>
          <p className="text-sm text-zinc-500 mt-0.5">
            {data ? `${data.total.toLocaleString()} Italian startups from real sourcing channels` : "Loading…"}
          </p>
          {data?.metadata && (
            <p className="text-xs text-zinc-600 mt-1">
              Generated: {new Date(data.metadata.generatedAt).toLocaleDateString()}
              {" · "}Sources: {data.metadata.sources?.map((s) => `${s.name}${s.count ? ` (${s.count})` : ""}`).join(", ")}
              {data.metadata.excludedSources ? ` · ${data.metadata.excludedSources}` : ""}
            </p>
          )}
        </div>
        <Link href="/startups" className="text-xs text-zinc-500 hover:text-zinc-300 underline">← Back to Startups</Link>
      </div>

      {result && (
        <div className="rounded-lg border border-emerald-700 bg-emerald-950/40 px-4 py-3 text-sm text-emerald-300">
          ✓ Imported <strong>{result.imported}</strong> startups
          {result.skipped > 0 && <span className="text-zinc-400"> · {result.skipped} skipped (already exist)</span>}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        {/* Verdict quick filters */}
        {data?.verdicts.map((v) => (
          <button
            key={v}
            onClick={() => {
              if (verdictFilter === v) {
                setVerdictFilter("");
                setSelected(new Set());
              } else {
                setVerdictFilter(v);
                selectByVerdict(v);
              }
            }}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
              verdictFilter === v
                ? VERDICT_COLORS[v] || "bg-zinc-200 text-zinc-900"
                : "bg-zinc-800 text-zinc-400 hover:text-zinc-200"
            }`}
          >
            {v} ({data.items.filter((i) => i.aiVerdict === v).length})
          </button>
        ))}

        <select
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value)}
          className="bg-zinc-800 border border-zinc-700 rounded px-3 py-1 text-xs text-zinc-200"
        >
          <option value="">All sources</option>
          {data?.sources.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        <select
          value={sectorFilter}
          onChange={(e) => setSectorFilter(e.target.value)}
          className="bg-zinc-800 border border-zinc-700 rounded px-3 py-1 text-xs text-zinc-200"
        >
          <option value="">All sectors</option>
          {data?.sectors.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>

        <Input
          placeholder="Search by name, city, or description…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-64 h-7 text-xs"
        />
      </div>

      {/* Bulk actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={toggleAll} className="text-xs text-zinc-400 hover:text-zinc-200 underline">
            {visibleSelectedCount === filtered.length && filtered.length > 0 ? "Deselect all" : `Select all (${filtered.length})`}
          </button>
          {visibleSelectedCount > 0 && (
            <span className="text-xs text-zinc-500">{visibleSelectedCount} selected</span>
          )}
          <span className="text-xs text-zinc-600">
            Ordered by {SORT_LABELS[sortBy].toLowerCase()} {sortDirection === "asc" ? "ascending" : "descending"}
          </span>
        </div>
        <Button
          size="sm"
          disabled={visibleSelectedCount === 0 || importing}
          onClick={handleImport}
        >
          {importing ? "Importing…" : `Import ${visibleSelectedCount} startups`}
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-zinc-800 overflow-hidden">
        <table className="w-full text-xs">
          <thead className="bg-zinc-900 border-b border-zinc-800">
            <tr>
              <th className="w-8 px-3 py-2"></th>
              <SortHeader field="name" sortBy={sortBy} sortDirection={sortDirection} onSort={handleSort}>Name</SortHeader>
              <SortHeader field="source" sortBy={sortBy} sortDirection={sortDirection} onSort={handleSort}>Source</SortHeader>
              <SortHeader field="aiVerdict" sortBy={sortBy} sortDirection={sortDirection} onSort={handleSort}>Verdict</SortHeader>
              <SortHeader field="score" sortBy={sortBy} sortDirection={sortDirection} onSort={handleSort}>Score</SortHeader>
              <SortHeader field="sector" sortBy={sortBy} sortDirection={sortDirection} onSort={handleSort}>Sector</SortHeader>
              <SortHeader field="city" sortBy={sortBy} sortDirection={sortDirection} onSort={handleSort}>City</SortHeader>
              <SortHeader field="foundedYear" sortBy={sortBy} sortDirection={sortDirection} onSort={handleSort}>Founded</SortHeader>
              <th className="text-left px-3 py-2 text-zinc-400 font-medium">Contact</th>
              <th className="text-left px-3 py-2 text-zinc-400 font-medium">Website</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60">
            {loading ? (
              <tr><td colSpan={10} className="px-3 py-8 text-center text-zinc-600">Loading…</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={10} className="px-3 py-8 text-center text-zinc-600">No results</td></tr>
            ) : filtered.map((item) => {
              const key = itemKey(item);

              return (
              <tr
                key={key}
                onClick={() => setSelected((prev) => {
                  const next = new Set(prev);
                  if (next.has(key)) {
                    next.delete(key);
                  } else {
                    next.add(key);
                  }
                  return next;
                })}
                className={`cursor-pointer transition-colors ${selected.has(key) ? "bg-zinc-800/60" : "hover:bg-zinc-900/60"}`}
              >
                <td className="px-3 py-2">
                  <input type="checkbox" readOnly checked={selected.has(key)} className="accent-zinc-400" />
                </td>
                <td className="px-3 py-2 font-medium text-zinc-200 max-w-[200px]">
                  <div className="truncate" title={item.name}>{item.name}</div>
                  {item.description && (
                    <div className="text-zinc-500 text-[10px] truncate mt-0.5" title={item.description}>
                      {item.description.substring(0, 80)}…
                    </div>
                  )}
                </td>
                <td className="px-3 py-2">
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                    SOURCE_COLORS[item.source] || "bg-zinc-800 text-zinc-400"
                  }`}>
                    {item.source}
                  </span>
                </td>
                <td className="px-3 py-2">
                  {item.aiVerdict ? (
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                      VERDICT_COLORS[item.aiVerdict] || "bg-zinc-800 text-zinc-400"
                    }`}>
                      {item.aiVerdict}
                    </span>
                  ) : (
                    <span className="text-zinc-600">—</span>
                  )}
                </td>
                <td className="px-3 py-2 text-zinc-300 font-mono">
                  {item.score ?? "—"}
                </td>
                <td className="px-3 py-2 text-zinc-400">
                  {item.sector ? (
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-zinc-800 text-zinc-400">
                      {item.sector}
                    </span>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-3 py-2 text-zinc-500">{item.city ?? "—"}</td>
                <td className="px-3 py-2 text-zinc-500 font-mono">{item.foundedYear ?? "—"}</td>
                <td className="px-3 py-2 text-zinc-500 max-w-[120px]">
                  {item.contactEmail ? (
                    <div className="truncate" title={item.contactEmail}>{item.contactEmail}</div>
                  ) : item.contactLinkedin ? (
                    <a href={`https://${item.contactLinkedin}`} target="_blank" rel="noopener noreferrer"
                       onClick={(e) => e.stopPropagation()}
                       className="text-blue-400 hover:underline truncate block">
                      {item.contactLinkedin}
                    </a>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-3 py-2 text-zinc-500 truncate max-w-[150px]">
                  {item.website ? (
                    <a href={item.website} target="_blank" rel="noopener noreferrer"
                       onClick={(e) => e.stopPropagation()}
                       className="text-blue-400 hover:underline truncate block">
                      {item.website.replace(/^https?:\/\//, "")}
                    </a>
                  ) : (
                    "—"
                  )}
                </td>
              </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
