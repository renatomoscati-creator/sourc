"use client";

import { useState, useEffect, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { confirmImport, clearImportQueue, type ImportedStartup } from "@/lib/actions/import";
import { Check, Bot, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function ImportQueueBanner() {
  const [items, setItems] = useState<ImportedStartup[]>([]);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [result, setResult] = useState<{ imported: number; skipped: number } | null>(null);
  const [isPending, startTransition] = useTransition();

  // Poll every 5 seconds for new items in the queue
  useEffect(() => {
    let active = true;
    async function poll() {
      try {
        const res = await fetch("/api/import/queue");
        const data = await res.json();
        if (active && Array.isArray(data.items) && data.items.length > 0) {
          setItems(data.items);
        }
      } catch {
        // silently ignore network errors
      }
    }
    poll();
    const id = setInterval(poll, 5000);
    return () => { active = false; clearInterval(id); };
  }, []);

  function openReview() {
    setSelected(new Set(items.map((_, i) => i)));
    setResult(null);
    setOpen(true);
  }

  function dismiss() {
    startTransition(async () => {
      await clearImportQueue();
      setItems([]);
    });
  }

  function handleConfirm() {
    const toImport = items.filter((_, i) => selected.has(i));
    startTransition(async () => {
      const r = await confirmImport(toImport);
      await clearImportQueue();
      setResult(r);
      setItems([]);
    });
  }

  function toggleAll() {
    if (selected.size === items.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(items.map((_, i) => i)));
    }
  }

  if (items.length === 0) return null;

  return (
    <>
      {/* Sticky banner */}
      <div className="fixed bottom-4 right-4 z-50 flex items-center gap-3 rounded-xl border border-emerald-800/50 bg-zinc-900 px-4 py-3 shadow-xl shadow-black/40">
        <div className="rounded-full bg-emerald-950/60 p-1.5">
          <Bot className="h-4 w-4 text-emerald-400" />
        </div>
        <div>
          <p className="text-sm font-medium text-zinc-100">Claude found {items.length} startup{items.length !== 1 ? "s" : ""}</p>
          <p className="text-xs text-zinc-500">Ready to review and import</p>
        </div>
        <div className="flex gap-2 ml-2">
          <Button size="sm" className="h-7 text-xs bg-emerald-700 hover:bg-emerald-600" onClick={openReview}>
            Review
          </Button>
          <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-zinc-600 hover:text-zinc-400" onClick={dismiss} disabled={isPending}>
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Review dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {result ? "Import complete" : `Review ${items.length} startups from Claude`}
            </DialogTitle>
          </DialogHeader>

          {result ? (
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
          ) : (
            <div className="space-y-3 mt-2">
              <div className="flex items-center justify-between">
                <p className="text-xs text-zinc-500">
                  Select which startups to import. Duplicates will be skipped automatically.
                </p>
                <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={toggleAll}>
                  {selected.size === items.length ? "Deselect all" : "Select all"}
                </Button>
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {items.map((s, i) => (
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
                <span className="text-xs text-zinc-600">{selected.size} of {items.length} selected</span>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>Cancel</Button>
                  <Button size="sm" onClick={handleConfirm} disabled={selected.size === 0 || isPending}>
                    {isPending ? "Importing…" : `Import ${selected.size} startup${selected.size !== 1 ? "s" : ""}`}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
