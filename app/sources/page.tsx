export const dynamic = "force-dynamic";

import { getSources } from "@/lib/db/queries/sources";
import { SourcesClient } from "@/components/sources-client";

export default async function SourcesPage() {
  const sources = await getSources();
  return (
    <div className="max-w-screen-lg mx-auto px-6 py-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-zinc-100">Sources</h1>
        <p className="text-sm text-zinc-500 mt-0.5">
          Accelerators, incubators, events, and other discovery channels
        </p>
      </div>
      <SourcesClient sources={sources} />
    </div>
  );
}
