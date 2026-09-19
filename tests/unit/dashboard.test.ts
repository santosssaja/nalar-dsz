import { describe, it, expect } from "vitest";
import { getGlobalLearnerRecommendation } from "@/server/services/recommendation-engine";
import { Actor } from "@/server/auth/actor-resolver";
import { getModules, getConcepts } from "@/content/loader";

describe("Dashboard & Global Recommendation", () => {
  const mockGuestActor: Actor = {
    kind: "guest",
    deviceId: "a0000000-0000-4000-8000-000000000001",
    learnerDeviceId: "a0000000-0000-4000-8000-000000000001",
  };

  it("should provide logical next step recommendation across all modules", async () => {
    const recommendation = await getGlobalLearnerRecommendation(mockGuestActor);

    expect(recommendation).toBeDefined();
    expect(recommendation.targetSlug).toBeTruthy();
    expect(recommendation.targetTitle).toBeTruthy();
    expect(["concept", "review", "module"]).toContain(recommendation.targetType);
    expect(recommendation.reasonText).toBeTruthy();
  });

  it("should load all 5 modules and 47 concepts for dashboard overview", () => {
    const modules = getModules();
    expect(modules).toHaveLength(5);

    const concepts = getConcepts();
    expect(concepts).toHaveLength(47);

    const moduleSlugs = modules.map((m) => m.slug);
    expect(moduleSlugs).toContain("fondasi-matematika");
    expect(moduleSlugs).toContain("turunan");
    expect(moduleSlugs).toContain("fisika-mekanika");
    expect(moduleSlugs).toContain("kimia-dasar");
    expect(moduleSlugs).toContain("biologi-dasar");
  });
});
