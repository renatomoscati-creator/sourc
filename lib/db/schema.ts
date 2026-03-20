import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

// ─── Enums (stored as text) ───────────────────────────────────────────────────

export const PIPELINE_STAGES = [
  "New",
  "Researched",
  "Contacted",
  "Replied",
  "Call Scheduled",
  "Call Completed",
  "Under Review",
  "Selected for Presentation",
  "Rejected/Archived",
  "Hell No",
  "Already Sourced",
] as const;

export type PipelineStage = (typeof PIPELINE_STAGES)[number];

export const OUTREACH_STATUSES = [
  "Not Contacted",
  "Outreach Sent",
  "Follow-up Sent",
  "Replied",
  "No Response",
  "Call Scheduled",
  "Call Completed",
  "Closed",
] as const;

export type OutreachStatus = (typeof OUTREACH_STATUSES)[number];

export const SOURCE_TYPES = [
  "accelerator",
  "incubator",
  "event",
  "linkedin",
  "referral",
  "web",
] as const;

export type SourceType = (typeof SOURCE_TYPES)[number];

export const STARTUP_STAGES = [
  "Pre-seed",
  "Seed",
  "Series A",
  "Unknown",
] as const;

export const RECOMMENDATIONS = ["Present", "Do Not Present", "TBD"] as const;

// ─── Tables ───────────────────────────────────────────────────────────────────

export const startups = sqliteTable("startups", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  website: text("website"),
  city: text("city").default("Milan"),
  geographyTag: text("geography_tag"),
  stage: text("stage"),
  sector: text("sector"),
  foundedYear: integer("founded_year"),
  description: text("description"),
  problem: text("problem"),
  product: text("product"),
  businessModel: text("business_model"),
  traction: text("traction"),
  fundingStatus: text("funding_status"),
  accelerator: text("accelerator"),
  contactEmail: text("contact_email"),
  contactPhone: text("contact_phone"),
  contactLinkedin: text("contact_linkedin"),
  // Scoring dimensions (1-10)
  scoreRelevance: real("score_relevance"),
  scoreStageFit: real("score_stage_fit"),
  scoreSourceQuality: real("score_source_quality"),
  scoreTeamQuality: real("score_team_quality"),
  scoreProblemAttractiveness: real("score_problem_attractiveness"),
  scoreProductClarity: real("score_product_clarity"),
  scoreTractionQuality: real("score_traction_quality"),
  scoreMarketPotential: real("score_market_potential"),
  scoreFounderResponsiveness: real("score_founder_responsiveness"),
  scoreOverallConviction: real("score_overall_conviction"),
  priorityScore: real("priority_score"),
  status: text("status").notNull().default("New"),
  recommendation: text("recommendation").default("TBD"),
  hiddenReason: text("hidden_reason"),
  notes: text("notes"),
  pros: text("pros"),
  cons: text("cons"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
});

export const founders = sqliteTable("founders", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  startupId: integer("startup_id")
    .notNull()
    .references(() => startups.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  title: text("title"),
  email: text("email"),
  linkedin: text("linkedin"),
  notes: text("notes"),
});

export const sources = sqliteTable("sources", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  type: text("type").notNull(),
  url: text("url"),
  geographyRelevance: text("geography_relevance"),
  notes: text("notes"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
});

export const startupSources = sqliteTable("startup_sources", {
  startupId: integer("startup_id")
    .notNull()
    .references(() => startups.id, { onDelete: "cascade" }),
  sourceId: integer("source_id")
    .notNull()
    .references(() => sources.id, { onDelete: "cascade" }),
});

export const outreachEvents = sqliteTable("outreach_events", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  startupId: integer("startup_id")
    .notNull()
    .references(() => startups.id, { onDelete: "cascade" }),
  founderId: integer("founder_id").references(() => founders.id, {
    onDelete: "set null",
  }),
  date: text("date").notNull(),
  channel: text("channel"), // email, linkedin, phone, intro
  status: text("status").notNull().default("Outreach Sent"),
  messageType: text("message_type"), // first outreach, follow-up, reply
  followUpDate: text("follow_up_date"),
  notes: text("notes"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
});

export const callNotes = sqliteTable("call_notes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  startupId: integer("startup_id")
    .notNull()
    .references(() => startups.id, { onDelete: "cascade" }),
  date: text("date").notNull(),
  participants: text("participants"),
  founderBackground: text("founder_background"),
  whatTheyDo: text("what_they_do"),
  problemAndMarket: text("problem_and_market"),
  productMaturity: text("product_maturity"),
  traction: text("traction"),
  customers: text("customers"),
  businessModel: text("business_model"),
  fundraisingStatus: text("fundraising_status"),
  milestones: text("milestones"),
  keyRisks: text("key_risks"),
  overallImpression: text("overall_impression"),
  recommendation: text("recommendation"),
  nextStep: text("next_step"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
});

// ─── Relations ────────────────────────────────────────────────────────────────

export const startupsRelations = relations(startups, ({ many }) => ({
  founders: many(founders),
  startupSources: many(startupSources),
  outreachEvents: many(outreachEvents),
  callNotes: many(callNotes),
}));

export const foundersRelations = relations(founders, ({ one, many }) => ({
  startup: one(startups, {
    fields: [founders.startupId],
    references: [startups.id],
  }),
  outreachEvents: many(outreachEvents),
}));

export const sourcesRelations = relations(sources, ({ many }) => ({
  startupSources: many(startupSources),
}));

export const startupSourcesRelations = relations(
  startupSources,
  ({ one }) => ({
    startup: one(startups, {
      fields: [startupSources.startupId],
      references: [startups.id],
    }),
    source: one(sources, {
      fields: [startupSources.sourceId],
      references: [sources.id],
    }),
  })
);

export const outreachEventsRelations = relations(outreachEvents, ({ one }) => ({
  startup: one(startups, {
    fields: [outreachEvents.startupId],
    references: [startups.id],
  }),
  founder: one(founders, {
    fields: [outreachEvents.founderId],
    references: [founders.id],
  }),
}));

export const callNotesRelations = relations(callNotes, ({ one }) => ({
  startup: one(startups, {
    fields: [callNotes.startupId],
    references: [startups.id],
  }),
}));
