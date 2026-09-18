import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { resolveActor } from "@/server/auth/actor-resolver";
import { evaluateExplanation } from "@/server/services/explain-evaluator";

export const dynamic = "force-dynamic";

const ExplainRequestSchema = z.object({
  conceptSlug: z.string().min(1),
  stepId: z.string().uuid(),
  explanation: z
    .string()
    .min(10, "Tuliskan penjelasan minimal 10 karakter untuk dievaluasi.")
    .max(2000, "Penjelasan tidak boleh melebihi 2000 karakter."),
});

export async function POST(request: NextRequest) {
  try {
    const actor = await resolveActor();

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "Request body harus berupa JSON yang valid.",
          },
        },
        { status: 400 }
      );
    }

    const parseResult = ExplainRequestSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "Payload penjelasan tidak valid.",
            fields: parseResult.error.flatten().fieldErrors,
          },
        },
        { status: 400 }
      );
    }

    const { conceptSlug, stepId, explanation } = parseResult.data;

    const evaluation = await evaluateExplanation(
      actor,
      conceptSlug,
      stepId,
      explanation
    );

    return NextResponse.json({
      data: evaluation,
    });
  } catch (error) {
    console.error("Error evaluating explanation:", error);
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "Gagal mengevaluasi penjelasan konsep.",
        },
      },
      { status: 500 }
    );
  }
}
