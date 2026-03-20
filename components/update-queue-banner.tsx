"use client";

import { useState, useEffect, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { applyUpdate, clearUpdateQueue, type StartupUpdate } from "@/lib/actions/import";
import { Check, Bot, X, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const FIELD_LABELS: Record<string, string> = {
  name: "Name", website: "Website", description: "Description",
  sector: "Sector", stage: "Stage", foundedYear: "Founded Year",
  accelerator: "Accelerator", contactEmail: "Contact Email",
  contactPhone: "Contact Phone", contactLinkedin: "Company LinkedIn",
  problem: "Problem", product: "Product", businessModel: "Business Model",
  traction: "Traction", fundingStatus: "Funding Status",
};

export function UpdateQueueBanner() {
  const [items, setItems] = useState<StartupUpdate[]>([]);
  const [open, setOpen] = useState(false);
  const [approved, setApproved] = useState<Set<number>>(new Set());
  const [done, setDone] = useState(false);
  const [results, setResults] = useState<{ name: string; success: boolean; error?: string }[]>([]);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    let active = true;
    async function poll() {
      try {
        const res = await fetch("/api/update/queue");
        const data = await res.json();
        if (active && Array.isArray(data.items) && data.items.length > 0) {
          setItems(data.items);
        }
      } catch { /* ignore */ }
    }
    poll();
    const id = setInterval(poll, 5000);
    return () => { active = false; clearInterval(id); };
  }, []);

  function openReview() {
    setApproved(new Set(items.map((_, i) => i)));
    setDone(false);
    setResults([]);
    setOpen(true);
  }

  function dismiss() {
    startTransition(async () => {
      await clearUpdateQueue();
      setItems([]);
    });
  }

  function handleConfirm() {
    const toApply = items.filter((_, i) => approved.has(i));
    startTransition(async () => {
      const res = await Promise.all(toApply.map(async (u) => {
        const r = await applyUpdate(u);
        return { name: u.startupName, ...r };
      }));
      await clearUpdateQueue();
      setResults(res);
      setDone(true);
      setItems([]);
    });
  }

  if (items.length === 0) return null;

  return (
    <>
      <div className="fixed bottom-16 right-4 z-50 flex items-center gap-3 rounded-xl border border-blue-800/50 bg-zinc-900 px-4 py-3 shadow-xl shadow-black/40">
        <div className="rounded-full bg-blue-950/60 p-1.5">
          <Bot className="h-4 w-4 text-blue-400" />
        </div>
        <div>
          <p className="text-sm font-medium text-zinc-100">Claude proposed updates to {items.length} startup{items.length !== 1 ? "s" : ""}</p>
          <p className="text-xs text-zinc-500">Review before applying</p>
        </div>
        <div className="flex gap-2 ml-2">
          <Button size="sm" className="h-7 text-xs bg-blue-700 hover:bg-blue-600" onClick={openReview}>Review</Button>
          <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-zinc-600 hover:text-zinc-400" onClick={dismiss} disabled={isPending}>
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{done ? "Updates applied" : `Review ${items.length} proposed update${items.length !== 1 ? "s" : ""}`}</DialogTitle>
          </DialogHeader>

          {done ? (
            <div className="space-y-2 mt-2">
              {results.map((r, i) => (
                <div key={i} className={cn("flex items-center gap-2 rounded-lg border p-3 text-sm", r.success ? "border-emerald-800/40 bg-emerald-950/20 text-emerald-300" : "border-red-800/40 bg-red-950/20 text-red-400")}>
                  {r.success ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                  <span>{r.name}</span>
                  {r.error && <span className="text-xs opacity-70">— {r.error}</span>}
                </div>
              ))}
              <div className="flex justify-end pt-2">
                <Button size="sm" onClick={() => setOpen(false)}>Done</Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 mt-2">
              <p className="text-xs text-zinc-500">These changes were proposed by Claude. Select which ones to apply.</p>
              {items.map((update, i) => (
                <div key={i} className={cn("rounded-lg border p-3 space-y-2 transition-colors", approved.has(i) ? "border-zinc-600 bg-zinc-800/40" : "border-zinc-800 bg-zinc-900/40 opacity-60")}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setApproved(prev => { const n = new Set(prev); n.has(i) ? n.delete(i) : n.add(i); return n; })}
                        className={cn("h-4 w-4 rounded border flex items-center justify-center flex-shrink-0", approved.has(i) ? "border-zinc-500 bg-zinc-700" : "border-zinc-700")}
                      >
                        {approved.has(i) && <Check className="h-2.5 w-2.5 text-zinc-300" />}
                      </button>
                      <span className="text-sm font-medium text-zinc-100">{update.startupName}</span>
                    </div>
                    <ChevronRight className="h-3.5 w-3.5 text-zinc-600" />
                  </div>
                  <table className="w-full text-xs">
                    <tbody>
                      {Object.entries(update.changes).map(([field, value]) => (
                        <tr key={field} className="border-t border-zinc-800/50">
                          <td className="py-1 pr-3 text-zinc-500 w-36">{FIELD_LABELS[field] ?? field}</td>
                          <td className="py-1 text-zinc-300">{String(value)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
              <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
                <span className="text-xs text-zinc-600">{approved.size} of {items.length} selected</span>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>Cancel</Button>
                  <Button size="sm" onClick={handleConfirm} disabled={approved.size === 0 || isPending}>
                    {isPending ? "Applying…" : `Apply ${approved.size} update${approved.size !== 1 ? "s" : ""}`}
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
