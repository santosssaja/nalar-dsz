import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { resolveActor } from "@/server/auth/actor-resolver";
import { submitAttempt } from "@/server/services/learning-service";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

const submitAttemptSchema = z.object({
  stepId: z.string().uuid("stepId harus berupa UUID"),
  contentVersion: z.number().default(1),
  response: z.record(z.unknown()),
  usedHintsCount: z.number().default(0),
});

export async function POST(request: NextRequest) {
  const idempotencyKey =
    request.headers.get("Idempotency-Key") ||
    request.headers.get("idempotency-key");

  if (!idempotencyKey) {
    return NextResponse.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: "Header 'Idempotency-Key' wajib disertakan.",
        },
      },
      { status: 400 }
    );
  }

  const uuidValidation = z.string().uuid().safeParse(idempotencyKey);
  if (!uuidValidation.success) {
    return NextResponse.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: "Header 'Idempotency-Key' harus berupa string UUID yang valid.",
        },
      },
      { status: 400 }
    );
  }

  try {
    const rawBody = await request.json();
    const parsed = submitAttemptSchema.safeParse(rawBody);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "Payload submission tidak valid.",
            fields: parsed.error.flatten().fieldErrors,
          },
        },
        { status: 400 }
      );
    }

    const actor = await resolveActor();
    const result = await submitAttempt({
      actor,
      stepId: parsed.data.stepId,
      contentVersion: parsed.data.contentVersion,
      idempotencyKey,
      response: parsed.data.response,
      usedHintsCount: parsed.data.usedHintsCount,
    });

    return NextResponse.json({
      data: result,
    });
  } catch (error) {
    logger.error("Error submitting attempt", error);
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: error instanceof Error ? error.message : "Terjadi kesalahan internal.",
        },
      },
      { status: 500 }
    );
  }
}
