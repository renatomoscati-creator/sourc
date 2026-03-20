"use client";

import { useState, useTransition } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateStartupStatus } from "@/lib/actions/startups";
import { PIPELINE_STAGES } from "@/lib/db/schema";

interface Props {
  startupId: number;
  currentStatus: string;
}

export function StatusSelect({ startupId, currentStatus }: Props) {
  const [isPending, startTransition] = useTransition();
  const [pendingHellNo, setPendingHellNo] = useState(false);
  const [hellNoReason, setHellNoReason] = useState("");

  function handleValueChange(value: string | null) {
    if (!value) return;
    if (value === "Hell No") {
      setPendingHellNo(true);
      setHellNoReason("");
      return;
    }
    startTransition(() => updateStartupStatus(startupId, value));
  }

  function handleConfirmHellNo() {
    startTransition(() =>
      updateStartupStatus(startupId, "Hell No", hellNoReason || null).then(() => {
        setPendingHellNo(false);
        setHellNoReason("");
      })
    );
  }

  function handleCancelHellNo() {
    setPendingHellNo(false);
    setHellNoReason("");
  }

  return (
    <div className="flex flex-col gap-2">
      <Select
        value={pendingHellNo ? "Hell No" : currentStatus}
        onValueChange={handleValueChange}
        disabled={isPending}
      >
        <SelectTrigger className="w-56 h-8 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {PIPELINE_STAGES.map((stage) => (
            <SelectItem key={stage} value={stage} className="text-xs">
              {stage}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {pendingHellNo && (
        <div className="flex flex-col gap-1.5 w-56">
          <textarea
            value={hellNoReason}
            onChange={(e) => setHellNoReason(e.target.value)}
            placeholder="Why are you skipping this? (optional)"
            rows={2}
            className="w-full px-2 py-1.5 text-xs rounded-md bg-zinc-900 border border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 resize-none"
          />
          <div className="flex gap-1.5">
            <button
              onClick={handleConfirmHellNo}
              disabled={isPending}
              className="flex-1 h-7 text-xs rounded-md bg-red-950 border border-red-800 text-red-300 hover:bg-red-900 transition-colors disabled:opacity-50"
            >
              Confirm
            </button>
            <button
              onClick={handleCancelHellNo}
              disabled={isPending}
              className="flex-1 h-7 text-xs rounded-md bg-zinc-900 border border-zinc-700 text-zinc-400 hover:text-zinc-200 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
