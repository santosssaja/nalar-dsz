import { createHash, timingSafeEqual } from "crypto";

export interface PublishGateOptions {
  secret?: string;
  isProduction: boolean;
}

/**
 * Content publishing mutates shared published state, so it must be gated:
 * - When a secret is configured, a matching `Authorization: Bearer <secret>`
 *   header is required in every environment.
 * - Without a secret, publishing stays open only outside production
 *   (dev/test authoring workflow) and is disabled in production.
 */
export function publishIsAuthorized(
  options: PublishGateOptions,
  authorizationHeader: string | null
): boolean {
  if (options.secret) {
    if (!authorizationHeader) return false;
    const provided = authorizationHeader.startsWith("Bearer ")
      ? authorizationHeader.slice("Bearer ".length)
      : authorizationHeader;
    const providedDigest = createHash("sha256").update(provided).digest();
    const secretDigest = createHash("sha256").update(options.secret).digest();
    return timingSafeEqual(providedDigest, secretDigest);
  }
  return !options.isProduction;
}