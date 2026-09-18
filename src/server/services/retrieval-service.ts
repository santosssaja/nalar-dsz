import { eq, and, lte } from "drizzle-orm";
import { randomUUID } from "crypto";
import {
  getDb,
  ensureDbInitialized,
  reviewQueue,
  conceptProgress,
  learningEvidence,
} from "@/server/db";
import { Actor } from "@/server/auth/actor-resolver";
import { getConceptById } from "@/content/loader";
import { ConceptMasterySnapshot, applyMasteryUpdate } from "./mastery-engine";

export interface DueReviewItem {
  id: string;
  conceptId: string;
  conceptSlug: string;
  conceptTitle: string;
  dueAt: Date;
  intervalDays: number;
  state: string;
}

const INTERVAL_LADDER = [1, 3, 7, 14, 30];

export async function scheduleOrUpdateReview(
  learnerDeviceId: string,
  conceptId: string,
  isSuccess = true
): Promise<void> {
  await ensureDbInitialized();
  const db = getDb();

  const [existing] = await db
    .select()
    .from(reviewQueue)
    .where(
      and(
        eq(reviewQueue.learnerDeviceId, learnerDeviceId),
        eq(reviewQueue.conceptId, conceptId)
      )
    )
    .limit(1);

  const now = new Date();

  if (!existing) {
    const initialDays = 1;
    const dueAt = new Date(now.getTime() + initialDays * 24 * 60 * 60 * 1000);
    await db.insert(reviewQueue).values({
      id: randomUUID(),
      learnerDeviceId,
      conceptId,
      dueAt,
      intervalDays: initialDays,
      state: "pending",
      updatedAt: now,
    });
    return;
  }

  // Calculate next interval
  let nextIntervalDays: number;
  if (!isSuccess) {
    nextIntervalDays = 1;
  } else {
    const currentIdx = INTERVAL_LADDER.indexOf(existing.intervalDays);
    if (currentIdx === -1 || currentIdx >= INTERVAL_LADDER.length - 1) {
      nextIntervalDays = Math.min(existing.intervalDays * 2, 60);
    } else {
      nextIntervalDays = INTERVAL_LADDER[currentIdx + 1];
    }
  }

  const dueAt = new Date(now.getTime() + nextIntervalDays * 24 * 60 * 60 * 1000);

  await db
    .update(reviewQueue)
    .set({
      intervalDays: nextIntervalDays,
      dueAt,
      state: "pending",
      updatedAt: now,
    })
    .where(eq(reviewQueue.id, existing.id));
}

export async function getDueReviews(actor: Actor): Promise<DueReviewItem[]> {
  await ensureDbInitialized();
  const db = getDb();
  const now = new Date();

  const items = await db
    .select()
    .from(reviewQueue)
    .where(
      and(
        eq(reviewQueue.learnerDeviceId, actor.learnerDeviceId),
        eq(reviewQueue.state, "pending"),
        lte(reviewQueue.dueAt, now)
      )
    );

  const result: DueReviewItem[] = [];
  for (const item of items) {
    const concept = getConceptById(item.conceptId);
    if (concept) {
      result.push({
        id: item.id,
        conceptId: item.conceptId,
        conceptSlug: concept.slug,
        conceptTitle: concept.title,
        dueAt: item.dueAt,
        intervalDays: item.intervalDays,
        state: item.state,
      });
    }
  }

  return result;
}

export async function completeReview(
  actor: Actor,
  conceptId: string,
  performance: "again" | "good" | "easy"
): Promise<{
  updatedSnapshot: ConceptMasterySnapshot;
  nextDueAt: Date;
  intervalDays: number;
}> {
  await ensureDbInitialized();
  const db = getDb();

  const isSuccess = performance !== "again";
  const retentionDelta = performance === "easy" ? 25 : performance === "good" ? 18 : 5;

  // 1. Fetch current concept progress
  const [currentProgress] = await db
    .select()
    .from(conceptProgress)
    .where(
      and(
        eq(conceptProgress.learnerDeviceId, actor.learnerDeviceId),
        eq(conceptProgress.conceptId, conceptId)
      )
    )
    .limit(1);

  const initialSnapshot: ConceptMasterySnapshot = currentProgress
    ? {
        understanding: currentProgress.understanding,
        practice: currentProgress.practice,
        application: currentProgress.application,
        transfer: currentProgress.transfer,
        explanation: currentProgress.explanation,
        retention: currentProgress.retention,
        status: currentProgress.status as ConceptMasterySnapshot["status"],
      }
    : {
        understanding: 0,
        practice: 0,
        application: 0,
        transfer: 0,
        explanation: 0,
        retention: 0,
        status: "learning",
      };

  const updatedSnapshot = applyMasteryUpdate(
    initialSnapshot,
    "retention",
    retentionDelta
  );

  // 2. Persist progress
  if (currentProgress) {
    await db
      .update(conceptProgress)
      .set({
        retention: updatedSnapshot.retention,
        status: updatedSnapshot.status,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(conceptProgress.learnerDeviceId, actor.learnerDeviceId),
          eq(conceptProgress.conceptId, conceptId)
        )
      );
  }

  // 3. Log evidence
  await db.insert(learningEvidence).values({
    attemptId: null,
    learnerDeviceId: actor.learnerDeviceId,
    conceptId,
    dimension: "retention",
    score: retentionDelta,
    source: "retrieve",
    observedAt: new Date(),
  });

  // 4. Update review queue
  await scheduleOrUpdateReview(actor.learnerDeviceId, conceptId, isSuccess);

  const [updatedQueue] = await db
    .select()
    .from(reviewQueue)
    .where(
      and(
        eq(reviewQueue.learnerDeviceId, actor.learnerDeviceId),
        eq(reviewQueue.conceptId, conceptId)
      )
    )
    .limit(1);

  return {
    updatedSnapshot,
    nextDueAt: updatedQueue ? updatedQueue.dueAt : new Date(),
    intervalDays: updatedQueue ? updatedQueue.intervalDays : 1,
  };
}
