"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { resolveStaleOutreach } from "@/lib/actions/startups";

type StaleItem = {
  outreachId: number;
  startupId: number;
  startupName: string;
  date: string;
  channel: string | null;
  messageType: string | null;
};

export function StaleOutreachBanner({ items: initialItems }: { items: StaleItem[] }) {
  const [items, setItems] = useState<StaleItem[]>(initialItems);
  const [dismissed, setDismissed] = useState(false);
  const [pending, startTransition] = useTransition();

  if (dismissed || items.length === 0) return null;

  function removeItem(outreachId: number) {
    setItems((prev) => prev.filter((i) => i.outreachId !== outreachId));
  }

  function handleAction(
    outreachId: number,
    resolution: "followup" | "pending" | "closed"
  ) {
    startTransition(async () => {
      await resolveStaleOutreach(outreachId, resolution);
      removeItem(outreachId);
    });
  }

  return (
    <div className="mb-6 rounded-xl border border-amber-700/50 bg-amber-950/30 px-4 py-3">
      {/* Banner header */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold text-amber-400">
          ⏰ {items.length} follow-up{items.length > 1 ? "s" : ""} overdue
        </span>
        <button
          onClick={() => setDismissed(true)}
          className="text-amber-600 hover:text-amber-400 text-lg leading-none ml-4"
          aria-label="Dismiss banner"
        >
          ✕
        </button>
      </div>

      {/* Items list */}
      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item.outreachId}
            className="flex flex-col sm:flex-row sm:items-center gap-2 rounded-lg border border-amber-800/30 bg-zinc-900/60 px-3 py-2"
          >
            {/* Info */}
            <div className="flex-1 min-w-0">
              <Link
                href={`/startups/${item.startupId}`}
                className="text-sm font-medium text-amber-300 hover:text-amber-200 truncate"
              >
                {item.startupName}
              </Link>
              <div className="text-xs text-zinc-500 mt-0.5">
                {item.date}
                {item.channel && (
                  <span className="ml-2 text-zinc-600">via {item.channel}</span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-1.5 flex-shrink-0">
              <button
                disabled={pending}
                onClick={() => handleAction(item.outreachId, "followup")}
                className="text-xs px-2 py-1 rounded-md bg-amber-900/50 text-amber-300 hover:bg-amber-800/60 disabled:opacity-50 border border-amber-700/40"
              >
                Send Follow-up
              </button>
              <button
                disabled={pending}
                onClick={() => handleAction(item.outreachId, "pending")}
                className="text-xs px-2 py-1 rounded-md bg-zinc-800 text-zinc-400 hover:bg-zinc-700 disabled:opacity-50 border border-zinc-700"
              >
                Mark No Response
              </button>
              <button
                disabled={pending}
                onClick={() => handleAction(item.outreachId, "closed")}
                className="text-xs px-2 py-1 rounded-md bg-zinc-800 text-zinc-500 hover:bg-zinc-700 disabled:opacity-50 border border-zinc-700"
              >
                Close
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
