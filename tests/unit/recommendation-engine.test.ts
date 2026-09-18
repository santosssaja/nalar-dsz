import { describe, it, expect, beforeEach } from "vitest";
import { getNextRecommendation } from "@/server/services/recommendation-engine";
import { Actor } from "@/server/auth/actor-resolver";
import {
  ensureDbInitialized,
  getDb,
  learnerDevices,
  reviewQueue,
  mistakeEvents,
  attempts,
} from "@/server/db";
import { randomUUID } from "crypto";

describe("RecommendationEngine (Adaptive Learning Path)", () => {
  const testDeviceId = randomUUID();
  const testActor: Actor = {
    kind: "guest",
    deviceId: "test-device-uuid",
    learnerDeviceId: testDeviceId,
  };

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

  it("recommends the first concept when learner is new", async () => {
    const rec = await getNextRecommendation(testActor, "turunan");

    expect(rec).toBeDefined();
    expect(["NEXT_PATH_NODE", "PREREQUISITE_INCOMPLETE"]).toContain(rec.reasonCode);
    expect(rec.targetSlug).toBeDefined();
    expect(rec.reasonText).toBeDefined();
  });

  it("prioritizes spaced review when a review is overdue", async () => {
    const db = getDb();
    const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000); // 1 day ago

    await db.insert(reviewQueue).values({
      id: randomUUID(),
      learnerDeviceId: testDeviceId,
      conceptId: "30000000-0000-4000-8000-000000000001",
      dueAt: pastDate,
      intervalDays: 1,
      state: "pending",
      updatedAt: pastDate,
    });

    const rec = await getNextRecommendation(testActor, "turunan");

    expect(rec.reasonCode).toBe("RETRIEVAL_DUE");
    expect(rec.targetType).toBe("review");
    expect(rec.priority).toBe(2);
  });
});
