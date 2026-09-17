import { describe, it, expect } from "vitest";
import {
  getDomains,
  getModules,
  getModuleBySlug,
  getConcepts,
  getConceptBySlug,
  getStepById,
} from "@/content/loader";

describe("Curated Content Loader", () => {
  it("should load Matematika domain successfully", () => {
    const domains = getDomains();
    expect(domains.length).toBeGreaterThanOrEqual(1);

    const mat = domains.find((d) => d.slug === "matematika");
    expect(mat).toBeDefined();
    expect(mat?.title).toBe("Matematika");
    expect(mat?.moduleSlugs).toContain("turunan");
  });

  it("should load Turunan module with learning path", () => {
    const mod = getModuleBySlug("turunan");
    expect(mod).toBeDefined();
    expect(mod?.title).toContain("Turunan");
    expect(mod?.conceptSlugs.length).toBe(3);
    expect(mod?.learningPath.nodes.length).toBe(3);
  });

  it("should load 3 curated concepts for Turunan", () => {
    const concepts = getConcepts("turunan");
    expect(concepts.length).toBe(3);

    const slugs = concepts.map((c) => c.slug);
    expect(slugs).toEqual(["perubahan", "laju-perubahan", "definisi-turunan"]);
  });

  it("should validate concept 03-definisi-turunan steps and hints", () => {
    const concept = getConceptBySlug("definisi-turunan");
    expect(concept).toBeDefined();
    expect(concept?.steps.length).toBe(5);

    const kinds = concept?.steps.map((s) => s.kind);
    expect(kinds).toContain("encounter");
    expect(kinds).toContain("explore");
    expect(kinds).toContain("predict");
    expect(kinds).toContain("understand");
    expect(kinds).toContain("practice");

    // Check predict step has hints
    const predictStep = concept?.steps.find((s) => s.kind === "predict");
    expect(predictStep?.hints?.solution).toBeDefined();
  });

  it("should retrieve step by ID", () => {
    const stepInfo = getStepById("40000000-0000-4000-8000-000000000010");
    expect(stepInfo).toBeDefined();
    expect(stepInfo?.step.kind).toBe("predict");
    expect(stepInfo?.concept.slug).toBe("definisi-turunan");
  });
});
