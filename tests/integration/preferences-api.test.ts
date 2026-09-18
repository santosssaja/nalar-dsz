import { describe, it, expect } from "vitest";
import {
  GET as getPreferencesHandler,
  PATCH as patchPreferencesHandler,
} from "@/app/api/v1/preferences/route";
import { NextRequest } from "next/server";

describe("Preferences API (/api/v1/preferences)", () => {
  it("GET /api/v1/preferences returns accessibility settings", async () => {
    const res = await getPreferencesHandler();
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.data).toBeDefined();
    expect(json.data.theme).toBeDefined();
    expect(typeof json.data.highContrast).toBe("boolean");
    expect(json.data.fontScale).toBeDefined();
    expect(typeof json.data.reducedMotion).toBe("boolean");
    expect(typeof json.data.naiVisible).toBe("boolean");
  });

  it("PATCH /api/v1/preferences updates theme, highContrast, and font scale", async () => {
    const req = new NextRequest("http://localhost:3000/api/v1/preferences", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        theme: "dark",
        highContrast: true,
        fontScale: "large",
        reducedMotion: true,
      }),
    });

    const res = await patchPreferencesHandler(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.data.theme).toBe("dark");
    expect(json.data.highContrast).toBe(true);
    expect(json.data.fontScale).toBe("large");
    expect(json.data.reducedMotion).toBe(true);
  });
});
