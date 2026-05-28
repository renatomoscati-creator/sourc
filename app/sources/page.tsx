export const dynamic = "force-dynamic";

import { getSources } from "@/lib/db/queries/sources";
import { SourcesTabsClient } from "@/components/sources-tabs-client";

export default async function SourcesPage() {
  const sources = await getSources();

  return (
    <div className="max-w-screen-lg mx-auto px-6 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-zinc-100">Sources</h1>
        <p className="text-sm text-zinc-500 mt-1">
          Startup discovery channels and data sources
        </p>
      </div>
      <SourcesTabsClient sources={sources} />
    </div>
  );
}
