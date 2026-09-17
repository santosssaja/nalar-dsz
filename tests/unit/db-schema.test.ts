import { describe, it, expect } from "vitest";
import * as schema from "@/server/db/schema";

describe("Database Schema Definitions", () => {
  it("should define all core tables specified in docs/database-schema.md", () => {
    // Entities required by database-schema.md
    expect(schema.users).toBeDefined();
    expect(schema.learnerDevices).toBeDefined();
    expect(schema.learnerPreferences).toBeDefined();
    expect(schema.domains).toBeDefined();
    expect(schema.modules).toBeDefined();
    expect(schema.concepts).toBeDefined();
    expect(schema.conceptPrerequisites).toBeDefined();
    expect(schema.learningPaths).toBeDefined();
    expect(schema.pathNodes).toBeDefined();
    expect(schema.contentVersions).toBeDefined();
    expect(schema.learningSteps).toBeDefined();
    expect(schema.rubrics).toBeDefined();
    expect(schema.attempts).toBeDefined();
    expect(schema.learningEvidence).toBeDefined();
    expect(schema.conceptProgress).toBeDefined();
    expect(schema.mistakeEvents).toBeDefined();
    expect(schema.reviewQueue).toBeDefined();
    expect(schema.recommendations).toBeDefined();
    expect(schema.aiInteractions).toBeDefined();
  });

  it("should have correct column definitions on attempts table", () => {
    expect(schema.attempts.id).toBeDefined();
    expect(schema.attempts.learnerDeviceId).toBeDefined();
    expect(schema.attempts.learningStepId).toBeDefined();
    expect(schema.attempts.contentVersionId).toBeDefined();
    expect(schema.attempts.idempotencyKey).toBeDefined();
    expect(schema.attempts.response).toBeDefined();
    expect(schema.attempts.result).toBeDefined();
    expect(schema.attempts.submittedAt).toBeDefined();
  });

  it("should have 6 mastery dimensions on conceptProgress table", () => {
    expect(schema.conceptProgress.understanding).toBeDefined();
    expect(schema.conceptProgress.practice).toBeDefined();
    expect(schema.conceptProgress.application).toBeDefined();
    expect(schema.conceptProgress.transfer).toBeDefined();
    expect(schema.conceptProgress.explanation).toBeDefined();
    expect(schema.conceptProgress.retention).toBeDefined();
  });
});
