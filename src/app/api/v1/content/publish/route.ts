import { NextRequest, NextResponse } from "next/server";
import { publishConceptContent } from "@/server/services/content-publish-pipeline";
import { ConceptContentSchema } from "@/content/schema";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
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
    console.error("Error publishing content:", error);
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: error instanceof Error ? error.message : "Gagal mempublikasikan konten versi baru.",
        },
      },
      { status: 500 }
    );
  }
}
