import { describe, it, expect, beforeEach } from "vitest";
import {
  validateConceptContent,
  detectPrerequisiteCycle,
  publishConceptContent,
  getContentVersionHistory,
  computeContentChecksum,
} from "@/server/services/content-publish-pipeline";
import { ensureDbInitialized, getDb, contentVersions } from "@/server/db";
import { ConceptContent } from "@/content/schema";
import { randomUUID } from "crypto";

describe("ContentPublishPipeline", () => {
  beforeEach(async () => {
    await ensureDbInitialized();
  });

  const validConcept: ConceptContent = {
    id: randomUUID(),
    moduleId: randomUUID(),
    slug: "uji-validasi",
    title: "Konsep Uji Validasi",
    summary: "Ringkasan konsep uji untuk testing pipeline publish.",
    difficulty: "standard",
    learningObjectives: ["Mampu memahami tujuan pengujian konten"],
    prerequisites: [],
    misconceptions: [],
    steps: [
      {
        id: randomUUID(),
        kind: "predict",
        sortOrder: 1,
        title: "Prediksi Uji",
        instruction: "Pilih prediksi jawabanmu.",
        content: "Apa yang terjadi saat $x$ membesar?",
        estimatedMinutes: 2,
        config: {},
        hints: {
          solution: "Solusi lengkap ada di sini.",
        },
        evaluation: {
          type: "choice",
          options: [
            { id: "opt-1", label: "Membesar", isCorrect: true },
            { id: "opt-2", label: "Mengecil", isCorrect: false },
          ],
          feedbackCorrect: "Benar!",
        },
      },
    ],
  };

  it("validates a well-formed concept successfully", () => {
    const report = validateConceptContent(validConcept);

    expect(report.valid).toBe(true);
    expect(report.errors.length).toBe(0);
    expect(report.checklist.length).toBeGreaterThanOrEqual(4);
  });

  it("detects circular dependency in prerequisite graph", () => {
    const graphWithCycle = [
      { slug: "concept-a", prerequisites: ["concept-b"] },
      { slug: "concept-b", prerequisites: ["concept-c"] },
      { slug: "concept-c", prerequisites: ["concept-a"] }, // Cycle: A -> B -> C -> A
    ];

    const cycleResult = detectPrerequisiteCycle(graphWithCycle);
    expect(cycleResult.hasCycle).toBe(true);
    expect(cycleResult.cycle).toBeDefined();

    const acyclicGraph = [
      { slug: "concept-a", prerequisites: [] },
      { slug: "concept-b", prerequisites: ["concept-a"] },
      { slug: "concept-c", prerequisites: ["concept-b"] },
    ];
    const acyclicResult = detectPrerequisiteCycle(acyclicGraph);
    expect(acyclicResult.hasCycle).toBe(false);
  });

  it("publishes concept into content_versions table and increments version", async () => {
    const result1 = await publishConceptContent(validConcept);

    expect(result1.success).toBe(true);
    expect(result1.version).toBe(1);
    expect(result1.checksum).toHaveLength(64);

    // Publish second version
    const updatedConcept = {
      ...validConcept,
      title: "Konsep Uji Validasi (Revisi)",
    };
    const result2 = await publishConceptContent(updatedConcept);

    expect(result2.success).toBe(true);
    expect(result2.version).toBe(2);
    expect(result2.checksum).not.toBe(result1.checksum);

    // Verify version history
    const history = await getContentVersionHistory(validConcept.id);
    expect(history.length).toBe(2);
    expect(history[0].version).toBe(2);
    expect(history[1].version).toBe(1);
  });
});
