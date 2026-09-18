import { NextResponse } from "next/server";
import { AI_PROVIDERS_CATALOG } from "@/server/ai/factory";

export async function GET() {
  return NextResponse.json({
    data: {
      defaultProvider: "gemma",
      providers: AI_PROVIDERS_CATALOG,
    },
  });
}
