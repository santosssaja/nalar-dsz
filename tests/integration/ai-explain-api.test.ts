import { describe, it, expect } from "vitest";
import { POST as explainHandler } from "@/app/api/v1/ai/explain-feedback/route";
import { NextRequest } from "next/server";

describe("POST /api/v1/ai/explain-feedback", () => {
  it("evaluates student explanation via rubric endpoint", async () => {
    const payload = {
      conceptSlug: "definisi-turunan",
      stepId: "40000000-0000-4000-8000-000000000013",
      explanation:
        "Turunan adalah kemiringan garis singgung sesaat pada kurva yang diperoleh dari garis potong saat limit jarak h mendekati nol.",
    };

    const req = new NextRequest(
      "http://localhost:3000/api/v1/ai/explain-feedback",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    const res = await explainHandler(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.data).toBeDefined();
    expect(json.data.passed).toBe(true);
    expect(json.data.totalScore).toBeGreaterThanOrEqual(70);
    expect(json.data.naiGuidance).toBeDefined();
  });

  it("returns 400 validation error for too short explanation", async () => {
    const payload = {
      conceptSlug: "definisi-turunan",
      stepId: "40000000-0000-4000-8000-000000000013",
      explanation: "pendek",
    };

    const req = new NextRequest(
      "http://localhost:3000/api/v1/ai/explain-feedback",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    const res = await explainHandler(req);
    expect(res.status).toBe(400);
  });
});
