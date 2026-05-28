# Graph Report - .  (2026-04-16)

## Corpus Check
- 139 files · ~51,380 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 306 nodes · 437 edges · 45 communities detected
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 19 edges (avg confidence: 0.83)
- Token cost: 18,200 input · 3,100 output

## God Nodes (most connected - your core abstractions)
1. `main()` - 10 edges
2. `log()` - 8 edges
3. `main()` - 7 edges
4. `Agentic AI Sourcing Dashboard` - 7 edges
5. `Project Conventions (CLAUDE.md)` - 7 edges
6. `generate_report()` - 6 edges
7. `update_manifest()` - 6 edges
8. `Startup Contact Enrichment Skill` - 6 edges
9. `Creandum Scout Orchestrator (QWEN.md)` - 6 edges
10. `Creandum Scout Setup (README)` - 6 edges

## Surprising Connections (you probably didn't know these)
- `Coding Conventions (Server Components, cn(), no any)` --semantically_similar_to--> `Backend Patterns (lib/CLAUDE.md)`  [INFERRED] [semantically similar]
  CLAUDE.md → lib/CLAUDE.md
- `App Router Structure (app/CLAUDE.md)` --references--> `Project Conventions (CLAUDE.md)`  [INFERRED]
  app/CLAUDE.md → CLAUDE.md
- `Project Conventions (CLAUDE.md)` --references--> `Next.js 16 + React 19`  [EXTRACTED]
  CLAUDE.md → README.md
- `Subagent Checklist (AGENTS.md)` --references--> `Project Conventions (CLAUDE.md)`  [EXTRACTED]
  AGENTS.md → CLAUDE.md
- `Project Conventions (CLAUDE.md)` --references--> `SQLite + Drizzle ORM`  [EXTRACTED]
  CLAUDE.md → README.md

## Hyperedges (group relationships)
- **Project Documentation Set** — claude_project_conventions, app_claude_app_router_structure, components_claude_ui_conventions, lib_claude_backend_patterns [EXTRACTED 0.95]
- **PoliHub Deep Tech & Space Cluster** — polihub_fast_aerospace, polihub_leafspace, polihub_overspace_aviation, polihub_ecosmic, polihub_nireos, polihub_lithium_lasers [INFERRED 0.80]
- **PoliHub AI & SaaS Cluster** — polihub_indigo_ai, polihub_aiblooms, polihub_synergy_flow, polihub_agade [INFERRED 0.75]
- **Creandum Multi-Vertical Scout Pipeline** — creandum_qwen_md, creandum_vertical_ai_scout, creandum_infra_scout, creandum_fintech_scout, creandum_consumer_scout, creandum_climate_scout [EXTRACTED 0.95]

## Communities

### Community 0 - "AI Brief Generation"
Cohesion: 0.05
Nodes (4): calcPriorityScore(), getStartups(), getStartupsGroupedByStatus(), updateStartup()

### Community 1 - "Dialog Components"
Cohesion: 0.11
Nodes (0): 

### Community 2 - "UI Component Library"
Cohesion: 0.08
Nodes (0): 

### Community 3 - "Import Pipeline"
Cohesion: 0.09
Nodes (2): buildPrompt(), POST()

### Community 4 - "Call Notes & Bulk Scripts"
Cohesion: 0.09
Nodes (0): 

### Community 5 - "Scraping Output Organizer"
Cohesion: 0.19
Nodes (20): copy_firecrawl_sources(), copy_new_files(), copy_root_files(), count_files(), ensure_dirs(), generate_report(), get_dir_size(), log() (+12 more)

### Community 6 - "Project Conventions & Docs"
Cohesion: 0.14
Nodes (16): Subagent Checklist (AGENTS.md), App Router Structure (app/CLAUDE.md), AI SDK v6 Usage Rules, Coding Conventions (Server Components, cn(), no any), Next.js 16 Breaking Changes, Project Conventions (CLAUDE.md), UI Component Conventions (components/CLAUDE.md), Backend Patterns (lib/CLAUDE.md) (+8 more)

### Community 7 - "Select & Dropdown UI"
Cohesion: 0.15
Nodes (0): 

### Community 8 - "Import Queue Banner"
Cohesion: 0.14
Nodes (0): 

### Community 9 - "Creandum Scout Agents"
Cohesion: 0.27
Nodes (12): Climate Scout Agent, Consumer Scout Agent, Fintech Scout Agent, Infra Scout Results, Infra Scout Agent, Noru — Runner-Up (Compliance Automation), Creandum Final Pick (Procure AI), Procure AI — Top Investment Pick (+4 more)

### Community 10 - "PoliHub Portfolio Startups"
Cohesion: 0.2
Nodes (10): AIBlooms (PoliHub), Ecosmic (PoliHub), Empatica (PoliHub), Energy Dome (PoliHub), Fast Aerospace (PoliHub), Heliowitch (PoliHub), Indigo AI (PoliHub), LeafSpace (PoliHub) (+2 more)

### Community 11 - "Data Consolidation Scripts"
Cohesion: 0.5
Nodes (8): deduplicate(), loadAiEvaluated(), loadFirecrawlContacts(), loadPoliHubProfiles(), loadRegistryStage(), main(), readJson(), toImportFormat()

### Community 12 - "Contact Enrichment Skill"
Cohesion: 0.38
Nodes (7): Aggregator Sites Reference (PoliHub, Crunchbase), Startup Contact Enrichment Skill, PoliHub Aggregator Fallback Strategy, Update Queue JSON (data/update-queue.json), Contact Enrichment Results Reference, Scraping Patterns Reference, Contact Enrichment Troubleshooting

### Community 13 - "Dropdown Menu UI"
Cohesion: 0.33
Nodes (0): 

### Community 14 - "Scraping Organization Reports"
Cohesion: 0.67
Nodes (3): Organization Report 2026-04-14, Organization Report 2026-04-15, Registro Startup Data (27k+ records)

### Community 15 - "Billding Startup"
Cohesion: 1.0
Nodes (2): Billding (PoliHub), Billding Utilities (PoliHub)

### Community 16 - "Next.js Config"
Cohesion: 1.0
Nodes (0): 

### Community 17 - "Drizzle Config"
Cohesion: 1.0
Nodes (0): 

### Community 18 - "Next Config"
Cohesion: 1.0
Nodes (0): 

### Community 19 - "Blimp Startup"
Cohesion: 1.0
Nodes (1): Blimp (PoliHub)

### Community 20 - "Eye4Nir Startup"
Cohesion: 1.0
Nodes (1): Eye4Nir (PoliHub)

### Community 21 - "EFESO Startup"
Cohesion: 1.0
Nodes (1): EFESO (PoliHub)

### Community 22 - "Fili Pari Startup"
Cohesion: 1.0
Nodes (1): Fili Pari (PoliHub)

### Community 23 - "Adapta Studio Startup"
Cohesion: 1.0
Nodes (1): Adapta Studio (PoliHub)

### Community 24 - "Artiness Startup"
Cohesion: 1.0
Nodes (1): Artiness (PoliHub)

### Community 25 - "Postura Ergonomics Startup"
Cohesion: 1.0
Nodes (1): Postura Ergonomics (PoliHub)

### Community 26 - "OpenMall Startup"
Cohesion: 1.0
Nodes (1): OpenMall (PoliHub)

### Community 27 - "Bonus X Startup"
Cohesion: 1.0
Nodes (1): Bonus X (PoliHub)

### Community 28 - "Lithium Lasers Startup"
Cohesion: 1.0
Nodes (1): Lithium Lasers (PoliHub)

### Community 29 - "Nireos Startup"
Cohesion: 1.0
Nodes (1): Nireos (PoliHub)

### Community 30 - "Synergy Flow Startup"
Cohesion: 1.0
Nodes (1): Synergy Flow (PoliHub)

### Community 31 - "Remedy Technologies Startup"
Cohesion: 1.0
Nodes (1): Remedy Technologies (PoliHub)

### Community 32 - "Cambridge Raman Imaging Startup"
Cohesion: 1.0
Nodes (1): Cambridge Raman Imaging (PoliHub)

### Community 33 - "Narvalo Startup"
Cohesion: 1.0
Nodes (1): Narvalo (PoliHub)

### Community 34 - "Nautilus Startup"
Cohesion: 1.0
Nodes (1): Nautilus (PoliHub)

### Community 35 - "Supair Startup"
Cohesion: 1.0
Nodes (1): Supair (PoliHub)

### Community 36 - "Magic Vision Startup"
Cohesion: 1.0
Nodes (1): Magic Vision (PoliHub)

### Community 37 - "Agade Startup"
Cohesion: 1.0
Nodes (1): Agade (PoliHub)

### Community 38 - "Isaac Startup"
Cohesion: 1.0
Nodes (1): Isaac (PoliHub)

### Community 39 - "Smush Materials Startup"
Cohesion: 1.0
Nodes (1): Smush Materials (PoliHub)

### Community 40 - "Vercel Logo"
Cohesion: 1.0
Nodes (1): Vercel Logo SVG

### Community 41 - "Next.js Logo"
Cohesion: 1.0
Nodes (1): Next.js Logo SVG

### Community 42 - "Globe Icon"
Cohesion: 1.0
Nodes (1): Globe Icon SVG

### Community 43 - "Window Icon"
Cohesion: 1.0
Nodes (1): Window Icon SVG

### Community 44 - "File Icon"
Cohesion: 1.0
Nodes (1): File Icon SVG

## Knowledge Gaps
- **57 isolated node(s):** `Create directory structure if it doesn't exist.`, `Validate all JSON files in organized directories.`, `Copy new files from source to dest if they don't already exist at dest.`, `Copy firecrawl source data into raw-data/firecrawl-sources/.`, `Copy relevant root-level files into organized directories.` (+52 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Billding Startup`** (2 nodes): `Billding (PoliHub)`, `Billding Utilities (PoliHub)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Next.js Config`** (1 nodes): `next-env.d.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Drizzle Config`** (1 nodes): `drizzle.config.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Next Config`** (1 nodes): `next.config.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Blimp Startup`** (1 nodes): `Blimp (PoliHub)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Eye4Nir Startup`** (1 nodes): `Eye4Nir (PoliHub)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `EFESO Startup`** (1 nodes): `EFESO (PoliHub)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Fili Pari Startup`** (1 nodes): `Fili Pari (PoliHub)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Adapta Studio Startup`** (1 nodes): `Adapta Studio (PoliHub)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Artiness Startup`** (1 nodes): `Artiness (PoliHub)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Postura Ergonomics Startup`** (1 nodes): `Postura Ergonomics (PoliHub)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `OpenMall Startup`** (1 nodes): `OpenMall (PoliHub)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Bonus X Startup`** (1 nodes): `Bonus X (PoliHub)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Lithium Lasers Startup`** (1 nodes): `Lithium Lasers (PoliHub)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Nireos Startup`** (1 nodes): `Nireos (PoliHub)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Synergy Flow Startup`** (1 nodes): `Synergy Flow (PoliHub)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Remedy Technologies Startup`** (1 nodes): `Remedy Technologies (PoliHub)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Cambridge Raman Imaging Startup`** (1 nodes): `Cambridge Raman Imaging (PoliHub)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Narvalo Startup`** (1 nodes): `Narvalo (PoliHub)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Nautilus Startup`** (1 nodes): `Nautilus (PoliHub)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Supair Startup`** (1 nodes): `Supair (PoliHub)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Magic Vision Startup`** (1 nodes): `Magic Vision (PoliHub)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Agade Startup`** (1 nodes): `Agade (PoliHub)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Isaac Startup`** (1 nodes): `Isaac (PoliHub)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Smush Materials Startup`** (1 nodes): `Smush Materials (PoliHub)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Vercel Logo`** (1 nodes): `Vercel Logo SVG`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Next.js Logo`** (1 nodes): `Next.js Logo SVG`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Globe Icon`** (1 nodes): `Globe Icon SVG`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Window Icon`** (1 nodes): `Window Icon SVG`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `File Icon`** (1 nodes): `File Icon SVG`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What connects `Create directory structure if it doesn't exist.`, `Validate all JSON files in organized directories.`, `Copy new files from source to dest if they don't already exist at dest.` to the rest of the system?**
  _57 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `AI Brief Generation` be split into smaller, more focused modules?**
  _Cohesion score 0.05 - nodes in this community are weakly interconnected._
- **Should `Dialog Components` be split into smaller, more focused modules?**
  _Cohesion score 0.11 - nodes in this community are weakly interconnected._
- **Should `UI Component Library` be split into smaller, more focused modules?**
  _Cohesion score 0.08 - nodes in this community are weakly interconnected._
- **Should `Import Pipeline` be split into smaller, more focused modules?**
  _Cohesion score 0.09 - nodes in this community are weakly interconnected._
- **Should `Call Notes & Bulk Scripts` be split into smaller, more focused modules?**
  _Cohesion score 0.09 - nodes in this community are weakly interconnected._
- **Should `Project Conventions & Docs` be split into smaller, more focused modules?**
  _Cohesion score 0.14 - nodes in this community are weakly interconnected._