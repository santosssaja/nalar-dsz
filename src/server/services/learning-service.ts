import { eq, and } from "drizzle-orm";
import { randomUUID } from "crypto";
import { getDb, ensureDbInitialized, attempts, learningEvidence, conceptProgress, mistakeEvents } from "@/server/db";
import { Actor } from "@/server/auth/actor-resolver";
import { getStepById } from "@/content/loader";
import { evaluateStepResponse, EvaluationResult } from "./evaluator";
import {
  getDimensionForStep,
  computeMasteryDelta,
  applyMasteryUpdate,
  ConceptMasterySnapshot,
} from "./mastery-engine";
import { HintLevel } from "@/content/schema";

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
  nextAction: {
    type: "continue" | "hint" | "remedial";
    reasonCode: string;
  };
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

  const nextAction = isCorrect
    ? { type: "continue" as const, reasonCode: "STEP_COMPLETED" }
    : evaluation.misconceptionCodes.length > 0
    ? { type: "remedial" as const, reasonCode: "MISCONCEPTION_ACTIVE" }
    : { type: "hint" as const, reasonCode: "RETRY_WITH_HINT" };

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

  // Content version placeholder for now
  const dummyContentVersionId = "00000000-0000-0000-0000-000000000001";

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

export function getStepHint(stepId: string, level: HintLevel): { level: HintLevel; hintText: string } | null {
  const stepInfo = getStepById(stepId);
  if (!stepInfo || !stepInfo.step.hints) return null;

  const { hints } = stepInfo.step;
  const hintText = hints[level];
  if (!hintText) return null;

  return { level, hintText };
}
