"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { confirmImport, type ImportedStartup } from "@/lib/actions/import";
import { Globe, Check, X, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  sourceId?: number;
  sourceName?: string;
  sourceUrl?: string;
}

type Step = "input" | "loading" | "review" | "done" | "error";

export function ImportFromUrlDialog({ sourceId, sourceName, sourceUrl }: Props) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("input");
  const [url, setUrl] = useState(sourceUrl ?? "");
  const [extracted, setExtracted] = useState<ImportedStartup[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ imported: number; skipped: number } | null>(null);
  const [isPending, startTransition] = useTransition();

  function reset() {
    setStep("input");
    setUrl(sourceUrl ?? "");
    setExtracted([]);
    setSelected(new Set());
    setError(null);
    setResult(null);
  }

  async function handleScrape() {
    if (!url.trim()) return;
    setStep("loading");
    setError(null);
    try {
      const res = await fetch("/api/import/firecrawl", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Scraping failed");

      const items: ImportedStartup[] = (data.startups ?? []).map((s: ImportedStartup) => ({
        ...s,
        sourceId,
      }));
      setExtracted(items);
      setSelected(new Set(items.map((_, i) => i)));
      setStep(items.length > 0 ? "review" : "error");
      if (items.length === 0) setError("No startups found on this page. Try a portfolio or directory URL.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setStep("error");
    }
  }

  function handleConfirm() {
    const toImport = extracted.filter((_, i) => selected.has(i));
    startTransition(async () => {
      const r = await confirmImport(toImport);
      setResult(r);
      setStep("done");
    });
  }

  function toggleAll() {
    if (selected.size === extracted.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(extracted.map((_, i) => i)));
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) reset(); }}>
      <DialogTrigger render={<Button size="sm" variant="outline" className="gap-1.5 h-8 text-xs" />}>
        <Globe className="h-3.5 w-3.5" />
        Import from URL
      </DialogTrigger>
      <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {step === "review" ? `Review ${extracted.length} startups found` :
             step === "done" ? "Import complete" :
             `Import from ${sourceName ?? "URL"}`}
          </DialogTitle>
        </DialogHeader>

        {/* Step: input */}
        {(step === "input" || step === "error") && (
          <div className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Portfolio or directory URL</Label>
              <Input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://polihub.it/portfolio"
                onKeyDown={(e) => e.key === "Enter" && handleScrape()}
              />
              <p className="text-xs text-zinc-600">
                Works on any public page — accelerator portfolios, incubator directories, startup lists.
              </p>
            </div>
            {error && (
              <div className="flex gap-2 items-start rounded-lg border border-red-900/40 bg-red-950/20 p-3 text-xs text-red-400">
                <AlertCircle className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                {error}
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>Cancel</Button>
              <Button size="sm" onClick={handleScrape} disabled={!url.trim()}>
                Scrape with Firecrawl
              </Button>
            </div>
          </div>
        )}

        {/* Step: loading */}
        {step === "loading" && (
          <div className="flex flex-col items-center justify-center py-12 gap-3 text-zinc-500">
            <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
            <p className="text-sm">Firecrawl is reading the page…</p>
            <p className="text-xs text-zinc-700">This usually takes 5–15 seconds</p>
          </div>
        )}

        {/* Step: review */}
        {step === "review" && (
          <div className="space-y-3 mt-2">
            <div className="flex items-center justify-between">
              <p className="text-xs text-zinc-500">
                Select which startups to import. Duplicates will be skipped automatically.
              </p>
              <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={toggleAll}>
                {selected.size === extracted.length ? "Deselect all" : "Select all"}
              </Button>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {extracted.map((s, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSelected(prev => {
                    const next = new Set(prev);
                    next.has(i) ? next.delete(i) : next.add(i);
                    return next;
                  })}
                  className={cn(
                    "w-full text-left rounded-lg border p-3 text-xs transition-colors",
                    selected.has(i)
                      ? "border-zinc-600 bg-zinc-800/60"
                      : "border-zinc-800 bg-zinc-900/40 opacity-50"
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-zinc-100 truncate">{s.name}</div>
                      {s.website && <div className="text-zinc-600 truncate">{s.website}</div>}
                      {s.description && (
                        <div className="text-zinc-500 mt-1 line-clamp-2">{s.description}</div>
                      )}
                      <div className="flex gap-2 mt-1.5 flex-wrap">
                        {s.stage && <span className="text-zinc-500">{s.stage}</span>}
                        {s.sector && <span className="text-zinc-600">· {s.sector}</span>}
                        {s.accelerator && <span className="text-emerald-700">· {s.accelerator}</span>}
                      </div>
                    </div>
                    <div className={cn(
                      "flex-shrink-0 rounded border h-4 w-4 flex items-center justify-center mt-0.5",
                      selected.has(i) ? "border-zinc-500 bg-zinc-700" : "border-zinc-700"
                    )}>
                      {selected.has(i) && <Check className="h-2.5 w-2.5 text-zinc-300" />}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
              <span className="text-xs text-zinc-600">{selected.size} of {extracted.length} selected</span>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => setStep("input")}>Back</Button>
                <Button size="sm" onClick={handleConfirm} disabled={selected.size === 0 || isPending}>
                  {isPending ? "Importing…" : `Import ${selected.size} startup${selected.size !== 1 ? "s" : ""}`}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Step: done */}
        {step === "done" && result && (
          <div className="flex flex-col items-center justify-center py-8 gap-3">
            <div className="rounded-full bg-emerald-950/40 border border-emerald-800/40 p-3">
              <Check className="h-5 w-5 text-emerald-400" />
            </div>
            <p className="text-sm font-medium text-zinc-200">
              {result.imported} startup{result.imported !== 1 ? "s" : ""} imported
            </p>
            {result.skipped > 0 && (
              <p className="text-xs text-zinc-600">{result.skipped} skipped (already in database)</p>
            )}
            <Button size="sm" onClick={() => setOpen(false)} className="mt-2">Done</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
