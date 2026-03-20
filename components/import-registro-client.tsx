"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { confirmImport } from "@/lib/actions/import";
import type { RegistroEntry } from "@/app/api/import/registro/route";

const PROVINCE_LABELS: Record<string, string> = {
  MI: "Milano", RM: "Roma", NA: "Napoli", TO: "Torino", BO: "Bologna",
  BS: "Brescia", BG: "Bergamo", BA: "Bari", GE: "Genova", SA: "Salerno",
  FI: "Firenze", VR: "Verona", PD: "Padova", MO: "Modena", RE: "Reggio Emilia",
};

export function ImportRegistroClient() {
  const [province, setProvince] = useState("MI");
  const [sector, setSector] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<{ items: RegistroEntry[]; total: number; provinces: string[]; sectors: string[] } | null>(null);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ imported: number; skipped: number } | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ province, sector, page: String(page), limit: "50" });
    const res = await fetch(`/api/import/registro?${params}`);
    const json = await res.json();
    setData(json);
    setSelected(new Set());
    setLoading(false);
  }, [province, sector, page]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { setPage(1); }, [province, sector]);

  const filtered = data?.items.filter(item =>
    !search || item.name.toLowerCase().includes(search.toLowerCase()) ||
    item.city?.toLowerCase().includes(search.toLowerCase())
  ) ?? [];

  const toggleAll = () => {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((_, i) => i)));
    }
  };

  const handleImport = async () => {
    const toImport = filtered.filter((_, i) => selected.has(i)).map(e => ({
      name: e.name,
      website: e.website,
      sector: e.sector,
      city: e.city,
      foundedYear: e.foundedYear,
      stage: e.stage,
      accelerator: e.accelerator,
      description: e.ateco ? `ATECO ${e.ateco}` : undefined,
    }));
    setImporting(true);
    const res = await confirmImport(toImport);
    setResult(res);
    setImporting(false);
    setSelected(new Set());
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-100">Registro Startup Innovative 2025</h1>
          <p className="text-sm text-zinc-500 mt-0.5">
            {data ? `${data.total.toLocaleString()} AI / Software / R&D startups found` : "Loading…"}
          </p>
        </div>
        <a href="/startups" className="text-xs text-zinc-500 hover:text-zinc-300 underline">← Back to Startups</a>
      </div>

      {result && (
        <div className="rounded-lg border border-emerald-700 bg-emerald-950/40 px-4 py-3 text-sm text-emerald-300">
          ✓ Imported <strong>{result.imported}</strong> startups
          {result.skipped > 0 && <span className="text-zinc-400"> · {result.skipped} skipped (already exist)</span>}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex gap-2 flex-wrap">
          {["MI", "RM", "NA", "TO", "BO", "BS", "BG", "BA", "FI", "ALL"].map(p => (
            <button
              key={p}
              onClick={() => setProvince(p === "ALL" ? "" : p)}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                (p === "ALL" ? province === "" : province === p)
                  ? "bg-zinc-200 text-zinc-900"
                  : "bg-zinc-800 text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {p === "ALL" ? "All Italy" : (PROVINCE_LABELS[p] ?? p)}
            </button>
          ))}
        </div>

        <select
          value={sector}
          onChange={e => setSector(e.target.value)}
          className="bg-zinc-800 border border-zinc-700 rounded px-3 py-1 text-xs text-zinc-200"
        >
          <option value="">All sectors</option>
          {data?.sectors.map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        <Input
          placeholder="Search by name or city…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-56 h-7 text-xs"
        />
      </div>

      {/* Bulk actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={toggleAll} className="text-xs text-zinc-400 hover:text-zinc-200 underline">
            {selected.size === filtered.length && filtered.length > 0 ? "Deselect all" : `Select all ${filtered.length}`}
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
              <th className="text-left px-3 py-2 text-zinc-400 font-medium">City</th>
              <th className="text-left px-3 py-2 text-zinc-400 font-medium">Sector</th>
              <th className="text-left px-3 py-2 text-zinc-400 font-medium">ATECO</th>
              <th className="text-left px-3 py-2 text-zinc-400 font-medium">Founded</th>
              <th className="text-left px-3 py-2 text-zinc-400 font-medium">Website</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60">
            {loading ? (
              <tr><td colSpan={7} className="px-3 py-8 text-center text-zinc-600">Loading…</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={7} className="px-3 py-8 text-center text-zinc-600">No results</td></tr>
            ) : filtered.map((item, i) => (
              <tr
                key={i}
                onClick={() => setSelected(prev => {
                  const next = new Set(prev);
                  next.has(i) ? next.delete(i) : next.add(i);
                  return next;
                })}
                className={`cursor-pointer transition-colors ${selected.has(i) ? "bg-zinc-800/60" : "hover:bg-zinc-900/60"}`}
              >
                <td className="px-3 py-2">
                  <input type="checkbox" readOnly checked={selected.has(i)} className="accent-zinc-400" />
                </td>
                <td className="px-3 py-2 font-medium text-zinc-200">{item.name}</td>
                <td className="px-3 py-2 text-zinc-400">{item.city ?? "—"}</td>
                <td className="px-3 py-2">
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                    item.sector === "Software" ? "bg-blue-900/50 text-blue-300" :
                    item.sector === "R&D / Deep Tech" ? "bg-purple-900/50 text-purple-300" :
                    "bg-zinc-800 text-zinc-400"
                  }`}>{item.sector}</span>
                </td>
                <td className="px-3 py-2 text-zinc-500 font-mono">{item.ateco ?? "—"}</td>
                <td className="px-3 py-2 text-zinc-500">{item.foundedYear ?? "—"}</td>
                <td className="px-3 py-2 text-zinc-500 truncate max-w-[150px]">
                  {item.website ? (
                    <a href={item.website} target="_blank" rel="noopener noreferrer"
                       onClick={e => e.stopPropagation()}
                       className="text-blue-400 hover:underline truncate block">
                      {item.website.replace(/^https?:\/\//, "")}
                    </a>
                  ) : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {data && data.total > 50 && (
        <div className="flex items-center justify-between text-xs text-zinc-500">
          <span>Page {page} of {Math.ceil(data.total / 50)}</span>
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
            <Button size="sm" variant="ghost" disabled={page >= Math.ceil(data.total / 50)} onClick={() => setPage(p => p + 1)}>Next</Button>
          </div>
        </div>
      )}
    </div>
  );
}
