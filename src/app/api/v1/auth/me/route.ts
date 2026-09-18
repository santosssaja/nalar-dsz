import { NextResponse } from "next/server";
import { resolveActor } from "@/server/auth/actor-resolver";
import { getUserProfile } from "@/server/services/auth-service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const actor = await resolveActor();

    let user = null;
    if (actor.kind === "member") {
      user = await getUserProfile(actor.userId);
    }

    return NextResponse.json({
      data: {
        actorKind: actor.kind,
        learnerDeviceId: actor.learnerDeviceId,
        user,
      },
    });
  } catch (error) {
    console.error("Error fetching auth status:", error);
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "Gagal mengambil status otentikasi.",
        },
      },
      { status: 500 }
    );
  }
}
