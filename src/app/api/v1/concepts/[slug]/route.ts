import { NextRequest, NextResponse } from "next/server";
import { getConceptBySlug } from "@/content/loader";
import { resolveActor } from "@/server/auth/actor-resolver";
import { getLearnerConceptProgress } from "@/server/services/learning-service";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const concept = getConceptBySlug(slug);

  if (!concept) {
    return NextResponse.json(
      {
        error: {
          code: "NOT_FOUND",
          message: `Konsep dengan slug '${slug}' tidak ditemukan.`,
        },
      },
      { status: 404 }
    );
  }

  const actor = await resolveActor();
  const progress = await getLearnerConceptProgress(actor, concept.id);

  return NextResponse.json({
    data: {
      concept,
      progress,
    },
  });
}
