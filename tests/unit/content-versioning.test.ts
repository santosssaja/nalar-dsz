import { describe, it, expect } from "vitest";
import {
  contentVersionOfStep,
  checksumOfStep,
  stableStringify,
} from "@/content/versioning";

describe("Content Versioning", () => {
  const baseStep = {
    id: "40000000-0000-4000-8000-000000000012",
    kind: "practice",
    sortOrder: 2,
    title: "Definisi Turunan",
    instruction: "Hitung nilai turunan berikut.",
    content: "f(x) = x^2",
    config: {},
    hints: {
      orientation: "Ingat cara menghitung turunan.",
      solution: "2x",
    },
  } as const;

  it("produces a deterministic valid UUID version id for identical content", () => {
    const first = contentVersionOfStep(baseStep as never);
    const second = contentVersionOfStep(baseStep as never);

    expect(first.id).toBe(second.id);
    expect(first.checksum).toBe(second.checksum);
    expect(first.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
    );
  });

  it("changes the version id when step content changes", () => {
    const original = contentVersionOfStep(baseStep as never);
    const modified = contentVersionOfStep({
      ...baseStep,
      content: "f(x) = x^3",
    } as never);

    expect(modified.id).not.toBe(original.id);
    expect(modified.checksum).not.toBe(original.checksum);
  });

  it("ignores property order when computing the checksum (canonical JSON)", () => {
    const a = stableStringify({ x: 1, y: [2, 3] });
    const b = stableStringify({ y: [2, 3], x: 1 });
    expect(a).toBe(b);
    expect(checksumOfStep(baseStep as never)).toHaveLength(64);
  });
});