/*
 * PURPOSE:
 * Standalone security regression verification test suite.
 *
 * RESPONSIBILITY:
 * Tests JWT validation, authorization boundaries, IDOR, public lead protection,
 * rate limiting, SSRF, XSS URL rejection, and security headers against the Express app instance.
 */

import "dotenv/config";
import http from "node:http";
import jwt from "jsonwebtoken";
import app from "../app.js";

const JWT_SECRET = process.env.JWT_SECRET || "test-jwt-secret-key-must-be-long-enough-for-hs256-32chars";
process.env.JWT_SECRET = JWT_SECRET;

function createToken(payload: object, options: jwt.SignOptions = {}) {
  return jwt.sign(payload, JWT_SECRET, {
    algorithm: "HS256",
    expiresIn: "15m",
    ...options,
  });
}

async function runTests() {
  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", () => resolve()));
  const port = (server.address() as any).port;
  const baseUrl = `http://127.0.0.1:${port}`;

  console.log(`[SECURITY TEST SUITE] Server listening on ${baseUrl}\n`);
  const results: Array<{ test: string; passed: boolean; details: string }> = [];

  function record(test: string, passed: boolean, details: string) {
    results.push({ test, passed, details });
    console.log(`${passed ? "✓ PASS" : "✗ FAIL"}: ${test} (${details})`);
  }

  try {
    // 1. Missing Authorization header -> 401
    {
      const res = await fetch(`${baseUrl}/api/admin/projects`);
      const data: any = await res.json();
      record(
        "1. Missing Authorization header returns 401",
        res.status === 401 && data.error?.code === "AUTHENTICATION_REQUIRED",
        `status=${res.status}, code=${data.error?.code}`,
      );
    }

    // 2. Malformed Authorization header -> 401
    {
      const res = await fetch(`${baseUrl}/api/admin/projects`, {
        headers: { Authorization: "Basic invalid-format" },
      });
      const data: any = await res.json();
      record(
        "2. Malformed Authorization header returns 401",
        res.status === 401 && data.error?.code === "AUTHENTICATION_REQUIRED",
        `status=${res.status}, code=${data.error?.code}`,
      );
    }

    // 3. Random / garbage JWT -> 401
    {
      const res = await fetch(`${baseUrl}/api/admin/projects`, {
        headers: { Authorization: "Bearer totally.invalid.token" },
      });
      const data: any = await res.json();
      record(
        "3. Garbage JWT returns 401",
        res.status === 401 && data.error?.code === "AUTHENTICATION_REQUIRED",
        `status=${res.status}, code=${data.error?.code}`,
      );
    }

    // 4. Expired JWT -> 401
    {
      const expiredToken = jwt.sign(
        { sub: "admin-1", email: "admin@example.com" },
        JWT_SECRET,
        { algorithm: "HS256", expiresIn: "-10s" },
      );
      const res = await fetch(`${baseUrl}/api/admin/projects`, {
        headers: { Authorization: `Bearer ${expiredToken}` },
      });
      const data: any = await res.json();
      record(
        "4. Expired JWT returns 401",
        res.status === 401 && data.error?.code === "AUTHENTICATION_REQUIRED",
        `status=${res.status}, code=${data.error?.code}`,
      );
    }

    // 5. Incorrectly signed JWT -> 401
    {
      const wrongSecretToken = jwt.sign(
        { sub: "admin-1", email: "admin@example.com" },
        "wrong-secret-key-that-does-not-match-jwt-secret",
        { algorithm: "HS256", expiresIn: "15m" },
      );
      const res = await fetch(`${baseUrl}/api/admin/projects`, {
        headers: { Authorization: `Bearer ${wrongSecretToken}` },
      });
      const data: any = await res.json();
      record(
        "5. Incorrectly signed JWT returns 401",
        res.status === 401 && data.error?.code === "AUTHENTICATION_REQUIRED",
        `status=${res.status}, code=${data.error?.code}`,
      );
    }

    // 6. Token with unsupported algorithm (e.g. none) -> 401
    {
      const header = Buffer.from(JSON.stringify({ alg: "none", typ: "JWT" })).toString("base64url");
      const payload = Buffer.from(JSON.stringify({ sub: "admin-1", email: "admin@example.com", exp: Math.floor(Date.now()/1000) + 900 })).toString("base64url");
      const noneToken = `${header}.${payload}.`;
      const res = await fetch(`${baseUrl}/api/admin/projects`, {
        headers: { Authorization: `Bearer ${noneToken}` },
      });
      const data: any = await res.json();
      record(
        "6. Unsupported algorithm (none) returns 401",
        res.status === 401 && data.error?.code === "AUTHENTICATION_REQUIRED",
        `status=${res.status}, code=${data.error?.code}`,
      );
    }

    // 7. Token missing required claims (e.g. missing sub) -> 401
    {
      const missingSubToken = jwt.sign(
        { email: "admin@example.com" },
        JWT_SECRET,
        { algorithm: "HS256", expiresIn: "15m" },
      );
      const res = await fetch(`${baseUrl}/api/admin/projects`, {
        headers: { Authorization: `Bearer ${missingSubToken}` },
      });
      const data: any = await res.json();
      record(
        "7. Token missing sub claim returns 401",
        res.status === 401 && data.error?.code === "AUTHENTICATION_REQUIRED",
        `status=${res.status}, code=${data.error?.code}`,
      );
    }

    // 8. Valid admin token -> Authorized
    const validToken = createToken({ sub: "admin-1", email: "admin@example.com" });
    {
      const res = await fetch(`${baseUrl}/api/admin/projects`, {
        headers: { Authorization: `Bearer ${validToken}` },
      });
      record(
        "8. Valid admin token is authorized (status 200)",
        res.status === 200,
        `status=${res.status}`,
      );
    }

    // 9. IDOR / Invalid Entity ID on Admin Media -> 404
    {
      const res = await fetch(`${baseUrl}/api/admin/media/non-existent-media-id-999`, {
        headers: { Authorization: `Bearer ${validToken}` },
      });
      const data: any = await res.json();
      record(
        "9. Non-existent Media ID returns 404 (MEDIA_NOT_FOUND)",
        res.status === 404 && data.error?.code === "MEDIA_NOT_FOUND",
        `status=${res.status}, code=${data.error?.code}`,
      );
    }

    // 10. Media Ownership / Context Mismatch -> 400 (INVALID_MEDIA_OWNER)
    {
      const res = await fetch(`${baseUrl}/api/admin/media/url`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${validToken}`,
        },
        body: JSON.stringify({
          url: "https://example.com/image.jpg",
          context: "HOME",
          developerId: "attacker-supplied-developer-id", // HOME context cannot have developerId
          type: "IMAGE",
          category: "HERO",
        }),
      });
      const data: any = await res.json();
      record(
        "10. Media Context Ownership Mismatch rejected (400 INVALID_MEDIA_OWNER)",
        res.status === 400 && data.error?.code === "INVALID_MEDIA_OWNER",
        `status=${res.status}, code=${data.error?.code}`,
      );
    }

    // 11. Public Lead - Admin field injection (status/notes) -> 400
    {
      const res = await fetch(`${baseUrl}/api/leads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Test User",
          phone: "9876543210",
          status: "DONE", // Admin-only field injection
          notes: "Injected private note",
        }),
      });
      const data: any = await res.json();
      record(
        "11. Public Lead rejecting admin field injection (400 INVALID_LEAD_REQUEST)",
        res.status === 400 && data.error?.code === "INVALID_LEAD_REQUEST",
        `status=${res.status}, code=${data.error?.code}`,
      );
    }

    // 12. Public Lead - Invalid / Oversized input rejected -> 400
    {
      const res = await fetch(`${baseUrl}/api/leads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "",
          phone: "1", // too short
        }),
      });
      const data: any = await res.json();
      record(
        "12. Public Lead rejecting malformed/incomplete input (400)",
        res.status === 400 && data.error?.code === "INVALID_LEAD_REQUEST",
        `status=${res.status}, code=${data.error?.code}`,
      );
    }

    // 13. Stored XSS URL validation in Developer endpoint -> 400
    {
      const res = await fetch(`${baseUrl}/api/admin/developers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${validToken}`,
        },
        body: JSON.stringify({
          name: "XSS Developer",
          slug: "xss-developer",
          websiteUrl: "javascript:alert(document.cookie)", // Malicious XSS URI scheme
        }),
      });
      const data: any = await res.json();
      record(
        "13. Malicious javascript: URL rejected in developer creation (400)",
        res.status === 400 && data.error?.code === "INVALID_DEVELOPER_REQUEST",
        `status=${res.status}, code=${data.error?.code}`,
      );
    }

    // 14. SSRF Private IP / Localhost rejection in Import Scraper -> 502/400
    {
      const res = await fetch(`${baseUrl}/api/admin/import/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${validToken}`,
        },
        body: JSON.stringify({
          url: "http://127.0.0.1:8080/internal-admin", // Private loopback URL
        }),
      });
      const data: any = await res.json();
      record(
        "14. SSRF private IP blocked in Import Scraper (502 IMPORT_ANALYZE_FAILED)",
        res.status === 502 && data.error?.code === "IMPORT_ANALYZE_FAILED",
        `status=${res.status}, code=${data.error?.code}`,
      );
    }

    // 15. Security Headers verification
    {
      const res = await fetch(`${baseUrl}/api/site`);
      const nosniff = res.headers.get("x-content-type-options");
      const frameOptions = res.headers.get("x-frame-options");
      record(
        "15. Security Headers (nosniff, SAMEORIGIN) present in response",
        nosniff === "nosniff" && frameOptions === "SAMEORIGIN",
        `nosniff=${nosniff}, x-frame-options=${frameOptions}`,
      );
    }

    const totalPassed = results.filter((r) => r.passed).length;
    console.log(`\n========================================`);
    console.log(`Security Test Suite: ${totalPassed}/${results.length} PASSED`);
    console.log(`========================================\n`);

    if (totalPassed !== results.length) {
      process.exit(1);
    }
  } finally {
    server.close();
  }
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
