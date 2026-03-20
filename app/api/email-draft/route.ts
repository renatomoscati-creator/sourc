import { NextRequest, NextResponse } from "next/server";
import { streamText } from "ai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { getStartupById } from "@/lib/db/queries/startups";

const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { startupId, currentDraft, type } = body;

    if (!startupId || !currentDraft) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const startup = await getStartupById(startupId);
    if (!startup) {
      return NextResponse.json(
        { error: "Startup not found" },
        { status: 404 }
      );
    }

    const systemPrompt = `You are an expert email writer helping Renato Moscati from Innovis VC Milan polish outreach emails to startup founders.

Your role is to:
- Make emails warm, professional, and respectful of the founder's time
- Maintain Renato's authentic voice and personal style
- Keep the core message and structure intact
- Use European business communication style (slightly more formal than US)
- Ensure the tone is genuine interest, not salesy
- Keep emails under 250 words when possible
- Maintain consistency with Renato's identity at Innovis VC Milan

Style guidelines:
- Use "I hope you are doing well" as opening
- Write "I would love to" instead of "I'd love to" (avoid contractions in formal parts)
- Use "it would be great to" instead of "it'd be great to"
- End with "Best regards," followed by full signature
- Always include: renato.moscati@innovis.vc and LinkedIn URL
- Reference Milan hub when relevant
- Be specific about what caught attention

Do NOT:
- Add fluff or generic corporate phrases
- Make it sound like a template
- Over-promise or exaggerate
- Change the fundamental ask or call-to-action
- Use overly casual American expressions`;

    const userPrompt = `Polish this ${type || "outreach"} email to a startup founder.

Startup context:
- Name: ${startup.name}
- Sector: ${startup.sector || "N/A"}
- Stage: ${startup.stage || "N/A"}
- Accelerator: ${startup.accelerator || "None"}
- Description: ${startup.description || "N/A"}
- Traction: ${startup.traction || "N/A"}

Current draft:
${currentDraft}

Return ONLY the polished email body, no explanations or metadata.`;

    const result = streamText({
      model: anthropic("claude-sonnet-4-20250514"),
      system: systemPrompt,
      prompt: userPrompt,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("Error polishing email draft:", error);
    return NextResponse.json(
      { error: "Failed to polish email draft" },
      { status: 500 }
    );
  }
}
