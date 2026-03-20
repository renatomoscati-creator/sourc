import FirecrawlApp from "firecrawl";
import { z } from "zod";

// Schema for what we want Firecrawl's AI to extract from any page
const StartupSchema = z.object({
  startups: z.array(
    z.object({
      name: z.string().describe("Company or startup name"),
      website: z.string().optional().describe("Company website URL"),
      description: z.string().optional().describe("Short description of what the company does"),
      sector: z.string().optional().describe("Industry sector or vertical (e.g. SaaS, Fintech, Health)"),
      stage: z.string().optional().describe("Funding stage: Pre-seed, Seed, Series A, or Unknown"),
      foundedYear: z.number().optional().describe("Year the company was founded"),
      accelerator: z.string().optional().describe("Accelerator or incubator name if mentioned"),
      founders: z.array(z.object({
        name: z.string(),
        title: z.string().optional(),
      })).optional().describe("Founder names and titles if listed"),
    })
  ).describe("All startups, companies, or portfolio companies found on this page"),
});

export async function POST(req: Request) {
  const { url } = await req.json();

  if (!url) {
    return Response.json({ error: "URL is required" }, { status: 400 });
  }

  const apiKey = process.env.FIRECRAWL_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "FIRECRAWL_API_KEY not set in .env.local. Get a free key at firecrawl.dev" },
      { status: 400 }
    );
  }

  try {
    const app = new FirecrawlApp({ apiKey });

    // Use Firecrawl's extract endpoint — their AI parses the page for us
    const result = await app.extract([url], {
      prompt: `Extract all startups, portfolio companies, or ventures listed on this page.
For each one, capture: name, website, description, sector/vertical, funding stage, founded year,
accelerator/incubator affiliation, and founder names if available.
Focus on Milan-based or Italian startups. If a field is not mentioned, omit it.`,
      schema: StartupSchema,
    });

    if (!result.success) {
      return Response.json({ error: "Firecrawl extraction failed", details: result }, { status: 500 });
    }

    const extracted = (result.data as z.infer<typeof StartupSchema>).startups ?? [];

    return Response.json({
      success: true,
      url,
      count: extracted.length,
      startups: extracted,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}
