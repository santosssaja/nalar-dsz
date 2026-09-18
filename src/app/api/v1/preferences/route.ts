import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { resolveActor } from "@/server/auth/actor-resolver";
import {
  getLearnerPreferences,
  updateLearnerPreferences,
} from "@/server/services/preferences-service";

export const dynamic = "force-dynamic";

const UpdatePreferencesSchema = z.object({
  theme: z.enum(["light", "dark", "contrast"]).optional(),
  fontScale: z.enum(["small", "normal", "large"]).optional(),
  reducedMotion: z.boolean().optional(),
  naiVisible: z.boolean().optional(),
});

export async function GET() {
  try {
    const actor = await resolveActor();
    const preferences = await getLearnerPreferences(actor);

    return NextResponse.json({
      data: preferences,
    });
  } catch (error) {
    console.error("Error fetching preferences:", error);
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "Gagal mengambil preferensi pengguna.",
        },
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
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

    const parseResult = UpdatePreferencesSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "Format preferensi tidak valid.",
            fields: parseResult.error.flatten().fieldErrors,
          },
        },
        { status: 400 }
      );
    }

    const updated = await updateLearnerPreferences(actor, parseResult.data);

    return NextResponse.json({
      data: updated,
    });
  } catch (error) {
    console.error("Error updating preferences:", error);
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "Gagal memperbarui preferensi pengguna.",
        },
      },
      { status: 500 }
    );
  }
}
