import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { resolveActor } from "@/server/auth/actor-resolver";
import { requestEmailVerification } from "@/server/services/auth-service";

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
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Error requesting email verification:", err);

    if (err.message.includes("belum terdaftar")) {
      return NextResponse.json(
        {
          error: {
            code: "USER_NOT_FOUND",
            message: err.message,
          },
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: err.message || "Gagal mengirimkan email verifikasi.",
        },
      },
      { status: 500 }
    );
  }
}
