"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { SourcesClient } from "@/components/sources-client";
import { ImportB4iClient } from "@/components/import-b4i-client";
import { ImportRegistroClient } from "@/components/import-registro-client";
import { ImportScrapingClient } from "@/components/import-scraping-client";
import type { getSources } from "@/lib/db/queries/sources";

type Source = Awaited<ReturnType<typeof getSources>>[0];

interface Props {
  sources: Source[];
}

const TABS = [
  { id: "custom", label: "Custom Sources" },
  { id: "b4i", label: "🎓 B4I" },
  { id: "registro", label: "📋 Registro" },
  { id: "scraping", label: "🔍 Scraping Data" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function SourcesTabsClient({ sources }: Props) {
  const [active, setActive] = useState<TabId>("custom");

  return (
    <div>
      <div className="flex gap-1 border-b border-zinc-800 mb-6">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActive(tab.id)}
            className={cn(
              "px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px",
              active === tab.id
                ? "border-zinc-100 text-zinc-100"
                : "border-transparent text-zinc-500 hover:text-zinc-300"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {active === "custom" && <SourcesClient sources={sources} />}
      {active === "b4i" && <ImportB4iClient />}
      {active === "registro" && <ImportRegistroClient />}
      {active === "scraping" && <ImportScrapingClient />}
    </div>
  );
}
