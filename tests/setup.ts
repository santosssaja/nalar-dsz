import "@testing-library/jest-dom";
import { ensureDbInitialized } from "@/server/db";

// Ensure NODE_ENV is set to test
(process.env as Record<string, string | undefined>).NODE_ENV = "test";

// Initialize in-memory PostgreSQL schema for integration tests
await ensureDbInitialized();
