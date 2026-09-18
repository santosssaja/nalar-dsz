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

    const { conceptSlug, stepId, userQuestion, provider, model, apiKey, endpoint } = parsed.data;

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
