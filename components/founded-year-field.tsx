"use client";

import { useState, useTransition, useRef } from "react";
import { updateStartup } from "@/lib/actions/startups";
import { Pencil } from "lucide-react";

interface Props {
  startupId: number;
  value?: number | null;
}

export function FoundedYearField({ startupId, value }: Props) {
  const [editing, setEditing] = useState(false);
  const [year, setYear] = useState(value?.toString() ?? "");
  const [display, setDisplay] = useState(value ?? null);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  function handleCommit() {
    const parsed = year ? parseInt(year, 10) : null;
    if (parsed && (parsed < 1900 || parsed > new Date().getFullYear())) return;
    startTransition(async () => {
      await updateStartup(startupId, { foundedYear: parsed });
      setDisplay(parsed);
      setEditing(false);
    });
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1">
        <span className="text-xs text-zinc-600">Founded</span>
        {!editing && (
          <button
            onClick={() => { setEditing(true); setTimeout(() => inputRef.current?.focus(), 0); }}
            className="text-zinc-700 hover:text-zinc-400 transition-colors"
          >
            <Pencil className="h-2.5 w-2.5" />
          </button>
        )}
      </div>

      {editing ? (
        <input
          ref={inputRef}
          type="number"
          min={1900}
          max={new Date().getFullYear()}
          value={year}
          onChange={(e) => setYear(e.target.value)}
          onBlur={handleCommit}
          onKeyDown={(e) => { if (e.key === "Enter") handleCommit(); if (e.key === "Escape") setEditing(false); }}
          disabled={isPending}
          placeholder="e.g. 2021"
          className="w-24 text-sm bg-zinc-800 border border-zinc-600 rounded px-2 py-0.5 text-zinc-200 focus:outline-none focus:ring-1 focus:ring-zinc-500"
        />
      ) : (
        <div
          onClick={() => setEditing(true)}
          className="text-sm text-zinc-300 cursor-pointer hover:text-zinc-100 transition-colors"
        >
          {display ?? <span className="text-zinc-700 italic">—</span>}
        </div>
      )}
    </div>
  );
}
