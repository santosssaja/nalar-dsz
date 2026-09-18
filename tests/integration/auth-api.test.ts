import { describe, it, expect } from "vitest";
import { POST as loginHandler } from "@/app/api/v1/auth/login/route";
import { GET as meHandler } from "@/app/api/v1/auth/me/route";
import { POST as claimHandler } from "@/app/api/v1/auth/claim-device/route";
import { POST as logoutHandler } from "@/app/api/v1/auth/logout/route";
import { NextRequest } from "next/server";
import { randomUUID } from "crypto";

describe("Auth & Device Claiming API", () => {
  it("POST /api/v1/auth/login logs in member and sets session cookie", async () => {
    const email = `api-test-${randomUUID()}@example.com`;
    const req = new NextRequest("http://localhost:3000/api/v1/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        displayName: "Dewi",
      }),
    });

    const res = await loginHandler(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.data.user).toBeDefined();
    expect(json.data.user.email).toBe(email);

    // Verify session cookie was set
    const setCookie = res.headers.get("set-cookie");
    expect(setCookie).toContain("nalar_session_user_id");
  });

  it("POST /api/v1/auth/claim-device links guest device to member account", async () => {
    // First create a user
    const email = `claim-test-${randomUUID()}@example.com`;
    const loginReq = new NextRequest("http://localhost:3000/api/v1/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const loginRes = await loginHandler(loginReq);
    const loginJson = await loginRes.json();
    const userId = loginJson.data.user.id;

    // Explicit claim
    const claimReq = new NextRequest(
      "http://localhost:3000/api/v1/auth/claim-device",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      }
    );

    const claimRes = await claimHandler(claimReq);
    expect(claimRes.status).toBe(200);

    const claimJson = await claimRes.json();
    expect(claimJson.data.claimedDeviceId).toBeDefined();
    expect(claimJson.data.userId).toBe(userId);
  });

  it("GET /api/v1/auth/me returns current actor state", async () => {
    const res = await meHandler();
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.data.actorKind).toBeDefined();
    expect(json.data.learnerDeviceId).toBeDefined();
  });

  it("POST /api/v1/auth/logout clears user session", async () => {
    const res = await logoutHandler();
    expect(res.status).toBe(200);

    const setCookie = res.headers.get("set-cookie");
    expect(setCookie).toBeDefined();
  });

  it("POST /api/v1/auth/request-verification sends email verification and GET /api/v1/auth/verify verifies token", async () => {
    const { POST: requestVerificationHandler } = await import(
      "@/app/api/v1/auth/request-verification/route"
    );
    const { GET: verifyHandler } = await import("@/app/api/v1/auth/verify/route");

    const email = `magic-${randomUUID()}@example.com`;

    // 1. Request verification in register mode
    const req = new NextRequest(
      "http://localhost:3000/api/v1/auth/request-verification",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          displayName: "Budi Santoso",
          mode: "register",
        }),
      }
    );

    const res = await requestVerificationHandler(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data.email).toBe(email);
    expect(json.data.devVerificationUrl).toBeDefined();

    // 2. Extract token from verification URL
    const url = new URL(json.data.devVerificationUrl);
    const token = url.searchParams.get("token");
    expect(token).toBeDefined();

    // 3. Verify token via GET /api/v1/auth/verify
    const verifyReq = new NextRequest(
      `http://localhost:3000/api/v1/auth/verify?token=${token}`,
      {
        method: "GET",
        headers: { Accept: "application/json" },
      }
    );

    const verifyRes = await verifyHandler(verifyReq);
    expect(verifyRes.status).toBe(200);
    const verifyJson = await verifyRes.json();
    expect(verifyJson.data.user.email).toBe(email);
    expect(verifyJson.data.user.displayName).toBe("Budi Santoso");

    // Check cookie
    const setCookie = verifyRes.headers.get("set-cookie");
    expect(setCookie).toContain("nalar_session_user_id");

    // 4. Repeated use of consumed token should fail
    const repeatVerify = await verifyHandler(verifyReq);
    expect(repeatVerify.status).toBe(400);
  });

  it("POST /api/v1/auth/request-verification returns 404 if login requested for unregistered email", async () => {
    const { POST: requestVerificationHandler } = await import(
      "@/app/api/v1/auth/request-verification/route"
    );

    const email = `unregistered-${randomUUID()}@example.com`;
    const req = new NextRequest(
      "http://localhost:3000/api/v1/auth/request-verification",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          mode: "login",
        }),
      }
    );

    const res = await requestVerificationHandler(req);
    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json.error.code).toBe("USER_NOT_FOUND");
  });
});
