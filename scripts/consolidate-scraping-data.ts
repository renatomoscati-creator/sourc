/**
 * Consolidates all scraping JSON files into the dashboard's import queue format.
 * 
 * Sources (in priority order):
 * 1. AI-evaluated companies (with PASS/MAYBE verdicts)
 * 2. Milan top startups (filtered, scored)
 * 3. Italy top startups
 * 4. Firecrawl contact data (enriched with contact info)
 * 5. PoliHub company profiles
 * 
 * Run: npx tsx scripts/consolidate-scraping-data.ts
 */

import fs from "fs";
import path from "path";

const BASE = process.cwd();
const SCRAPING_DIR = path.join(BASE, "Agent for Scraping and Sourcing");
const QUEUE_PATH = path.join(BASE, "data", "import-queue.json");
const CONSOLIDATED_PATH = path.join(BASE, "data", "consolidated-scraping-data.json");

interface ScrapedStartup {
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
  score?: number;
  aiVerdict?: string;
  source: string;
  codiceFiscale?: string;
  province?: string;
  ateco?: string;
}

function readJson<T>(filePath: string): T | null {
  try {
    if (!fs.existsSync(filePath)) return null;
    return JSON.parse(fs.readFileSync(filePath, "utf-8")) as T;
  } catch (e) {
    console.warn(`⚠️  Failed to read ${filePath}: ${e}`);
    return null;
  }
}

// 1. AI-evaluated companies (highest quality)
function loadAiEvaluated(): ScrapedStartup[] {
  const data = readJson<any[]>(
    path.join(SCRAPING_DIR, "registry-data/ai-evaluations/ai_evaluated.json")
  );
  if (!data) return [];

  return data.map((item) => ({
    name: item.name,
    website: item.website || undefined,
    sector: undefined,
    stage: undefined,
    foundedYear: undefined,
    accelerator: "Registro Startup Innovative IT 2025",
    score: item.vcScore,
    aiVerdict: item.flag,
    source: "ai-evaluation",
  }));
}

// 2. Registry pipeline stages
function loadRegistryStage(filePath: string, source: string, defaultScore?: number): ScrapedStartup[] {
  const data = readJson<any[]>(filePath);
  if (!data) return [];

  return data.map((item) => ({
    name: item.name,
    website: item.website || undefined,
    description: item.ateco ? `ATECO ${item.ateco}` : undefined,
    sector: item.sector || undefined,
    stage: item.stage || "Pre-seed",
    foundedYear: item.foundedYear || undefined,
    accelerator: item.accelerator || "Registro Startup Innovative IT 2025",
    city: item.city || undefined,
    province: item.province || undefined,
    codiceFiscale: item.codiceFiscale || undefined,
    ateco: item.ateco || undefined,
    score: item.score || defaultScore,
    source,
  }));
}

// 3. Firecrawl contact data
function loadFirecrawlContacts(): ScrapedStartup[] {
  const contactsDir = path.join(SCRAPING_DIR, "firecrawl-data/contacts/by-company");
  if (!fs.existsSync(contactsDir)) return [];

  const results: ScrapedStartup[] = [];
  const companyDirs = fs.readdirSync(contactsDir);

  for (const dir of companyDirs) {
    const dirPath = path.join(contactsDir, dir);
    if (!fs.statSync(dirPath).isDirectory()) continue;

    // Try to find contact info first
    const contactFile = path.join(dirPath, `contact-${dir}.json`);
    const homeFile = path.join(dirPath, `home-${dir}.json`);
    const extraFile = path.join(dirPath, `extra-${dir}.json`);

    // Read contact file for structured data
    const contactData = readJson<any>(contactFile);
    const homeData = readJson<any>(homeFile);

    // Extract company name from directory name (kebab-case to title case)
    const companyName = dir
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

    // Try to extract email/linkedin from markdown content
    let contactEmail: string | undefined;
    let contactLinkedin: string | undefined;
    let website: string | undefined;

    if (contactData?.markdown) {
      const md = contactData.markdown;
      const emailMatch = md.match(/[\w.+-]+@[\w-]+\.[\w.-]+/);
      if (emailMatch) contactEmail = emailMatch[0];
      const linkedinMatch = md.match(/linkedin\.com\/company\/([\w-]+)/i);
      if (linkedinMatch) contactLinkedin = linkedinMatch[0];
    }

    if (homeData?.metadata?.url) {
      try {
        const url = new URL(homeData.metadata.url);
        website = url.origin;
      } catch {
        // ignore
      }
    }

    // Also check extra file
    if (extraFile && fs.existsSync(extraFile)) {
      const extraData = readJson<any>(extraFile);
      if (extraData?.markdown) {
        const md = extraData.markdown;
        if (!contactEmail) {
          const emailMatch = md.match(/[\w.+-]+@[\w-]+\.[\w.-]+/);
          if (emailMatch) contactEmail = emailMatch[0];
        }
        if (!contactLinkedin) {
          const linkedinMatch = md.match(/linkedin\.com\/company\/([\w-]+)/i);
          if (linkedinMatch) contactLinkedin = linkedinMatch[0];
        }
      }
    }

    results.push({
      name: companyName,
      website,
      contactEmail,
      contactLinkedin,
      accelerator: "PoliHub / Firecrawl",
      source: "firecrawl-contacts",
    });
  }

  return results;
}

// 4. PoliHub profiles (markdown files)
function loadPoliHubProfiles(): ScrapedStartup[] {
  const urlsFile = path.join(SCRAPING_DIR, "firecrawl-data/polihub/urls.json");
  const urlsData = readJson<any[]>(urlsFile);

  const polihubDir = path.join(SCRAPING_DIR, "firecrawl-data/polihub");
  const profileFiles = fs.readdirSync(polihubDir).filter((f) => f.startsWith("company-") && f.endsWith(".md"));

  return profileFiles.map((file) => {
    const content = fs.readFileSync(path.join(polihubDir, file), "utf-8");
    if (!content.trim()) return null;

    const companyName = file
      .replace("company-", "")
      .replace(".md", "")
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

    // Extract first substantial paragraph as description
    const paragraphs = content.split("\n\n").filter((p) => p.trim().length > 50 && !p.startsWith("#") && !p.startsWith("- ["));
    const description = paragraphs.length > 0 ? paragraphs[0].substring(0, 300) : undefined;

    // Try to find website URL in content
    let website: string | undefined;
    const urlMatch = content.match(/https?:\/\/(?!www\.)([\w-]+\.)+[\w]{2,}(\/[\w-./]*)?/);
    if (urlMatch) {
      try {
        const url = new URL(urlMatch[0]);
        website = url.origin;
      } catch {
        // ignore
      }
    }

    return {
      name: companyName,
      website,
      description,
      accelerator: "PoliHub Incubator",
      source: "polihub",
    };
  }).filter(Boolean) as ScrapedStartup[];
}

// Deduplicate by name (case-insensitive), keeping the richest record
function deduplicate(records: ScrapedStartup[]): ScrapedStartup[] {
  const map = new Map<string, ScrapedStartup>();

  for (const record of records) {
    const key = record.name.toLowerCase().trim();
    const existing = map.get(key);

    if (!existing) {
      map.set(key, record);
      continue;
    }

    // Merge: prefer non-null fields from either record
    const merged: ScrapedStartup = { ...existing };
    for (const r of [record, existing]) {
      for (const key of Object.keys(r) as (keyof ScrapedStartup)[]) {
        const val = r[key];
        if (val !== null && val !== undefined && val !== "") {
          (merged as any)[key] = val;
        }
      }
    }

    // Always prefer higher score
    if (record.score && (!existing.score || record.score > existing.score)) {
      merged.score = record.score;
    }
    if (record.aiVerdict) {
      merged.aiVerdict = record.aiVerdict;
    }

    map.set(key, merged);
  }

  return Array.from(map.values());
}

// Convert to dashboard's ImportedStartup format
function toImportFormat(records: ScrapedStartup[]): any[] {
  return records
    .sort((a, b) => {
      // Sort by: AI verdict (PASS first), then score desc, then name
      const verdictOrder = { PASS: 0, MAYBE: 1, SKIP: 2 };
      const aOrder = verdictOrder[a.aiVerdict as keyof typeof verdictOrder] ?? 3;
      const bOrder = verdictOrder[b.aiVerdict as keyof typeof verdictOrder] ?? 3;
      if (aOrder !== bOrder) return aOrder - bOrder;
      if (a.score && b.score) return b.score - a.score;
      if (a.score) return -1;
      if (b.score) return 1;
      return a.name.localeCompare(b.name);
    })
    .map((r) => ({
      name: r.name,
      website: r.website,
      description: r.description,
      sector: r.sector,
      stage: r.stage,
      foundedYear: r.foundedYear,
      accelerator: r.accelerator,
      contactEmail: r.contactEmail,
      contactPhone: r.contactPhone,
      contactLinkedin: r.contactLinkedin,
      city: r.city || "Milan",
      // Custom fields for review
      _score: r.score,
      _aiVerdict: r.aiVerdict,
      _source: r.source,
      _province: r.province,
      _codiceFiscale: r.codiceFiscale,
      _ateco: r.ateco,
    }));
}

async function main() {
  console.log("🔄 Consolidating scraping data...\n");

  const sources: { name: string; data: ScrapedStartup[] }[] = [
    { name: "AI-evaluated", data: loadAiEvaluated() },
    { name: "Milan Top", data: loadRegistryStage(
      path.join(SCRAPING_DIR, "registry-data/processed/milan_top.json"),
      "milan-top",
      7
    )},
    { name: "Italy Top", data: loadRegistryStage(
      path.join(SCRAPING_DIR, "registry-data/processed/italy_top.json"),
      "italy-top",
      6
    )},
    { name: "Filtered", data: loadRegistryStage(
      path.join(SCRAPING_DIR, "registry-data/processed/filtered.json"),
      "filtered",
      5
    )},
    { name: "Firecrawl Contacts", data: loadFirecrawlContacts() },
    { name: "PoliHub Profiles", data: loadPoliHubProfiles() },
  ];

  // Report source counts
  for (const source of sources) {
    console.log(`  ${source.name}: ${source.data.length} records`);
  }

  // Combine all
  const allCombined = sources.flatMap((s) => s.data);
  console.log(`\n  Combined: ${allCombined.length} records`);

  // Deduplicate
  const deduped = deduplicate(allCombined);
  console.log(`  After dedup: ${deduped.length} unique records`);

  // Convert to import format
  const importReady = toImportFormat(deduped);

  // Write import queue
  fs.writeFileSync(QUEUE_PATH, JSON.stringify(importReady, null, 2));
  console.log(`\n✅ Import queue written: ${QUEUE_PATH}`);
  console.log(`   ${importReady.length} startups ready for dashboard import`);

  // Also write a consolidated file with full data for reference
  fs.writeFileSync(CONSOLIDATED_PATH, JSON.stringify({
    metadata: {
      generatedAt: new Date().toISOString(),
      totalRecords: deduped.length,
      sources: sources.map((s) => ({ name: s.name, count: s.data.length })),
    },
    startups: deduped,
  }, null, 2));
  console.log(`✅ Consolidated data written: ${CONSOLIDATED_PATH}`);

  // Summary by AI verdict
  const passCount = deduped.filter((d) => d.aiVerdict === "PASS").length;
  const maybeCount = deduped.filter((d) => d.aiVerdict === "MAYBE").length;
  const skipCount = deduped.filter((d) => d.aiVerdict === "SKIP").length;
  const noVerdict = deduped.length - passCount - maybeCount - skipCount;

  console.log(`\n📊 AI Verdict Summary:`);
  console.log(`   PASS: ${passCount}`);
  console.log(`   MAYBE: ${maybeCount}`);
  console.log(`   SKIP: ${skipCount}`);
  console.log(`   No verdict: ${noVerdict}`);
}

main().catch(console.error);
