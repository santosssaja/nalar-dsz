import { describe, it, expect } from "vitest";
import { POST as syncHandler } from "@/app/api/v1/sync/route";
import { NextRequest } from "next/server";
import { randomUUID } from "crypto";

describe("POST /api/v1/sync (Offline Outbox Sync)", () => {
  it("processes offline outbox attempt events idempotently", async () => {
    const eventId = randomUUID();
    const stepId = "40000000-0000-4000-8000-000000000003"; // predict step

    const payload = {
      events: [
        {
          eventId,
          type: "attempt.submit",
          occurredAt: new Date().toISOString(),
          payload: {
            stepId,
            response: { selectedOptionId: "opt-curam" },
            usedHintsCount: 0,
          },
        },
      ],
    };

    const req = new NextRequest("http://localhost:3000/api/v1/sync", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const res = await syncHandler(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.data).toBeDefined();
    expect(json.data.accepted).toContain(eventId);
    expect(json.data.rejected.length).toBe(0);
    expect(json.data.progress).toBeDefined();

    // Repeat sync with same eventId (idempotent)
    const req2 = new NextRequest("http://localhost:3000/api/v1/sync", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const res2 = await syncHandler(req2);
    expect(res2.status).toBe(200);
    const json2 = await res2.json();
    expect(json2.data.accepted).toContain(eventId);
  });
});
