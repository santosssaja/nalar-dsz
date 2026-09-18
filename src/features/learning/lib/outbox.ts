import { openDB, DBSchema, IDBPDatabase } from "idb";

export interface OutboxEvent {
  eventId: string;
  type: "attempt.submit";
  occurredAt: string;
  payload: {
    stepId: string;
    response: Record<string, unknown>;
    usedHintsCount?: number;
  };
  status: "pending" | "failed";
  createdAt: number;
}

interface NalarDB extends DBSchema {
  outbox: {
    key: string;
    value: OutboxEvent;
    indexes: { "by-status": string };
  };
}

const DB_NAME = "nalar-local-store";
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<NalarDB>> | null = null;

function getDbInstance() {
  if (typeof window === "undefined" || !("indexedDB" in window)) {
    return null;
  }
  if (!dbPromise) {
    dbPromise = openDB<NalarDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("outbox")) {
          const store = db.createObjectStore("outbox", { keyPath: "eventId" });
          store.createIndex("by-status", "status");
        }
      },
    });
  }
  return dbPromise;
}

export async function queueOutboxEvent(
  stepId: string,
  response: Record<string, unknown>,
  usedHintsCount = 0
): Promise<string> {
  const db = await getDbInstance();
  const eventId =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : "outbox-" + Date.now() + "-" + Math.random().toString(16).substring(2, 10);

  const event: OutboxEvent = {
    eventId,
    type: "attempt.submit",
    occurredAt: new Date().toISOString(),
    payload: {
      stepId,
      response,
      usedHintsCount,
    },
    status: "pending",
    createdAt: Date.now(),
  };

  if (db) {
    await db.put("outbox", event);
  }

  return eventId;
}

export async function getPendingOutboxEvents(): Promise<OutboxEvent[]> {
  const db = await getDbInstance();
  if (!db) return [];
  return db.getAllFromIndex("outbox", "by-status", "pending");
}

export async function removeSyncedEvents(eventIds: string[]): Promise<void> {
  const db = await getDbInstance();
  if (!db || eventIds.length === 0) return;

  const tx = db.transaction("outbox", "readwrite");
  for (const id of eventIds) {
    await tx.store.delete(id);
  }
  await tx.done;
}

export async function flushOutbox(): Promise<{ synced: number; failed: number }> {
  const pendingEvents = await getPendingOutboxEvents();
  if (pendingEvents.length === 0) {
    return { synced: 0, failed: 0 };
  }

  try {
    const res = await fetch("/api/v1/sync", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        events: pendingEvents.map((e) => ({
          eventId: e.eventId,
          type: e.type,
          occurredAt: e.occurredAt,
          payload: e.payload,
        })),
      }),
    });

    if (res.ok) {
      const data = await res.json();
      const accepted: string[] = data?.data?.accepted ?? [];
      if (accepted.length > 0) {
        await removeSyncedEvents(accepted);
      }
      return {
        synced: accepted.length,
        failed: pendingEvents.length - accepted.length,
      };
    }
  } catch (err) {
    console.warn("Flush outbox failed (network error):", err);
  }

  return { synced: 0, failed: pendingEvents.length };
}
