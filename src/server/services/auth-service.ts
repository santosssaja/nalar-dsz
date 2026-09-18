import { randomUUID } from "crypto";
import { eq, and, ne } from "drizzle-orm";
import {
  getDb,
  ensureDbInitialized,
  users,
  learnerDevices,
  conceptProgress,
  learnerPreferences,
} from "@/server/db";

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
