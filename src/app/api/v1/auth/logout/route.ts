import { NextResponse } from "next/server";
import { SESSION_USER_COOKIE } from "@/server/auth/actor-resolver";

export const dynamic = "force-dynamic";

export async function POST() {
  const response = NextResponse.json({
    data: {
      message: "Berhasil keluar dari sesi akun. Kembali ke mode tamu.",
    },
  });

  response.cookies.delete(SESSION_USER_COOKIE);

  return response;
}
