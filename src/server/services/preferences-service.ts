import { eq } from "drizzle-orm";
import { getDb, ensureDbInitialized, learnerPreferences } from "@/server/db";
import { Actor } from "@/server/auth/actor-resolver";

export interface UserPreferences {
  theme: "light" | "dark" | "contrast";
  highContrast: boolean;
  fontScale: "small" | "normal" | "large";
  reducedMotion: boolean;
  naiVisible: boolean;
  updatedAt: Date;
}

export async function getLearnerPreferences(actor: Actor): Promise<UserPreferences> {
  await ensureDbInitialized();
  const db = getDb();

  let [prefs] = await db
    .select()
    .from(learnerPreferences)
    .where(eq(learnerPreferences.learnerDeviceId, actor.learnerDeviceId))
    .limit(1);

  if (!prefs) {
    const defaultPrefs = {
      learnerDeviceId: actor.learnerDeviceId,
      theme: "light",
      highContrast: false,
      fontScale: "normal",
      reducedMotion: false,
      naiVisible: true,
      updatedAt: new Date(),
    };
    try {
      await db
        .insert(learnerPreferences)
        .values(defaultPrefs)
        .onConflictDoNothing({ target: learnerPreferences.learnerDeviceId });
    } catch {
      // Safely ignore unique constraint violation in case of concurrent initialization
    }

    const [createdOrExisting] = await db
      .select()
      .from(learnerPreferences)
      .where(eq(learnerPreferences.learnerDeviceId, actor.learnerDeviceId))
      .limit(1);

    if (createdOrExisting) {
      prefs = createdOrExisting;
    } else {
      return {
        theme: "light",
        highContrast: false,
        fontScale: "normal",
        reducedMotion: false,
        naiVisible: true,
        updatedAt: defaultPrefs.updatedAt,
      };
    }
  }

  const isLegacyContrast = prefs.theme === "contrast";
  const normalizedTheme = isLegacyContrast ? "light" : ((prefs.theme as UserPreferences["theme"]) || "light");
  const normalizedHighContrast = prefs.highContrast ?? isLegacyContrast;

  return {
    theme: normalizedTheme,
    highContrast: normalizedHighContrast,
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
    highContrast:
      update.highContrast !== undefined ? update.highContrast : current.highContrast,
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
