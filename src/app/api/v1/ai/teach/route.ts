import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAiProvider } from "@/server/ai/factory";
import { AiProviderName, AiTeachContext } from "@/server/ai/types";
import { getConceptBySlug } from "@/content/loader";
import { resolveActor } from "@/server/auth/actor-resolver";
import { parseAiError } from "@/server/ai/error-utils";

const TeachRequestSchema = z.object({
  conceptSlug: z.string(),
  naiQuestion: z.string(),
  userTeachingExplanation: z.string().min(3).max(2500),
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
    const parsed = TeachRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Permintaan Teach Mode tidak valid.", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const {
      conceptSlug,
      naiQuestion,
      userTeachingExplanation,
      provider,
      model,
      apiKey,
      endpoint,
      stream: requestStream,
    } = parsed.data;

    const isStreamRequested = requestStream || req.headers.get("accept")?.includes("text/event-stream");

    const concept = getConceptBySlug(conceptSlug);
    if (!concept) {
      return NextResponse.json(
        { error: `Konsep '${conceptSlug}' tidak ditemukan.` },
        { status: 404 }
      );
    }

    const context: AiTeachContext = {
      conceptSlug: concept.slug,
      conceptTitle: concept.title,
      conceptSummary: concept.summary,
      naiQuestion,
      userTeachingExplanation,
      rubricCriteria: concept.rubric?.criteria,
    };

    const ai = getAiProvider(provider as AiProviderName);

    // Streaming mode (SSE)
    if (isStreamRequested) {
      const encoder = new TextEncoder();
      const readableStream = new ReadableStream({
        async start(controller) {
          try {
            const stream = ai.evaluateTeachModeStream
              ? ai.evaluateTeachModeStream(context, { model, apiKey, endpoint })
              : (async function* () {
                  yield {
                    type: "thought" as const,
                    content: "Nai sedang menyimak penjelasan Guru...",
                  };
                  const evaluation = await ai.evaluateTeachMode(context, { model, apiKey, endpoint });
                  const words = evaluation.naiResponse.split(/(\s+)/);
                  for (const w of words) {
                    if (w) {
                      yield { type: "nai_response" as const, content: w };
                      await new Promise((r) => setTimeout(r, 15));
                    }
                  }
                  yield { type: "evaluation" as const, evaluation };
                  yield { type: "done" as const, provider: ai.name };
                })();

            for await (const chunk of stream) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`));
            }
            controller.close();
          } catch (err) {
            console.error("Stream error in AI Teach route:", err);
            const parsed = parseAiError(err, model);
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ type: "error", content: parsed.message, code: parsed.code })}\n\n`
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
    const evaluation = await ai.evaluateTeachMode(context, {
      model,
      apiKey,
      endpoint,
    });

    return NextResponse.json({
      data: {
        evaluation,
        provider: ai.name,
        actorKind: actor.kind,
      },
    });
  } catch (error) {
    console.error("Error in AI Teach route:", error);
    const parsed = parseAiError(error);
    return NextResponse.json(
      { error: { code: parsed.code, message: parsed.message } },
      { status: parsed.status }
    );
  }
}
