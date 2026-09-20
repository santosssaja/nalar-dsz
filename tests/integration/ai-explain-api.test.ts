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

describe("AI Engine Endpoints (Providers, Tutor, Teach Mode)", () => {
  it(
    "GET /api/v1/ai/providers returns provider catalog with Gemma as default",
    async () => {
      const { GET: providersHandler } = await import("@/app/api/v1/ai/providers/route");
      const res = await providersHandler();
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.data.defaultProvider).toBe("gemma");
      expect(json.data.providers.length).toBeGreaterThanOrEqual(5);

      const ids = json.data.providers.map((p: { id: string }) => p.id);
      expect(ids).toContain("gemma");
      expect(ids).toContain("google");
      expect(ids).toContain("openai");
      expect(ids).toContain("anthropic");
      expect(ids).toContain("curated");
    },
    15000
  );

  it("POST /api/v1/ai/tutor provides Socratic guidance for learners", async () => {
    const { POST: tutorHandler } = await import("@/app/api/v1/ai/tutor/route");
    const payload = {
      conceptSlug: "definisi-turunan",
      userQuestion: "Mengapa h harus mendekati nol bukannya tepat nol?",
      provider: "gemma",
    };

    const req = new NextRequest("http://localhost:3000/api/v1/ai/tutor", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const res = await tutorHandler(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.data).toBeDefined();
    expect(json.data.answer).toBeDefined();
    expect(json.data.answer.length).toBeGreaterThan(10);
  });

  it("POST /api/v1/ai/tutor supports real-time streaming with thought and text chunks", async () => {
    const { POST: tutorHandler } = await import("@/app/api/v1/ai/tutor/route");
    const payload = {
      conceptSlug: "definisi-turunan",
      userQuestion: "Bagaimana cara kerja limit pada turunan?",
      provider: "curated",
      stream: true,
    };

    const req = new NextRequest("http://localhost:3000/api/v1/ai/tutor", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const res = await tutorHandler(req);
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("text/event-stream");

    const reader = res.body?.getReader();
    expect(reader).toBeDefined();

    const decoder = new TextDecoder();
    let streamText = "";
    while (true) {
      const { done, value } = await reader!.read();
      if (done) break;
      streamText += decoder.decode(value);
    }

    expect(streamText).toContain("data: ");
    expect(streamText).toContain('"type":"thought"');
    expect(streamText).toContain('"type":"text"');
    expect(streamText).toContain('"type":"done"');
  });

  it("POST /api/v1/ai/tutor accepts multi-turn chatHistory context", async () => {
    const { POST: tutorHandler } = await import("@/app/api/v1/ai/tutor/route");
    const payload = {
      conceptSlug: "definisi-turunan",
      userQuestion: "Lalu bagaimana jika h mendekati 0?",
      provider: "curated",
      chatHistory: [
        { role: "user", content: "Apa itu garis sekan?" },
        { role: "assistant", content: "Garis sekan adalah garis lurus yang memotong kurva di dua titik berjarak h." },
      ],
    };

    const req = new NextRequest("http://localhost:3000/api/v1/ai/tutor", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const res = await tutorHandler(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.data).toBeDefined();
    expect(json.data.answer).toBeDefined();
    expect(json.data.answer.length).toBeGreaterThan(10);
  });

  it("POST /api/v1/ai/teach evaluates learner teaching Nai in Teach Mode", async () => {
    const { POST: teachHandler } = await import("@/app/api/v1/ai/teach/route");
    const payload = {
      conceptSlug: "definisi-turunan",
      naiQuestion: "Nai masih bingung, bedanya kemiringan rata-rata dan turunan sesaat itu apa ya kak?",
      userTeachingExplanation:
        "Kemiringan rata-rata itu menghubungkan dua titik berjarak h pada kurva. Kalau turunan sesaat, jarak h kita buat mendekati limit nol sehingga hanya menyentuh tepat di satu titik garis singgung kurva.",
      provider: "gemma",
    };

    const req = new NextRequest("http://localhost:3000/api/v1/ai/teach", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const res = await teachHandler(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.data).toBeDefined();
    expect(json.data.evaluation).toBeDefined();
    expect(json.data.evaluation.score).toBeGreaterThanOrEqual(60);
    expect(json.data.evaluation.naiResponse).toBeDefined();
  });

  it("POST /api/v1/ai/teach supports real-time streaming with thought, nai_response, and evaluation chunks", async () => {
    const { POST: teachHandler } = await import("@/app/api/v1/ai/teach/route");
    const payload = {
      conceptSlug: "definisi-turunan",
      naiQuestion: "Nai masih bingung, bedanya kemiringan rata-rata dan turunan sesaat itu apa ya kak?",
      userTeachingExplanation:
        "Kemiringan rata-rata itu menghubungkan dua titik berjarak h pada kurva karena garis secant.",
      provider: "curated",
      stream: true,
    };

    const req = new NextRequest("http://localhost:3000/api/v1/ai/teach", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const res = await teachHandler(req);
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("text/event-stream");

    const reader = res.body?.getReader();
    expect(reader).toBeDefined();

    const decoder = new TextDecoder();
    let streamText = "";
    while (true) {
      const { done, value } = await reader!.read();
      if (done) break;
      streamText += decoder.decode(value);
    }

    expect(streamText).toContain("data: ");
    expect(streamText).toContain('"type":"thought"');
    expect(streamText).toContain('"type":"nai_response"');
    expect(streamText).toContain('"type":"evaluation"');
    expect(streamText).toContain('"type":"done"');
  });

  it("POST /api/v1/ai/predict evaluates learner hypothesis and reasoning", async () => {
    const { POST: predictHandler } = await import("@/app/api/v1/ai/predict/route");
    const payload = {
      conceptSlug: "gerak-melingkar",
      stepId: "40000000-0000-4000-8000-000000002302",
      selectedOptionId: "opt-4-times",
      confidence: "high",
      reasoning: "Karena percepatan sentripetal berbanding lurus dengan kuadrat kecepatan v^2/r",
      provider: "curated",
    };

    const req = new NextRequest("http://localhost:3000/api/v1/ai/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const res = await predictHandler(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.data).toBeDefined();
    expect(json.data.hypothesisEvaluation).toBeDefined();
    expect(json.data.cognitiveAnalysis).toContain("kuadrat");
    expect(json.data.conceptualNudge).toBeDefined();
  });

  it("POST /api/v1/ai/predict returns 400 validation error on invalid payload", async () => {
    const { POST: predictHandler } = await import("@/app/api/v1/ai/predict/route");
    const req = new NextRequest("http://localhost:3000/api/v1/ai/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        conceptSlug: "gerak-melingkar",
        stepId: "invalid-uuid",
      }),
    });

    const res = await predictHandler(req);
    expect(res.status).toBe(400);
  });
});


