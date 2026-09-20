export interface ParsedAiError {
  code: "RATE_LIMIT_EXCEEDED" | "AUTH_ERROR" | "SERVER_OVERLOADED" | "NETWORK_ERROR" | "INTERNAL_ERROR";
  message: string;
  isRateLimit: boolean;
  status: number;
}

/**
 * Parses and categorizes errors from AI providers (Google, Gemma, OpenAI, Anthropic).
 * Distinguishes rate limits (429 / quota exceeded), auth errors (401 / 403),
 * server overload (503), and network dropouts into user-friendly Indonesian messages.
 */
export function parseAiError(err: unknown, modelName?: string): ParsedAiError {
  const modelStr = modelName ? ` (${modelName})` : "";
  const errStr = err instanceof Error ? err.message : String(err || "");
  const lower = errStr.toLowerCase();

  // 1. Rate Limit & Quota Exhaustion (429)
  if (
    lower.includes("429") ||
    lower.includes("resource_exhausted") ||
    lower.includes("rate limit") ||
    lower.includes("quota") ||
    lower.includes("too many requests") ||
    lower.includes("exhausted")
  ) {
    return {
      code: "RATE_LIMIT_EXCEEDED",
      message: `Batas kuota atau rate limit model AI${modelStr} sedang penuh (HTTP 429). Silakan tunggu beberapa saat atau beralih ke model lain di menu atas.`,
      isRateLimit: true,
      status: 429,
    };
  }

  // 2. Authentication / API Key issues (401, 403)
  if (
    lower.includes("401") ||
    lower.includes("403") ||
    lower.includes("api_key_invalid") ||
    lower.includes("api key not valid") ||
    lower.includes("permission_denied") ||
    lower.includes("unauthenticated")
  ) {
    return {
      code: "AUTH_ERROR",
      message: `Kunci API (API Key) untuk model AI${modelStr} tidak valid atau belum diizinkan. Periksa konfigurasi kredensial server.`,
      isRateLimit: false,
      status: 403,
    };
  }

  // 3. Server Overloaded / Temporary Unavailable (503, 502)
  if (
    lower.includes("503") ||
    lower.includes("unavailable") ||
    lower.includes("overloaded") ||
    lower.includes("server error") ||
    lower.includes("bad gateway")
  ) {
    return {
      code: "SERVER_OVERLOADED",
      message: `Server penyedia model AI${modelStr} sedang mengalami lonjakan beban atau pemeliharaan sementara (HTTP 503). Silakan coba sesaat lagi.`,
      isRateLimit: false,
      status: 503,
    };
  }

  // 4. Network / Connectivity Dropouts
  if (
    lower.includes("fetch failed") ||
    lower.includes("network") ||
    lower.includes("enotfound") ||
    lower.includes("econnrefused") ||
    lower.includes("econnreset") ||
    lower.includes("timeout") ||
    lower.includes("abort")
  ) {
    return {
      code: "NETWORK_ERROR",
      message: `Gagal terhubung ke penyedia model AI${modelStr}. Periksa koneksi internet Anda atau coba beberapa saat lagi.`,
      isRateLimit: false,
      status: 502,
    };
  }

  // 5. Default Internal Error
  return {
    code: "INTERNAL_ERROR",
    message: errStr || `Terjadi kendala saat memproses penalaran dengan model AI${modelStr}.`,
    isRateLimit: false,
    status: 500,
  };
}
