import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { resolveActor, SESSION_USER_COOKIE } from "@/server/auth/actor-resolver";
import { claimDevice } from "@/server/services/auth-service";

export const dynamic = "force-dynamic";

const ClaimDeviceSchema = z.object({
  userId: z.string().uuid().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const actor = await resolveActor();

    let targetUserId: string | undefined;
    if (actor.kind === "member") {
      targetUserId = actor.userId;
    }

    try {
      const body = await request.json();
      const parsed = ClaimDeviceSchema.safeParse(body);
      if (parsed.success && parsed.data.userId) {
        targetUserId = parsed.data.userId;
      }
    } catch {
      // Body may be empty if user is already authenticated via session cookie
    }

    if (!targetUserId) {
      return NextResponse.json(
        {
          error: {
            code: "UNAUTHENTICATED",
            message: "Pengguna harus terautentikasi atau menyertakan userId untuk mengklaim perangkat.",
          },
        },
        { status: 401 }
      );
    }

    const claimResult = await claimDevice(targetUserId, actor.learnerDeviceId);

    const response = NextResponse.json({
      data: claimResult,
    });

    response.cookies.set(SESSION_USER_COOKIE, targetUserId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
    });

    return response;
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Error claiming device:", err);
    if (err?.message?.includes("tidak ditemukan")) {
      return NextResponse.json(
        {
          error: {
            code: "NOT_FOUND",
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
          message: "Gagal mengklaim dan menyinkronkan perangkat.",
        },
      },
      { status: 500 }
    );
  }
}
