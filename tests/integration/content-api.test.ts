import { describe, it, expect } from "vitest";
import { POST as validateHandler } from "@/app/api/v1/content/validate/route";
import { POST as publishHandler } from "@/app/api/v1/content/publish/route";
import { GET as versionsHandler } from "@/app/api/v1/content/versions/route";
import { NextRequest } from "next/server";
import { randomUUID } from "crypto";

describe("Content Management API", () => {
  const sampleConcept = {
    id: randomUUID(),
    moduleId: randomUUID(),
    slug: `test-concept-${randomUUID()}`,
    title: "Konsep Integrasi Test",
    summary: "Ringkasan konsep integrasi untuk API content.",
    difficulty: "introductory",
    learningObjectives: ["Memahami pengujian API konten"],
    prerequisites: [],
    misconceptions: [],
    steps: [
      {
        id: randomUUID(),
        kind: "understand",
        sortOrder: 1,
        title: "Pemahaman Langkah",
        instruction: "Pelajari materi berikut.",
        content: "Materi uji.",
        estimatedMinutes: 2,
        config: {},
      },
    ],
  };

  it("POST /api/v1/content/validate returns validation report without modifying database", async () => {
    const req = new NextRequest("http://localhost:3000/api/v1/content/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(sampleConcept),
    });

    const res = await validateHandler(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.data).toBeDefined();
    expect(json.data.valid).toBe(true);
    expect(Array.isArray(json.data.checklist)).toBe(true);
  });

  it("POST /api/v1/content/publish saves immutable version and GET /versions retrieves it", async () => {
    // 1. Publish
    const pubReq = new NextRequest("http://localhost:3000/api/v1/content/publish", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(sampleConcept),
    });

    const pubRes = await publishHandler(pubReq);
    expect(pubRes.status).toBe(200);

    const pubJson = await pubRes.json();
    expect(pubJson.data.success).toBe(true);
    expect(pubJson.data.version).toBe(1);
    expect(pubJson.data.checksum).toBeDefined();

    // 2. Fetch versions
    const verReq = new NextRequest(
      `http://localhost:3000/api/v1/content/versions?ownerId=${sampleConcept.id}`
    );

    const verRes = await versionsHandler(verReq);
    expect(verRes.status).toBe(200);

    const verJson = await verRes.json();
    expect(verJson.data.ownerId).toBe(sampleConcept.id);
    expect(verJson.data.versions.length).toBeGreaterThanOrEqual(1);
    expect(verJson.data.versions[0].version).toBe(1);
  });
});
