import { NextRequest, NextResponse } from "next/server";
import { getModuleBySlug, getConcepts } from "@/content/loader";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const mod = getModuleBySlug(slug);

  if (!mod) {
    return NextResponse.json(
      {
        error: {
          code: "NOT_FOUND",
          message: `Modul dengan slug '${slug}' tidak ditemukan.`,
        },
      },
      { status: 404 }
    );
  }

  const moduleConcepts = getConcepts(slug).map((c) => ({
    id: c.id,
    slug: c.slug,
    title: c.title,
    summary: c.summary,
    difficulty: c.difficulty,
    prerequisites: c.prerequisites,
    stepsCount: c.steps.length,
  }));

  return NextResponse.json({
    data: {
      ...mod,
      concepts: moduleConcepts,
    },
  });
}
