import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { resolveActor, SESSION_USER_COOKIE } from "@/server/auth/actor-resolver";
import { loginOrRegisterMember } from "@/server/services/auth-service";

export const dynamic = "force-dynamic";

const LoginSchema = z.object({
  email: z.string().email("Format email tidak valid."),
  displayName: z.string().min(1).max(50).optional(),
});

export async function POST(request: NextRequest) {
  try {
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

    const parseResult = LoginSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "Data login tidak valid.",
            fields: parseResult.error.flatten().fieldErrors,
          },
        },
        { status: 400 }
      );
    }

    const { email, displayName } = parseResult.data;
    const actor = await resolveActor();

    const { user, claimResult } = await loginOrRegisterMember(
      email,
      displayName,
      actor.learnerDeviceId
    );

    const response = NextResponse.json({
      data: {
        user,
        claimResult,
      },
    });

    // Set session cookie
    response.cookies.set(SESSION_USER_COOKIE, user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365, // 1 year
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Error logging in:", error);
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "Gagal memproses login atau pendaftaran.",
        },
      },
      { status: 500 }
    );
  }
}
