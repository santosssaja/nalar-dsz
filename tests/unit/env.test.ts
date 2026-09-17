import { describe, it, expect } from "vitest";
import { env } from "@/lib/env";

describe("Environment Validation", () => {
  it("should have valid environment loaded", () => {
    expect(env).toBeDefined();
    expect(env.NODE_ENV).toBeDefined();
    expect(typeof env.COOKIE_SECRET).toBe("string");
    expect(env.COOKIE_SECRET.length).toBeGreaterThanOrEqual(16);
  });
});
