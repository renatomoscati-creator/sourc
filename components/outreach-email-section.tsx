"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { StartupWithRelations } from "@/lib/db/queries/startups";
import { Sparkles, Copy, Check, Mail } from "lucide-react";

type Startup = NonNullable<StartupWithRelations>;
type Language = "it" | "en";
type MessageType = "first" | "follow-up";

interface Props { startup: Startup }

export function OutreachEmailSection({ startup }: Props) {
  const [email, setEmail] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [language, setLanguage] = useState<Language>("it");
  const [messageType, setMessageType] = useState<MessageType>("first");

  async function handleGenerate() {
    setIsGenerating(true);
    setEmail(null);
    try {
      const res = await fetch("/api/outreach-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startupId: startup.id, language, messageType }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(err.error ?? "Email generation failed. Check that ANTHROPIC_API_KEY is set in .env.local");
        return;
      }
      const reader = res.body?.getReader();
      if (!reader) return;
      const decoder = new TextDecoder();
      let result = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        result += decoder.decode(value, { stream: true });
        setEmail(result);
      }
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleCopy() {
    if (!email) return;
    await navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
          Outreach Email
        </h3>
        <div className="flex items-center gap-2">
          {/* Language toggle */}
          <div className="flex rounded-md border border-zinc-800 overflow-hidden text-xs">
            <button
              onClick={() => setLanguage("it")}
              className={`px-2.5 py-1 transition-colors ${
                language === "it"
                  ? "bg-zinc-700 text-zinc-100"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              🇮🇹 IT
            </button>
            <button
              onClick={() => setLanguage("en")}
              className={`px-2.5 py-1 transition-colors border-l border-zinc-800 ${
                language === "en"
                  ? "bg-zinc-700 text-zinc-100"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              🇬🇧 EN
            </button>
          </div>

          {/* Message type toggle */}
          <div className="flex rounded-md border border-zinc-800 overflow-hidden text-xs">
            <button
              onClick={() => setMessageType("first")}
              className={`px-2.5 py-1 transition-colors ${
                messageType === "first"
                  ? "bg-zinc-700 text-zinc-100"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              1st
            </button>
            <button
              onClick={() => setMessageType("follow-up")}
              className={`px-2.5 py-1 transition-colors border-l border-zinc-800 ${
                messageType === "follow-up"
                  ? "bg-zinc-700 text-zinc-100"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              Follow-up
            </button>
          </div>

          {email && (
            <Button
              size="sm"
              variant="outline"
              className="gap-1 h-7 text-xs"
              onClick={handleCopy}
            >
              {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
              {copied ? "Copied!" : "Copy"}
            </Button>
          )}

          <Button
            size="sm"
            variant="outline"
            className="gap-1 h-7 text-xs text-sky-400 border-sky-800/50 hover:bg-sky-950/30"
            onClick={handleGenerate}
            disabled={isGenerating}
          >
            {isGenerating ? <Sparkles className="h-3 w-3 animate-pulse" /> : <Mail className="h-3 w-3" />}
            {isGenerating ? "Generating…" : email ? "Regenerate" : "Generate Email"}
          </Button>
        </div>
      </div>

      {!email && !isGenerating && (
        <div className="flex items-center justify-center h-24 rounded-lg border border-dashed border-zinc-800 text-xs text-zinc-700">
          Select language &amp; type, then click &ldquo;Generate Email&rdquo;
        </div>
      )}

      {email && (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4 text-xs leading-relaxed text-zinc-300 whitespace-pre-wrap font-mono overflow-auto max-h-[400px]">
          {email}
        </div>
      )}
    </div>
  );
}
