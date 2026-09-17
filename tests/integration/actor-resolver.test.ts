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
});
