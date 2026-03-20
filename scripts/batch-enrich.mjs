#!/usr/bin/env node
/**
 * Overnight batch enrichment script
 * Processes startups from registro_parsed.json, scrapes their sites,
 * scores them with Claude Haiku, and writes good ones to import-queue.json
 *
 * Usage:
 *   node scripts/batch-enrich.mjs [--batch 100] [--min-score 7] [--province MI]
 *   Schedule: crontab -e → "0 2 * * * cd /Users/renatomoscati/sourc && node scripts/batch-enrich.mjs >> logs/enrich.log 2>&1"
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

// --- Config from CLI args ---
const args = process.argv.slice(2);
const getArg = (name, def) => {
  const i = args.indexOf(name);
  return i !== -1 ? args[i + 1] : def;
};
const BATCH_SIZE = parseInt(getArg("--batch", "500"));
const MIN_SCORE = parseFloat(getArg("--min-score", "6"));
const PROVINCE_FILTER = getArg("--province", ""); // "" = all Italy
const SECTOR_FILTER = getArg("--sector", "");     // "" = all sectors

// --- Paths ---
const REGISTRO_PATH = join(ROOT, "data", "registro_parsed.json");
const QUEUE_PATH = join(ROOT, "data", "import-queue.json");
const PROGRESS_PATH = join(ROOT, "data", "enrich-progress.json");
const LOGS_DIR = join(ROOT, "logs");

if (!existsSync(LOGS_DIR)) mkdirSync(LOGS_DIR, { recursive: true });

// --- Load data ---
const all = JSON.parse(readFileSync(REGISTRO_PATH, "utf-8"));
const FIRECRAWL_API_KEY = process.env.FIRECRAWL_API_KEY;

// Load or init progress tracker
let progress = existsSync(PROGRESS_PATH)
  ? JSON.parse(readFileSync(PROGRESS_PATH, "utf-8"))
  : { lastIndex: 0, processed: 0, imported: 0, skipped: 0, lastRun: null };

log(`=== Batch Enrich Started ${new Date().toISOString()} ===`);
log(`Total in registry: ${all.length} | Progress: ${progress.lastIndex} processed so far`);

// --- Filter candidates ---
let candidates = all.slice(progress.lastIndex);

if (PROVINCE_FILTER) candidates = candidates.filter(s => s.province === PROVINCE_FILTER);
if (SECTOR_FILTER) candidates = candidates.filter(s => s.sector === SECTOR_FILTER);

// Heuristic pre-filter: must have website, founded 2020+
candidates = candidates.filter(s =>
  s.website &&
  s.website.length > 15 &&
  (!s.foundedYear || s.foundedYear >= 2019)
);

const batch = candidates.slice(0, BATCH_SIZE);
log(`Processing batch of ${batch.length} candidates (min score: ${MIN_SCORE})`);

if (batch.length === 0) {
  log("No more candidates to process. Resetting progress for next full cycle.");
  progress.lastIndex = 0;
  saveProgress();
  process.exit(0);
}

// --- Load existing queue to avoid duplicates ---
const existingQueue = existsSync(QUEUE_PATH)
  ? JSON.parse(readFileSync(QUEUE_PATH, "utf-8"))
  : [];
const existingNames = new Set(existingQueue.map(s => s.name.toLowerCase().trim()));

// --- Process each startup ---
const goodOnes = [];
let processed = 0;

for (const startup of batch) {
  try {
    const result = await evaluateStartup(startup);
    processed++;

    if (result && result.score >= MIN_SCORE) {
      if (!existingNames.has(startup.name.toLowerCase().trim())) {
        goodOnes.push({
          name: startup.name,
          website: startup.website,
          description: result.description,
          sector: startup.sector,
          city: startup.city,
          foundedYear: startup.foundedYear,
          stage: "Pre-seed",
          accelerator: "Registro Startup Innovative IT 2025",
          _score: result.score,
          _reason: result.reason,
        });
        existingNames.add(startup.name.toLowerCase().trim());
        log(`  ✓ [${result.score}/10] ${startup.name} — ${result.reason}`);
      } else {
        log(`  ~ SKIP (already queued): ${startup.name}`);
      }
    } else {
      log(`  ✗ [${result?.score ?? "??"}/10] ${startup.name} — ${result?.reason ?? "no data"}`);
    }

    // Short delay — no AI API, just Firecrawl (or heuristic if no key)
    await sleep(FIRECRAWL_API_KEY ? 300 : 50);
  } catch (err) {
    log(`  ! ERROR: ${startup.name} — ${err.message}`);
  }
}

// --- Write results ---
if (goodOnes.length > 0) {
  const updated = [...existingQueue, ...goodOnes];
  writeFileSync(QUEUE_PATH, JSON.stringify(updated, null, 2));
  log(`\nWrote ${goodOnes.length} new startups to import queue (total: ${updated.length})`);
}

// --- Update progress ---
progress.lastIndex += batch.length;
progress.processed += processed;
progress.imported += goodOnes.length;
progress.skipped += processed - goodOnes.length;
progress.lastRun = new Date().toISOString();
saveProgress();

log(`\n=== Done ===`);
log(`This run: ${processed} processed, ${goodOnes.length} added to queue`);
log(`All time: ${progress.processed} processed, ${progress.imported} imported`);
log(`Next run will start from index ${progress.lastIndex}`);

// ─── Helpers ───────────────────────────────────────────────────────────────

async function evaluateStartup(startup) {
  // 1. Scrape the website with Firecrawl
  let description = null;
  try {
    const fc = await fetch("https://api.firecrawl.dev/v1/scrape", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.FIRECRAWL_API_KEY}`,
      },
      body: JSON.stringify({
        url: startup.website,
        formats: ["markdown"],
        onlyMainContent: true,
        timeout: 15000,
      }),
    });
    const fcData = await fc.json();
    if (fcData.success && fcData.data?.markdown) {
      // Truncate to first 1500 chars to keep prompt short
      description = fcData.data.markdown.slice(0, 1500).replace(/\n+/g, " ").trim();
    }
  } catch {
    // Firecrawl failed, use ATECO description as fallback
  }

  if (!description) {
    // No website content — score purely on metadata
    description = `${startup.name} — ATECO ${startup.ateco ?? "N/A"}, ${startup.city ?? ""}, founded ${startup.foundedYear ?? "unknown"}`;
  }

  // 2. Score with Claude Haiku
  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
  if (!ANTHROPIC_API_KEY) {
    // No API key — use heuristic scoring only
    return heuristicScore(startup, description);
  }

  const prompt = `You are a VC analyst at an early-stage fund focused on AI, software, and deep tech in Italy.

Evaluate this Italian startup for investment relevance. Be concise and critical.

Company: ${startup.name}
City: ${startup.city ?? "Unknown"} (${startup.province ?? "?"})
Sector: ${startup.sector}
Founded: ${startup.foundedYear ?? "Unknown"}
ATECO: ${startup.ateco ?? "N/A"}
Website content: ${description}

Score from 1-10 for early-stage VC relevance (10 = strong AI/software play, clear market, innovative).
Penalize: services companies, consulting, no clear tech differentiation, generic software.
Reward: AI-native, platform plays, B2B SaaS, deep tech, strong niche.

Reply ONLY with valid JSON: {"score": 7, "reason": "one sentence why"}`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5",
      max_tokens: 100,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  const data = await res.json();
  const text = data.content?.[0]?.text ?? "{}";
  try {
    const parsed = JSON.parse(text.match(/\{.*\}/s)?.[0] ?? "{}");
    return { score: parsed.score ?? 0, reason: parsed.reason ?? "unknown", description };
  } catch {
    return { score: 0, reason: "parse error", description };
  }
}

function heuristicScore(startup, description) {
  const text = (description + " " + startup.name + " " + (startup.city ?? "")).toLowerCase();
  let score = 4; // baseline
  const reasons = [];

  // ── ATECO quality (strongest signal) ──────────────────────────────────
  const ateco = startup.ateco ?? "";
  if (ateco.startsWith("621"))        { score += 2; reasons.push("core software dev (621x)"); }
  else if (ateco.startsWith("6201"))  { score += 2; reasons.push("custom software (6201x)"); }
  else if (ateco.startsWith("6311"))  { score += 2; reasons.push("data processing (6311x)"); }
  else if (ateco.startsWith("7211"))  { score += 3; reasons.push("AI/ML R&D (7211x)"); }
  else if (ateco.startsWith("72"))    { score += 2; reasons.push("R&D (72xx)"); }
  else if (ateco.startsWith("63"))    { score += 1; reasons.push("IT services (63xx)"); }

  // ── High-signal AI / tech keywords (+1 each, capped at +3) ───────────
  const aiKw = ["intelligenza artificiale", "machine learning", "deep learning",
    "neural", "nlp", "computer vision", "llm", "generative", "predictive",
    "reinforcement", "transformer", "embedding"];
  const aiHits = aiKw.filter(w => text.includes(w)).length;
  if (aiHits > 0) { score += Math.min(3, aiHits); reasons.push(`AI keywords ×${aiHits}`); }

  // ── SaaS / product signals (+1 each, capped at +2) ────────────────────
  const saasKw = ["saas", "platform", "marketplace", "api", "sdk", "b2b",
    "subscription", "dashboard", "as a service", "software as"];
  const saasHits = saasKw.filter(w => text.includes(w)).length;
  if (saasHits > 0) { score += Math.min(2, saasHits); reasons.push(`product signals ×${saasHits}`); }

  // ── Sector boosts ──────────────────────────────────────────────────────
  const sectorKw = ["fintech", "healthtech", "medtech", "proptech", "legaltech",
    "edtech", "agritech", "cleantech", "cybersec", "blockchain",
    "robotica", "automazione", "iot", "drone", "biotech"];
  const sectorHits = sectorKw.filter(w => text.includes(w)).length;
  if (sectorHits > 0) { score += Math.min(2, sectorHits); reasons.push(`vertical ×${sectorHits}`); }

  // ── Recency bonus ──────────────────────────────────────────────────────
  if (startup.foundedYear >= 2022)      { score += 1; reasons.push("founded 2022+"); }
  else if (startup.foundedYear >= 2020) { score += 0.5; }

  // ── Website quality signal ─────────────────────────────────────────────
  if (description.length > 300) { score += 0.5; reasons.push("rich website content"); }

  // ── Hard penalties ─────────────────────────────────────────────────────
  const penaltyKw = [
    "consulenza", "web agency", "agenzia", "agenzia digitale",
    "e-commerce store", "negozio", "ristorante", "turismo", "hotel",
    "immobili", "real estate", "noleggio", "trasporti", "logistica",
    "pulizie", "recruitment", "head hunting", "marketing agency",
    "comunicazione", "grafica", "video production", "eventi"
  ];
  const penaltyHits = penaltyKw.filter(w => text.includes(w));
  if (penaltyHits.length > 0) {
    score -= penaltyHits.length * 2;
    reasons.push(`PENALTY: ${penaltyHits.slice(0, 2).join(", ")}`);
  }

  // ── Hard kills (score → 1) ─────────────────────────────────────────────
  const killKw = ["web agency", "agenzia di comunicazione", "studio fotografico",
    "parrucchier", "estetista", "pizzeria", "gelateria"];
  if (killKw.some(w => text.includes(w))) {
    return { score: 1, reason: "hard kill — not tech", description };
  }

  const finalScore = Math.min(10, Math.max(1, Math.round(score)));
  return {
    score: finalScore,
    reason: reasons.length > 0 ? reasons.join(" | ") : "baseline",
    description,
  };
}

function saveProgress() {
  writeFileSync(PROGRESS_PATH, JSON.stringify(progress, null, 2));
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}`;
  console.log(line);
}
