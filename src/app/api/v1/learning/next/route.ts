import { NextRequest, NextResponse } from "next/server";
import { resolveActor } from "@/server/auth/actor-resolver";
import { getNextRecommendation } from "@/server/services/recommendation-engine";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const actor = await resolveActor();
    const searchParams = request.nextUrl.searchParams;
    const moduleSlug = searchParams.get("moduleSlug") ?? "turunan";

    const recommendation = await getNextRecommendation(actor, moduleSlug);

    return NextResponse.json({
      data: recommendation,
    });
  } catch (error) {
    console.error("Error generating recommendation:", error);
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "Gagal memproses rekomendasi pembelajaran.",
        },
      },
      { status: 500 }
    );
  }
}
