import { NextResponse } from "next/server";
import { resolveActor } from "@/server/auth/actor-resolver";
import {
  getAllLearnerProgress,
  getMistakeSummaryForLearner,
} from "@/server/services/learning-service";
import { getDueReviews } from "@/server/services/retrieval-service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const actor = await resolveActor();

    const [progress, reviewsDue, mistakes] = await Promise.all([
      getAllLearnerProgress(actor),
      getDueReviews(actor),
      getMistakeSummaryForLearner(actor),
    ]);

    return NextResponse.json({
      data: {
        progress,
        reviewsDue,
        mistakes,
      },
    });
  } catch (error) {
    console.error("Error fetching progress summary:", error);
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "Gagal mengambil ringkasan progres pembelajaran.",
        },
      },
      { status: 500 }
    );
  }
}
