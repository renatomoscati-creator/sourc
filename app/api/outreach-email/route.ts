import { streamText } from "ai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { getStartupById } from "@/lib/db/queries/startups";

export async function POST(req: Request) {
  const { startupId, language, messageType } = await req.json();

  const startup = await getStartupById(startupId);
  if (!startup) {
    return new Response(JSON.stringify({ error: "Startup not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "ANTHROPIC_API_KEY not set in .env.local" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const founders = startup.founders
    .map((f) => `${f.name}${f.title ? ` (${f.title})` : ""}`)
    .join(", ");

  const latestOutreach = startup.outreachEvents[0];

  const context = [
    `Company: ${startup.name}`,
    startup.description ? `Description: ${startup.description}` : null,
    startup.sector ? `Sector: ${startup.sector}` : null,
    startup.stage ? `Stage: ${startup.stage}` : null,
    startup.city ? `City: ${startup.city}` : null,
    startup.accelerator ? `Accelerator/Incubator: ${startup.accelerator}` : null,
    startup.problem ? `Problem they solve: ${startup.problem}` : null,
    startup.product ? `Product: ${startup.product}` : null,
    startup.traction ? `Traction: ${startup.traction}` : null,
    startup.fundingStatus ? `Funding status: ${startup.fundingStatus}` : null,
    founders ? `Founders: ${founders}` : null,
    latestOutreach && messageType === "follow-up"
      ? `Previous outreach: ${latestOutreach.date} via ${latestOutreach.channel ?? "unknown"} — ${latestOutreach.status}`
      : null,
  ]
    .filter(Boolean)
    .join("\n");

  const isItalian = language === "it";
  const isFollowUp = messageType === "follow-up";

  const italianSystem = `Sei un assistente di venture capital specializzato nella comunicazione con startup italiane.
Il tuo compito è scrivere email di outreach professionali in italiano per conto di un fondo VC milanese chiamato Innovis.
Tono: professionale ma caldo, diretto, rispettoso del tempo del fondatore.
Stile: conciso (max 150 parole), autentico, no gergo eccessivo, no superlative vuoti.
Struttura: oggetto email breve + corpo email con saluto, motivo del contatto, proposta di valore per il fondatore, call to action chiara.
Output: solo il testo dell'email, con "Oggetto:" in cima.`;

  const italianFollowUpSystem = `Sei un assistente di venture capital specializzato nella comunicazione con startup italiane.
Il tuo compito è scrivere email di follow-up professionali in italiano per conto di un fondo VC milanese chiamato Innovis.
Tono: rispettoso, breve, non insistente — un gentile promemoria.
Stile: max 80 parole, nessuna pressione, ricorda il contatto precedente.
Struttura: oggetto email breve + corpo email sintetico con riferimento al messaggio precedente e una call to action morbida.
Output: solo il testo dell'email, con "Oggetto:" in cima.`;

  const englishSystem = `You are a venture capital outreach assistant writing on behalf of Innovis, a Milan-based VC fund.
Your task is to write a professional cold outreach email to an Italian startup founder.
Tone: professional yet warm, direct, respectful of the founder's time.
Style: concise (max 150 words), authentic, no empty buzzwords, no excessive superlatives.
Structure: short subject line + email body with greeting, reason for contact, value proposition for the founder, clear call to action.
Note: the founder may be Italian — keep language simple and clear.
Output: email text only, starting with "Subject:" on the first line.`;

  const englishFollowUpSystem = `You are a venture capital outreach assistant writing on behalf of Innovis, a Milan-based VC fund.
Your task is to write a professional follow-up email to an Italian startup founder who hasn't replied yet.
Tone: respectful, brief, non-pushy — a gentle reminder.
Style: max 80 words, no pressure, reference the previous contact.
Note: the founder may be Italian — keep language simple and clear.
Output: email text only, starting with "Subject:" on the first line.`;

  const systemPrompt = isItalian
    ? isFollowUp ? italianFollowUpSystem : italianSystem
    : isFollowUp ? englishFollowUpSystem : englishSystem;

  const userPrompt = isItalian
    ? `Scrivi l'email di outreach${isFollowUp ? " di follow-up" : ""} per questa startup:\n\n${context}`
    : `Write the ${isFollowUp ? "follow-up " : ""}outreach email for this startup:\n\n${context}`;

  const anthropic = createAnthropic({ apiKey });

  const result = streamText({
    model: anthropic("claude-sonnet-4-5"),
    system: systemPrompt,
    prompt: userPrompt,
  });

  return result.toTextStreamResponse();
}
