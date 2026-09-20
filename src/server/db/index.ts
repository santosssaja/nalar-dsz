import { drizzle as drizzlePostgres, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { drizzle as drizzlePglite } from "drizzle-orm/pglite";
import postgres from "postgres";
import { PGlite } from "@electric-sql/pglite";
import * as schema from "./schema";

export type DbClient = ReturnType<typeof drizzlePostgres<typeof schema>> | ReturnType<typeof drizzlePglite<typeof schema>>;

export async function withTransaction<T>(
  fn: (tx: DbClient) => Promise<T>
): Promise<T> {
  const db = getDb() as PostgresJsDatabase<typeof schema>;
  return db.transaction(async (tx) => fn(tx as unknown as DbClient));
}

const globalForDb = globalThis as unknown as {
  cachedDb?: DbClient;
  pgliteInstance?: PGlite;
  initPromise?: Promise<void>;
  isInitialized?: boolean;
};

export function getDb(): DbClient {
  if (globalForDb.cachedDb) {
    return globalForDb.cachedDb;
  }

  const databaseUrl = process.env.DATABASE_URL;

  if (databaseUrl && process.env.NODE_ENV !== "test") {
    // Production / Staging with real PostgreSQL
    // prepare: false is required for connection poolers (e.g. Supabase port 6543 / PgBouncer)
    const client = postgres(databaseUrl, {
      max: 10,
      idle_timeout: 20,
      connect_timeout: 10,
      prepare: false,
    });
    globalForDb.cachedDb = drizzlePostgres(client, { schema });
    return globalForDb.cachedDb;
  }

  // Local / Test In-Memory PostgreSQL using PGlite
  if (!globalForDb.pgliteInstance) {
    globalForDb.pgliteInstance = new PGlite();
  }
  globalForDb.cachedDb = drizzlePglite(globalForDb.pgliteInstance, { schema });
  return globalForDb.cachedDb;
}

export async function ensureDbInitialized(): Promise<void> {
  if (globalForDb.isInitialized) return;
  if (globalForDb.initPromise) return globalForDb.initPromise;

  globalForDb.initPromise = (async () => {
    const database = getDb();
    if (globalForDb.pgliteInstance) {
      try {
        const fs = await import("fs");
        const path = await import("path");
        const migrationPath = path.resolve(process.cwd(), "drizzle/0000_warm_silk_fever.sql");
        if (fs.existsSync(migrationPath)) {
          const sqlContent = fs.readFileSync(migrationPath, "utf-8");
          const cleanSql = sqlContent.replace(/--> statement-breakpoint/g, ";");
          await globalForDb.pgliteInstance.exec(cleanSql);
        }
      } catch (err) {
        console.error("Failed to initialize database schema:", err);
        globalForDb.initPromise = undefined;
        throw err;
      }
    }

    if (database) {
      try {
        const { seedCuratedContent } = await import("./seed");
        await seedCuratedContent(database);
        globalForDb.isInitialized = true;
      } catch (err) {
        console.warn("Curated content seed notice:", err);
      }
    }
  })();

  return globalForDb.initPromise;
}

export const db = getDb();
export * from "./schema";
