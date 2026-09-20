/*
 * PURPOSE:
 * Standalone automated verification suite for Location V1 Step 1 (Backend Snapshot Foundation).
 *
 * RESPONSIBILITY:
 * Tests POST /api/admin/location, GET /api/admin/locations, coordinate validation,
 * server timestamp generation, IDOR/tampering rejection, role boundaries, and response shape.
 */

import "dotenv/config";
import http from "node:http";
import jwt from "jsonwebtoken";
import app from "../app.js";
import { prisma } from "../lib/prisma.js";

const JWT_SECRET = process.env.JWT_SECRET || "test-jwt-secret-key-must-be-long-enough-for-hs256-32chars";
process.env.JWT_SECRET = JWT_SECRET;

function createToken(adminId: string, email: string) {
  return jwt.sign({ sub: adminId, email }, JWT_SECRET, {
    algorithm: "HS256",
    expiresIn: "15m",
  });
}

async function runVerification() {
  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", () => resolve()));
  const port = (server.address() as any).port;
  const baseUrl = `http://127.0.0.1:${port}`;

  console.log(`=== LOCATION V1 STEP 1: BACKEND SNAPSHOT VERIFICATION ===`);
  console.log(`Server running on ${baseUrl}\n`);

  const results: Array<{ test: string; passed: boolean; details: string }> = [];

  function record(test: string, passed: boolean, details: string) {
    results.push({ test, passed, details });
    console.log(`${passed ? "✓ PASS" : "✗ FAIL"}: ${test} (${details})`);
  }

  let founder = await prisma.admin.findFirst({ where: { isActive: true, role: "FOUNDER" } });
  if (!founder) {
    founder = await prisma.admin.create({
      data: {
        id: "f0000000-0000-4000-8000-000000000001",
        email: "founder-loc-test@example.com",
        passwordHash: "hash",
        role: "FOUNDER",
        name: "Test Founder",
        isActive: true,
      },
    });
  }

  let employee = await prisma.admin.findFirst({ where: { isActive: true, role: "EMPLOYEE" } });
  let createdTestEmp = false;
  if (!employee) {
    employee = await prisma.admin.create({
      data: {
        id: "e0000000-0000-4000-8000-000000000001",
        email: "employee-loc-test@example.com",
        passwordHash: "hash",
        role: "EMPLOYEE",
        name: "Test Employee",
        isActive: true,
      },
    });
    createdTestEmp = true;
  }

  const founderToken = createToken(founder.id, founder.email);
  const employeeToken = createToken(employee.id, employee.email);

  try {
    // 1. Unauthenticated POST /api/admin/location -> 401
    {
      const res = await fetch(`${baseUrl}/api/admin/location`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ latitude: 18.5204, longitude: 73.8567 }),
      });
      const data: any = await res.json();
      record(
        "1. Unauthenticated POST /api/admin/location returns 401",
        res.status === 401 && data.error?.code === "AUTHENTICATION_REQUIRED",
        `status=${res.status}, code=${data.error?.code}`,
      );
    }

    // 2. Unauthenticated GET /api/admin/locations -> 401
    {
      const res = await fetch(`${baseUrl}/api/admin/locations`);
      const data: any = await res.json();
      record(
        "2. Unauthenticated GET /api/admin/locations returns 401",
        res.status === 401 && data.error?.code === "AUTHENTICATION_REQUIRED",
        `status=${res.status}, code=${data.error?.code}`,
      );
    }

    // 3. Employee POST /api/admin/location updates own snapshot -> 200
    {
      const beforeTime = new Date(Date.now() - 3000);
      const res = await fetch(`${baseUrl}/api/admin/location`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${employeeToken}`,
        },
        body: JSON.stringify({ latitude: 18.5204, longitude: 73.8567 }),
      });
      const json: any = await res.json();
      const serverTime = json.data?.lastLocationAt ? new Date(json.data.lastLocationAt) : null;
      const validTime = Boolean(serverTime && serverTime >= beforeTime && serverTime <= new Date(Date.now() + 5000));

      const dbEmp = await prisma.admin.findUnique({ where: { id: employee.id } });

      record(
        "3. Employee POST /api/admin/location updates own snapshot",
        res.status === 200 &&
          json.data?.latitude === 18.5204 &&
          json.data?.longitude === 73.8567 &&
          validTime &&
          dbEmp?.lastLatitude === 18.5204 &&
          dbEmp?.lastLongitude === 73.8567 &&
          dbEmp?.lastLocationAt !== null,
        `status=${res.status}, lat=${json.data?.latitude}, lon=${json.data?.longitude}`,
      );
    }

    // 4. Employee GET /api/admin/locations is rejected with 403 Forbidden
    {
      const res = await fetch(`${baseUrl}/api/admin/locations`, {
        headers: { Authorization: `Bearer ${employeeToken}` },
      });
      const data: any = await res.json();
      record(
        "4. Employee GET /api/admin/locations returns 403 Forbidden",
        res.status === 403 && data.error?.code === "FORBIDDEN",
        `status=${res.status}, code=${data.error?.code}`,
      );
    }

    // 5. Founder POST /api/admin/location updates own snapshot
    {
      const res = await fetch(`${baseUrl}/api/admin/location`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${founderToken}`,
        },
        body: JSON.stringify({ latitude: 18.5314, longitude: 73.8446 }),
      });
      const json: any = await res.json();
      const dbFounder = await prisma.admin.findUnique({ where: { id: founder.id } });

      record(
        "5. Founder POST /api/admin/location updates own snapshot",
        res.status === 200 &&
          json.data?.latitude === 18.5314 &&
          json.data?.longitude === 73.8446 &&
          dbFounder?.lastLatitude === 18.5314 &&
          dbFounder?.lastLongitude === 73.8446,
        `status=${res.status}, lat=${json.data?.latitude}, lon=${json.data?.longitude}`,
      );
    }

    // 6. Founder GET /api/admin/locations returns active admin snapshots
    {
      const res = await fetch(`${baseUrl}/api/admin/locations`, {
        headers: { Authorization: `Bearer ${founderToken}` },
      });
      const json: any = await res.json();
      const items = json.data || [];
      const hasFounder = items.some((i: any) => i.id === founder.id && i.latitude === 18.5314);
      const hasEmployee = items.some((i: any) => i.id === employee.id && i.latitude === 18.5204);
      const noSensitiveFields = items.every((i: any) => !("passwordHash" in i) && !("passwordResetTokens" in i));

      record(
        "6. Founder GET /api/admin/locations returns active admin snapshots without sensitive data",
        res.status === 200 && Array.isArray(items) && hasFounder && hasEmployee && noSensitiveFields,
        `status=${res.status}, count=${items.length}`,
      );
    }

    // 7. Coordinate Validation: Missing latitude -> 400
    {
      const res = await fetch(`${baseUrl}/api/admin/location`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${employeeToken}` },
        body: JSON.stringify({ longitude: 73.8567 }),
      });
      const data: any = await res.json();
      record(
        "7. Missing latitude rejected with 400",
        res.status === 400 && data.error?.code === "INVALID_LOCATION_REQUEST",
        `status=${res.status}, code=${data.error?.code}`,
      );
    }

    // 8. Coordinate Validation: Missing longitude -> 400
    {
      const res = await fetch(`${baseUrl}/api/admin/location`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${employeeToken}` },
        body: JSON.stringify({ latitude: 18.5204 }),
      });
      const data: any = await res.json();
      record(
        "8. Missing longitude rejected with 400",
        res.status === 400 && data.error?.code === "INVALID_LOCATION_REQUEST",
        `status=${res.status}, code=${data.error?.code}`,
      );
    }

    // 9. Coordinate Validation: String coordinates -> 400
    {
      const res = await fetch(`${baseUrl}/api/admin/location`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${employeeToken}` },
        body: JSON.stringify({ latitude: "18.5204", longitude: 73.8567 }),
      });
      const data: any = await res.json();
      record(
        "9. String latitude rejected with 400",
        res.status === 400 && data.error?.code === "INVALID_LOCATION_REQUEST",
        `status=${res.status}, code=${data.error?.code}`,
      );
    }

    // 10. Coordinate Validation: Out-of-range latitude (> 90) -> 400
    {
      const res = await fetch(`${baseUrl}/api/admin/location`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${employeeToken}` },
        body: JSON.stringify({ latitude: 90.001, longitude: 73.8567 }),
      });
      const data: any = await res.json();
      record(
        "10. Latitude greater than 90 rejected with 400",
        res.status === 400 && data.error?.code === "INVALID_LOCATION_REQUEST",
        `status=${res.status}, code=${data.error?.code}`,
      );
    }

    // 11. Coordinate Validation: Out-of-range longitude (< -180) -> 400
    {
      const res = await fetch(`${baseUrl}/api/admin/location`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${employeeToken}` },
        body: JSON.stringify({ latitude: 18.5204, longitude: -180.001 }),
      });
      const data: any = await res.json();
      record(
        "11. Longitude less than -180 rejected with 400",
        res.status === 400 && data.error?.code === "INVALID_LOCATION_REQUEST",
        `status=${res.status}, code=${data.error?.code}`,
      );
    }

    // 12. IDOR / Tampering: Injected adminId in payload -> 400
    {
      const res = await fetch(`${baseUrl}/api/admin/location`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${employeeToken}` },
        body: JSON.stringify({
          latitude: 18.5204,
          longitude: 73.8567,
          adminId: founder.id,
        }),
      });
      const data: any = await res.json();
      record(
        "12. Injected adminId in payload rejected with 400",
        res.status === 400 && data.error?.code === "INVALID_LOCATION_REQUEST",
        `status=${res.status}, code=${data.error?.code}`,
      );
    }

    // 13. IDOR / Tampering: Injected lastLocationAt in payload -> 400
    {
      const res = await fetch(`${baseUrl}/api/admin/location`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${employeeToken}` },
        body: JSON.stringify({
          latitude: 18.5204,
          longitude: 73.8567,
          lastLocationAt: "2020-01-01T00:00:00.000Z",
        }),
      });
      const data: any = await res.json();
      record(
        "13. Injected lastLocationAt in payload rejected with 400",
        res.status === 400 && data.error?.code === "INVALID_LOCATION_REQUEST",
        `status=${res.status}, code=${data.error?.code}`,
      );
    }

    // 14. IDOR / Tampering: Query param override cannot affect another admin
    {
      await fetch(`${baseUrl}/api/admin/location?adminId=${founder.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${employeeToken}` },
        body: JSON.stringify({ latitude: 19.1234, longitude: 72.8765 }),
      });
      const dbFounder = await prisma.admin.findUnique({ where: { id: founder.id } });
      const dbEmp = await prisma.admin.findUnique({ where: { id: employee.id } });

      record(
        "14. Query param manipulation cannot affect another admin location",
        dbFounder?.lastLatitude === 18.5314 && dbEmp?.lastLatitude === 19.1234,
        `founderLat=${dbFounder?.lastLatitude}, empLat=${dbEmp?.lastLatitude}`,
      );
    }

    console.log("\n========================================");
    const passedCount = results.filter((r) => r.passed).length;
    console.log("TOTAL TESTS: " + results.length);
    console.log("PASSED:      " + passedCount);
    console.log("FAILED:      " + (results.length - passedCount));
    console.log("========================================\n");

    if (passedCount !== results.length) {
      process.exit(1);
    }
  } finally {
    if (createdTestEmp && employee) {
      await prisma.admin.delete({ where: { id: employee.id } }).catch(() => {});
    }
    server.close();
  }
}

runVerification().catch((err) => {
  console.error("Verification execution error:", err);
  process.exit(1);
});
