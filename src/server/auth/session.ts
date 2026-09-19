import { createHmac, timingSafeEqual } from "crypto";
import { env } from "@/lib/env";

const SEPARATOR = ".";
export const SESSION_TOKEN_TTL_MS = 365 * 24 * 60 * 60 * 1000;

export interface SessionTokenPayload {
  userId: string;
  expiresAt: number;
}

function sign(body: string): string {
  return createHmac("sha256", env.COOKIE_SECRET).update(body).digest("hex");
}

function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a, "utf8");
  const right = Buffer.from(b, "utf8");
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export function createSessionToken(
  userId: string,
  ttlMs: number = SESSION_TOKEN_TTL_MS
): string {
  const payload: SessionTokenPayload = {
    userId,
    expiresAt: Date.now() + ttlMs,
  };
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${body}${SEPARATOR}${sign(body)}`;
}

export function verifySessionToken(token: string): SessionTokenPayload | null {
  const separatorIndex = token.indexOf(SEPARATOR);
  if (separatorIndex <= 0) return null;

  const body = token.slice(0, separatorIndex);
  const signature = token.slice(separatorIndex + 1);

  if (!signature || !safeEqual(sign(body), signature)) return null;

  try {
    const decoded = JSON.parse(
      Buffer.from(body, "base64url").toString("utf8")
    ) as { userId?: unknown; expiresAt?: unknown };

    if (
      typeof decoded.userId !== "string" ||
      typeof decoded.expiresAt !== "number"
    ) {
      return null;
    }
    if (decoded.expiresAt < Date.now()) return null;

    return { userId: decoded.userId, expiresAt: decoded.expiresAt };
  } catch {
    return null;
  }
}

export function sessionCookieOptions(): {
  httpOnly: boolean;
  secure: boolean;
  sameSite: "lax";
  maxAge: number;
  path: string;
} {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: Math.floor(SESSION_TOKEN_TTL_MS / 1000),
    path: "/",
  };
}