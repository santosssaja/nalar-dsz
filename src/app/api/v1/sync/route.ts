import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { resolveActor } from "@/server/auth/actor-resolver";
import {
  submitAttempt,
  getAllLearnerProgress,
} from "@/server/services/learning-service";
import { NalarError } from "@/lib/errors";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

const SyncEventSchema = z.object({
  eventId: z.string().uuid(),
  type: z.enum(["attempt.submit"]),
  occurredAt: z.string(),
  payload: z.object({
    stepId: z.string().uuid(),
    contentVersion: z.number().optional(),
    response: z.record(z.unknown()),
    usedHintsCount: z.number().optional(),
  }),
});

const SyncRequestSchema = z.object({
  events: z.array(SyncEventSchema).max(50),
});

export async function POST(request: NextRequest) {
  try {
    const actor = await resolveActor();

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "Request body harus berupa JSON yang valid.",
          },
        },
        { status: 400 }
      );
    }

    const parseResult = SyncRequestSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "Format payload sync tidak valid.",
            fields: parseResult.error.flatten().fieldErrors,
          },
        },
        { status: 400 }
      );
    }

    const { events } = parseResult.data;
    const accepted: string[] = [];
    const rejected: Array<{ eventId: string; reason: string }> = [];

    // Process each outbox event idempotently using eventId as idempotencyKey
    for (const event of events) {
      try {
        if (event.type === "attempt.submit") {
          await submitAttempt({
            actor,
            stepId: event.payload.stepId,
            idempotencyKey: event.eventId,
            response: event.payload.response,
            usedHintsCount: event.payload.usedHintsCount,
          });
          accepted.push(event.eventId);
        } else {
          rejected.push({
            eventId: event.eventId,
            reason: `Tipe event '${event.type}' tidak didukung.`,
          });
        }
      } catch (err: unknown) {
        if (err instanceof NalarError && err.expose) {
          rejected.push({
            eventId: event.eventId,
            reason: err.message,
          });
        } else {
          logger.error("Failed to process sync event", err);
          rejected.push({
            eventId: event.eventId,
            reason: "Gagal memproses event.",
          });
        }
      }
    }

    // Retrieve latest progress after sync
    const latestProgress = await getAllLearnerProgress(actor);

    return NextResponse.json({
      data: {
        accepted,
        rejected,
        serverTime: new Date().toISOString(),
        progress: latestProgress,
      },
    });
  } catch (error) {
    console.error("Error during sync:", error);
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "Gagal memproses sinkronisasi event.",
        },
      },
      { status: 500 }
    );
  }
}
