import { createHash, randomUUID } from "crypto";
import { cookies, headers } from "next/headers";
import { eq } from "drizzle-orm";
import { getDb, ensureDbInitialized, users, learnerDevices, learnerPreferences } from "@/server/db";
import { verifySessionToken } from "./session";

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
  let sessionToken: string | undefined;

  try {
    const cookieStore = await cookies();
    const headerStore = await headers();
    deviceKey =
      headerStore.get("x-device-key") ||
      cookieStore.get(DEVICE_KEY_COOKIE)?.value;
    sessionToken =
      headerStore.get("x-session-token") ||
      cookieStore.get(SESSION_USER_COOKIE)?.value;
  } catch {
    // Fallback when called outside active Next.js request scope (e.g. tests or build)
  }

  if (!deviceKey) {
    // Generate new anonymous device key for guest
    deviceKey = randomUUID();
    try {
      const cookieStore = await cookies();
      cookieStore.set(DEVICE_KEY_COOKIE, deviceKey, {
        path: "/",
        maxAge: 31536000, // 1 year
        httpOnly: true,
        sameSite: "lax",
      });
    } catch {
      // Ignored when invoked in contexts where cookie mutation is prohibited (e.g. Server Component render)
    }
  }

  const keyHash = hashDeviceKey(deviceKey);

  // Verify HMAC-signed session token before trusting the claimed user identity
  let sessionUserId: string | undefined;
  if (sessionToken) {
    const payload = verifySessionToken(sessionToken);
    if (payload) {
      sessionUserId = payload.userId;
    }
  }

  // Validate sessionUserId against users table to prevent FK constraint violations
  let validSessionUserId: string | undefined;
  if (sessionUserId) {
    const [existingUser] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.id, sessionUserId))
      .limit(1);
    if (existingUser) {
      validSessionUserId = existingUser.id;
    }
  }

  // Look up learner device by hashed key
  let [device] = await db
    .select()
    .from(learnerDevices)
    .where(eq(learnerDevices.deviceKeyHash, keyHash))
    .limit(1);

  if (!device) {
    try {
      // Insert new learner device with ON CONFLICT DO NOTHING to prevent race condition crashes
      const [inserted] = await db
        .insert(learnerDevices)
        .values({
          userId: validSessionUserId,
          deviceKeyHash: keyHash,
          lastSeenAt: new Date(),
        })
        .onConflictDoNothing({ target: learnerDevices.deviceKeyHash })
        .returning();

      if (inserted) {
        device = inserted;
        try {
          // Create default preferences for device
          await db
            .insert(learnerPreferences)
            .values({
              learnerDeviceId: device.id,
              theme: "light",
              highContrast: false,
              fontScale: "normal",
              reducedMotion: false,
              naiVisible: true,
            })
            .onConflictDoNothing({ target: learnerPreferences.learnerDeviceId });
        } catch {
          // Ignore if preferences were concurrently initialized
        }
      } else {
        // Record was concurrently created by another request
        [device] = await db
          .select()
          .from(learnerDevices)
          .where(eq(learnerDevices.deviceKeyHash, keyHash))
          .limit(1);
      }
    } catch (err: unknown) {
      const dbErr = err as { code?: string; message?: string };
      // Handle Postgres error 23505 (unique_violation) gracefully
      if (dbErr?.code === "23505" || dbErr?.message?.includes("unique constraint") || dbErr?.message?.includes("duplicate key")) {
        [device] = await db
          .select()
          .from(learnerDevices)
          .where(eq(learnerDevices.deviceKeyHash, keyHash))
          .limit(1);
      } else {
        throw err;
      }
    }
  }

  // Safety query fallback
  if (!device) {
    [device] = await db
      .select()
      .from(learnerDevices)
      .where(eq(learnerDevices.deviceKeyHash, keyHash))
      .limit(1);
  } else {
    // If valid session user exists but device isn't linked, update device.userId
    if (validSessionUserId && device.userId !== validSessionUserId) {
      await db
        .update(learnerDevices)
        .set({ userId: validSessionUserId, lastSeenAt: new Date() })
        .where(eq(learnerDevices.id, device.id));
      device.userId = validSessionUserId;
    } else if (!validSessionUserId && device.userId) {
      // Check if device.userId is still valid in users table
      const [existingDeviceUser] = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.id, device.userId))
        .limit(1);
      if (!existingDeviceUser) {
        // Stale user reference, detach it safely
        await db
          .update(learnerDevices)
          .set({ userId: null, lastSeenAt: new Date() })
          .where(eq(learnerDevices.id, device.id));
        device.userId = null;
      } else {
        await db
          .update(learnerDevices)
          .set({ lastSeenAt: new Date() })
          .where(eq(learnerDevices.id, device.id));
      }
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
