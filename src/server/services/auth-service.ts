import { randomUUID, randomBytes } from "crypto";
import { eq, and, ne, gt, count } from "drizzle-orm";
import {
  getDb,
  ensureDbInitialized,
  users,
  learnerDevices,
  conceptProgress,
  learnerPreferences,
  verificationTokens,
} from "@/server/db";
import { sendVerificationEmail } from "./email-service";
import { NalarError } from "@/lib/errors";

const VERIFICATION_RATE_LIMIT_REQUESTS = 3;
const VERIFICATION_RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;

export interface ClaimDeviceResult {
  claimedDeviceId: string;
  userId: string;
  conceptsMerged: number;
  status: "success" | "already_linked";
}

export interface UserProfile {
  id: string;
  email: string;
  displayName: string | null;
  createdAt: Date;
}

export async function loginOrRegisterMember(
  email: string,
  displayName?: string,
  currentLearnerDeviceId?: string
): Promise<{
  user: UserProfile;
  claimResult?: ClaimDeviceResult;
}> {
  await ensureDbInitialized();
  const db = getDb();
  const normalizedEmail = email.trim().toLowerCase();

  let [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, normalizedEmail))
    .limit(1);

  if (!user) {
    const generatedName = displayName || normalizedEmail.split("@")[0] || "Pelajar";
    const [inserted] = await db
      .insert(users)
      .values({
        id: randomUUID(),
        email: normalizedEmail,
        displayName: generatedName,
        createdAt: new Date(),
      })
      .returning();
    user = inserted;
  }

  let claimResult: ClaimDeviceResult | undefined;
  if (currentLearnerDeviceId) {
    claimResult = await claimDevice(user.id, currentLearnerDeviceId);
  }

  return {
    user: {
      id: user.id,
      email: user.email ?? normalizedEmail,
      displayName: user.displayName,
      createdAt: user.createdAt,
    },
    claimResult,
  };
}

export async function claimDevice(
  userId: string,
  learnerDeviceId: string
): Promise<ClaimDeviceResult> {
  await ensureDbInitialized();
  const db = getDb();

  const [device] = await db
    .select()
    .from(learnerDevices)
    .where(eq(learnerDevices.id, learnerDeviceId))
    .limit(1);

  if (!device) {
    throw new Error(`Device dengan ID ${learnerDeviceId} tidak ditemukan.`);
  }

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) {
    throw new Error(`User dengan ID ${userId} tidak ditemukan.`);
  }

  if (device.userId === userId) {
    return {
      claimedDeviceId: learnerDeviceId,
      userId,
      conceptsMerged: 0,
      status: "already_linked",
    };
  }

  // Find other devices belonging to this user to merge progress
  const otherDevices = await db
    .select()
    .from(learnerDevices)
    .where(and(eq(learnerDevices.userId, userId), ne(learnerDevices.id, learnerDeviceId)));

  let conceptsMerged = 0;

  for (const other of otherDevices) {
    const otherProgress = await db
      .select()
      .from(conceptProgress)
      .where(eq(conceptProgress.learnerDeviceId, other.id));

    for (const prog of otherProgress) {
      const [currentProg] = await db
        .select()
        .from(conceptProgress)
        .where(
          and(
            eq(conceptProgress.learnerDeviceId, learnerDeviceId),
            eq(conceptProgress.conceptId, prog.conceptId)
          )
        )
        .limit(1);

      if (!currentProg) {
        // Copy progress from other device
        await db.insert(conceptProgress).values({
          learnerDeviceId,
          conceptId: prog.conceptId,
          understanding: prog.understanding,
          practice: prog.practice,
          application: prog.application,
          transfer: prog.transfer,
          explanation: prog.explanation,
          retention: prog.retention,
          status: prog.status,
          updatedAt: prog.updatedAt,
        });
        conceptsMerged += 1;
      } else {
        // Merge taking highest mastery values per dimension
        const newUnderstanding = Math.max(currentProg.understanding, prog.understanding);
        const newPractice = Math.max(currentProg.practice, prog.practice);
        const newApplication = Math.max(currentProg.application, prog.application);
        const newTransfer = Math.max(currentProg.transfer, prog.transfer);
        const newExplanation = Math.max(currentProg.explanation, prog.explanation);
        const newRetention = Math.max(currentProg.retention, prog.retention);

        let newStatus = currentProg.status;
        if (prog.status === "mastered" || currentProg.status === "mastered") {
          newStatus = "mastered";
        } else if (prog.status === "practiced" || currentProg.status === "practiced") {
          newStatus = "practiced";
        } else if (prog.status === "learning" || currentProg.status === "learning") {
          newStatus = "learning";
        }

        await db
          .update(conceptProgress)
          .set({
            understanding: newUnderstanding,
            practice: newPractice,
            application: newApplication,
            transfer: newTransfer,
            explanation: newExplanation,
            retention: newRetention,
            status: newStatus,
            updatedAt: new Date(),
          })
          .where(
            and(
              eq(conceptProgress.learnerDeviceId, learnerDeviceId),
              eq(conceptProgress.conceptId, prog.conceptId)
            )
          );
        conceptsMerged += 1;
      }
    }
  }

  // Associate device with user
  await db
    .update(learnerDevices)
    .set({
      userId,
      lastSeenAt: new Date(),
    })
    .where(eq(learnerDevices.id, learnerDeviceId));

  return {
    claimedDeviceId: learnerDeviceId,
    userId,
    conceptsMerged,
    status: "success",
  };
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  await ensureDbInitialized();
  const db = getDb();

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) return null;

  return {
    id: user.id,
    email: user.email ?? "",
    displayName: user.displayName,
    createdAt: user.createdAt,
  };
}

export interface RequestVerificationResult {
  success: boolean;
  email: string;
  mode: "login" | "register";
  devVerificationUrl?: string;
  message: string;
}

export interface VerifyTokenResult {
  user: UserProfile;
  sessionUserId: string;
  claimResult?: ClaimDeviceResult;
}

export async function requestEmailVerification(
  email: string,
  mode: "login" | "register" = "login",
  displayName?: string,
  currentLearnerDeviceId?: string,
  origin?: string
): Promise<RequestVerificationResult> {
  await ensureDbInitialized();
  const db = getDb();
  const normalizedEmail = email.trim().toLowerCase();

  const [recentTokens] = await db
    .select({ count: count() })
    .from(verificationTokens)
    .where(
      and(
        eq(verificationTokens.email, normalizedEmail),
        gt(
          verificationTokens.createdAt,
          new Date(Date.now() - VERIFICATION_RATE_LIMIT_WINDOW_MS)
        )
      )
    );

  if (recentTokens.count >= VERIFICATION_RATE_LIMIT_REQUESTS) {
    throw new NalarError(
      "RATE_LIMIT_EXCEEDED",
      "Terlalu banyak permintaan tautan verifikasi. Silakan tunggu beberapa saat sebelum mencoba lagi.",
      429
    );
  }

  const [existingUser] = await db
    .select()
    .from(users)
    .where(eq(users.email, normalizedEmail))
    .limit(1);

  if (mode === "login" && !existingUser) {
    throw new NalarError(
      "USER_NOT_FOUND",
      "Alamat email belum terdaftar. Silakan pilih tab 'Daftar' untuk membuat akun baru.",
      404
    );
  }

  // Generate secure token
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

  await db.insert(verificationTokens).values({
    id: randomUUID(),
    email: normalizedEmail,
    token,
    displayName: displayName?.trim() || existingUser?.displayName || null,
    mode,
    targetLearnerDeviceId: currentLearnerDeviceId || null,
    expiresAt,
    createdAt: new Date(),
  });

  const baseUrl = origin || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const verificationUrl = `${baseUrl}/auth/verify?token=${token}`;

  const sendResult = await sendVerificationEmail({
    toEmail: normalizedEmail,
    verificationUrl,
    displayName: displayName?.trim() || existingUser?.displayName || undefined,
    mode,
  });

  return {
    success: true,
    email: normalizedEmail,
    mode,
    devVerificationUrl: sendResult.devVerificationUrl,
    message: `Tautan verifikasi telah dikirim ke ${normalizedEmail}. Silakan periksa kotak masuk atau folder spam email Anda.`,
  };
}

export async function verifyEmailToken(
  token: string,
  currentLearnerDeviceId?: string
): Promise<VerifyTokenResult> {
  await ensureDbInitialized();
  const db = getDb();

  const [tokenRecord] = await db
    .select()
    .from(verificationTokens)
    .where(eq(verificationTokens.token, token))
    .limit(1);

  if (!tokenRecord) {
    throw new NalarError(
      "TOKEN_INVALID",
      "Tautan verifikasi tidak valid atau tidak ditemukan.",
      400
    );
  }

  if (tokenRecord.consumedAt) {
    throw new NalarError(
      "TOKEN_ALREADY_USED",
      "Tautan verifikasi ini sudah pernah digunakan sebelumnya.",
      400
    );
  }

  if (tokenRecord.expiresAt < new Date()) {
    throw new NalarError(
      "TOKEN_EXPIRED",
      "Tautan verifikasi telah kedaluwarsa (berlaku 15 menit). Silakan minta tautan baru.",
      400
    );
  }

  // Mark token consumed
  await db
    .update(verificationTokens)
    .set({ consumedAt: new Date() })
    .where(eq(verificationTokens.id, tokenRecord.id));

  // Find or create user
  const normalizedEmail = tokenRecord.email.toLowerCase();
  let [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, normalizedEmail))
    .limit(1);

  if (!user) {
    const generatedName =
      tokenRecord.displayName || normalizedEmail.split("@")[0] || "Pelajar";
    const [inserted] = await db
      .insert(users)
      .values({
        id: randomUUID(),
        email: normalizedEmail,
        displayName: generatedName,
        emailVerifiedAt: new Date(),
        createdAt: new Date(),
      })
      .returning();
    user = inserted;
  } else {
    // Update verified at and displayName if provided
    await db
      .update(users)
      .set({
        emailVerifiedAt: new Date(),
        displayName: tokenRecord.displayName || user.displayName,
      })
      .where(eq(users.id, user.id));
  }

  // Claim device
  const deviceIdToClaim = currentLearnerDeviceId || tokenRecord.targetLearnerDeviceId;
  let claimResult: ClaimDeviceResult | undefined;
  if (deviceIdToClaim) {
    try {
      claimResult = await claimDevice(user.id, deviceIdToClaim);
    } catch (err) {
      console.warn("Could not claim device during token verification:", err);
    }
  }

  return {
    user: {
      id: user.id,
      email: user.email ?? normalizedEmail,
      displayName: user.displayName,
      createdAt: user.createdAt,
    },
    sessionUserId: user.id,
    claimResult,
  };
}
