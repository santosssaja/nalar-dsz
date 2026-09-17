import { describe, it, expect } from "vitest";
import { GET } from "@/app/api/health/route";

describe("Health Check API", () => {
  it("should return ok status and database connected", async () => {
    const response = await GET();
    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body.data).toBeDefined();
    expect(body.data.status).toBe("ok");
    expect(body.data.database).toBe("connected");
    expect(body.data.requestId).toBeDefined();
    expect(body.data.timestamp).toBeDefined();
  });
});
