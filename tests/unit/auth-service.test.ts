import { eq, and } from "drizzle-orm";
import { describe, it, expect, beforeEach } from "vitest";
import {
  loginOrRegisterMember,
  claimDevice,
  getUserProfile,
} from "@/server/services/auth-service";
import {
  ensureDbInitialized,
  getDb,
  learnerDevices,
  conceptProgress,
} from "@/server/db";
import { randomUUID } from "crypto";

describe("AuthService (Guest to Member & Device Claiming)", () => {
  beforeEach(async () => {
    await ensureDbInitialized();
  });

  it("registers a new user and returns profile", async () => {
    const email = `test-${randomUUID()}@example.com`;
    const { user } = await loginOrRegisterMember(email, "Budi Santoso");

    expect(user).toBeDefined();
    expect(user.id).toBeDefined();
    expect(user.email).toBe(email);
    expect(user.displayName).toBe("Budi Santoso");

    const profile = await getUserProfile(user.id);
    expect(profile).toBeDefined();
    expect(profile?.email).toBe(email);
  });

  it("claims a guest device and merges progress without loss", async () => {
    const db = getDb();
    const email = `merge-${randomUUID()}@example.com`;

    // 1. Register member
    const { user } = await loginOrRegisterMember(email, "Siti");

    // 2. Create device 1 (old device) with progress
    const device1Id = randomUUID();
    await db.insert(learnerDevices).values({
      id: device1Id,
      userId: user.id,
      deviceKeyHash: `hash-${device1Id}`,
      lastSeenAt: new Date(),
    });

    const conceptId = "30000000-0000-4000-8000-000000000001";
    await db.insert(conceptProgress).values({
      learnerDeviceId: device1Id,
      conceptId,
      understanding: 75,
      practice: 60,
      application: 0,
      transfer: 0,
      explanation: 0,
      retention: 40,
      status: "practiced",
      updatedAt: new Date(),
    });

    // 3. Create device 2 (current guest device) with partial progress
    const device2Id = randomUUID();
    await db.insert(learnerDevices).values({
      id: device2Id,
      deviceKeyHash: `hash-${device2Id}`,
      lastSeenAt: new Date(),
    });

    await db.insert(conceptProgress).values({
      learnerDeviceId: device2Id,
      conceptId,
      understanding: 50,
      practice: 80, // Higher than device 1
      application: 0,
      transfer: 0,
      explanation: 0,
      retention: 20,
      status: "learning",
      updatedAt: new Date(),
    });

    // 4. Claim device 2 under the user
    const claimRes = await claimDevice(user.id, device2Id);
    expect(claimRes.status).toBe("success");
    expect(claimRes.conceptsMerged).toBeGreaterThanOrEqual(1);

    // 5. Verify merged progress on device 2
    const [merged] = await db
      .select()
      .from(conceptProgress)
      .where(
        and(
          eq(conceptProgress.learnerDeviceId, device2Id),
          eq(conceptProgress.conceptId, conceptId)
        )
      );

    expect(merged.understanding).toBe(75); // Max(50, 75)
    expect(merged.practice).toBe(80); // Max(80, 60)
    expect(merged.status).toBe("practiced");
  });
});
