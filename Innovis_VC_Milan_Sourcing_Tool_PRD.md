# Product Requirements Document
## Milan Early-Stage Startup Sourcing & Founder Outreach Tool

**Purpose:** Internal personal workflow tool for Renato's sourcing work at Innovis VC Milan.

**Key constraint:** this does not need to be a real scalable app. It is a lightweight tool for one user only. No hosting, multi-tenant architecture, enterprise security layer, or scaling infrastructure is required.

## 1. Product overview
This product is an internal tool designed to support my work as a trainee at Innovis VC Milan.

Its purpose is to help me source early-stage startups, focus on pre-seed to seed companies, prioritize startups from accelerators and incubators in Milan, conduct founder outreach, track calls and qualitative insights, and generate presentation-ready startup briefs.

The system is not meant to be a generic startup database or a production SaaS product. It is a focused VC sourcing workflow tool tailored to one user and one operating model: identify startups, research them, contact founders, enrich the profile through direct interaction, and prepare them for internal presentation.

## 2. Problem statement
The current workflow is fragmented and manual. Startup information is scattered across accelerator websites, incubator pages, LinkedIn, demo day lists, news articles, founder profiles, and ecosystem lists.

At the pre-seed and seed stages, public information is often incomplete. Many of the best insights only emerge after direct founder outreach or a call with the team.

Without a standardized structure, it is difficult to compare startups consistently, track who has been contacted, remember what was learned, and prepare concise internal presentation materials quickly.

## 3. Goal
Build a lightweight system that enables me to discover relevant early-stage startups in Milan, organize them into a sourcing pipeline, collect structured company data, manage founder outreach, record call insights and soft signals, rank or flag the most interesting opportunities, and produce concise internal startup summaries for presentation.

## 4. Product context and target universe
My role at Innovis VC Milan is to source startups and present them internally. I also need to reach out to founders and, ideally, speak with them directly to gather deeper information.

The target universe is Milan-based startups, especially pre-seed to seed companies, with strong emphasis on startups coming from accelerators, incubators, startup programs, demo days, university innovation ecosystems, and local founder networks.

The tool should therefore be optimized for early-stage discovery, founder contact management, and quick internal evaluation rather than deep diligence.

## 5. Non-goals
This product is not intended to replace full VC due diligence, make investment decisions autonomously, function as a CRM for a large team, support broad geographic coverage from day one, or scrape the entire internet at enterprise scale.

It is also not intended to be hosted publicly, commercialized, or engineered for scale. There is no need for cloud deployment, user management for many users, distributed systems design, or production-grade infrastructure.

## 6. Core user
The primary and only required user is Renato, acting as a trainee at Innovis VC Milan.

The user needs to source startups in Milan, identify relevant pre-seed and seed companies, contact founders, gather better information through conversations, decide which startups deserve internal attention, and present findings clearly.

## 7. Jobs to be done
- Find relevant startups from Milan-based accelerators, incubators, demo days, ecosystem lists, LinkedIn, and web research.
- Store startup information in a consistent format so that companies can be compared easily.
- Track founder outreach, follow-ups, replies, and calls without losing context.
- Capture qualitative insights from founder conversations in a structured way.
- Generate short, high-quality startup briefs ready for internal presentation.

## 8. User workflow
1. Identify relevant sources such as accelerator websites, incubator portfolio pages, demo day lists, startup directories, LinkedIn, and ecosystem newsletters.
2. Add a startup manually or semi-manually with its core information.
3. Enrich the profile with description, product, business model, traction, funding context, reasons for interest, and red flags.
4. Reach out to founders and log contact attempts, replies, follow-ups, and call status.
5. After a founder conversation, record structured call notes and soft signals.
6. Review the opportunity and mark it as worth tracking, worth presenting, or deprioritized.
7. Generate a concise presentation-ready startup brief.

## 9. Functional requirements
### 9.1 Startup database and pipeline
The system must support a central startup database with one record per company.

Required core fields: startup name, website, source name, source type, Milan relevance, stage, sector or vertical, founding year, founder names, founder LinkedIn or contact if available, short description, problem solved, product or offering, business model, accelerator or incubator affiliation, funding status, traction indicators, notes, recommendation status.

Pipeline stages: New, Researched, Contacted, Replied, Call Scheduled, Call Completed, Under Review, Selected for Presentation, Rejected or Archived.

### 9.2 Sourcing support
The tool should allow creation of source lists and categorization by type: accelerator, incubator, event, LinkedIn, referral, web.

Each startup should be linkable to one or more sources.

The system should help avoid duplicate startup entries and allow filtering by Milan-based and accelerator or incubator sourced.

### 9.3 Startup profile enrichment
Each startup profile should support both hard data and soft data.

Hard data includes stage, geography, funding, traction, and source.

Soft data includes founder impression, clarity of pitch, responsiveness, credibility, ambition, and overall analyst opinion.

### 9.4 Founder outreach tracking
For each startup, the tool must track founder name, role, email, LinkedIn, outreach channel, outreach date, outreach status, reply date, follow-up date, call booked or not, and next action.

Outreach statuses should include: Not Contacted, Outreach Sent, Follow-up Sent, Replied, No Response, Call Scheduled, Call Completed, Closed.

### 9.5 Founder call notes
Call notes should be attached directly to the startup record and remain searchable.

The structured note template should include: date, participants, founder background, what the company does, problem and market, product maturity, current traction, customers or pilots, business model, fundraising status, near-term milestones, key risks, overall impression, recommendation, follow-up needed.

### 9.6 Evaluation and prioritization
The tool should support a simple, editable VC-style evaluation layer.

Possible scoring dimensions: relevance to target geography, stage fit, source quality, team quality, problem attractiveness, product clarity, traction quality, market potential, founder responsiveness, overall conviction.

The scoring should remain lightweight and should support numeric scoring, qualitative tags, manual override, and a final present or do not present recommendation.

### 9.7 Presentation-ready output
The system must generate a concise startup summary for each selected company.

The output should include: startup name, one-line description, sector, stage, geography, accelerator or incubator origin, founders, key traction, funding context, why it is interesting, main concerns, outreach or call status, and recommendation.

## 10. MVP scope
The MVP must include: startup database, manual startup entry, source tracking, stage/geography/sector filters, outreach tracking, call note storage, status pipeline, startup scoring or prioritization, and presentation summary generation.

The MVP can exclude: advanced scraping infrastructure, automated email sending, team permissions, integrations with external CRMs, advanced dashboards, and autonomous AI sourcing agents.

## 11. Success metrics
Primary metrics: number of relevant Milan startups added per week, share of startups that are truly pre-seed or seed, number of founders contacted, reply rate, number of founder calls completed, number of startups selected for internal presentation, average time from discovery to presentation-ready brief.

Secondary metrics: reduction in duplicate work, improved consistency of startup profiles, improved completeness of startup data, improved confidence in presentation quality.

## 12. Data model
**Startup:** id, name, website, city, geography tag, stage, sector, founded year, description, problem, product, business model, traction, funding status, accelerator or incubator, source ids, priority score, status, recommendation, created at, updated at.

**Founder:** id, startup id, name, title, email, LinkedIn, notes.

**Source:** id, name, type, URL, geography relevance, notes.

**Outreach event:** id, startup id, founder id, date, channel, status, message type, follow-up date, notes.

**Call note:** id, startup id, date, participants, structured notes, recommendation, next step.

## 13. UX principles
The system should feel fast, structured, lightweight, pipeline-oriented, and qualitative-aware.

The interface should prioritize a table view, a kanban or pipeline view, a detailed startup record page, quick note entry, and clear filtering.

## 14. Constraints and assumptions
**Constraints:** early-stage startup information is often incomplete; much of the best information comes only through direct founder interaction; some sourcing will remain manual; the initial user base is one person only; flexibility is more important than over-engineering.

**Assumptions:** Milan ecosystem sources can be identified consistently; stage classification can be approximated even when not explicit; founder outreach is a core part of sourcing; internal presentation needs short, standardized outputs rather than long memos.

## 15. Technical and deployment requirements
This does not need to be a real scalable app. It is a personal internal tool for one user.

No hosting is required. The preferred architecture can be local-first, file-based, single-user, or otherwise simple to run on one machine.

No scaling work is required. There is no need for load balancing, multi-user auth, cloud infrastructure, background job orchestration, complex DevOps, uptime targets, or production observability.

The design should optimize for ease of use, speed of implementation, low maintenance, and reliability for one person rather than software engineering complexity.

## 16. Risks
- Too much manual data entry may make the tool cumbersome.
- Scoring may create false precision.
- Source coverage may be incomplete.
- Outreach tracking may be neglected if the UX is too slow.
- Overbuilding automation too early may delay usefulness.

## 17. Future extensions
Possible later additions include automated source monitoring for Milan accelerators and incubators, founder email draft support, meeting scheduling support, AI-generated startup summaries, AI extraction from startup websites and LinkedIn, weekly sourced startup digests, and sector-specific sourcing filters.

## 18. Product vision
The long-term vision is to create a lean internal venture sourcing operating system for Innovis VC Milan's early-stage workflow.

It should allow a trainee to move seamlessly from ecosystem discovery to startup research to founder outreach to qualitative insight capture to internal presentation, with minimal fragmentation and maximal consistency.
