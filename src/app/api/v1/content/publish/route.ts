import { NextRequest, NextResponse } from "next/server";
import { publishConceptContent } from "@/server/services/content-publish-pipeline";
import { publishIsAuthorized } from "@/server/services/content-publish-gate";
import { ConceptContentSchema } from "@/content/schema";
import { logger } from "@/lib/logger";
import { env } from "@/lib/env";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    if (
      !publishIsAuthorized(
        {
          secret: env.CONTENT_PUBLISH_SECRET,
          isProduction: env.NODE_ENV === "production",
        },
        request.headers.get("authorization")
      )
    ) {
      return NextResponse.json(
        {
          error: {
            code: "FORBIDDEN",
            message: "Anda tidak memiliki izin untuk mempublikasikan konten.",
          },
        },
        { status: 403 }
      );
    }

    const rawBody = await request.json();
    const parsed = ConceptContentSchema.safeParse(rawBody);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "Struktur data konsep tidak memenuhi skema yang valid.",
            fields: parsed.error.flatten().fieldErrors,
          },
        },
        { status: 400 }
      );
    }

    const result = await publishConceptContent(parsed.data);

    return NextResponse.json({
      data: result,
    });
  } catch (error) {
    logger.error("Error publishing content:", error);
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