import { NextResponse } from "next/server";
import { getDomains } from "@/content/loader";

export const dynamic = "force-dynamic";

export async function GET() {
  const domains = getDomains();
  return NextResponse.json({
    data: domains,
  });
}
