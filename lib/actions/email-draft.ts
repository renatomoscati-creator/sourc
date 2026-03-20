"use server";

import { getStartupById } from "@/lib/db/queries/startups";

export async function generateEmailDraft(
  startupId: number,
  type: "initial" | "followup" | "call-request"
): Promise<{ subject: string; body: string }> {
  const startup = await getStartupById(startupId);
  if (!startup) throw new Error("Startup not found");

  const founderName = startup.founders[0]?.name || "Founder";
  const accelerator = startup.accelerator;
  const sector = startup.sector || "your space";
  const description = startup.description;
  const traction = startup.traction;
  const problem = startup.problem;
  const product = startup.product;

  // Extract a specific detail from available info
  const specificDetail = traction 
    ? `your traction with "${traction.substring(0, 80)}${traction.length > 80 ? '...' : ''}"`
    : product
    ? `your product approach with "${product.substring(0, 80)}${product.length > 80 ? '...' : ''}"`
    : description
    ? `your focus on "${description.substring(0, 80)}${description.length > 80 ? '...' : ''}"`
    : "your work in this space";

  const whyItMatters = traction
    ? "it shows clear momentum and execution capability"
    : product
    ? "it demonstrates a thoughtful approach to solving this problem"
    : "it aligns well with what we look for in early-stage companies";

  let subject = "";
  let body = "";

  if (type === "initial") {
    subject = `${startup.name} x Innovis VC — ${accelerator ? `${accelerator} ` : ""}${sector} Opportunity`;

    body = `Dear ${founderName.split(' ')[0]},

I hope you are doing well.

My name is Renato Moscati, and I am part of the Innovis VC hub in Milan. I recently came across ${startup.name} and was particularly interested in what you are building around ${product || problem || sector}. In particular, ${specificDetail} stood out to me, especially because ${whyItMatters}.

${accelerator ? `It was also great to see that you are part of ${accelerator}. ` : ""}I spend a lot of time looking at early-stage companies in ${sector}, and ${startup.name} caught my attention because of the space you are addressing and the approach you seem to be taking.

I would love to learn more about your vision, roadmap, and current progress. If you would be open to it, it would be great to either have a short call or simply exchange a few thoughts here by message, whichever is easier for you.

Best regards,
Renato Moscati
Innovis VC Milan
renato.moscati@innovis.vc
LinkedIn: https://www.linkedin.com/in/renato-moscati-b5a567328/`
  }

  if (type === "followup") {
    subject = `Re: ${startup.name} — Following Up`;

    body = `Dear ${founderName.split(' ')[0]},

I hope you are doing well.

I wanted to follow up on my previous note about ${startup.name}. I understand you are likely focused on building and fundraising can take a backseat — but I remain very interested in what you are doing in ${sector}.

${accelerator ? `Having spent time looking at ${accelerator} companies, I know the caliber of teams that come through the program, and ${startup.name} stands out.` : ""}

If now isn't the right time, I would still love to stay in touch and follow your progress. If you are fundraising, I would appreciate the chance to learn more.

No pressure either way — just let me know what works best for you.

Best regards,
Renato Moscati
Innovis VC Milan
renato.moscati@innovis.vc
LinkedIn: https://www.linkedin.com/in/renato-moscati-b5a567328/`
  }

  if (type === "call-request") {
    subject = `${startup.name} / Innovis VC — Quick Call?`;

    body = `Dear ${founderName.split(' ')[0]},

I hope you are doing well.

Thank you for connecting. I would love to schedule a quick 20-minute call to learn more about ${startup.name} and explore potential fit with Innovis VC.

A bit about us:
• We invest at pre-seed and seed stages
• We are sector-agnostic but focus on ${sector} opportunities
• We move quickly and can lead rounds
• We are hands-on partners who stay with companies long-term

Are you available for a call next week? Here are a few slots that work for me (all times CET):

• Tuesday 10:00–12:00
• Wednesday 14:00–17:00
• Thursday 09:00–11:00

If none of these work, please feel free to suggest a time that is better for you.

Looking forward to speaking!

Best regards,
Renato Moscati
Innovis VC Milan
renato.moscati@innovis.vc
LinkedIn: https://www.linkedin.com/in/renato-moscati-b5a567328/`
  }

  return { subject, body };
}
