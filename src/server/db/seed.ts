import { DbClient } from "./index";
import {
  domains,
  modules,
  concepts,
  contentVersions,
  learningSteps,
} from "./schema";
import { getDomains, getModules, getConcepts } from "@/content/loader";
import { contentVersionOfStep } from "@/content/versioning";

export async function seedCuratedContent(db: DbClient): Promise<void> {
  const allConcepts = getConcepts();

  // 1. Seed immutable per-step content versions (deterministic ids derived from content)
  const contentVersionRows = allConcepts.flatMap((concept) =>
    concept.steps.map((step) => {
      const version = contentVersionOfStep(step);
      return {
        id: version.id,
        ownerType: "step" as const,
        ownerId: step.id,
        version: 1,
        payload: version.payload,
        checksum: version.checksum,
      };
    })
  );
  if (contentVersionRows.length > 0) {
    await db
      .insert(contentVersions)
      .values(contentVersionRows)
      .onConflictDoNothing();
  }

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

  // 4. Batch Seed Concepts (upsert to reconcile changes)
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
    for (const row of conceptRows) {
      await db
        .insert(concepts)
        .values(row)
        .onConflictDoUpdate({
          target: concepts.id,
          set: {
            moduleId: row.moduleId,
            slug: row.slug,
            title: row.title,
            summary: row.summary,
            difficulty: row.difficulty,
            status: row.status,
          },
        });
    }
  }

  // 5. Seed Learning Steps linked to their real content version
  const stepRows = allConcepts.flatMap((concept) =>
    concept.steps.map((step) => ({
      id: step.id,
      conceptId: concept.id,
      contentVersionId: contentVersionOfStep(step).id,
      kind: step.kind,
      sortOrder: step.sortOrder,
      config: step.config ?? {},
    }))
  );
  if (stepRows.length > 0) {
    for (const row of stepRows) {
      await db
        .insert(learningSteps)
        .values(row)
        .onConflictDoUpdate({
          target: learningSteps.id,
          set: {
            conceptId: row.conceptId,
            contentVersionId: row.contentVersionId,
            kind: row.kind,
            sortOrder: row.sortOrder,
            config: row.config,
          },
        });
    }
  }
}