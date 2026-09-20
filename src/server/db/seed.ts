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
import { sql } from "drizzle-orm";

export async function seedCuratedContent(db: DbClient, force = false): Promise<void> {
  const allConcepts = getConcepts();

  // Fast path: if concepts and steps are already seeded and force is false, skip heavy operations
  if (!force) {
    try {
      const [existing] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(concepts);

      if (Number(existing?.count ?? 0) >= allConcepts.length) {
        return;
      }
    } catch {
      // Table might not exist yet during initial boot, proceed with seed
    }
  }

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

  // 4. Batch Seed Concepts in a single upsert query
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
    await db
      .insert(concepts)
      .values(conceptRows)
      .onConflictDoUpdate({
        target: concepts.id,
        set: {
          moduleId: sql`excluded.module_id`,
          slug: sql`excluded.slug`,
          title: sql`excluded.title`,
          summary: sql`excluded.summary`,
          difficulty: sql`excluded.difficulty`,
          status: sql`excluded.status`,
        },
      });
  }

  // 5. Batch Seed Learning Steps in a single upsert query
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
    await db
      .insert(learningSteps)
      .values(stepRows)
      .onConflictDoUpdate({
        target: learningSteps.id,
        set: {
          conceptId: sql`excluded.concept_id`,
          contentVersionId: sql`excluded.content_version_id`,
          kind: sql`excluded.kind`,
          sortOrder: sql`excluded.sort_order`,
          config: sql`excluded.config`,
        },
      });
  }
}