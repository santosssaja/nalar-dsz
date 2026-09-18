import { NextResponse } from "next/server";
import {
  getDb,
  ensureDbInitialized,
  users,
  learnerDevices,
  attempts,
  learningEvidence,
  mistakeEvents,
  reviewQueue,
  contentVersions,
} from "@/server/db";
import { getConcepts } from "@/content/loader";
import { count, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await ensureDbInitialized();
    const db = getDb();

    const [
      usersCount,
      devicesCount,
      attemptsCount,
      evidenceCount,
      mistakesCount,
      pendingReviewsCount,
      versionsCount,
    ] = await Promise.all([
      db.select({ count: count() }).from(users),
      db.select({ count: count() }).from(learnerDevices),
      db.select({ count: count() }).from(attempts),
      db.select({ count: count() }).from(learningEvidence),
      db.select({ count: count() }).from(mistakeEvents),
      db
        .select({ count: count() })
        .from(reviewQueue)
        .where(eq(reviewQueue.state, "pending")),
      db.select({ count: count() }).from(contentVersions),
    ]);

    const allConcepts = getConcepts();

    return NextResponse.json({
      data: {
        status: "healthy",
        uptime: process.uptime(),
        serverTime: new Date().toISOString(),
        database: {
          status: "connected",
          engine: process.env.DATABASE_URL ? "postgresql" : "pglite-in-memory",
        },
        metrics: {
          registeredMembers: usersCount[0]?.count ?? 0,
          activeDevices: devicesCount[0]?.count ?? 0,
          totalAttempts: attemptsCount[0]?.count ?? 0,
          totalLearningEvidence: evidenceCount[0]?.count ?? 0,
          totalMistakesLogged: mistakesCount[0]?.count ?? 0,
          pendingSpacedReviews: pendingReviewsCount[0]?.count ?? 0,
          publishedConceptsCount: allConcepts.length,
          immutableContentVersions: versionsCount[0]?.count ?? 0,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching observability stats:", error);
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "Gagal memuat statistik observabilitas sistem.",
        },
      },
      { status: 500 }
    );
  }
}
