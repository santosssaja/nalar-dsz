import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAiProvider } from "@/server/ai/factory";
import { AiProviderName, AiSocraticContext } from "@/server/ai/types";
import { getStepById, getConceptBySlug } from "@/content/loader";
import { resolveActor } from "@/server/auth/actor-resolver";

const TutorRequestSchema = z.object({
  conceptSlug: z.string(),
  stepId: z.string().optional(),
  userQuestion: z.string().min(1).max(1000),
  provider: z.enum(["gemma", "google", "openai", "anthropic", "curated"]).optional().default("gemma"),
  model: z.string().optional(),
  apiKey: z.string().optional(),
  endpoint: z.string().optional(),
  stream: z.boolean().optional().default(false),
});

export async function POST(req: NextRequest) {
  try {
    const actor = await resolveActor();
    const body = await req.json();
    const parsed = TutorRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Permintaan tutor tidak valid.", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { conceptSlug, stepId, userQuestion, provider, model, apiKey, endpoint, stream: requestStream } = parsed.data;
    const isStreamRequested = requestStream || req.headers.get("accept")?.includes("text/event-stream");

    const concept = getConceptBySlug(conceptSlug);
    if (!concept) {
      return NextResponse.json(
        { error: `Konsep '${conceptSlug}' tidak ditemukan.` },
        { status: 404 }
      );
    }

    const step = stepId ? concept.steps.find((s) => s.id === stepId) : concept.steps[0];

    const context: AiSocraticContext = {
      conceptSlug: concept.slug,
      conceptTitle: concept.title,
      stepKind: step?.kind ?? "encounter",
      stepTitle: step?.title ?? "Materi Konsep",
      stepInstruction: step?.instruction ?? "",
      stepContent: step?.content ?? concept.summary,
      userQuestion,
      misconceptions: concept.misconceptions,
    };

    const ai = getAiProvider(provider as AiProviderName);

    // Streaming mode (SSE)
    if (isStreamRequested) {
      const encoder = new TextEncoder();
      const readableStream = new ReadableStream({
        async start(controller) {
          try {
            const stream = ai.socraticGuidanceStream
              ? ai.socraticGuidanceStream(context, { model, apiKey, endpoint })
              : (async function* () {
                  const res = await ai.socraticGuidance(context, { model, apiKey, endpoint });
                  yield { type: "text" as const, content: res.text };
                  yield { type: "done" as const, provider: res.provider, model: res.model };
                })();

            for await (const chunk of stream) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`));
            }
            controller.close();
          } catch (err) {
            console.error("Stream error in AI Tutor route:", err);
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ type: "error", content: "Terjadi gangguan saat streaming jawaban." })}\n\n`
              )
            );
            controller.close();
          }
        },
      });

      return new Response(readableStream, {
        headers: {
          "Content-Type": "text/event-stream; charset=utf-8",
          "Cache-Control": "no-cache, no-transform",
          "Connection": "keep-alive",
        },
      });
    }

    // Static JSON mode
    const result = await ai.socraticGuidance(context, {
      model,
      apiKey,
      endpoint,
    });

    return NextResponse.json({
      data: {
        answer: result.text,
        provider: result.provider,
        model: result.model,
        actorKind: actor.kind,
      },
    });
  } catch (error) {
    console.error("Error in AI Tutor route:", error);
    return NextResponse.json(
      { error: "Gagal memproses sesi konsultasi dengan Nai." },
      { status: 500 }
    );
  }
}
