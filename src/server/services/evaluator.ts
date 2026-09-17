import { StepContent, StepEvaluation } from "@/content/schema";

export interface EvaluationResult {
  status: "correct" | "incorrect";
  feedback: string;
  misconceptionCodes: string[];
  availableHintLevel: "orientation" | "concept" | "strategy" | "solution";
}

export function evaluateStepResponse(
  step: StepContent,
  response: Record<string, unknown>
): EvaluationResult {
  const evaluation: StepEvaluation | undefined = step.evaluation;

  // Informational or open exploration steps without strict evaluation
  if (!evaluation) {
    return {
      status: "correct",
      feedback: "Langkah berhasil diselesaikan.",
      misconceptionCodes: [],
      availableHintLevel: "orientation",
    };
  }

  if (evaluation.type === "choice") {
    const selectedOptionId = String(response.selectedOptionId ?? response.answer ?? "");
    const option = evaluation.options.find((opt) => opt.id === selectedOptionId);

    if (!option) {
      return {
        status: "incorrect",
        feedback: "Pilihlah salah satu opsi jawaban sebelum melanjutkan.",
        misconceptionCodes: [],
        availableHintLevel: "orientation",
      };
    }

    if (option.isCorrect) {
      return {
        status: "correct",
        feedback: option.feedback ?? evaluation.feedbackCorrect,
        misconceptionCodes: [],
        availableHintLevel: "orientation",
      };
    }

    return {
      status: "incorrect",
      feedback: option.feedback ?? "Pilihan belum tepat. Pikirkan kembali konsep di balik pilihan tersebut.",
      misconceptionCodes: option.misconceptionCode ? [option.misconceptionCode] : [],
      availableHintLevel: "orientation",
    };
  }

  if (evaluation.type === "numeric") {
    const rawVal = response.value ?? response.answer;
    const numVal = typeof rawVal === "number" ? rawVal : parseFloat(String(rawVal));

    if (isNaN(numVal)) {
      return {
        status: "incorrect",
        feedback: "Masukkan angka numerik yang valid.",
        misconceptionCodes: [],
        availableHintLevel: "orientation",
      };
    }

    const diff = Math.abs(numVal - evaluation.expectedValue);
    if (diff <= evaluation.tolerance) {
      return {
        status: "correct",
        feedback: evaluation.feedbackCorrect,
        misconceptionCodes: [],
        availableHintLevel: "orientation",
      };
    }

    // Check for specific misconception traps
    for (const trap of evaluation.misconceptions) {
      if (Math.abs(numVal - trap.triggerValue) <= evaluation.tolerance) {
        return {
          status: "incorrect",
          feedback: trap.feedback,
          misconceptionCodes: [trap.code],
          availableHintLevel: "orientation",
        };
      }
    }

    return {
      status: "incorrect",
      feedback: "Hasil perhitunganmu belum tepat. Periksa kembali rumus dan langkah perhitunganmu.",
      misconceptionCodes: [],
      availableHintLevel: "orientation",
    };
  }

  // Fallback for rubric / other evaluations
  return {
    status: "correct",
    feedback: "Tanggapan diterima.",
    misconceptionCodes: [],
    availableHintLevel: "orientation",
  };
}
