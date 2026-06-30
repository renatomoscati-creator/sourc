import { streamText } from "ai";
import { getModel, aiConfigured, aiConfigError } from "@/lib/ai";
import { generateBriefTemplate } from "@/lib/actions/brief";

export async function POST(req: Request) {
  const { startupId, guidance } = await req.json();

  const template = await generateBriefTemplate(startupId);

  if (!aiConfigured()) {
    return new Response(JSON.stringify({ error: aiConfigError() }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const result = streamText({
    model: getModel(),
    system: `You are a venture capital analyst assistant. Your task is to polish a startup sourcing brief.
Keep exactly the same structure and sections. Improve the prose to be concise, professional, and presentation-ready.
Use VC-standard language. Do not add information that is not in the source brief. Do not remove sections.
Output valid markdown.`,
    prompt: `Polish this sourcing brief for internal VC presentation:${guidance ? `\n\nAdditional guidance: ${guidance}` : ""}\n\n${template}`,
  });

  return result.toTextStreamResponse();
}
