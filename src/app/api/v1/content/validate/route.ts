import { NextRequest, NextResponse } from "next/server";
import { validateConceptContent } from "@/server/services/content-publish-pipeline";
import { getConcepts } from "@/content/loader";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.json();
    const existing = getConcepts().map((c) => ({
      slug: c.slug,
      prerequisites: c.prerequisites,
    }));

    const report = validateConceptContent(rawBody, existing);

    return NextResponse.json({
      data: report,
    });
  } catch (error) {
    console.error("Error validating content:", error);
    return NextResponse.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: error instanceof Error ? error.message : "Gagal memvalidasi konten.",
        },
      },
      { status: 400 }
    );
  }
}
