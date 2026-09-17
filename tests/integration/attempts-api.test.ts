import { describe, it, expect } from "vitest";
import { randomUUID } from "crypto";
import { submitAttempt, getLearnerConceptProgress } from "@/server/services/learning-service";
import { Actor } from "@/server/auth/actor-resolver";
import { getDb, learnerDevices, learnerPreferences } from "@/server/db";

describe("Submit Attempt & Mastery Integration", () => {
  async function createTestActor(): Promise<Actor> {
    const db = getDb();
    const deviceId = `test-device-${randomUUID()}`;
    const [device] = await db
      .insert(learnerDevices)
      .values({
        deviceKeyHash: `hash-${randomUUID()}`,
        lastSeenAt: new Date(),
      })
      .returning();

    await db.insert(learnerPreferences).values({
      learnerDeviceId: device.id,
      theme: "light",
      fontScale: "normal",
      reducedMotion: false,
      naiVisible: true,
    });

    return {
      kind: "guest",
      deviceId,
      learnerDeviceId: device.id,
    };
  }

  it("should process practice submission, update mastery dimensions, and persist progress", async () => {
    const actor = await createTestActor();
    const stepId = "40000000-0000-4000-8000-000000000012"; // Definisi Turunan practice step
    const idempotencyKey = randomUUID();

    const output = await submitAttempt({
      actor,
      stepId,
      idempotencyKey,
      response: { value: 6 },
      usedHintsCount: 0,
    });

    expect(output).toBeDefined();
    expect(output.evaluation.status).toBe("correct");
    expect(output.progress.dimensions.practice).toBeGreaterThan(0);
    expect(output.progress.status).toBe("learning");

    // Verify database read matches
    const persisted = await getLearnerConceptProgress(
      actor,
      "30000000-0000-4000-8000-000000000003"
    );
    expect(persisted).toBeDefined();
    expect(persisted?.practice).toBe(output.progress.dimensions.practice);
  });

  it("should enforce idempotency when submitting twice with identical idempotencyKey", async () => {
    const actor = await createTestActor();
    const stepId = "40000000-0000-4000-8000-000000000010"; // Predict step
    const idempotencyKey = randomUUID();

    // First submission
    const res1 = await submitAttempt({
      actor,
      stepId,
      idempotencyKey,
      response: { selectedOptionId: "opt-tangent" },
      usedHintsCount: 0,
    });

    // Second submission with exact same key
    const res2 = await submitAttempt({
      actor,
      stepId,
      idempotencyKey,
      response: { selectedOptionId: "opt-tangent" },
      usedHintsCount: 0,
    });

    expect(res1.attemptId).toBe(res2.attemptId);
    expect(res1.evaluation.status).toBe(res2.evaluation.status);
    expect(res1.progress.dimensions.understanding).toBe(
      res2.progress.dimensions.understanding
    );
  });
});
