import { NextRequest, NextResponse } from "next/server";
import { getModules } from "@/content/loader";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const domainSlug = request.nextUrl.searchParams.get("domainSlug") ?? undefined;
  const modules = getModules(domainSlug);

  return NextResponse.json({
    data: modules,
  });
}
