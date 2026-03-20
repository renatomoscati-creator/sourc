"use client";

import { useTransition } from "react";
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

  return (
    <Select
      value={currentStatus}
      onValueChange={(value) => {
        if (!value) return;
        startTransition(() => updateStartupStatus(startupId, value));
      }}
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
  );
}
