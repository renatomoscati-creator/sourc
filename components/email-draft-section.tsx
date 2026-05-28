"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { generateEmailDraft } from "@/lib/actions/email-draft";
import type { StartupWithRelations } from "@/lib/db/queries/startups";
import { Sparkles, Copy, Check, Mail, Send } from "lucide-react";
import { cn } from "@/lib/utils";

type Startup = NonNullable<StartupWithRelations>;

interface Props {
  startup: Startup;
  founderEmail?: string;
}

export function EmailDraftSection({ startup, founderEmail }: Props) {
  const [draft, setDraft] = useState<{ subject: string; body: string } | null>(null);
  const [isPolishing, setIsPolishing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [emailType, setEmailType] = useState<"initial" | "followup" | "call-request">("initial");
  const [language, setLanguage] = useState<"en" | "it">("it");
  const [guidance, setGuidance] = useState("");

  function handleGenerate() {
    startTransition(async () => {
      const result = await generateEmailDraft(startup.id, emailType, language);
      setDraft(result);
    });
  }

  async function handlePolish() {
    if (!draft) return;
    setIsPolishing(true);
    try {
      const res = await fetch("/api/email-draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startupId: startup.id,
          currentDraft: draft.body,
          type: emailType,
          guidance: guidance.trim() || undefined,
        }),
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
      setDraft({ ...draft, body: "" });
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        result += decoder.decode(value, { stream: true });
        setDraft({ ...draft, body: result });
      }
    } finally {
      setIsPolishing(false);
    }
  }

  async function handleCopy() {
    if (!draft) return;
    const fullEmail = `Subject: ${draft.subject}\n\n${draft.body}`;
    await navigator.clipboard.writeText(fullEmail);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleOpenInOutlook() {
    if (!draft || !founderEmail) return;
    const subject = encodeURIComponent(draft.subject);
    const body = encodeURIComponent(draft.body);
    // Use Outlook web URL for universal access
    window.open(`https://outlook.office.com/mail/?to=${founderEmail}&subject=${subject}&body=${body}`);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
          Email Draft
        </h3>
        <div className="flex gap-2">
          {/* Language toggle */}
          <div className="flex rounded border border-zinc-700 overflow-hidden text-xs h-7">
            <button
              onClick={() => setLanguage("en")}
              className={cn("px-2 transition-colors", language === "en" ? "bg-zinc-700 text-zinc-100" : "bg-zinc-900 text-zinc-500 hover:text-zinc-300")}
            >EN</button>
            <button
              onClick={() => setLanguage("it")}
              className={cn("px-2 transition-colors", language === "it" ? "bg-zinc-700 text-zinc-100" : "bg-zinc-900 text-zinc-500 hover:text-zinc-300")}
            >IT</button>
          </div>
          <select
            value={emailType}
            onChange={(e) => setEmailType(e.target.value as typeof emailType)}
            className="text-xs h-7 px-2 rounded border border-zinc-700 bg-zinc-900 text-zinc-300 focus:outline-none focus:ring-1 focus:ring-zinc-500"
          >
            <option value="initial">Initial Outreach</option>
            <option value="followup">Follow-up</option>
            <option value="call-request">Call Request</option>
          </select>
          {draft && (
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
              <Button
                size="sm"
                variant="outline"
                className="gap-1 h-7 text-xs text-emerald-400 border-emerald-800/50 hover:bg-emerald-950/30"
                onClick={handleOpenInOutlook}
              >
                <Send className="h-3 w-3" />
                Open in Outlook
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
            <Mail className="h-3 w-3" />
            {isPending ? "Generating…" : draft ? "Regenerate" : "Generate Draft"}
          </Button>
        </div>
      </div>

      {/* Guidance input */}
      <div className="mb-3">
        <textarea
          value={guidance}
          onChange={(e) => setGuidance(e.target.value)}
          placeholder="Guide the AI… e.g. 'mention their B2B pivot', 'be very brief', 'focus on the Milan ecosystem angle'"
          rows={1}
          className="w-full px-3 py-2 text-xs rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-600 resize-none"
        />
      </div>

      {!draft && !isPending && (
        <div className="flex items-center justify-center h-24 rounded-lg border border-dashed border-zinc-800 text-xs text-zinc-700">
          Select email type and click &ldquo;Generate Draft&rdquo; to create a personalized outreach email
        </div>
      )}

      {draft && (
        <div className="space-y-3">
          <div>
            <div className="text-xs text-zinc-500 mb-1">Subject:</div>
            <div className="text-sm text-zinc-200 font-medium">{draft.subject}</div>
          </div>
          <div>
            <div className="text-xs text-zinc-500 mb-1">Body:</div>
            <Textarea
              value={draft.body}
              onChange={(e) => setDraft({ ...draft, body: e.target.value })}
              className="text-sm font-sans min-h-[200px] leading-relaxed"
            />
          </div>
          {founderEmail && (
            <div className="text-xs text-zinc-600">
              To: {founderEmail}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
