"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createSource, deleteSource } from "@/lib/actions/sources";
import { SOURCE_TYPES } from "@/lib/db/schema";
import type { getSources } from "@/lib/db/queries/sources";
import { ImportFromUrlDialog } from "@/components/import-from-url-dialog";
import { Plus, Trash2, ExternalLink, Bot } from "lucide-react";
import { cn } from "@/lib/utils";

type Source = Awaited<ReturnType<typeof getSources>>[0];

const typeColors: Record<string, string> = {
  accelerator: "bg-blue-950 text-blue-300",
  incubator: "bg-violet-950 text-violet-300",
  event: "bg-amber-950 text-amber-300",
  linkedin: "bg-sky-950 text-sky-300",
  referral: "bg-emerald-950 text-emerald-300",
  web: "bg-zinc-800 text-zinc-400",
};

function AddSourceDialog() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [type, setType] = useState<string | null>("accelerator");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      await createSource({
        name: fd.get("name") as string,
        type: type ?? "web",
        url: fd.get("url") as string,
        geographyRelevance: fd.get("geographyRelevance") as string,
        notes: fd.get("notes") as string,
      });
      setOpen(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" className="gap-1.5" />}>
        <Plus className="h-4 w-4" /> Add Source
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Add Source</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3 mt-2">
          <div className="space-y-1"><Label className="text-xs">Name *</Label><Input name="name" required placeholder="e.g. Polihub, H-FARM…" /></div>
          <div className="space-y-1">
            <Label className="text-xs">Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{SOURCE_TYPES.map(t => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1"><Label className="text-xs">URL</Label><Input name="url" placeholder="https://…" /></div>
          <div className="space-y-1"><Label className="text-xs">Geography relevance</Label><Input name="geographyRelevance" placeholder="Milan, Lombardy, North Italy…" /></div>
          <div className="space-y-1"><Label className="text-xs">Notes</Label><Textarea name="notes" rows={2} placeholder="Context, portfolio focus…" /></div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" size="sm" disabled={isPending}>{isPending ? "Adding…" : "Add"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface Props { sources: Source[] }

async function openClaude(sourceName: string, sourceUrl: string) {
  await fetch("/api/open-claude", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sourceName, sourceUrl }),
  });
}

export function SourcesClient({ sources }: Props) {
  const [isPending, startTransition] = useTransition();

  function handleDelete(id: number) {
    if (!confirm("Delete this source?")) return;
    startTransition(() => deleteSource(id));
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <AddSourceDialog />
      </div>

      {sources.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 text-zinc-600 rounded-xl border border-dashed border-zinc-800">
          <p className="text-sm">No sources yet.</p>
          <p className="text-xs mt-1">Add accelerators, incubators, events, and other discovery channels.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-zinc-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900/60">
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Name</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Type</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Geography</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Notes</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Import</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {sources.map((s, i) => (
                <tr key={s.id} className={cn("border-b border-zinc-800/50", i === sources.length - 1 && "border-b-0")}>
                  <td className="px-4 py-3">
                    <div className="font-medium text-zinc-100">{s.name}</div>
                    {s.url && (
                      <a href={s.url} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-zinc-600 hover:text-zinc-400 mt-0.5">
                        {s.url.replace(/^https?:\/\//, "").slice(0, 40)}
                        <ExternalLink className="h-2.5 w-2.5" />
                      </a>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn("inline-flex items-center px-2 py-0.5 rounded text-xs capitalize", typeColors[s.type] ?? "bg-zinc-800 text-zinc-400")}>
                      {s.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-zinc-500">{s.geographyRelevance ?? "—"}</td>
                  <td className="px-4 py-3 text-xs text-zinc-600 max-w-xs truncate">{s.notes ?? "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      {s.url && (
                        <ImportFromUrlDialog
                          sourceId={s.id}
                          sourceName={s.name}
                          sourceUrl={s.url}
                        />
                      )}
                      {s.url && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1.5 h-8 text-xs"
                          onClick={() => openClaude(s.name, s.url!)}
                          title="Open in Claude Code (for LinkedIn / gated sites)"
                        >
                          <Bot className="h-3.5 w-3.5" />
                          Claude
                        </Button>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-zinc-700 hover:text-red-400"
                      onClick={() => handleDelete(s.id)} disabled={isPending}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
