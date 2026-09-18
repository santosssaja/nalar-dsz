import { NextRequest, NextResponse } from "next/server";
import { getContentVersionHistory } from "@/server/services/content-publish-pipeline";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const ownerId = searchParams.get("ownerId");

    if (!ownerId) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "Parameter 'ownerId' (UUID konsep atau modul) wajib disertakan.",
          },
        },
        { status: 400 }
      );
    }

    const versions = await getContentVersionHistory(ownerId);

    return NextResponse.json({
      data: {
        ownerId,
        versions,
      },
    });
  } catch (error) {
    console.error("Error fetching content version history:", error);
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "Gagal mengambil riwayat versi konten.",
        },
      },
      { status: 500 }
    );
  }
}
