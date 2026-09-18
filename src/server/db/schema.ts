import {
  pgTable,
  uuid,
  text,
  integer,
  boolean,
  real,
  timestamp,
  jsonb,
  uniqueIndex,
  primaryKey,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// 1. Users (Registered Members)
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").unique(),
  displayName: text("display_name"),
  emailVerifiedAt: timestamp("email_verified_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// 1b. Verification Tokens (Magic Link Email Verification)
export const verificationTokens = pgTable("verification_tokens", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull(),
  token: text("token").notNull().unique(),
  displayName: text("display_name"),
  mode: text("mode").default("login").notNull(), // "login" | "register"
  targetLearnerDeviceId: uuid("target_learner_device_id"),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  consumedAt: timestamp("consumed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// 2. Learner Devices (Guest & Member Devices)
export const learnerDevices = pgTable("learner_devices", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  deviceKeyHash: text("device_key_hash").notNull().unique(),
  lastSeenAt: timestamp("last_seen_at", { withTimezone: true }).defaultNow().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// 3. Learner Preferences
export const learnerPreferences = pgTable("learner_preferences", {
  learnerDeviceId: uuid("learner_device_id")
    .primaryKey()
    .references(() => learnerDevices.id, { onDelete: "cascade" }),
  theme: text("theme").default("light").notNull(),
  highContrast: boolean("high_contrast").default(false).notNull(),
  fontScale: text("font_scale").default("normal").notNull(),
  reducedMotion: boolean("reduced_motion").default(false).notNull(),
  naiVisible: boolean("nai_visible").default(true).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// 4. Domains (e.g. Matematika, Fisika)
export const domains = pgTable("domains", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  status: text("status").default("published").notNull(),
});

// 5. Modules (e.g. Turunan, Aljabar Linear)
export const modules = pgTable(
  "modules",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    domainId: uuid("domain_id")
      .notNull()
      .references(() => domains.id, { onDelete: "restrict" }),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    summary: text("summary").notNull(),
    estimatedMinutes: integer("estimated_minutes").default(60).notNull(),
    status: text("status").default("published").notNull(),
  },
  (table) => [
    uniqueIndex("modules_domain_slug_idx").on(table.domainId, table.slug),
  ]
);

// 6. Concepts (Atomic knowledge units)
export const concepts = pgTable("concepts", {
  id: uuid("id").primaryKey().defaultRandom(),
  moduleId: uuid("module_id")
    .notNull()
    .references(() => modules.id, { onDelete: "restrict" }),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  summary: text("summary").notNull(),
  difficulty: text("difficulty").default("standard").notNull(),
  status: text("status").default("published").notNull(),
});

// 7. Concept Prerequisites
export const conceptPrerequisites = pgTable(
  "concept_prerequisites",
  {
    conceptId: uuid("concept_id")
      .notNull()
      .references(() => concepts.id, { onDelete: "cascade" }),
    prerequisiteConceptId: uuid("prerequisite_concept_id")
      .notNull()
      .references(() => concepts.id, { onDelete: "cascade" }),
    strength: text("strength").default("required").notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.conceptId, table.prerequisiteConceptId] }),
  ]
);

// 8. Learning Paths
export const learningPaths = pgTable("learning_paths", {
  id: uuid("id").primaryKey().defaultRandom(),
  moduleId: uuid("module_id")
    .notNull()
    .references(() => modules.id, { onDelete: "restrict" }),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  version: integer("version").default(1).notNull(),
  status: text("status").default("published").notNull(),
});

// 9. Path Nodes
export const pathNodes = pgTable("path_nodes", {
  id: uuid("id").primaryKey().defaultRandom(),
  pathId: uuid("path_id")
    .notNull()
    .references(() => learningPaths.id, { onDelete: "cascade" }),
  conceptId: uuid("concept_id")
    .notNull()
    .references(() => concepts.id, { onDelete: "restrict" }),
  sortOrder: integer("sort_order").default(0).notNull(),
  required: boolean("required").default(true).notNull(),
});

// 10. Content Versions (Immutable published content)
export const contentVersions = pgTable("content_versions", {
  id: uuid("id").primaryKey().defaultRandom(),
  ownerType: text("owner_type").notNull(),
  ownerId: uuid("owner_id").notNull(),
  version: integer("version").default(1).notNull(),
  payload: jsonb("payload").notNull(),
  publishedAt: timestamp("published_at", { withTimezone: true }).defaultNow().notNull(),
  checksum: text("checksum").notNull(),
});

// 11. Learning Steps
export const learningSteps = pgTable("learning_steps", {
  id: uuid("id").primaryKey().defaultRandom(),
  conceptId: uuid("concept_id")
    .notNull()
    .references(() => concepts.id, { onDelete: "restrict" }),
  contentVersionId: uuid("content_version_id")
    .notNull()
    .references(() => contentVersions.id, { onDelete: "restrict" }),
  kind: text("kind").notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  config: jsonb("config").notNull(),
});

// 12. Rubrics
export const rubrics = pgTable("rubrics", {
  id: uuid("id").primaryKey().defaultRandom(),
  conceptId: uuid("concept_id")
    .notNull()
    .references(() => concepts.id, { onDelete: "restrict" }),
  contentVersionId: uuid("content_version_id")
    .notNull()
    .references(() => contentVersions.id, { onDelete: "restrict" }),
  criteria: jsonb("criteria").notNull(),
  passingThreshold: integer("passing_threshold").default(70).notNull(),
});

// 13. Attempts (Append-only)
export const attempts = pgTable(
  "attempts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    learnerDeviceId: uuid("learner_device_id")
      .notNull()
      .references(() => learnerDevices.id, { onDelete: "restrict" }),
    learningStepId: uuid("learning_step_id")
      .notNull()
      .references(() => learningSteps.id, { onDelete: "restrict" }),
    contentVersionId: uuid("content_version_id")
      .notNull()
      .references(() => contentVersions.id, { onDelete: "restrict" }),
    idempotencyKey: uuid("idempotency_key").notNull(),
    response: jsonb("response").notNull(),
    result: jsonb("result").notNull(),
    submittedAt: timestamp("submitted_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("attempts_learner_idempotency_idx").on(
      table.learnerDeviceId,
      table.idempotencyKey
    ),
  ]
);

// 14. Learning Evidence
export const learningEvidence = pgTable("learning_evidence", {
  id: uuid("id").primaryKey().defaultRandom(),
  attemptId: uuid("attempt_id").references(() => attempts.id, { onDelete: "set null" }),
  learnerDeviceId: uuid("learner_device_id")
    .notNull()
    .references(() => learnerDevices.id, { onDelete: "cascade" }),
  conceptId: uuid("concept_id")
    .notNull()
    .references(() => concepts.id, { onDelete: "restrict" }),
  dimension: text("dimension").notNull(),
  score: integer("score").notNull(),
  source: text("source").notNull(),
  observedAt: timestamp("observed_at", { withTimezone: true }).defaultNow().notNull(),
});

// 15. Concept Progress (Aggregate Cache)
export const conceptProgress = pgTable(
  "concept_progress",
  {
    learnerDeviceId: uuid("learner_device_id")
      .notNull()
      .references(() => learnerDevices.id, { onDelete: "cascade" }),
    conceptId: uuid("concept_id")
      .notNull()
      .references(() => concepts.id, { onDelete: "restrict" }),
    understanding: integer("understanding").default(0).notNull(),
    practice: integer("practice").default(0).notNull(),
    application: integer("application").default(0).notNull(),
    transfer: integer("transfer").default(0).notNull(),
    explanation: integer("explanation").default(0).notNull(),
    retention: integer("retention").default(0).notNull(),
    status: text("status").default("unstarted").notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.learnerDeviceId, table.conceptId] }),
  ]
);

// 16. Mistake Events
export const mistakeEvents = pgTable("mistake_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  attemptId: uuid("attempt_id")
    .notNull()
    .references(() => attempts.id, { onDelete: "cascade" }),
  conceptId: uuid("concept_id")
    .notNull()
    .references(() => concepts.id, { onDelete: "restrict" }),
  misconceptionCode: text("misconception_code").notNull(),
  confidence: real("confidence").default(1.0).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// 17. Review Queue
export const reviewQueue = pgTable("review_queue", {
  id: uuid("id").primaryKey().defaultRandom(),
  learnerDeviceId: uuid("learner_device_id")
    .notNull()
    .references(() => learnerDevices.id, { onDelete: "cascade" }),
  conceptId: uuid("concept_id")
    .notNull()
    .references(() => concepts.id, { onDelete: "restrict" }),
  dueAt: timestamp("due_at", { withTimezone: true }).notNull(),
  intervalDays: integer("interval_days").default(1).notNull(),
  state: text("state").default("pending").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// 18. Recommendations
export const recommendations = pgTable("recommendations", {
  id: uuid("id").primaryKey().defaultRandom(),
  learnerDeviceId: uuid("learner_device_id")
    .notNull()
    .references(() => learnerDevices.id, { onDelete: "cascade" }),
  targetType: text("target_type").notNull(),
  targetId: uuid("target_id").notNull(),
  priority: integer("priority").default(0).notNull(),
  reasonCode: text("reason_code").notNull(),
  generatedAt: timestamp("generated_at", { withTimezone: true }).defaultNow().notNull(),
  dismissedAt: timestamp("dismissed_at", { withTimezone: true }),
});

// 19. AI Interactions
export const aiInteractions = pgTable("ai_interactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  learnerDeviceId: uuid("learner_device_id")
    .notNull()
    .references(() => learnerDevices.id, { onDelete: "cascade" }),
  conceptId: uuid("concept_id").references(() => concepts.id, { onDelete: "set null" }),
  mode: text("mode").notNull(),
  provider: text("provider").notNull(),
  model: text("model").notNull(),
  inputVersion: integer("input_version").default(1).notNull(),
  output: jsonb("output").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  devices: many(learnerDevices),
}));

export const learnerDevicesRelations = relations(learnerDevices, ({ one, many }) => ({
  user: one(users, { fields: [learnerDevices.userId], references: [users.id] }),
  preferences: one(learnerPreferences, {
    fields: [learnerDevices.id],
    references: [learnerPreferences.learnerDeviceId],
  }),
  attempts: many(attempts),
  evidence: many(learningEvidence),
  progress: many(conceptProgress),
}));

export const domainsRelations = relations(domains, ({ many }) => ({
  modules: many(modules),
}));

export const modulesRelations = relations(modules, ({ one, many }) => ({
  domain: one(domains, { fields: [modules.domainId], references: [domains.id] }),
  concepts: many(concepts),
  paths: many(learningPaths),
}));

export const conceptsRelations = relations(concepts, ({ one, many }) => ({
  module: one(modules, { fields: [concepts.moduleId], references: [modules.id] }),
  steps: many(learningSteps),
  rubrics: many(rubrics),
  progress: many(conceptProgress),
}));
