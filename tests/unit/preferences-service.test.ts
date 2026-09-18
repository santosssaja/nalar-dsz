import { describe, it, expect, beforeEach } from "vitest";
import {
  getLearnerPreferences,
  updateLearnerPreferences,
} from "@/server/services/preferences-service";
import { Actor } from "@/server/auth/actor-resolver";
import { ensureDbInitialized, getDb, learnerDevices } from "@/server/db";
import { randomUUID } from "crypto";

describe("PreferencesService (Theme & Accessibility Settings)", () => {
  const testDeviceId = randomUUID();
  const testActor: Actor = {
    kind: "guest",
    deviceId: "test-device-uuid",
    learnerDeviceId: testDeviceId,
  };

  beforeEach(async () => {
    await ensureDbInitialized();
    const db = getDb();

    await db
      .insert(learnerDevices)
      .values({
        id: testDeviceId,
        deviceKeyHash: "hash-" + testDeviceId,
        lastSeenAt: new Date(),
        createdAt: new Date(),
      })
      .onConflictDoNothing();
  });

  it("retrieves default preferences for a new device", async () => {
    const prefs = await getLearnerPreferences(testActor);

    expect(prefs).toBeDefined();
    expect(prefs.theme).toBe("light");
    expect(prefs.highContrast).toBe(false);
    expect(prefs.fontScale).toBe("normal");
    expect(prefs.reducedMotion).toBe(false);
    expect(prefs.naiVisible).toBe(true);
  });

  it("updates accessibility settings and persists them", async () => {
    const updated = await updateLearnerPreferences(testActor, {
      theme: "dark",
      highContrast: true,
      fontScale: "large",
      reducedMotion: true,
      naiVisible: false,
    });

    expect(updated.theme).toBe("dark");
    expect(updated.highContrast).toBe(true);
    expect(updated.fontScale).toBe("large");
    expect(updated.reducedMotion).toBe(true);
    expect(updated.naiVisible).toBe(false);

    // Verify subsequent read matches
    const fetched = await getLearnerPreferences(testActor);
    expect(fetched.theme).toBe("dark");
    expect(fetched.highContrast).toBe(true);
    expect(fetched.reducedMotion).toBe(true);
  });
});
