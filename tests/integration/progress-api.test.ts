import { describe, it, expect } from "vitest";
import { GET as progressHandler } from "@/app/api/v1/progress/route";
import { POST as reviewHandler } from "@/app/api/v1/progress/review/route";
import { NextRequest } from "next/server";

describe("Progress & Review API", () => {
  it("GET /api/v1/progress returns learner progress, reviews due, and mistakes", async () => {
    const res = await progressHandler();

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data).toBeDefined();
    expect(Array.isArray(json.data.progress)).toBe(true);
    expect(Array.isArray(json.data.reviewsDue)).toBe(true);
    expect(Array.isArray(json.data.mistakes)).toBe(true);
  });

  it("POST /api/v1/progress/review completes a review and updates schedule", async () => {
    const conceptId = "30000000-0000-4000-8000-000000000001";
    const req = new NextRequest("http://localhost:3000/api/v1/progress/review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        conceptId,
        performance: "good",
      }),
    });

    const res = await reviewHandler(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.data).toBeDefined();
    expect(json.data.updatedSnapshot).toBeDefined();
    expect(json.data.updatedSnapshot.retention).toBeGreaterThan(0);
    expect(json.data.intervalDays).toBeGreaterThanOrEqual(1);
  });
});
