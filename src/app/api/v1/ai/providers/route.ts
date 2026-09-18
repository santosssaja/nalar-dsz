import { NextResponse } from "next/server";
import { AI_PROVIDERS_CATALOG, resolveProviderName } from "@/server/ai/factory";

export async function GET() {
  const defaultProvider = resolveProviderName(
    process.env.AI_DEFAULT_PROVIDER || process.env.AI_PROVIDER
  );

  return NextResponse.json({
    data: {
      defaultProvider,
      providers: AI_PROVIDERS_CATALOG,
    },
  });
}
