import { describe, it, expect, beforeEach } from "vitest";
import {
  scheduleOrUpdateReview,
  getDueReviews,
  completeReview,
} from "@/server/services/retrieval-service";
import { Actor } from "@/server/auth/actor-resolver";
import { ensureDbInitialized, getDb, reviewQueue, learnerDevices } from "@/server/db";
import { randomUUID } from "crypto";

describe("RetrievalService (Spaced Retrieval)", () => {
  const testDeviceId = randomUUID();
  const testActor: Actor = {
    kind: "guest",
    deviceId: "test-device-uuid",
    learnerDeviceId: testDeviceId,
  };
  const testConceptId = "30000000-0000-4000-8000-000000000001"; // Perubahan

  beforeEach(async () => {
    await ensureDbInitialized();
    const db = getDb();

    // Ensure learner device exists in database
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

  it("schedules an initial 1-day review for a concept", async () => {
    await scheduleOrUpdateReview(testDeviceId, testConceptId, true);

    const db = getDb();
    const rows = await db.select().from(reviewQueue);
    const item = rows.find((r) => r.learnerDeviceId === testDeviceId && r.conceptId === testConceptId);

    expect(item).toBeDefined();
    expect(item?.intervalDays).toBe(1);
    expect(item?.state).toBe("pending");
  });

  it("increases the interval on subsequent successful reviews", async () => {
    // 1 -> 3 days
    await scheduleOrUpdateReview(testDeviceId, testConceptId, true);

    const db = getDb();
    const rows = await db.select().from(reviewQueue);
    const item = rows.find((r) => r.learnerDeviceId === testDeviceId && r.conceptId === testConceptId);

    expect(item?.intervalDays).toBe(3);
  });

  it("resets interval to 1 day if learner struggles", async () => {
    await scheduleOrUpdateReview(testDeviceId, testConceptId, false);

    const db = getDb();
    const rows = await db.select().from(reviewQueue);
    const item = rows.find((r) => r.learnerDeviceId === testDeviceId && r.conceptId === testConceptId);

    expect(item?.intervalDays).toBe(1);
  });

  it("completes a review and updates retention mastery", async () => {
    const result = await completeReview(testActor, testConceptId, "good");

    expect(result.updatedSnapshot.retention).toBeGreaterThan(0);
    expect(result.intervalDays).toBeGreaterThanOrEqual(1);
    expect(result.nextDueAt).toBeDefined();
  });
});
