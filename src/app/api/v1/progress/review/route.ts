import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { resolveActor } from "@/server/auth/actor-resolver";
import { completeReview } from "@/server/services/retrieval-service";

export const dynamic = "force-dynamic";

const ReviewSubmissionSchema = z.object({
  conceptId: z.string().uuid(),
  performance: z.enum(["again", "good", "easy"]),
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

    const parseResult = ReviewSubmissionSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "Payload review tidak valid.",
            fields: parseResult.error.flatten().fieldErrors,
          },
        },
        { status: 400 }
      );
    }

    const { conceptId, performance } = parseResult.data;
    const result = await completeReview(actor, conceptId, performance);

    return NextResponse.json({
      data: result,
    });
  } catch (error) {
    console.error("Error submitting review:", error);
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "Gagal menyimpan hasil review pengulangan.",
        },
      },
      { status: 500 }
    );
  }
}
