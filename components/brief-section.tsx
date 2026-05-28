"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { generateBriefTemplate } from "@/lib/actions/brief";
import type { StartupWithRelations } from "@/lib/db/queries/startups";
import { Sparkles, Copy, Check, FileText } from "lucide-react";

type Startup = NonNullable<StartupWithRelations>;

interface Props { startup: Startup }

export function BriefSection({ startup }: Props) {
  const [brief, setBrief] = useState<string | null>(null);
  const [isPolishing, setIsPolishing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [guidance, setGuidance] = useState("");

  function handleGenerate() {
    startTransition(async () => {
      const text = await generateBriefTemplate(startup.id);
      setBrief(text);
    });
  }

  async function handlePolish() {
    if (!brief) return;
    setIsPolishing(true);
    try {
      const res = await fetch("/api/brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startupId: startup.id, guidance: guidance.trim() || undefined }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(err.error ?? "AI polish failed. Check that ANTHROPIC_API_KEY is set in .env.local");
        return;
      }
      const reader = res.body?.getReader();
      if (!reader) return;
      const decoder = new TextDecoder();
      let result = "";
      setBrief("");
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        result += decoder.decode(value, { stream: true });
        setBrief(result);
      }
    } finally {
      setIsPolishing(false);
    }
  }

  async function handleCopy() {
    if (!brief) return;
    await navigator.clipboard.writeText(brief);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
          Presentation Brief
        </h3>
        <div className="flex gap-2">
          {brief && (
            <>
              <Button
                size="sm"
                variant="outline"
                className="gap-1 h-7 text-xs"
                onClick={handleCopy}
              >
                {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                {copied ? "Copied!" : "Copy"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="gap-1 h-7 text-xs text-amber-400 border-amber-800/50 hover:bg-amber-950/30"
                onClick={handlePolish}
                disabled={isPolishing}
              >
                <Sparkles className="h-3 w-3" />
                {isPolishing ? "Polishing…" : "✦ Polish with AI"}
              </Button>
            </>
          )}
          <Button
            size="sm"
            variant="outline"
            className="gap-1 h-7 text-xs"
            onClick={handleGenerate}
            disabled={isPending}
          >
            <FileText className="h-3 w-3" />
            {isPending ? "Generating…" : brief ? "Regenerate" : "Generate Brief"}
          </Button>
        </div>
      </div>

      {/* Guidance input */}
      <div className="mb-3">
        <textarea
          value={guidance}
          onChange={(e) => setGuidance(e.target.value)}
          placeholder="Guide the AI… e.g. 'emphasise traction', 'keep it under 200 words'"
          rows={1}
          className="w-full px-3 py-2 text-xs rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-600 resize-none"
        />
      </div>

      {!brief && !isPending && (
        <div className="flex items-center justify-center h-24 rounded-lg border border-dashed border-zinc-800 text-xs text-zinc-700">
          Click &ldquo;Generate Brief&rdquo; to create a presentation-ready summary
        </div>
      )}

      {brief && (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4 text-xs leading-relaxed text-zinc-300 whitespace-pre-wrap font-mono overflow-auto max-h-[600px]">
          {brief}
        </div>
      )}
    </div>
  );
}
