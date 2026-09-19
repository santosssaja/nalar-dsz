import React from "react";
import type { Metadata } from "next";
import { eq } from "drizzle-orm";
import { getDb, ensureDbInitialized, users } from "@/server/db";
import { resolveActor } from "@/server/auth/actor-resolver";
import { getModules, getConcepts } from "@/content/loader";
import {
  getAllLearnerProgress,
  getMistakeSummaryForLearner,
} from "@/server/services/learning-service";
import { getDueReviews } from "@/server/services/retrieval-service";
import { getGlobalLearnerRecommendation } from "@/server/services/recommendation-engine";

// Components
import { DashboardHeader } from "@/features/dashboard/components/dashboard-header";
import { MetricsOverview } from "@/features/dashboard/components/metrics-overview";
import { MasteryDimensionsPanel } from "@/features/dashboard/components/mastery-dimensions-panel";
import {
  ModuleProgressCards,
  ModuleProgressSummary,
} from "@/features/dashboard/components/module-progress-cards";
import { RemedialSection } from "@/features/dashboard/components/remedial-section";
import { QuickLabsCard } from "@/features/dashboard/components/quick-labs-card";
import { RecommendationCard } from "@/features/learning/components/recommendation-card";
import { SpacedReviewBanner } from "@/features/learning/components/spaced-review-banner";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dashboard Pemahaman Belajar | Nalar",
  description:
    "Pusat kendali dan kemajuan intuisi belajar STEM Nalar. Pantau penguasaan 47 konsep, 6 dimensi pemahaman, spaced retrieval, dan pembenahan miskonsepsi.",
};

export default async function DashboardPage() {
  await ensureDbInitialized();
  const db = getDb();
  const actor = await resolveActor();

  // 1. Fetch user display info if member
  let userEmail: string | null = null;
  let userDisplayName: string | null = null;
  if (actor.kind === "member") {
    const [u] = await db
      .select({ email: users.email, displayName: users.displayName })
      .from(users)
      .where(eq(users.id, actor.userId))
      .limit(1);
    if (u) {
      userEmail = u.email;
      userDisplayName = u.displayName;
    }
  }

  // 2. Fetch learning data in parallel
  const [allProgress, recommendation, dueReviews, mistakes] = await Promise.all([
    getAllLearnerProgress(actor),
    getGlobalLearnerRecommendation(actor),
    getDueReviews(actor),
    getMistakeSummaryForLearner(actor),
  ]);

  // 3. Metadata from content registry
  const allModules = getModules();
  const allConcepts = getConcepts();
  const totalConcepts = allConcepts.length;

  // 4. Map progress by concept slug
  const progressMap = new Map(allProgress.map((p) => [p.conceptSlug, p]));

  // 5. Aggregate metrics
  const masteredCount = allProgress.filter((p) => p.status === "mastered").length;
  const inProgressCount = allProgress.filter(
    (p) => p.status === "learning" || p.status === "practiced"
  ).length;

  // 6. Compute 6-dimensions average
  let sumU = 0;
  let sumP = 0;
  let sumA = 0;
  let sumT = 0;
  let sumE = 0;
  let sumR = 0;
  const attemptedCount = allProgress.length;

  if (attemptedCount > 0) {
    for (const p of allProgress) {
      sumU += p.dimensions.understanding;
      sumP += p.dimensions.practice;
      sumA += p.dimensions.application;
      sumT += p.dimensions.transfer;
      sumE += p.dimensions.explanation;
      sumR += p.dimensions.retention;
    }
  }

  const dimensionsScore = {
    understanding: attemptedCount > 0 ? sumU / attemptedCount : 0,
    practice: attemptedCount > 0 ? sumP / attemptedCount : 0,
    application: attemptedCount > 0 ? sumA / attemptedCount : 0,
    transfer: attemptedCount > 0 ? sumT / attemptedCount : 0,
    explanation: attemptedCount > 0 ? sumE / attemptedCount : 0,
    retention: attemptedCount > 0 ? sumR / attemptedCount : 0,
  };

  const overallMasteryPercentage =
    attemptedCount > 0
      ? (dimensionsScore.understanding +
          dimensionsScore.practice +
          dimensionsScore.application +
          dimensionsScore.transfer +
          dimensionsScore.explanation +
          dimensionsScore.retention) /
        6
      : 0;

  // 7. Compute per-module progress
  const moduleSummaries: ModuleProgressSummary[] = allModules.map((mod) => {
    let completedInMod = 0;
    let masteredInMod = 0;

    for (const slug of mod.conceptSlugs) {
      const p = progressMap.get(slug);
      if (p && (p.status === "practiced" || p.status === "mastered")) {
        completedInMod += 1;
      }
      if (p && p.status === "mastered") {
        masteredInMod += 1;
      }
    }

    return {
      id: mod.id,
      slug: mod.slug,
      title: mod.title,
      summary: mod.summary,
      domainSlug: mod.domainSlug,
      estimatedMinutes: mod.estimatedMinutes,
      totalConcepts: mod.conceptSlugs.length,
      completedConcepts: completedInMod,
      masteredConcepts: masteredInMod,
    };
  });

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-4">
      {/* 1. Dashboard Greeting & Actor Status */}
      <DashboardHeader
        actorKind={actor.kind}
        userDisplayName={userDisplayName}
        userEmail={userEmail}
      />

      {/* 2. Top-level 4 Metric Cards */}
      <MetricsOverview
        totalConcepts={totalConcepts}
        masteredCount={masteredCount}
        inProgressCount={inProgressCount}
        dueReviewsCount={dueReviews.length}
        overallMasteryPercentage={overallMasteryPercentage}
      />

      {/* 3. Spaced Retrieval Due Banner (if any due) */}
      {dueReviews.length > 0 && <SpacedReviewBanner dueReviews={dueReviews} />}

      {/* 4. Adaptive Recommendation Card */}
      <RecommendationCard recommendation={recommendation} />

      {/* 5. Module Progress Cards */}
      <ModuleProgressCards modules={moduleSummaries} />

      {/* 6. 6-Dimensions Reasoning Profile */}
      <MasteryDimensionsPanel dimensions={dimensionsScore} />

      {/* 7. Remedial Misconceptions Section */}
      <RemedialSection mistakes={mistakes} />

      {/* 8. Quick Navigation to Labs & Concept Graph */}
      <QuickLabsCard />
    </div>
  );
}
