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

    const dueConceptIds = new Set(reviewsDue.map((review) => review.conceptId));
    const progressWithReviewStatus = progress.map((item) => {
      const hasDueReview =
        dueConceptIds.has(item.conceptId) &&
        (item.status === "practiced" || item.status === "mastered");
      return hasDueReview ? { ...item, status: "review_due" as const } : item;
    });

    return NextResponse.json({
      data: {
        progress: progressWithReviewStatus,
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
