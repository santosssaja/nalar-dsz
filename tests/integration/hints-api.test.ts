import { describe, it, expect } from "vitest";
import { getStepHint } from "@/server/services/learning-service";

describe("Layered Hints Service", () => {
  it("should retrieve layered hints for concept step", () => {
    const stepId = "40000000-0000-4000-8000-000000000010"; // Predict step

    const orientation = getStepHint(stepId, "orientation");
    expect(orientation).toBeDefined();
    expect(orientation?.level).toBe("orientation");
    expect(orientation?.hintText.length).toBeGreaterThan(5);

    const solution = getStepHint(stepId, "solution");
    expect(solution).toBeDefined();
    expect(solution?.level).toBe("solution");
    expect(solution?.hintText).toContain("garis singgung");
  });

  it("should return null for non-existent hint levels or non-existent steps", () => {
    const invalid = getStepHint("00000000-0000-0000-0000-000000000000", "orientation");
    expect(invalid).toBeNull();
  });
});
