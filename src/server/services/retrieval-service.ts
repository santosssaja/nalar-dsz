import { eq, and, lte } from "drizzle-orm";
import { randomUUID } from "crypto";
import {
  getDb,
  ensureDbInitialized,
  withTransaction,
  reviewQueue,
  conceptProgress,
  learningEvidence,
  concepts,
  type DbClient,
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

async function upsertReviewQueue(
  db: DbClient,
  learnerDeviceId: string,
  conceptId: string,
  isSuccess = true
): Promise<void> {
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

export async function scheduleOrUpdateReview(
  learnerDeviceId: string,
  conceptId: string,
  isSuccess = true
): Promise<void> {
  await ensureDbInitialized();
  const db = getDb();
  await upsertReviewQueue(db, learnerDeviceId, conceptId, isSuccess);
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

  const isSuccess = performance !== "again";
  const retentionDelta =
    performance === "easy" ? 25 : performance === "good" ? 18 : 0;

  return withTransaction(async (tx) => {
    // 1. Fetch current concept progress
    const [currentProgress] = await tx
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
          status: "unstarted",
        };

    const updatedSnapshot = applyMasteryUpdate(
      initialSnapshot,
      "retention",
      retentionDelta
    );

    const conceptRef = getConceptById(conceptId);

    // 2. Ensure the concept exists before linking progress
    if (conceptRef) {
      await tx
        .insert(concepts)
        .values({
          id: conceptRef.id,
          moduleId: conceptRef.moduleId,
          slug: conceptRef.slug,
          title: conceptRef.title,
          summary: conceptRef.summary,
          difficulty: conceptRef.difficulty,
          status: "published",
        })
        .onConflictDoNothing();
    }

    // 3. Upsert progress (creates the row when it does not exist yet)
    const progressValues = {
      learnerDeviceId: actor.learnerDeviceId,
      conceptId,
      understanding: updatedSnapshot.understanding,
      practice: updatedSnapshot.practice,
      application: updatedSnapshot.application,
      transfer: updatedSnapshot.transfer,
      explanation: updatedSnapshot.explanation,
      retention: updatedSnapshot.retention,
      status: updatedSnapshot.status,
      updatedAt: new Date(),
    };

    await tx
      .insert(conceptProgress)
      .values(progressValues)
      .onConflictDoUpdate({
        target: [conceptProgress.learnerDeviceId, conceptProgress.conceptId],
        set: progressValues,
      });

    // 4. Log evidence
    await tx.insert(learningEvidence).values({
      attemptId: null,
      learnerDeviceId: actor.learnerDeviceId,
      conceptId,
      dimension: "retention",
      score: retentionDelta,
      source: "retrieve",
      observedAt: new Date(),
    });

    // 5. Update review queue within the same transaction
    await upsertReviewQueue(tx, actor.learnerDeviceId, conceptId, isSuccess);

    const [updatedQueue] = await tx
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
  });
}
