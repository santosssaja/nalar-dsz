import { describe, it, expect } from "vitest";
import {
  ensureDbInitialized,
  getDb,
  domains,
  modules,
  concepts,
  learningSteps,
} from "@/server/db";
import { seedCuratedContent } from "@/server/db/seed";
import { getDomains, getModules, getConcepts } from "@/content/loader";

describe("Curated content seed reconciliation", () => {
  it("seeds every curated domain, module, concept, and learning step", async () => {
    await ensureDbInitialized();
    const db = getDb();

    const dbDomains = await db.select({ id: domains.id }).from(domains);
    const dbModules = await db.select({ id: modules.id }).from(modules);
    const dbConcepts = await db.select({ id: concepts.id }).from(concepts);
    const dbSteps = await db.select({ id: learningSteps.id }).from(learningSteps);

    const curatedConceptCount = getConcepts().length;
    const curatedStepCount = getConcepts().reduce(
      (sum, c) => sum + c.steps.length,
      0
    );

    expect(dbDomains.length).toBe(getDomains().length);
    expect(dbModules.length).toBe(getModules().length);
    expect(dbConcepts.length).toBe(curatedConceptCount);
    expect(dbSteps.length).toBe(curatedStepCount);
    expect(curatedConceptCount).toBeGreaterThan(0);
    expect(curatedStepCount).toBeGreaterThan(0);
  });

  it("is idempotent: re-seeding does not create duplicate rows", async () => {
    const db = getDb();

    const before = await db.select({ id: learningSteps.id }).from(learningSteps);

    await seedCuratedContent(db);

    const afterOne = await db.select({ id: learningSteps.id }).from(learningSteps);

    await seedCuratedContent(db);
    await seedCuratedContent(db);

    const afterThree = await db.select({ id: learningSteps.id }).from(learningSteps);

    expect(afterOne.length).toBe(before.length);
    expect(afterThree.length).toBe(before.length);
    expect(before.length).toBe(
      getConcepts().reduce((sum, c) => sum + c.steps.length, 0)
    );
  }, 15000);
});