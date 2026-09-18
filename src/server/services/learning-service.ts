import { eq, and } from "drizzle-orm";
import { randomUUID } from "crypto";
import {
  getDb,
  ensureDbInitialized,
  attempts,
  learningEvidence,
  conceptProgress,
  mistakeEvents,
  contentVersions,
  concepts,
  learningSteps,
} from "@/server/db";
import { Actor } from "@/server/auth/actor-resolver";
import { getStepById, getConceptById } from "@/content/loader";
import { evaluateStepResponse, EvaluationResult } from "./evaluator";
import {
  getDimensionForStep,
  computeMasteryDelta,
  applyMasteryUpdate,
  ConceptMasterySnapshot,
} from "./mastery-engine";
import { scheduleOrUpdateReview } from "./retrieval-service";
import { HintLevel } from "@/content/schema";

export interface NextActionOutput {
  type: "continue" | "hint" | "remedial";
  reasonCode: string;
  remedialInfo?: {
    code: string;
    label: string;
    remediation: string;
  };
}

export interface SubmitAttemptInput {
  actor: Actor;
  stepId: string;
  contentVersion?: number;
  idempotencyKey: string;
  response: Record<string, unknown>;
  usedHintsCount?: number;
}

export interface SubmitAttemptOutput {
  attemptId: string;
  evaluation: EvaluationResult;
  progress: {
    conceptId: string;
    dimensions: Omit<ConceptMasterySnapshot, "status">;
    status: ConceptMasterySnapshot["status"];
  };
  nextAction: NextActionOutput;
}

export async function submitAttempt(
  input: SubmitAttemptInput
): Promise<SubmitAttemptOutput> {
  await ensureDbInitialized();
  const db = getDb();
  const { actor, stepId, idempotencyKey, response, usedHintsCount = 0 } = input;

  // 1. Idempotency Check: return existing attempt if key matches
  const [existingAttempt] = await db
    .select()
    .from(attempts)
    .where(
      and(
        eq(attempts.learnerDeviceId, actor.learnerDeviceId),
        eq(attempts.idempotencyKey, idempotencyKey)
      )
    )
    .limit(1);

  if (existingAttempt) {
    const cachedResult = existingAttempt.result as SubmitAttemptOutput;
    return {
      ...cachedResult,
      attemptId: existingAttempt.id,
    };
  }

  // 2. Load step and concept
  const stepInfo = getStepById(stepId);
  if (!stepInfo) {
    throw new Error(`Step dengan ID ${stepId} tidak ditemukan.`);
  }
  const { concept, step } = stepInfo;

  // 3. Evaluate response deterministically
  const evaluation = evaluateStepResponse(step, response);
  const isCorrect = evaluation.status === "correct";

  // 4. Calculate Mastery updates
  const dimension = getDimensionForStep(step.kind);
  const delta = computeMasteryDelta(dimension, isCorrect, usedHintsCount);

  // Fetch current progress
  const [currentProgress] = await db
    .select()
    .from(conceptProgress)
    .where(
      and(
        eq(conceptProgress.learnerDeviceId, actor.learnerDeviceId),
        eq(conceptProgress.conceptId, concept.id)
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

  const newSnapshot = applyMasteryUpdate(initialSnapshot, dimension, delta);

  // 5. Database writes
  const attemptId = randomUUID();

  const activeMisconception = evaluation.misconceptionCodes.length > 0
    ? concept.misconceptions.find((m) => m.code === evaluation.misconceptionCodes[0])
    : undefined;

  const nextAction: NextActionOutput = isCorrect
    ? { type: "continue", reasonCode: "STEP_COMPLETED" }
    : evaluation.misconceptionCodes.length > 0
    ? {
        type: "remedial",
        reasonCode: "MISCONCEPTION_ACTIVE",
        remedialInfo: activeMisconception
          ? {
              code: activeMisconception.code,
              label: activeMisconception.label,
              remediation: activeMisconception.remediation,
            }
          : undefined,
      }
    : { type: "hint", reasonCode: "RETRY_WITH_HINT" };

  const outputResult: SubmitAttemptOutput = {
    attemptId,
    evaluation,
    progress: {
      conceptId: concept.id,
      dimensions: {
        understanding: newSnapshot.understanding,
        practice: newSnapshot.practice,
        application: newSnapshot.application,
        transfer: newSnapshot.transfer,
        explanation: newSnapshot.explanation,
        retention: newSnapshot.retention,
      },
      status: newSnapshot.status,
    },
    nextAction,
  };

  // Content version placeholder
  const dummyContentVersionId = "00000000-0000-0000-0000-000000000001";

  // Self-healing database check: ensure content version, concept, and step exist in DB
  try {
    await db
      .insert(contentVersions)
      .values({
        id: dummyContentVersionId,
        ownerType: "bundle",
        ownerId: concept.moduleId,
        version: 1,
        payload: {},
        checksum: "v1-initial",
      })
      .onConflictDoNothing();

    await db
      .insert(concepts)
      .values({
        id: concept.id,
        moduleId: concept.moduleId,
        slug: concept.slug,
        title: concept.title,
        summary: concept.summary,
        difficulty: concept.difficulty,
        status: "published",
      })
      .onConflictDoNothing();

    await db
      .insert(learningSteps)
      .values({
        id: step.id,
        conceptId: concept.id,
        contentVersionId: dummyContentVersionId,
        kind: step.kind,
        sortOrder: step.sortOrder,
        config: step.config ?? {},
      })
      .onConflictDoNothing();
  } catch (seedErr) {
    console.warn("Self-healing step insertion notice:", seedErr);
  }

  // Insert attempt
  await db.insert(attempts).values({
    id: attemptId,
    learnerDeviceId: actor.learnerDeviceId,
    learningStepId: step.id,
    contentVersionId: dummyContentVersionId,
    idempotencyKey,
    response,
    result: outputResult,
    submittedAt: new Date(),
  });

  // Insert learning evidence
  await db.insert(learningEvidence).values({
    attemptId,
    learnerDeviceId: actor.learnerDeviceId,
    conceptId: concept.id,
    dimension,
    score: delta,
    source: step.kind,
    observedAt: new Date(),
  });

  // Upsert concept progress
  if (currentProgress) {
    await db
      .update(conceptProgress)
      .set({
        understanding: newSnapshot.understanding,
        practice: newSnapshot.practice,
        application: newSnapshot.application,
        transfer: newSnapshot.transfer,
        explanation: newSnapshot.explanation,
        retention: newSnapshot.retention,
        status: newSnapshot.status,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(conceptProgress.learnerDeviceId, actor.learnerDeviceId),
          eq(conceptProgress.conceptId, concept.id)
        )
      );
  } else {
    await db.insert(conceptProgress).values({
      learnerDeviceId: actor.learnerDeviceId,
      conceptId: concept.id,
      understanding: newSnapshot.understanding,
      practice: newSnapshot.practice,
      application: newSnapshot.application,
      transfer: newSnapshot.transfer,
      explanation: newSnapshot.explanation,
      retention: newSnapshot.retention,
      status: newSnapshot.status,
      updatedAt: new Date(),
    });
  }

  // Insert mistake events if any misconception detected
  if (evaluation.misconceptionCodes.length > 0) {
    for (const code of evaluation.misconceptionCodes) {
      await db.insert(mistakeEvents).values({
        attemptId,
        conceptId: concept.id,
        misconceptionCode: code,
        confidence: 1.0,
      });
    }
  }

  // Spaced review scheduling
  try {
    await scheduleOrUpdateReview(actor.learnerDeviceId, concept.id, isCorrect);
  } catch (err) {
    console.error("Failed to schedule review:", err);
  }

  return outputResult;
}

export async function getLearnerConceptProgress(
  actor: Actor,
  conceptId: string
): Promise<ConceptMasterySnapshot | null> {
  await ensureDbInitialized();
  const db = getDb();
  const [progress] = await db
    .select()
    .from(conceptProgress)
    .where(
      and(
        eq(conceptProgress.learnerDeviceId, actor.learnerDeviceId),
        eq(conceptProgress.conceptId, conceptId)
      )
    )
    .limit(1);

  if (!progress) return null;

  return {
    understanding: progress.understanding,
    practice: progress.practice,
    application: progress.application,
    transfer: progress.transfer,
    explanation: progress.explanation,
    retention: progress.retention,
    status: progress.status as ConceptMasterySnapshot["status"],
  };
}

export interface LearnerConceptProgressItem {
  conceptId: string;
  conceptSlug: string;
  conceptTitle: string;
  dimensions: Omit<ConceptMasterySnapshot, "status">;
  status: ConceptMasterySnapshot["status"];
  updatedAt: Date;
}

export async function getAllLearnerProgress(
  actor: Actor
): Promise<LearnerConceptProgressItem[]> {
  await ensureDbInitialized();
  const db = getDb();

  const rows = await db
    .select()
    .from(conceptProgress)
    .where(eq(conceptProgress.learnerDeviceId, actor.learnerDeviceId));

  const result: LearnerConceptProgressItem[] = [];
  for (const row of rows) {
    const concept = getConceptById(row.conceptId);
    if (concept) {
      result.push({
        conceptId: row.conceptId,
        conceptSlug: concept.slug,
        conceptTitle: concept.title,
        dimensions: {
          understanding: row.understanding,
          practice: row.practice,
          application: row.application,
          transfer: row.transfer,
          explanation: row.explanation,
          retention: row.retention,
        },
        status: row.status as ConceptMasterySnapshot["status"],
        updatedAt: row.updatedAt,
      });
    }
  }
  return result;
}

export interface MistakeSummaryItem {
  misconceptionCode: string;
  label: string;
  remediation: string;
  count: number;
  lastOccurredAt: Date;
  conceptId: string;
  conceptTitle: string;
}

export async function getMistakeSummaryForLearner(
  actor: Actor,
  conceptId?: string
): Promise<MistakeSummaryItem[]> {
  await ensureDbInitialized();
  const db = getDb();

  const query = db
    .select({
      id: mistakeEvents.id,
      conceptId: mistakeEvents.conceptId,
      misconceptionCode: mistakeEvents.misconceptionCode,
      createdAt: mistakeEvents.createdAt,
    })
    .from(mistakeEvents)
    .innerJoin(attempts, eq(mistakeEvents.attemptId, attempts.id))
    .where(
      and(
        eq(attempts.learnerDeviceId, actor.learnerDeviceId),
        conceptId ? eq(mistakeEvents.conceptId, conceptId) : undefined
      )
    );

  const rows = await query;
  const map = new Map<string, {
    count: number;
    lastOccurredAt: Date;
    conceptId: string;
    misconceptionCode: string;
  }>();

  for (const row of rows) {
    const key = `${row.conceptId}:${row.misconceptionCode}`;
    const existing = map.get(key);
    if (!existing) {
      map.set(key, {
        count: 1,
        lastOccurredAt: row.createdAt,
        conceptId: row.conceptId,
        misconceptionCode: row.misconceptionCode,
      });
    } else {
      existing.count += 1;
      if (row.createdAt > existing.lastOccurredAt) {
        existing.lastOccurredAt = row.createdAt;
      }
    }
  }

  const result: MistakeSummaryItem[] = [];
  for (const item of map.values()) {
    const concept = getConceptById(item.conceptId);
    const taxonomy = concept?.misconceptions.find(
      (m) => m.code === item.misconceptionCode
    );
    result.push({
      misconceptionCode: item.misconceptionCode,
      label: taxonomy?.label ?? item.misconceptionCode,
      remediation: taxonomy?.remediation ?? "Tinjau kembali konsep ini untuk memperdalam pemahaman.",
      count: item.count,
      lastOccurredAt: item.lastOccurredAt,
      conceptId: item.conceptId,
      conceptTitle: concept?.title ?? "Konsep Pembelajaran",
    });
  }

  return result.sort((a, b) => b.lastOccurredAt.getTime() - a.lastOccurredAt.getTime());
}

export function getStepHint(stepId: string, level: HintLevel): { level: HintLevel; hintText: string } | null {
  const stepInfo = getStepById(stepId);
  if (!stepInfo || !stepInfo.step.hints) return null;

  const { hints } = stepInfo.step;
  const hintText = hints[level];
  if (!hintText) return null;

  return { level, hintText };
}
