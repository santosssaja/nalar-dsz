import { describe, it, expect, beforeEach } from "vitest";
import { evaluateExplanation } from "@/server/services/explain-evaluator";
import { Actor } from "@/server/auth/actor-resolver";
import { ensureDbInitialized, getDb, learnerDevices } from "@/server/db";
import { randomUUID } from "crypto";

describe("ExplainEvaluator (Rubric & Scaffolding)", () => {
  const testDeviceId = randomUUID();
  const testActor: Actor = {
    kind: "guest",
    deviceId: "test-device-uuid",
    learnerDeviceId: testDeviceId,
  };
  const conceptSlug = "definisi-turunan";
  const stepId = "40000000-0000-4000-8000-000000000013";

  beforeEach(async () => {
    await ensureDbInitialized();
    const db = getDb();

    await db
      .insert(learnerDevices)
      .values({
        id: testDeviceId,
        deviceKeyHash: "hash-" + testDeviceId,
        lastSeenAt: new Date(),
        createdAt: new Date(),
      })
      .onConflictDoNothing();
  });

  it("evaluates a comprehensive student explanation and passes rubric criteria", async () => {
    const studentExplanation =
      "Turunan adalah kemiringan garis singgung pada suatu kurva di satu titik. Kita mendapatkannya dari garis potong dua titik berjarak h, lalu menggunakan limit saat jarak h mendekati nol sehingga garis menyentuh satu titik dan menghasilkan laju perubahan sesaat.";

    const result = await evaluateExplanation(
      testActor,
      conceptSlug,
      stepId,
      studentExplanation
    );

    expect(result.passed).toBe(true);
    expect(result.totalScore).toBeGreaterThanOrEqual(70);
    expect(result.criteriaResults.length).toBeGreaterThanOrEqual(3);
    expect(result.naiGuidance).toBeDefined();
    expect(result.explanationMastery).toBeGreaterThan(0);
  });

  it("identifies missing conceptual elements in an incomplete explanation", async () => {
    const incompleteExplanation = "Turunan adalah rumus turunan aljabar.";

    const result = await evaluateExplanation(
      testActor,
      conceptSlug,
      stepId,
      incompleteExplanation
    );

    expect(result.passed).toBe(false);
    expect(result.totalScore).toBeLessThan(70);
    const failedCriteria = result.criteriaResults.filter((c) => !c.passed);
    expect(failedCriteria.length).toBeGreaterThan(0);
  });

  it("evaluates a student explanation for concept bilangan using its rubric criteria", async () => {
    const studentExplanation =
      "Minus sepuluh lebih kecil daripada minus dua karena letaknya pada garis bilangan berada jauh lebih ke kiri dari titik acuan nol. Angka 10 adalah magnitude atau besaran jaraknya dari nol, tetapi karena arahnya negatif di sebelah kiri, maka nilainya semakin kecil.";

    const result = await evaluateExplanation(
      testActor,
      "bilangan",
      "40000000-0000-4000-8000-000000000025",
      studentExplanation
    );

    expect(result.passed).toBe(true);
    expect(result.totalScore).toBeGreaterThanOrEqual(70);
    expect(result.criteriaResults.length).toBe(3);
    expect(result.criteriaResults.every((c) => c.passed)).toBe(true);
  });

  it("evaluates a student explanation for Fisika concept vektor using its rubric criteria", async () => {
    const studentExplanation =
      "Besar resultan vektor sangat dipengaruhi oleh orientasi arah dan sudut antarentitas. Berbeda dengan skalar yang dijumlahkan biasa, vektor dijumlahkan secara geometris. Bila sudutnya searah nol derajat maka nilainya maksimum 10 Newton, sedangkan bila berlawanan 180 derajat gayanya saling meniadakan menjadi minimum 0 Newton.";

    const result = await evaluateExplanation(
      testActor,
      "vektor",
      "40000000-0000-4000-8000-000000000065",
      studentExplanation
    );

    expect(result.passed).toBe(true);
    expect(result.totalScore).toBeGreaterThanOrEqual(70);
    expect(result.criteriaResults.length).toBe(3);
    expect(result.criteriaResults.every((c) => c.passed)).toBe(true);
  });
});

