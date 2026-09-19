import { eq } from "drizzle-orm";
import { DbClient } from "./index";
import {
  domains,
  modules,
  concepts,
  contentVersions,
  learningSteps,
} from "./schema";
import { getDomains, getModules, getConcepts } from "@/content/loader";

export const DEFAULT_CONTENT_VERSION_ID = "00000000-0000-0000-0000-000000000001";

export async function seedCuratedContent(db: DbClient): Promise<void> {
  // Check if content version is already seeded to avoid redundant inserts
  const existing = await db
    .select({ id: contentVersions.id })
    .from(contentVersions)
    .where(eq(contentVersions.id, DEFAULT_CONTENT_VERSION_ID))
    .limit(1);

  if (existing.length > 0) {
    return;
  }

  // 1. Seed Content Version
  await db
    .insert(contentVersions)
    .values({
      id: DEFAULT_CONTENT_VERSION_ID,
      ownerType: "bundle",
      ownerId: "20000000-0000-4000-8000-000000000001",
      version: 1,
      payload: {},
      checksum: "v1-initial",
    })
    .onConflictDoNothing();

  // 2. Batch Seed Domains
  const domainRows = getDomains().map((domain) => ({
    id: domain.id,
    slug: domain.slug,
    title: domain.title,
    sortOrder: domain.sortOrder,
    status: "published" as const,
  }));
  if (domainRows.length > 0) {
    await db.insert(domains).values(domainRows).onConflictDoNothing();
  }

  // 3. Batch Seed Modules
  const moduleRows = getModules().map((mod) => ({
    id: mod.id,
    domainId: mod.domainId,
    slug: mod.slug,
    title: mod.title,
    summary: mod.summary,
    estimatedMinutes: mod.estimatedMinutes,
    status: "published" as const,
  }));
  if (moduleRows.length > 0) {
    await db.insert(modules).values(moduleRows).onConflictDoNothing();
  }

  // 4. Batch Seed Concepts and Steps
  const allConcepts = getConcepts();
  const conceptRows = allConcepts.map((concept) => ({
    id: concept.id,
    moduleId: concept.moduleId,
    slug: concept.slug,
    title: concept.title,
    summary: concept.summary,
    difficulty: concept.difficulty,
    status: "published" as const,
  }));
  if (conceptRows.length > 0) {
    await db.insert(concepts).values(conceptRows).onConflictDoNothing();
  }

  const stepRows = allConcepts.flatMap((concept) =>
    concept.steps.map((step) => ({
      id: step.id,
      conceptId: concept.id,
      contentVersionId: DEFAULT_CONTENT_VERSION_ID,
      kind: step.kind,
      sortOrder: step.sortOrder,
      config: step.config,
    }))
  );
  if (stepRows.length > 0) {
    await db.insert(learningSteps).values(stepRows).onConflictDoNothing();
  }
}
