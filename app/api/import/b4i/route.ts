import fs from "fs";
import path from "path";

const B4I_DATA_PATH = path.join(process.cwd(), "data", "b4i-startups.json");

export interface B4iStartup {
  name: string;
  website?: string;
  description?: string;
  sector?: string;
  stage?: string;
  city?: string;
  score?: number;
  aiVerdict?: string;
  source: string;
  accelerator?: string;
  fundingStatus?: string;
  founders?: { name: string; title?: string }[];
  notes?: string;
}

export async function GET() {
  if (!fs.existsSync(B4I_DATA_PATH)) {
    return Response.json({ 
      error: "B4I data file not found. Please ensure b4i-startups.json exists in the data directory.",
      items: [], 
      total: 0, 
      metadata: null 
    });
  }
  try {
    const raw = fs.readFileSync(B4I_DATA_PATH, "utf-8");
    const data = JSON.parse(raw);
    const items: B4iStartup[] = data.startups || [];
    
    // Extract unique values for filtering
    const sectors = [...new Set(items.map((i: B4iStartup) => i.sector).filter(Boolean))].sort();
    const verdicts = [...new Set(items.map((i: B4iStartup) => i.aiVerdict).filter(Boolean))].sort();
    const accelerators = [...new Set(items.map((i: B4iStartup) => i.accelerator).filter(Boolean))].sort();

    return Response.json({
      items,
      total: items.length,
      metadata: data.metadata || null,
      sectors,
      verdicts,
      accelerators,
    });
  } catch {
    return Response.json({ 
      error: "Failed to parse B4I data file",
      items: [], 
      total: 0, 
      metadata: null,
      sectors: [],
      verdicts: [],
      accelerators: [],
    });
  }
}
