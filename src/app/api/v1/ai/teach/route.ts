import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAiProvider } from "@/server/ai/factory";
import { AiProviderName, AiTeachContext } from "@/server/ai/types";
import { getConceptBySlug } from "@/content/loader";
import { resolveActor } from "@/server/auth/actor-resolver";

const TeachRequestSchema = z.object({
  conceptSlug: z.string(),
  naiQuestion: z.string(),
  userTeachingExplanation: z.string().min(3).max(2500),
  provider: z.enum(["gemma", "google", "openai", "anthropic", "curated"]).optional().default("gemma"),
  model: z.string().optional(),
  apiKey: z.string().optional(),
  endpoint: z.string().optional(),
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

    const { conceptSlug, naiQuestion, userTeachingExplanation, provider, model, apiKey, endpoint } = parsed.data;

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
    return NextResponse.json(
      { error: "Gagal memproses sesi Teach Mode." },
      { status: 500 }
    );
  }
}
