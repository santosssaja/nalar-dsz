import { NextRequest, NextResponse } from "next/server";
import { resolveActor, SESSION_USER_COOKIE } from "@/server/auth/actor-resolver";
import { verifyEmailToken } from "@/server/services/auth-service";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.json(
      {
        error: {
          code: "MISSING_TOKEN",
          message: "Token verifikasi tidak ditemukan.",
        },
      },
      { status: 400 }
    );
  }

  try {
    const actor = await resolveActor();
    const result = await verifyEmailToken(token, actor.learnerDeviceId);

    // If request accepts HTML (direct click from Gmail into browser), redirect to /auth/verify with success
    const acceptHeader = request.headers.get("accept") || "";
    const isBrowserNavigation = acceptHeader.includes("text/html");

    if (isBrowserNavigation) {
      const redirectUrl = new URL("/auth/verify", request.nextUrl.origin);
      redirectUrl.searchParams.set("status", "success");
      redirectUrl.searchParams.set("email", result.user.email);
      if (result.user.displayName) {
        redirectUrl.searchParams.set("name", result.user.displayName);
      }

      const response = NextResponse.redirect(redirectUrl);
      response.cookies.set(SESSION_USER_COOKIE, result.sessionUserId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 365,
        path: "/",
      });

      return response;
    }

    // Otherwise return JSON API response
    const response = NextResponse.json({
      data: {
        user: result.user,
        claimResult: result.claimResult,
      },
    });

    response.cookies.set(SESSION_USER_COOKIE, result.sessionUserId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
    });

    return response;
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Error verifying email token:", err);

    const acceptHeader = request.headers.get("accept") || "";
    if (acceptHeader.includes("text/html")) {
      const redirectUrl = new URL("/auth/verify", request.nextUrl.origin);
      redirectUrl.searchParams.set("status", "error");
      redirectUrl.searchParams.set("message", err.message || "Tautan verifikasi tidak valid.");
      return NextResponse.redirect(redirectUrl);
    }

    return NextResponse.json(
      {
        error: {
          code: "VERIFICATION_FAILED",
          message: err.message || "Gagal memverifikasi token email.",
        },
      },
      { status: 400 }
    );
  }
}
