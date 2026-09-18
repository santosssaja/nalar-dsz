import { drizzle as drizzlePostgres } from "drizzle-orm/postgres-js";
import { drizzle as drizzlePglite } from "drizzle-orm/pglite";
import postgres from "postgres";
import { PGlite } from "@electric-sql/pglite";
import * as schema from "./schema";

export type DbClient = ReturnType<typeof drizzlePostgres<typeof schema>> | ReturnType<typeof drizzlePglite<typeof schema>>;

let cachedDb: DbClient | null = null;
let pgliteInstance: PGlite | null = null;

export function getDb(): DbClient {
  if (cachedDb) {
    return cachedDb;
  }

  const databaseUrl = process.env.DATABASE_URL;

  if (databaseUrl && process.env.NODE_ENV !== "test") {
    // Production / Staging with real PostgreSQL
    const client = postgres(databaseUrl, {
      max: 10,
      idle_timeout: 20,
      connect_timeout: 10,
    });
    cachedDb = drizzlePostgres(client, { schema });
    return cachedDb;
  }

  // Local / Test In-Memory PostgreSQL using PGlite
  if (!pgliteInstance) {
    pgliteInstance = new PGlite();
  }
  cachedDb = drizzlePglite(pgliteInstance, { schema });
  return cachedDb;
}

let initPromise: Promise<void> | null = null;

export async function ensureDbInitialized(): Promise<void> {
  if (initPromise) return initPromise;

  initPromise = (async () => {
    getDb(); // ensure cachedDb is instantiated
    if (pgliteInstance) {
      try {
        const fs = await import("fs");
        const path = await import("path");
        const migrationPath = path.resolve(process.cwd(), "drizzle/0000_warm_silk_fever.sql");
        if (fs.existsSync(migrationPath)) {
          const sqlContent = fs.readFileSync(migrationPath, "utf-8");
          const cleanSql = sqlContent.replace(/--> statement-breakpoint/g, ";");
          await pgliteInstance.exec(cleanSql);
        }
      } catch (err) {
        console.error("Failed to initialize database schema:", err);
        initPromise = null;
        throw err;
      }
    }

    if (cachedDb) {
      try {
        const { seedCuratedContent } = await import("./seed");
        await seedCuratedContent(cachedDb);
      } catch (err) {
        console.warn("Curated content seed notice:", err);
      }
    }
  })();

  return initPromise;
}

export const db = getDb();
export * from "./schema";
