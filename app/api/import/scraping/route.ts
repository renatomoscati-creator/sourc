import fs from "fs";
import path from "path";

const CONSOLIDATED_PATH = path.join(process.cwd(), "data", "consolidated-scraping-data.json");
const SCOUT_SHORTLIST_PATH = path.join(process.cwd(), "data", "new-startups-shortlist-2026-04-27.json");
const ITALIAN_SOURCE_IDS = new Set(["firecrawl-contacts", "polihub"]);
const REAL_SOURCE_NAMES: Record<string, string> = {
  "firecrawl-contacts": "PoliHub / Firecrawl",
  polihub: "PoliHub profiles",
};

type SourcingVerdict = "PASS" | "MAYBE" | "SKIP";

type SourcingAssessment = {
  canonicalName?: string;
  website?: string;
  sector: string;
  score: number;
  aiVerdict: SourcingVerdict;
  stage?: string;
  city?: string;
  description: string;
  notes: string;
};

const SOURCING_ASSESSMENTS: Record<string, SourcingAssessment> = {
  agade: {
    sector: "University spinout / Industrial medtech robotics",
    score: 9.2,
    aiVerdict: "PASS",
    stage: "Early stage",
    city: "Milan",
    description: "Politecnico di Milano spin-off building patented adaptive exoskeletons for logistics and manufacturing fatigue reduction.",
    notes: "Strong match: Italian, university spin-off, defensible hardware IP, industrial/health pain point.",
  },
  aiblooms: {
    canonicalName: "AIBlooms",
    sector: "University spinout / AI software",
    score: 9.1,
    aiVerdict: "PASS",
    stage: "Early stage",
    city: "Milan",
    description: "Politecnico di Milano spin-off developing AI and machine-learning software.",
    notes: "Very strong fit: explicit Polimi spin-off, AI-native, likely young enough for early-stage sourcing.",
  },
  "cambridge raman imaging": {
    sector: "University spinout / Medtech imaging",
    score: 8.8,
    aiVerdict: "PASS",
    stage: "Early stage",
    city: "Milan",
    description: "Deep-tech Raman imaging company bringing ultra-fast laser and spectroscopy systems to medical tissue analysis.",
    notes: "Strong university/deep-tech signal and large clinical need; confirm Italian HQ/cap table and current fundraising stage.",
  },
  "synergy flow": {
    sector: "University-linked deeptech / Energy storage",
    score: 8.7,
    aiVerdict: "PASS",
    stage: "Early stage",
    city: "Milan",
    description: "Developer of sustainable low-cost redox flow batteries for multi-day energy storage.",
    notes: "Strong climate/deeptech fit and likely technical moat; heavier capex profile than pure software.",
  },
  "helio witch": {
    canonicalName: "HelioSwitch",
    website: "https://www.helioswitch.cloud",
    sector: "University-linked energy software",
    score: 8.5,
    aiVerdict: "PASS",
    stage: "Early stage",
    city: "Milan",
    description: "Cloud service for optimal dispatch of demand/generation flexibility using energy-market modeling and weather uncertainty.",
    notes: "Good match: Italian, technical energy software, early-looking PoliHub company.",
  },
  "helio%c6%a8witch": {
    canonicalName: "HelioSwitch",
    website: "https://www.helioswitch.cloud",
    sector: "University-linked energy software",
    score: 8.5,
    aiVerdict: "PASS",
    stage: "Early stage",
    city: "Milan",
    description: "Cloud service for optimal dispatch of demand/generation flexibility using energy-market modeling and weather uncertainty.",
    notes: "Duplicate PoliHub spelling of HelioSwitch; keep one enriched record.",
  },
  "postura ergonomics": {
    sector: "AI SaaS / Industrial health",
    score: 8.3,
    aiVerdict: "PASS",
    stage: "Early stage",
    city: "Milan",
    description: "AI SaaS for faster, more objective ergonomic assessments in industrial workstations.",
    notes: "Good early-stage Italian SaaS fit with clear workplace workflow pain; university spin-off signal not explicit.",
  },
  supair: {
    sector: "Aerospace deeptech",
    score: 8.1,
    aiVerdict: "PASS",
    stage: "Early stage",
    city: "Turin",
    description: "Developer of patented eVTOL aircraft technology using high-efficiency ThrustPod architecture.",
    notes: "Strong Italian deeptech, but aerospace/eVTOL is capital intensive and needs careful stage validation.",
  },
  "remedy technologies": {
    sector: "Medtech / Spinal oncology",
    score: 8.0,
    aiVerdict: "PASS",
    stage: "Early stage",
    city: "Milan",
    description: "Medtech startup developing spinal stabilization systems for oncological spine pathologies.",
    notes: "Solid technical medtech fit; regulatory and hardware timeline risk lowers near-term VC fit slightly.",
  },
  artiness: {
    sector: "Medtech / Augmented reality",
    score: 7.8,
    aiVerdict: "PASS",
    stage: "Early stage",
    city: "Milan",
    description: "Augmented-reality clinical visualization company using 4D holograms from patient-specific imaging.",
    notes: "Good Italian medtech/clinical workflow fit; confirm current product maturity and clinical adoption.",
  },
  efeso: {
    canonicalName: "EFESO",
    sector: "University-linked deeptech / Quantum materials",
    score: 7.7,
    aiVerdict: "PASS",
    stage: "Early stage",
    city: "Milan",
    description: "Deep-tech project using quantum materials to build ultra-low-power electronic components.",
    notes: "Very technical and potentially university-derived; high risk, long horizon, but fits deeptech thesis.",
  },
  nautilus: {
    canonicalName: "Nautilus",
    website: "https://www.spacenautilus.com",
    sector: "Space software / Flight dynamics",
    score: 7.6,
    aiVerdict: "MAYBE",
    stage: "Early stage",
    city: "Bologna",
    description: "Private European provider of mission analysis and flight dynamics services for CubeSat and SmallSat deep-space missions.",
    notes: "Good technical Italian space/software angle; verify spin-off status and whether it is still early enough.",
  },
  "nautilus 2": {
    canonicalName: "Nautilus",
    website: "https://www.spacenautilus.com",
    sector: "Space software / Flight dynamics",
    score: 7.6,
    aiVerdict: "MAYBE",
    stage: "Early stage",
    city: "Bologna",
    description: "Private European provider of mission analysis and flight dynamics services for CubeSat and SmallSat deep-space missions.",
    notes: "Duplicate PoliHub entry for Nautilus; keep one enriched record.",
  },
  "overspace aviation": {
    sector: "Aerospace deeptech",
    score: 7.3,
    aiVerdict: "MAYBE",
    stage: "Early stage",
    city: "Milan",
    description: "Developer of a modular patented VTOL aircraft for customized and sustainable aviation use cases.",
    notes: "Italian deeptech and incubator-sourced, but aircraft hardware is capex-heavy and less university-spinout explicit.",
  },
  openmall: {
    canonicalName: "OpenMall",
    website: "https://openmall.ai",
    sector: "AI consumer / Social commerce",
    score: 7.1,
    aiVerdict: "MAYBE",
    stage: "Early stage",
    city: "Milan",
    description: "AI-powered social commerce platform with 3D, virtual assistants, and mixed-reality shopping experiences.",
    notes: "Looks early and AI-native, but weaker deeptech signal.",
  },
  "openmall 3": {
    canonicalName: "OpenMall",
    website: "https://openmall.ai",
    sector: "AI consumer / Social commerce",
    score: 7.1,
    aiVerdict: "MAYBE",
    stage: "Early stage",
    city: "Milan",
    description: "AI-powered social commerce platform with 3D, virtual assistants, and mixed-reality shopping experiences.",
    notes: "Looks early and AI-native, but weaker deeptech signal.",
  },
  billding: {
    canonicalName: "Billding",
    website: "https://billding.it",
    sector: "AI fintech / Utilities switching",
    score: 6.9,
    aiVerdict: "MAYBE",
    stage: "Early stage",
    city: "Milan",
    description: "AI/OCR platform helping individuals and SMEs estimate savings across electricity, gas, internet, and telephony.",
    notes: "Italian and productized, but more commercial SaaS/consumer fintech than university spin-off deeptech.",
  },
  "billding the virtual home for utilities": {
    canonicalName: "Billding",
    website: "https://billding.it",
    sector: "AI fintech / Utilities switching",
    score: 6.9,
    aiVerdict: "MAYBE",
    stage: "Early stage",
    city: "Milan",
    description: "AI/OCR platform helping individuals and SMEs estimate savings across electricity, gas, internet, and telephony.",
    notes: "Italian and productized, but more commercial SaaS/consumer fintech than university spin-off deeptech.",
  },
  blimp: {
    sector: "AI data analytics / Urban intelligence",
    score: 6.8,
    aiVerdict: "MAYBE",
    stage: "Unknown",
    city: "Milan",
    description: "AI data company analyzing flows of people and vehicles in urban environments.",
    notes: "Relevant AI/data company, but maturity and university spin-off signal are unclear.",
  },
  narvalo: {
    sector: "University spinout / Urban health hardware",
    score: 6.6,
    aiVerdict: "MAYBE",
    stage: "Unknown",
    city: "Milan",
    description: "Politecnico di Milano spin-off producing anti-pollution masks and smart air-quality add-ons.",
    notes: "Explicit spin-off, but product is more consumer hardware/lifestyle and may be less venture-scalable now.",
  },
  "bonus x": {
    canonicalName: "BonusX",
    website: "https://bonusx.it",
    sector: "Govtech / Welfare benefits",
    score: 6.2,
    aiVerdict: "MAYBE",
    stage: "Unknown",
    city: "Milan",
    description: "Platform that helps citizens and employees discover and apply for public bonuses and benefits.",
    notes: "Useful Italian govtech workflow, but weaker university/deeptech signal and likely more mature.",
  },
  "fili pari": {
    sector: "Materials / Circular fashion",
    score: 6.0,
    aiVerdict: "MAYBE",
    stage: "Unknown",
    city: "Milan",
    description: "Materials/fashion company using marble powder by-products in patented textile membranes.",
    notes: "Interesting Italian materials story, but appears brand/commercially mature and less core early-stage tech.",
  },
  nireos: {
    canonicalName: "NIREOS",
    sector: "University spinout / Photonics",
    score: 8.6,
    aiVerdict: "PASS",
    stage: "Early stage",
    city: "Milan",
    description: "Politecnico di Milano Physics Department spin-off developing patented photonics, spectroscopy, and hyperspectral imaging devices.",
    notes: "Strong match: explicit Polimi spin-off, hard-science IP, industrial R&D use cases.",
  },
  leafspace: {
    canonicalName: "Leaf Space",
    sector: "Space infrastructure",
    score: 5.8,
    aiVerdict: "SKIP",
    stage: "Later stage",
    city: "Milan",
    description: "Ground-segment services platform for microsatellite operators.",
    notes: "Strong Italian space company, but likely too mature for the requested early-stage thesis.",
  },
  isaac: {
    canonicalName: "ISAAC",
    sector: "Construction deeptech / Seismic protection",
    score: 5.7,
    aiVerdict: "SKIP",
    stage: "Later stage",
    city: "Milan",
    description: "Smart seismic protection and structural monitoring systems for existing buildings.",
    notes: "Technically interesting and Italian, but active since 2018 and likely no longer early-stage.",
  },
  "indigo ai": {
    canonicalName: "Indigo.ai",
    sector: "Conversational AI SaaS",
    score: 5.4,
    aiVerdict: "SKIP",
    stage: "Later stage",
    city: "Milan",
    description: "No-code platform for designing chatbots and voicebots using conversational AI.",
    notes: "Italian AI company, but comparatively mature and not a university spin-off/deeptech wedge.",
  },
  empatica: {
    sector: "Wearables / Digital health",
    score: 5.0,
    aiVerdict: "SKIP",
    stage: "Later stage",
    city: "Milan",
    description: "Clinical-quality wearable devices and sensing systems used in medical research and patient monitoring.",
    notes: "Excellent company historically, but far too mature for early-stage sourcing.",
  },
  "energy dome": {
    sector: "Climate deeptech / Energy storage",
    score: 4.8,
    aiVerdict: "SKIP",
    stage: "Later stage",
    city: "Milan",
    description: "Developer of CO2-based long-duration energy storage systems.",
    notes: "Strong Italian climate company, but well beyond early stage for this dashboard flow.",
  },
};

export interface ScrapingDataItem {
  name: string;
  website?: string;
  description?: string;
  sector?: string;
  stage?: string;
  foundedYear?: number;
  accelerator?: string;
  contactEmail?: string;
  contactPhone?: string;
  contactLinkedin?: string;
  city?: string;
  fundingStatus?: string;
  traction?: string;
  notes?: string;
  score?: number;
  aiVerdict?: string;
  source: string;
  province?: string;
  codiceFiscale?: string;
  ateco?: string;
}

type ScoutDataItem = ScrapingDataItem & {
  _score?: number;
  _aiVerdict?: string;
  _source?: string;
};

function readJsonFile(filePath: string): unknown {
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

function normalizeScoutItem(item: ScoutDataItem): ScrapingDataItem {
  return {
    ...item,
    score: item.score ?? item._score,
    aiVerdict: item.aiVerdict ?? item._aiVerdict,
    source: item.source ?? item._source ?? "creandum-scout",
  };
}

function normalizedName(name: string) {
  return name
    .toLowerCase()
    .replace(/–/g, " ")
    .replace(/the virtual home for utilities\.?/g, "the virtual home for utilities")
    .replace(/[^a-z0-9%c6 ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function enrichForSourcing(item: ScrapingDataItem): ScrapingDataItem {
  const assessment = SOURCING_ASSESSMENTS[normalizedName(item.name)];
  if (!assessment) return item;

  return {
    ...item,
    name: assessment.canonicalName ?? item.name,
    website: assessment.website ?? item.website,
    description: assessment.description,
    sector: assessment.sector,
    stage: assessment.stage ?? item.stage,
    city: assessment.city ?? item.city,
    score: assessment.score,
    aiVerdict: assessment.aiVerdict,
    notes: assessment.notes,
  };
}

function dedupeItems(items: ScrapingDataItem[]) {
  const map = new Map<string, ScrapingDataItem>();
  for (const item of items) {
    const key = item.website
      ? item.website.replace(/^https?:\/\//, "").replace(/\/$/, "").toLowerCase()
      : normalizedName(item.name);
    const existing = map.get(key);
    if (!existing || (item.score ?? 0) > (existing.score ?? 0)) {
      map.set(key, item);
    }
  }
  return [...map.values()].sort((a, b) => (b.score ?? -1) - (a.score ?? -1) || a.name.localeCompare(b.name));
}

export async function GET() {
  try {
    const data = readJsonFile(CONSOLIDATED_PATH) as {
      startups?: ScrapingDataItem[];
      metadata?: { generatedAt?: string; sources?: { name: string; count?: number }[] };
    } | null;
    const scoutData = readJsonFile(SCOUT_SHORTLIST_PATH) as ScoutDataItem[] | null;
    const scoutItems = Array.isArray(scoutData) ? scoutData.map(normalizeScoutItem) : [];
    const items: ScrapingDataItem[] = dedupeItems(
      [...(data?.startups || []), ...scoutItems]
        .filter((item) => ITALIAN_SOURCE_IDS.has(item.source))
        .map(enrichForSourcing)
    );
    const sourceCounts = items.reduce<Record<string, number>>((acc, item) => {
      acc[item.source] = (acc[item.source] ?? 0) + 1;
      return acc;
    }, {});
    const metadata = {
      ...(data?.metadata || {}),
      generatedAt: data?.metadata?.generatedAt || new Date().toISOString(),
      excludedSources: "Registro-derived sources and non-Italian European scout picks are hidden from this import flow.",
      sources: Object.entries(sourceCounts).map(([source, count]) => ({
        name: REAL_SOURCE_NAMES[source] ?? source,
        count,
      })),
    };

    return Response.json({
      items,
      total: items.length,
      metadata,
      // Unique values for filtering
      sources: [...new Set(items.map((i: ScrapingDataItem) => i.source).filter(Boolean))].sort(),
      sectors: [...new Set(items.map((i: ScrapingDataItem) => i.sector).filter(Boolean))].sort(),
      verdicts: [...new Set(items.map((i: ScrapingDataItem) => i.aiVerdict).filter(Boolean))].sort(),
    });
  } catch {
    return Response.json({ items: [], total: 0, metadata: null, sources: [], sectors: [], verdicts: [] });
  }
}
