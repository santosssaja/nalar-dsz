import { describe, it, expect, vi } from "vitest";
import { hashDeviceKey, resolveActor } from "@/server/auth/actor-resolver";

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

  it("should safely handle stale or non-existent session user cookie without foreign key crash", async () => {
    const { cookies } = await import("next/headers");
    const nonExistentUserId = "4d4a9794-891a-44fe-9355-e6c579fb8384";
    vi.mocked(cookies).mockResolvedValueOnce({
      get: vi.fn().mockImplementation((name: string) => {
        if (name === "nalar_session_user_id") return { value: nonExistentUserId };
        return undefined;
      }),
      set: vi.fn(),
    } as any);

    // Should resolve safely as a guest without throwing Postgres 23503 foreign key violation
    const actor = await resolveActor();
    expect(actor).toBeDefined();
    expect(actor.kind).toBe("guest");
    expect(actor.learnerDeviceId).toBeDefined();
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
