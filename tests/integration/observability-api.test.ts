import { describe, it, expect } from "vitest";
import { GET as statsHandler } from "@/app/api/v1/observability/stats/route";

describe("Observability API (/api/v1/observability/stats)", () => {
  it("GET /api/v1/observability/stats returns database health and learning metrics", async () => {
    const res = await statsHandler();
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.data).toBeDefined();
    expect(json.data.status).toBe("healthy");
    expect(json.data.database.status).toBe("connected");
    expect(json.data.metrics).toBeDefined();
    expect(typeof json.data.metrics.totalAttempts).toBe("number");
    expect(typeof json.data.metrics.publishedConceptsCount).toBe("number");
    expect(typeof json.data.metrics.immutableContentVersions).toBe("number");
  });
});
