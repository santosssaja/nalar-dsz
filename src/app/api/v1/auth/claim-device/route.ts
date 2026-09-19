import { NextRequest, NextResponse } from "next/server";
import { resolveActor, SESSION_USER_COOKIE } from "@/server/auth/actor-resolver";
import { createSessionToken, sessionCookieOptions } from "@/server/auth/session";
import { claimDevice } from "@/server/services/auth-service";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const actor = await resolveActor();

    if (actor.kind !== "member") {
      return NextResponse.json(
        {
          error: {
            code: "UNAUTHENTICATED",
            message: "Pengguna harus terautentikasi untuk mengklaim perangkat.",
          },
        },
        { status: 401 }
      );
    }

    const claimResult = await claimDevice(actor.userId, actor.learnerDeviceId);

    const response = NextResponse.json({
      data: claimResult,
    });

    response.cookies.set(
      SESSION_USER_COOKIE,
      createSessionToken(actor.userId),
      sessionCookieOptions()
    );

    return response;
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Error claiming device:", err);
    if (err?.message?.includes("tidak ditemukan")) {
      return NextResponse.json(
        {
          error: {
            code: "NOT_FOUND",
            message: "Perangkat tidak ditemukan.",
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