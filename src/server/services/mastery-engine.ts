import { StepKind } from "@/content/schema";

export type MasteryDimension =
  | "understanding"
  | "practice"
  | "application"
  | "transfer"
  | "explanation"
  | "retention";

export interface ConceptMasterySnapshot {
  understanding: number;
  practice: number;
  application: number;
  transfer: number;
  explanation: number;
  retention: number;
  status: "unstarted" | "learning" | "practiced" | "mastered" | "review_due";
}

export function getDimensionForStep(stepKind: StepKind): MasteryDimension {
  switch (stepKind) {
    case "encounter":
    case "explore":
    case "predict":
    case "understand":
      return "understanding";
    case "practice":
      return "practice";
    case "apply":
      return "application";
    case "transfer":
      return "transfer";
    case "explain":
      return "explanation";
    case "retrieve":
      return "retention";
    default:
      return "understanding";
  }
}

export function computeMasteryDelta(
  dimension: MasteryDimension,
  isCorrect: boolean,
  usedHintsCount = 0
): number {
  if (isCorrect) {
    // Reward based on autonomy (fewer hints used = higher evidence score)
    const baseReward = dimension === "understanding" ? 25 : 20;
    const penalty = Math.min(usedHintsCount * 4, 12);
    return Math.max(baseReward - penalty, 8);
  } else {
    // Non-punitive: minimal deduction only for practice repetition, never below zero
    return dimension === "practice" ? -5 : 0;
  }
}

export function applyMasteryUpdate(
  current: ConceptMasterySnapshot,
  dimension: MasteryDimension,
  delta: number
): ConceptMasterySnapshot {
  const clamp = (val: number) => Math.max(0, Math.min(100, Math.round(val)));

  const updated = {
    ...current,
    [dimension]: clamp(current[dimension] + delta),
  };

  // Derive status
  let status: ConceptMasterySnapshot["status"] = "unstarted";
  const { understanding, practice, application } = updated;

  if (understanding > 0 || practice > 0) {
    status = "learning";
  }
  if (understanding >= 60 && practice >= 60) {
    status = "practiced";
  }
  if (understanding >= 80 && practice >= 80 && application >= 60) {
    status = "mastered";
  }

  return {
    ...updated,
    status,
  };
}
