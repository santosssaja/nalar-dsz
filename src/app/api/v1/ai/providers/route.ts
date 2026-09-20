import { NextResponse } from "next/server";
import { getAiProvidersCatalog, resolveProviderName } from "@/server/ai/factory";

export async function GET() {
  const defaultProvider = resolveProviderName(
    process.env.AI_DEFAULT_PROVIDER || process.env.AI_PROVIDER
  );
  const providers = getAiProvidersCatalog();

  return NextResponse.json({
    data: {
      defaultProvider,
      providers,
    },
  });
}
