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

  // 2. Seed Domains
  for (const domain of getDomains()) {
    await db
      .insert(domains)
      .values({
        id: domain.id,
        slug: domain.slug,
        title: domain.title,
        sortOrder: domain.sortOrder,
        status: "published",
      })
      .onConflictDoNothing();
  }

  // 3. Seed Modules
  for (const mod of getModules()) {
    await db
      .insert(modules)
      .values({
        id: mod.id,
        domainId: mod.domainId,
        slug: mod.slug,
        title: mod.title,
        summary: mod.summary,
        estimatedMinutes: mod.estimatedMinutes,
        status: "published",
      })
      .onConflictDoNothing();
  }

  // 4. Seed Concepts and Steps
  for (const concept of getConcepts()) {
    await db
      .insert(concepts)
      .values({
        id: concept.id,
        moduleId: concept.moduleId,
        slug: concept.slug,
        title: concept.title,
        summary: concept.summary,
        difficulty: concept.difficulty,
        status: "published",
      })
      .onConflictDoNothing();

    for (const step of concept.steps) {
      await db
        .insert(learningSteps)
        .values({
          id: step.id,
          conceptId: concept.id,
          contentVersionId: DEFAULT_CONTENT_VERSION_ID,
          kind: step.kind,
          sortOrder: step.sortOrder,
          config: step.config,
        })
        .onConflictDoNothing();
    }
  }
}
