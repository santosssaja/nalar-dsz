import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getStepHint } from "@/server/services/learning-service";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

const hintRequestSchema = z.object({
  stepId: z.string().uuid("stepId harus berupa UUID"),
  level: z.enum(["orientation", "concept", "strategy", "solution"]),
});

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.json();
    const parsed = hintRequestSchema.safeParse(rawBody);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "Permintaan hint tidak valid.",
            fields: parsed.error.flatten().fieldErrors,
          },
        },
        { status: 400 }
      );
    }

    const hint = getStepHint(parsed.data.stepId, parsed.data.level);

    if (!hint) {
      return NextResponse.json(
        {
          error: {
            code: "NOT_FOUND",
            message: `Hint layer '${parsed.data.level}' tidak tersedia untuk step ini.`,
          },
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      data: hint,
    });
  } catch (error) {
    logger.error("Error processing hint request:", error);
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "Terjadi kesalahan internal.",
        },
      },
      { status: 500 }
    );
  }
}
