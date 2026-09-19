import { describe, it, expect, vi } from "vitest";
import { randomUUID } from "crypto";
import { hashDeviceKey, resolveActor } from "@/server/auth/actor-resolver";
import { createSessionToken } from "@/server/auth/session";
import { ensureDbInitialized, getDb, users } from "@/server/db";

type CookieStoreLike = Awaited<ReturnType<typeof import("next/headers")["cookies"]>>;

function cookieStore(
  get: (name: string) => { value: string } | undefined
): CookieStoreLike {
  return {
    get,
    set: () => {},
  } as unknown as CookieStoreLike;
}

vi.mock("next/headers", () => ({
  cookies: vi.fn().mockResolvedValue({
    get: vi.fn().mockReturnValue(undefined),
    set: vi.fn(),
  }),
  headers: vi.fn().mockResolvedValue({
    get: vi.fn().mockReturnValue(null),
  }),
}));

describe("Actor & Device Resolver", () => {
  it("should generate deterministic sha256 hash for device key", () => {
    const rawKey = "sample-device-key-12345";
    const hash1 = hashDeviceKey(rawKey);
    const hash2 = hashDeviceKey(rawKey);

    expect(hash1).toBe(hash2);
    expect(hash1).toHaveLength(64);
    expect(hash1).not.toBe(rawKey);
  });

  it("should resolve anonymous guest actor and auto-initialize learner device in database", async () => {
    const actor = await resolveActor();
    expect(actor).toBeDefined();
    expect(actor.kind).toBe("guest");
    expect(actor.learnerDeviceId).toBeDefined();
    expect(actor.deviceId).toBeDefined();
  });

  it("should safely handle a signed session token for a non-existent user without foreign key crash", async () => {
    const { cookies } = await import("next/headers");
    const nonExistentUserId = "4d4a9794-891a-44fe-9355-e6c579fb8384";
    const forgedButSignedToken = createSessionToken(nonExistentUserId);
    vi.mocked(cookies).mockResolvedValueOnce(
      cookieStore((name: string) =>
        name === "nalar_session_user_id"
          ? { value: forgedButSignedToken }
          : undefined
      )
    );

    // Should resolve safely as a guest without throwing Postgres 23503 foreign key violation
    const actor = await resolveActor();
    expect(actor).toBeDefined();
    expect(actor.kind).toBe("guest");
    expect(actor.learnerDeviceId).toBeDefined();
  });

  it("should treat a tampered or invalid session token as a guest", async () => {
    const { cookies } = await import("next/headers");
    vi.mocked(cookies).mockResolvedValueOnce(
      cookieStore((name: string) =>
        name === "nalar_session_user_id"
          ? { value: "originally-valid-token.but.tampered-signature-000000000000000" }
          : undefined
      )
    );

    const actor = await resolveActor();
    expect(actor).toBeDefined();
    expect(actor.kind).toBe("guest");
    expect(actor.learnerDeviceId).toBeDefined();
  });

  it("should resolve a member actor from a valid signed session token", async () => {
    await ensureDbInitialized();
    const db = getDb();
    const userId = randomUUID();
    await db.insert(users).values({
      id: userId,
      email: `member-${randomUUID()}@example.com`,
      createdAt: new Date(),
    });

    const token = createSessionToken(userId);
    const { cookies } = await import("next/headers");
    vi.mocked(cookies).mockResolvedValueOnce(
      cookieStore((name: string) =>
        name === "nalar_session_user_id" ? { value: token } : undefined
      )
    );

    const actor = await resolveActor();
    expect(actor.kind).toBe("member");
    if (actor.kind === "member") {
      expect(actor.userId).toBe(userId);
    }
  });

  it("should safely handle concurrent resolveActor calls with identical device key without duplicate key collision", async () => {
    const { cookies } = await import("next/headers");
    const sharedDeviceKey = "concurrent-device-key-test-999";
    vi.mocked(cookies).mockResolvedValue({
      get: vi.fn().mockImplementation((name: string) => {
        if (name === "nalar_device_key") return { value: sharedDeviceKey };
        return undefined;
      }),
      set: vi.fn(),
    } as any);

    // Run 5 parallel resolveActor calls simultaneously
    const results = await Promise.all([
      resolveActor(),
      resolveActor(),
      resolveActor(),
      resolveActor(),
      resolveActor(),
    ]);

    expect(results).toHaveLength(5);
    const firstDeviceId = results[0].learnerDeviceId;
    for (const res of results) {
      expect(res.learnerDeviceId).toBe(firstDeviceId);
    }
  });
});
