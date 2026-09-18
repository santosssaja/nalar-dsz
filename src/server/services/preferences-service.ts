import { eq } from "drizzle-orm";
import { getDb, ensureDbInitialized, learnerPreferences } from "@/server/db";
import { Actor } from "@/server/auth/actor-resolver";

export interface UserPreferences {
  theme: "light" | "dark" | "contrast";
  fontScale: "small" | "normal" | "large";
  reducedMotion: boolean;
  naiVisible: boolean;
  updatedAt: Date;
}

export async function getLearnerPreferences(actor: Actor): Promise<UserPreferences> {
  await ensureDbInitialized();
  const db = getDb();

  const [prefs] = await db
    .select()
    .from(learnerPreferences)
    .where(eq(learnerPreferences.learnerDeviceId, actor.learnerDeviceId))
    .limit(1);

  if (!prefs) {
    const defaultPrefs = {
      learnerDeviceId: actor.learnerDeviceId,
      theme: "light",
      fontScale: "normal",
      reducedMotion: false,
      naiVisible: true,
      updatedAt: new Date(),
    };
    await db.insert(learnerPreferences).values(defaultPrefs);
    return {
      theme: "light",
      fontScale: "normal",
      reducedMotion: false,
      naiVisible: true,
      updatedAt: defaultPrefs.updatedAt,
    };
  }

  return {
    theme: (prefs.theme as UserPreferences["theme"]) || "light",
    fontScale: (prefs.fontScale as UserPreferences["fontScale"]) || "normal",
    reducedMotion: prefs.reducedMotion ?? false,
    naiVisible: prefs.naiVisible ?? true,
    updatedAt: prefs.updatedAt,
  };
}

export async function updateLearnerPreferences(
  actor: Actor,
  update: Partial<Omit<UserPreferences, "updatedAt">>
): Promise<UserPreferences> {
  await ensureDbInitialized();
  const db = getDb();

  const current = await getLearnerPreferences(actor);

  const newPrefs = {
    theme: update.theme ?? current.theme,
    fontScale: update.fontScale ?? current.fontScale,
    reducedMotion:
      update.reducedMotion !== undefined ? update.reducedMotion : current.reducedMotion,
    naiVisible:
      update.naiVisible !== undefined ? update.naiVisible : current.naiVisible,
    updatedAt: new Date(),
  };

  await db
    .update(learnerPreferences)
    .set(newPrefs)
    .where(eq(learnerPreferences.learnerDeviceId, actor.learnerDeviceId));

  return newPrefs;
}
