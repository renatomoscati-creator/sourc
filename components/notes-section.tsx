"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { updateStartup } from "@/lib/actions/startups";
import { Check, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  startupId: number;
  notes?: string | null;
  pros?: string | null;
  cons?: string | null;
}

function EditableBlock({
  label,
  value,
  onSave,
  placeholder,
  className,
}: {
  label: string;
  value: string | null | undefined;
  onSave: (val: string) => Promise<void>;
  placeholder: string;
  className?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(value ?? "");
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSave() {
    startTransition(async () => {
      await onSave(text);
      setSaved(true);
      setEditing(false);
      setTimeout(() => setSaved(false), 1500);
    });
  }

  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">{label}</span>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="text-zinc-600 hover:text-zinc-300 transition-colors"
          >
            {saved
              ? <Check className="h-3 w-3 text-emerald-400" />
              : <Pencil className="h-3 w-3" />}
          </button>
        )}
      </div>

      {editing ? (
        <div className="space-y-2">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={placeholder}
            className="text-sm min-h-[100px] leading-relaxed"
            autoFocus
          />
          <div className="flex gap-2 justify-end">
            <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => { setText(value ?? ""); setEditing(false); }}>
              Cancel
            </Button>
            <Button size="sm" className="h-7 text-xs" disabled={isPending} onClick={handleSave}>
              {isPending ? "Saving…" : "Save"}
            </Button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => setEditing(true)}
          className={cn(
            "text-sm leading-relaxed rounded-md px-2 py-1.5 cursor-text min-h-[40px] transition-colors",
            text ? "text-zinc-300" : "text-zinc-700 italic",
            "hover:bg-zinc-800/40"
          )}
        >
          {text || placeholder}
        </div>
      )}
    </div>
  );
}

export function NotesSection({ startupId, notes, pros, cons }: Props) {
  return (
    <div className="space-y-5">
      <EditableBlock
        label="Notes"
        value={notes}
        placeholder="Add internal notes about this startup…"
        onSave={(val) => updateStartup(startupId, { notes: val })}
      />

      <div className="grid grid-cols-2 gap-4">
        <EditableBlock
          label="✅ Pros"
          value={pros}
          placeholder="What stands out positively…"
          onSave={(val) => updateStartup(startupId, { pros: val })}
        />
        <EditableBlock
          label="⚠️ Cons"
          value={cons}
          placeholder="Risks, concerns, weak points…"
          onSave={(val) => updateStartup(startupId, { cons: val })}
        />
      </div>
    </div>
  );
}
