import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAiProvider } from "@/server/ai/factory";
import { AiProviderName, AiPredictContext } from "@/server/ai/types";
import { getStepById, getConceptBySlug } from "@/content/loader";
import { resolveActor } from "@/server/auth/actor-resolver";
import { ChoiceEvaluationSchema } from "@/content/schema";

export const dynamic = "force-dynamic";

const PredictRequestSchema = z.object({
  conceptSlug: z.string().min(1, "conceptSlug wajib diisi"),
  stepId: z.string().uuid("stepId harus berupa UUID yang valid"),
  selectedOptionId: z.string().min(1, "selectedOptionId wajib diisi"),
  confidence: z.enum(["low", "medium", "high"]).default("medium"),
  reasoning: z.string().max(1000).optional(),
  provider: z.enum(["gemma", "google", "openai", "anthropic", "curated"]).optional().default("gemma"),
  model: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    await resolveActor();
    const body = await req.json();
    const parsed = PredictRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "Permintaan evaluasi prediksi tidak valid.",
            fields: parsed.error.flatten().fieldErrors,
          },
        },
        { status: 400 }
      );
    }

    const { conceptSlug, stepId, selectedOptionId, confidence, reasoning, provider, model } = parsed.data;

    const concept = getConceptBySlug(conceptSlug);
    if (!concept) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: `Konsep '${conceptSlug}' tidak ditemukan.` } },
        { status: 404 }
      );
    }

    const step = concept.steps.find((s) => s.id === stepId) ?? getStepById(stepId)?.step;
    if (!step) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: `Langkah prediksi '${stepId}' tidak ditemukan.` } },
        { status: 404 }
      );
    }

    const choiceEvaluation =
      step.evaluation?.type === "choice"
        ? ChoiceEvaluationSchema.parse(step.evaluation)
        : null;

    if (!choiceEvaluation) {
      return NextResponse.json(
        { error: { code: "INVALID_STEP", message: "Langkah ini tidak memiliki konfigurasi prediksi pilihan ganda." } },
        { status: 400 }
      );
    }

    const chosenOption = choiceEvaluation.options.find((o) => o.id === selectedOptionId);
    if (!chosenOption) {
      return NextResponse.json(
        { error: { code: "OPTION_NOT_FOUND", message: "Opsi prediksi yang dipilih tidak valid." } },
        { status: 400 }
      );
    }

    const context: AiPredictContext = {
      conceptSlug: concept.slug,
      conceptTitle: concept.title,
      stepTitle: step.title,
      stepInstruction: step.instruction,
      stepContent: step.content,
      selectedOptionId: chosenOption.id,
      selectedOptionLabel: chosenOption.label,
      isCorrect: chosenOption.isCorrect,
      confidence,
      reasoning: reasoning?.trim() || undefined,
      misconceptions: concept.misconceptions,
      explanationFeedback: chosenOption.feedback,
    };

    const ai = getAiProvider(provider as AiProviderName);
    const analysis = ai.evaluatePrediction
      ? await ai.evaluatePrediction(context, { model })
      : await ai.socraticGuidance({
          conceptSlug: concept.slug,
          conceptTitle: concept.title,
          stepKind: "predict",
          stepTitle: step.title,
          stepInstruction: step.instruction,
          stepContent: step.content,
          userQuestion: `Saya memilih opsi "${chosenOption.label}" dengan alasan: "${reasoning || "tidak ada"}". Apakah prediksi ini tepat?`,
        }).then((res) => ({
          hypothesisEvaluation: chosenOption.isCorrect
            ? "Hipotesismu selaras dengan prinsip dasar konsep ini."
            : "Hipotesismu menarik, namun kenyataannya memiliki perilaku yang berbeda.",
          cognitiveAnalysis: res.text,
          conceptualNudge: "Amati pembuktian di langkah eksplorasi berikutnya!",
          provider: res.provider,
          model: res.model,
        }));

    return NextResponse.json({
      data: analysis,
    });
  } catch (error) {
    console.error("Error in AI Predict route:", error);
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "Gagal menganalisis prediksi dengan AI.",
        },
      },
      { status: 500 }
    );
  }
}
