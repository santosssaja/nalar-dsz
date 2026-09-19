import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { resolveActor } from "@/server/auth/actor-resolver";
import { requestEmailVerification } from "@/server/services/auth-service";
import { NalarError } from "@/lib/errors";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

const RequestVerificationSchema = z.object({
  email: z.string().email("Format email tidak valid"),
  mode: z.enum(["login", "register"]).default("login"),
  displayName: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = RequestVerificationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: parsed.error.issues[0]?.message ?? "Input tidak valid.",
          },
        },
        { status: 400 }
      );
    }

    const actor = await resolveActor();
    const origin = request.nextUrl.origin;

    const result = await requestEmailVerification(
      parsed.data.email,
      parsed.data.mode,
      parsed.data.displayName,
      actor.learnerDeviceId,
      origin
    );

    return NextResponse.json({
      data: result,
    });
  } catch (error) {
    if (error instanceof NalarError && error.expose) {
      return NextResponse.json(
        {
          error: {
            code: error.code,
            message: error.message,
          },
        },
        { status: error.status }
      );
    }

    logger.error("Error requesting email verification:", error);
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "Terjadi kesalahan internal.",
        },
      },
      { status: 500 }
    );
  }
}
