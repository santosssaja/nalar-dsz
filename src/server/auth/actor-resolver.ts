import { createHash, randomUUID } from "crypto";
import { cookies, headers } from "next/headers";
import { eq } from "drizzle-orm";
import { getDb, ensureDbInitialized, learnerDevices, learnerPreferences } from "@/server/db";

export type Actor =
  | { kind: "guest"; deviceId: string; learnerDeviceId: string }
  | { kind: "member"; userId: string; deviceId?: string; learnerDeviceId: string };

export const DEVICE_KEY_COOKIE = "nalar_device_key";

export const SESSION_USER_COOKIE = "nalar_session_user_id";

export function hashDeviceKey(rawKey: string): string {
  return createHash("sha256").update(rawKey).digest("hex");
}

export async function resolveActor(): Promise<Actor> {
  await ensureDbInitialized();
  const db = getDb();
  let deviceKey: string | undefined;
  let sessionUserId: string | undefined;

  try {
    const cookieStore = await cookies();
    const headerStore = await headers();
    deviceKey =
      headerStore.get("x-device-key") ||
      cookieStore.get(DEVICE_KEY_COOKIE)?.value;
    sessionUserId =
      headerStore.get("x-user-id") ||
      cookieStore.get(SESSION_USER_COOKIE)?.value;
  } catch {
    // Fallback when called outside active Next.js request scope (e.g. tests or build)
  }

  if (!deviceKey) {
    // Generate new anonymous device key for guest
    deviceKey = randomUUID();
  }

  const keyHash = hashDeviceKey(deviceKey);

  // Look up learner device by hashed key
  let [device] = await db
    .select()
    .from(learnerDevices)
    .where(eq(learnerDevices.deviceKeyHash, keyHash))
    .limit(1);

  if (!device) {
    // Insert new learner device
    const [inserted] = await db
      .insert(learnerDevices)
      .values({
        userId: sessionUserId,
        deviceKeyHash: keyHash,
        lastSeenAt: new Date(),
      })
      .returning();

    device = inserted;

    // Create default preferences for device
    await db.insert(learnerPreferences).values({
      learnerDeviceId: device.id,
      theme: "light",
      fontScale: "normal",
      reducedMotion: false,
      naiVisible: true,
    });
  } else {
    // If session user exists but device isn't linked, update device.userId
    if (sessionUserId && device.userId !== sessionUserId) {
      await db
        .update(learnerDevices)
        .set({ userId: sessionUserId, lastSeenAt: new Date() })
        .where(eq(learnerDevices.id, device.id));
      device.userId = sessionUserId;
    } else {
      // Update last seen
      await db
        .update(learnerDevices)
        .set({ lastSeenAt: new Date() })
        .where(eq(learnerDevices.id, device.id));
    }
  }

  if (device.userId) {
    return {
      kind: "member",
      userId: device.userId,
      deviceId: deviceKey,
      learnerDeviceId: device.id,
    };
  }

  return {
    kind: "guest",
    deviceId: deviceKey,
    learnerDeviceId: device.id,
  };
}
