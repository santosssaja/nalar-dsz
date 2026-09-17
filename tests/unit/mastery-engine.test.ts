import { describe, it, expect } from "vitest";
import {
  getDimensionForStep,
  computeMasteryDelta,
  applyMasteryUpdate,
  ConceptMasterySnapshot,
} from "@/server/services/mastery-engine";

describe("Deterministic Mastery Engine", () => {
  it("should map step kinds to appropriate mastery dimensions", () => {
    expect(getDimensionForStep("encounter")).toBe("understanding");
    expect(getDimensionForStep("predict")).toBe("understanding");
    expect(getDimensionForStep("understand")).toBe("understanding");
    expect(getDimensionForStep("practice")).toBe("practice");
    expect(getDimensionForStep("apply")).toBe("application");
    expect(getDimensionForStep("transfer")).toBe("transfer");
    expect(getDimensionForStep("explain")).toBe("explanation");
    expect(getDimensionForStep("retrieve")).toBe("retention");
  });

  it("should calculate positive delta for correct answer and respect hint penalty", () => {
    const fullReward = computeMasteryDelta("understanding", true, 0);
    const penaltyReward = computeMasteryDelta("understanding", true, 2);

    expect(fullReward).toBe(25);
    expect(penaltyReward).toBeLessThan(fullReward);
    expect(penaltyReward).toBeGreaterThanOrEqual(8);
  });

  it("should clamp mastery values strictly within 0 and 100", () => {
    const initial: ConceptMasterySnapshot = {
      understanding: 90,
      practice: 5,
      application: 0,
      transfer: 0,
      explanation: 0,
      retention: 0,
      status: "learning",
    };

    const updatedOver = applyMasteryUpdate(initial, "understanding", 25);
    expect(updatedOver.understanding).toBe(100);

    const updatedUnder = applyMasteryUpdate(initial, "practice", -20);
    expect(updatedUnder.practice).toBe(0);
  });

  it("should transition concept status from unstarted to learning to practiced", () => {
    let snapshot: ConceptMasterySnapshot = {
      understanding: 0,
      practice: 0,
      application: 0,
      transfer: 0,
      explanation: 0,
      retention: 0,
      status: "unstarted",
    };

    snapshot = applyMasteryUpdate(snapshot, "understanding", 25);
    expect(snapshot.status).toBe("learning");

    // Bump understanding and practice to 60+
    snapshot = applyMasteryUpdate(snapshot, "understanding", 40);
    snapshot = applyMasteryUpdate(snapshot, "practice", 65);
    expect(snapshot.status).toBe("practiced");
  });
});
