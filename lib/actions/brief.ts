"use server";

import { getStartupById } from "@/lib/db/queries/startups";

export async function generateBriefTemplate(startupId: number): Promise<string> {
  const startup = await getStartupById(startupId);
  if (!startup) throw new Error("Startup not found");

  const founders = startup.founders
    .map((f: { name: string; title?: string | null; email?: string | null }) =>
      `${f.name}${f.title ? ` (${f.title})` : ""}${f.email ? ` — ${f.email}` : ""}`)
    .join("\n");

  const latestCall = startup.callNotes[0];
  const latestOutreach = startup.outreachEvents[0];

  const score = startup.priorityScore != null ? `${startup.priorityScore}/10` : "Not scored";

  const lines = [
    `# ${startup.name} — Sourcing Brief`,
    ``,
    `**${startup.description ?? "No description provided."}**`,
    ``,
    `| | |`,
    `|---|---|`,
    `| Sector | ${startup.sector ?? "—"} |`,
    `| Stage | ${startup.stage ?? "—"} |`,
    `| City | ${startup.city ?? "Milan"} |`,
    `| Accelerator / Incubator | ${startup.accelerator ?? "—"} |`,
    `| Website | ${startup.website ?? "—"} |`,
    `| Founded | ${startup.foundedYear ?? "—"} |`,
    `| Priority score | ${score} |`,
    ``,
    `---`,
    ``,
    `## Founders`,
    founders || "_No founders added._",
    ``,
    `---`,
    ``,
    `## Company`,
    startup.problem ? `**Problem:** ${startup.problem}\n` : "",
    startup.product ? `**Product:** ${startup.product}\n` : "",
    startup.businessModel ? `**Business model:** ${startup.businessModel}\n` : "",
    startup.traction ? `**Traction:** ${startup.traction}\n` : "",
    startup.fundingStatus ? `**Funding status:** ${startup.fundingStatus}\n` : "",
    ``,
    `---`,
    ``,
    `## Outreach & Call Status`,
    latestOutreach
      ? `Last contact: ${latestOutreach.date} via ${latestOutreach.channel ?? "unknown channel"} — **${latestOutreach.status}**`
      : "_No outreach logged._",
    latestCall ? `\nCall held on ${latestCall.date}.` : "",
    ``,
    latestCall?.overallImpression ? `**Overall impression:** ${latestCall.overallImpression}\n` : "",
    latestCall?.keyRisks ? `**Key risks:** ${latestCall.keyRisks}\n` : "",
    ``,
    `---`,
    ``,
    `## Recommendation`,
    startup.recommendation === "Present"
      ? `✅ **Present internally**`
      : startup.recommendation === "Do Not Present"
      ? `❌ **Do not present at this stage**`
      : `⏳ **TBD** — evaluation in progress`,
    ``,
    startup.notes ? `*Analyst notes: ${startup.notes}*` : "",
  ];

  return lines.filter((l) => l !== "").join("\n");
}
