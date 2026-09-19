import { describe, it, expect } from "vitest";
import { randomUUID } from "crypto";
import { eq } from "drizzle-orm";
import { submitAttempt, getLearnerConceptProgress } from "@/server/services/learning-service";
import { Actor } from "@/server/auth/actor-resolver";
import { getDb, learnerDevices, learnerPreferences, contentVersions, learningSteps } from "@/server/db";
import { getStepById } from "@/content/loader";
import { contentVersionOfStep } from "@/content/versioning";
import { POST as attemptsHandler } from "@/app/api/v1/attempts/route";
import { NextRequest } from "next/server";

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

  it("should persist attempts against a deterministic content version derived from the step content", async () => {
    const actor = await createTestActor();
    const stepInfo = getStepById("40000000-0000-4000-8000-000000000012");
    if (!stepInfo) throw new Error("Step fixture missing");
    const expectedVersion = contentVersionOfStep(stepInfo.step);
    const idempotencyKey = randomUUID();

    await submitAttempt({
      actor,
      stepId: stepInfo.step.id,
      idempotencyKey,
      response: { value: 6 },
      usedHintsCount: 0,
    });

    const db = getDb();
    const [stepRow] = await db
      .select({ contentVersionId: learningSteps.contentVersionId })
      .from(learningSteps)
      .where(eq(learningSteps.id, stepInfo.step.id))
      .limit(1);

    expect(stepRow?.contentVersionId).toBe(expectedVersion.id);

    const [versionRow] = await db
      .select()
      .from(contentVersions)
      .where(eq(contentVersions.id, expectedVersion.id))
      .limit(1);

    expect(versionRow).toBeDefined();
    expect(versionRow.checksum).toBe(expectedVersion.checksum);
    expect(versionRow.ownerType).toBe("step");
  });

  it("rejects negative or excessive usedHintsCount at the route boundary", async () => {
    const stepId = "40000000-0000-4000-8000-000000000012";
    const req = new NextRequest("http://localhost:3000/api/v1/attempts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Idempotency-Key": randomUUID(),
      },
      body: JSON.stringify({
        stepId,
        response: { value: 6 },
        usedHintsCount: -1,
      }),
    });

    const res = await attemptsHandler(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error.code).toBe("VALIDATION_ERROR");
  });

  it("returns a generic message (no internal detail leak) when submission fails", async () => {
    const req = new NextRequest("http://localhost:3000/api/v1/attempts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Idempotency-Key": randomUUID(),
      },
      body: JSON.stringify({
        stepId: "00000000-0000-4000-8000-000000000000",
        response: { value: 1 },
        usedHintsCount: 0,
      }),
    });

    const res = await attemptsHandler(req);
    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json.error.message).not.toContain("00000000-0000-4000-8000-000000000000");
  });
});
