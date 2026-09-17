import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { randomUUID } from "crypto";
import { getDb, ensureDbInitialized } from "@/server/db";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

export async function GET() {
  const requestId = randomUUID();

  try {
    await ensureDbInitialized();
    const db = getDb();
    // Verify database connectivity
    await db.execute(sql`SELECT 1 as healthy`);

    return NextResponse.json({
      data: {
        status: "ok",
        database: "connected",
        timestamp: new Date().toISOString(),
        requestId,
      },
    });
  } catch (error) {
    logger.error("Health check failed", error, { requestId });

    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "Layanan database belum siap.",
          requestId,
        },
      },
      { status: 503 }
    );
  }
}
