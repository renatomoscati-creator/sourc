"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { confirmImport, findImportedStartups } from "@/lib/actions/import";
import { deleteStartup } from "@/lib/actions/startups";
import type { B4iStartup } from "@/app/api/import/b4i/route";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Trash2, CheckCircle2 } from "lucide-react";

const VERDICT_COLORS: Record<string, string> = {
  PASS: "bg-emerald-900/50 text-emerald-300",
  MAYBE: "bg-amber-900/50 text-amber-300",
  SKIP: "bg-red-900/50 text-red-300",
};

const ACCELERATOR_COLORS: Record<string, string> = {
  "b4i": "bg-blue-900/50 text-blue-300",
  "default": "bg-zinc-800 text-zinc-400",
};

export function ImportB4iClient() {
  const [data, setData] = useState<{
    items: B4iStartup[];
    total: number;
    metadata: {
      source: string;
      generatedAt: string;
      totalStartups: number;
      description: string;
    } | null;
    sectors: string[];
    verdicts: string[];
    accelerators: string[];
  } | null>(null);

  const [search, setSearch] = useState("");
  const [sectorFilter, setSectorFilter] = useState("");
  const [verdictFilter, setVerdictFilter] = useState("");
  const [acceleratorFilter, setAcceleratorFilter] = useState("");
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ imported: number; skipped: number; importedIds: number[] } | null>(null);
  const [importedMap, setImportedMap] = useState<Map<string, number>>(new Map()); // name -> id
  const [deleting, setDeleting] = useState<string | null>(null); // name being deleted

  const fetchData = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/import/b4i");
    const json = await res.json();
    setData(json);
    setSelected(new Set());
    setLoading(false);
  }, []);

  useEffect(() => {
    setTimeout(() => { void fetchData(); }, 0);
  }, [fetchData]);

  // Check which startups are already in the database
  useEffect(() => {
    if (!data?.items.length) return;
    
    const names = data.items.map(item => item.name);
    findImportedStartups(names).then(results => {
      const map = new Map<string, number>();
      for (const r of results) {
        map.set(r.name, r.id);
      }
      setImportedMap(map);
    });
  }, [data?.items]);

  const filtered = data?.items.filter((item) => {
    if (search && !item.name.toLowerCase().includes(search.toLowerCase()) &&
        !(item.city || "").toLowerCase().includes(search.toLowerCase()) &&
        !(item.description || "").toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    if (sectorFilter && item.sector !== sectorFilter) return false;
    if (verdictFilter && item.aiVerdict !== verdictFilter) return false;
    if (acceleratorFilter && item.accelerator !== acceleratorFilter) return false;
    return true;
  }) ?? [];

  const toggleAll = () => {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((_, i) => i)));
    }
  };

  const handleImport = async () => {
    const toImport = filtered
      .filter((_, i) => selected.has(i))
      .map((item) => ({
        name: item.name,
        website: item.website,
        description: item.description,
        sector: item.sector,
        stage: item.stage,
        accelerator: item.accelerator,
        city: item.city || "Milan",
        fundingStatus: item.fundingStatus,
        notes: item.notes,
        founders: item.founders,
      }));
    
    setImporting(true);
    const res = await confirmImport(toImport);
    setResult(res);
    
    // Refresh the imported map
    const names = data!.items.map(item => item.name);
    findImportedStartups(names).then(results => {
      const map = new Map<string, number>();
      for (const r of results) {
        map.set(r.name, r.id);
      }
      setImportedMap(map);
    });
    
    setImporting(false);
    setSelected(new Set());
  };

  const selectByVerdict = (verdict: string) => {
    const indices = filtered
      .map((item, i) => (item.aiVerdict === verdict ? i : -1))
      .filter((i) => i !== -1);
    setSelected(new Set(indices));
  };

  const handleDelete = async (name: string) => {
    const id = importedMap.get(name);
    if (!id || !confirm(`Delete ${name} from the database? This action cannot be undone.`)) return;
    
    setDeleting(name);
    await deleteStartup(id);
    
    // Update the imported map
    const newMap = new Map(importedMap);
    newMap.delete(name);
    setImportedMap(newMap);
    setDeleting(null);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-100">Import B4I Startups</h1>
          <p className="text-sm text-zinc-500 mt-0.5">
            {data ? `${data.total} startups from B4I (Bocconi for Innovation) Portfolio` : "Loading…"}
          </p>
          {data?.metadata && (
            <p className="text-xs text-zinc-600 mt-1">
              {data.metadata.description}
              {" · "}Generated: {data.metadata.generatedAt}
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
          value={sectorFilter}
          onChange={(e) => setSectorFilter(e.target.value)}
          className="bg-zinc-800 border border-zinc-700 rounded px-3 py-1 text-xs text-zinc-200"
        >
          <option value="">All sectors</option>
          {data?.sectors.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>

        <select
          value={acceleratorFilter}
          onChange={(e) => setAcceleratorFilter(e.target.value)}
          className="bg-zinc-800 border border-zinc-700 rounded px-3 py-1 text-xs text-zinc-200"
        >
          <option value="">All batches</option>
          {data?.accelerators.map((a) => <option key={a} value={a}>{a}</option>)}
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
            {selected.size === filtered.length && filtered.length > 0 ? "Deselect all" : `Select all (${filtered.length})`}
          </button>
          {selected.size > 0 && (
            <span className="text-xs text-zinc-500">{selected.size} selected</span>
          )}
        </div>
        <Button
          size="sm"
          disabled={selected.size === 0 || importing}
          onClick={handleImport}
        >
          {importing ? "Importing…" : `Import ${selected.size} startups`}
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-zinc-800 overflow-hidden">
        <table className="w-full text-xs">
          <thead className="bg-zinc-900 border-b border-zinc-800">
            <tr>
              <th className="w-8 px-3 py-2"></th>
              <th className="text-left px-3 py-2 text-zinc-400 font-medium">Name</th>
              <th className="text-left px-3 py-2 text-zinc-400 font-medium">Score</th>
              <th className="text-left px-3 py-2 text-zinc-400 font-medium">Verdict</th>
              <th className="text-left px-3 py-2 text-zinc-400 font-medium">Sector</th>
              <th className="text-left px-3 py-2 text-zinc-400 font-medium">Stage</th>
              <th className="text-left px-3 py-2 text-zinc-400 font-medium">City</th>
              <th className="text-left px-3 py-2 text-zinc-400 font-medium">Batch</th>
              <th className="text-left px-3 py-2 text-zinc-400 font-medium">Founders</th>
              <th className="text-left px-3 py-2 text-zinc-400 font-medium">Website</th>
              <th className="w-20 px-3 py-2 text-zinc-400 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60">
            {loading ? (
              <tr><td colSpan={11} className="px-3 py-8 text-center text-zinc-600">Loading…</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={11} className="px-3 py-8 text-center text-zinc-600">No results</td></tr>
            ) : filtered.map((item, i) => (
              <tr
                key={i}
                onClick={() => setSelected((prev) => {
                  const next = new Set(prev);
                  if (next.has(i)) {
                    next.delete(i);
                  } else {
                    next.add(i);
                  }
                  return next;
                })}
                className={`cursor-pointer transition-colors ${selected.has(i) ? "bg-zinc-800/60" : "hover:bg-zinc-900/60"}`}
              >
                <td className="px-3 py-2">
                  <input type="checkbox" readOnly checked={selected.has(i)} className="accent-zinc-400" />
                </td>
                <td className="px-3 py-2 font-medium text-zinc-200 max-w-[200px]">
                  <div className="flex items-center gap-2">
                    <div className="truncate" title={item.name}>{item.name}</div>
                    {importedMap.has(item.name) && (
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
                    )}
                  </div>
                  {item.description && (
                    <div className="text-zinc-500 text-[10px] truncate mt-0.5" title={item.description}>
                      {item.description.substring(0, 80)}…
                    </div>
                  )}
                </td>
                <td className="px-3 py-2">
                  {item.score != null ? (
                    <div className="flex items-center gap-1">
                      <span className={`text-zinc-300 font-mono font-medium`}>{item.score}</span>
                      {item.score >= 75 && (
                        <Badge className="text-[9px] px-1 py-0 h-4 bg-emerald-900/50 text-emerald-300 border-emerald-700">Strong</Badge>
                      )}
                      {item.score >= 60 && item.score < 75 && (
                        <Badge className="text-[9px] px-1 py-0 h-4 bg-amber-900/50 text-amber-300 border-amber-700">Borderline</Badge>
                      )}
                    </div>
                  ) : (
                    <span className="text-zinc-600">—</span>
                  )}
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
                <td className="px-3 py-2 text-zinc-400">
                  {item.sector ? (
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-zinc-800 text-zinc-400">
                      {item.sector}
                    </span>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-3 py-2 text-zinc-500">{item.stage ?? "—"}</td>
                <td className="px-3 py-2 text-zinc-500">{item.city ?? "—"}</td>
                <td className="px-3 py-2 text-zinc-500 max-w-[150px]">
                  {item.accelerator ? (
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                      ACCELERATOR_COLORS["b4i"] || ACCELERATOR_COLORS["default"]
                    }`}>
                      {item.accelerator}
                    </span>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-3 py-2 text-zinc-500 max-w-[150px]">
                  {item.founders && item.founders.length > 0 ? (
                    <div className="truncate" title={item.founders.map(f => f.name).join(", ")}>
                      {item.founders.map(f => f.name).join(", ")}
                    </div>
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
                <td className="px-3 py-2">
                  <div className="flex items-center gap-1">
                    {importedMap.has(item.name) && (
                      <>
                        <Link
                          href={`/startups/${importedMap.get(item.name)}`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-xs text-zinc-400 hover:text-zinc-200"
                          title="View startup"
                        >
                          View
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-zinc-600 hover:text-red-400"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(item.name);
                          }}
                          disabled={deleting === item.name}
                          title="Delete startup"
                        >
                          {deleting === item.name ? (
                            <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-zinc-400 border-t-transparent" />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5" />
                          )}
                        </Button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
