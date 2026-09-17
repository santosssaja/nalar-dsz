import { describe, it, expect } from "vitest";
import { evaluateStepResponse } from "@/server/services/evaluator";
import { getStepById } from "@/content/loader";

describe("Deterministic Step Evaluator", () => {
  it("should evaluate choice question correctly", () => {
    // Predict step in definisi-turunan: "opt-tangent" is correct
    const stepInfo = getStepById("40000000-0000-4000-8000-000000000010")!;
    expect(stepInfo).toBeDefined();

    // Correct choice
    const correctEval = evaluateStepResponse(stepInfo.step, {
      selectedOptionId: "opt-tangent",
    });
    expect(correctEval.status).toBe("correct");
    expect(correctEval.misconceptionCodes).toHaveLength(0);

    // Misconception choice: DIVIDE_BY_ZERO_CONFUSION
    const wrongEval = evaluateStepResponse(stepInfo.step, {
      selectedOptionId: "opt-hilang",
    });
    expect(wrongEval.status).toBe("incorrect");
    expect(wrongEval.misconceptionCodes).toContain("DIVIDE_BY_ZERO_CONFUSION");
  });

  it("should evaluate numeric practice question with tolerance and misconception trap", () => {
    // Practice step in definisi-turunan: expected 6
    const stepInfo = getStepById("40000000-0000-4000-8000-000000000012")!;
    expect(stepInfo).toBeDefined();

    // Correct numeric answer: 6
    const correctEval = evaluateStepResponse(stepInfo.step, { value: 6 });
    expect(correctEval.status).toBe("correct");
    expect(correctEval.misconceptionCodes).toHaveLength(0);

    // Misconception trap answer: 9 (USED_ORIGINAL_FUNCTION: f(3)=3² instead of f'(3)=2*3)
    const trapEval = evaluateStepResponse(stepInfo.step, { value: 9 });
    expect(trapEval.status).toBe("incorrect");
    expect(trapEval.misconceptionCodes).toContain("USED_ORIGINAL_FUNCTION");

    // Random wrong answer: 100
    const randomWrong = evaluateStepResponse(stepInfo.step, { value: 100 });
    expect(randomWrong.status).toBe("incorrect");
    expect(randomWrong.misconceptionCodes).toHaveLength(0);
  });
});
