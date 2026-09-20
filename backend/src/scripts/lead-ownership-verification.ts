/*
 * PURPOSE:
 * Lead Ownership & Creator Foundation verification test suite (Step 1).
 *
 * TESTS:
 * 1. Existing leads survive migration.
 * 2. Existing leads receive the correct Founder owner.
 * 3. Public lead creation assigns Founder as owner.
 * 4. Public lead creation cannot choose ownerId (rejected with 400).
 * 5. Public lead creation cannot choose createdById (rejected with 400).
 * 6. Authenticated Founder manually creating a lead: createdBy = Founder, owner = Founder.
 * 7. Authenticated Employee manually creating a lead: createdBy = Employee, owner = Employee.
 * 8. Employee cannot create a lead owned by another employee through request payload manipulation.
 */

import "dotenv/config";
import http from "node:http";
import jwt from "jsonwebtoken";
import app from "../app.js";
import { prisma } from "../lib/prisma.js";

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

  console.log(`[LEAD OWNERSHIP TEST SUITE] Server listening on ${baseUrl}\n`);
  const results: Array<{ test: string; passed: boolean; details: string }> = [];

  function record(test: string, passed: boolean, details: string) {
    results.push({ test, passed, details });
    console.log(`${passed ? "✓ PASS" : "✗ FAIL"}: ${test} (${details})`);
  }

  // Setup/Find Founder Admin
  let founder = await prisma.admin.findFirst({
    where: { role: "FOUNDER", isActive: true },
    orderBy: [{ createdAt: "asc" }, { id: "asc" }],
  });

  if (!founder) {
    founder = await prisma.admin.create({
      data: {
        id: "f0000000-0000-4000-8000-000000000001",
        email: "founder-test@example.com",
        passwordHash: "test-hash",
        name: "Founder Admin",
        role: "FOUNDER",
        isActive: true,
      },
    });
  }

  // Setup/Find Employee Admin 1
  let employee1 = await prisma.admin.findFirst({
    where: { role: "EMPLOYEE", isActive: true },
  });

  if (!employee1) {
    employee1 = await prisma.admin.create({
      data: {
        id: "e0000000-0000-4000-8000-000000000001",
        email: "employee1-test@example.com",
        passwordHash: "test-hash",
        name: "Employee 1",
        role: "EMPLOYEE",
        isActive: true,
      },
    });
  }

  // Setup/Find Employee Admin 2
  let employee2 = await prisma.admin.findFirst({
    where: { role: "EMPLOYEE", isActive: true, id: { not: employee1.id } },
  });

  if (!employee2) {
    employee2 = await prisma.admin.create({
      data: {
        id: "e0000000-0000-4000-8000-000000000002",
        email: "employee2-test@example.com",
        passwordHash: "test-hash",
        name: "Employee 2",
        role: "EMPLOYEE",
        isActive: true,
      },
    });
  }

  const founderToken = createToken({ sub: founder.id, email: founder.email });
  const employee1Token = createToken({ sub: employee1.id, email: employee1.email });
  const employee2Token = createToken({ sub: employee2.id, email: employee2.email });

  const cleanupLeadIds: string[] = [];

  try {
    // 1. Existing leads survive migration & 2. Existing leads receive the correct Founder owner
    {
      const existingLeads = await prisma.lead.findMany();
      const totalLeads = existingLeads.length;
      const organicLeads = existingLeads.filter((l) => l.createdById === null);
      const organicLeadsWithFounderOwner = organicLeads.filter((l) => l.ownerId === founder.id);
      record(
        "1 & 2. Existing organic leads survived migration and received Founder as owner",
        totalLeads > 0 && organicLeadsWithFounderOwner.length === organicLeads.length,
        `totalLeads=${totalLeads}, organicLeads=${organicLeads.length}, withFounderOwner=${organicLeadsWithFounderOwner.length}`,
      );
    }

    // 3. Public lead creation assigns Founder as owner
    {
      const res = await fetch(`${baseUrl}/api/leads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Public Lead Test",
          phone: "9876543210",
          email: "public.lead@example.com",
          message: "Interested in 3 BHK",
        }),
      });
      const data: any = await res.json();
      const createdId = data?.data?.id;
      if (createdId) cleanupLeadIds.push(createdId);

      const dbLead = createdId
        ? await prisma.lead.findUnique({
            where: { id: createdId },
            include: { owner: true, createdBy: true },
          })
        : null;

      record(
        "3. Public lead creation assigns Founder as owner and createdById as null",
        res.status === 201 &&
          dbLead?.ownerId === founder.id &&
          dbLead?.createdById === null &&
          dbLead?.owner?.email === founder.email,
        `status=${res.status}, ownerId=${dbLead?.ownerId}, createdById=${dbLead?.createdById}`,
      );
    }

    // 4. Public lead creation cannot choose ownerId
    {
      const res = await fetch(`${baseUrl}/api/leads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Malicious Public Lead",
          phone: "9876543211",
          ownerId: employee1.id,
        }),
      });
      const data: any = await res.json();
      record(
        "4. Public lead creation rejects payload containing ownerId with 400",
        res.status === 400 && data.error?.code === "INVALID_LEAD_REQUEST",
        `status=${res.status}, code=${data.error?.code}`,
      );
    }

    // 5. Public lead creation cannot choose createdById
    {
      const res = await fetch(`${baseUrl}/api/leads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Malicious Public Lead",
          phone: "9876543212",
          createdById: employee1.id,
        }),
      });
      const data: any = await res.json();
      record(
        "5. Public lead creation rejects payload containing createdById with 400",
        res.status === 400 && data.error?.code === "INVALID_LEAD_REQUEST",
        `status=${res.status}, code=${data.error?.code}`,
      );
    }

    // 6. Authenticated Founder manually creating a lead
    {
      const res = await fetch(`${baseUrl}/api/admin/leads`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${founderToken}`,
        },
        body: JSON.stringify({
          name: "Founder Manual Lead",
          phone: "9876543213",
          message: "Created by Founder",
        }),
      });
      const data: any = await res.json();
      const leadData = data?.data;
      if (leadData?.id) cleanupLeadIds.push(leadData.id);

      record(
        "6. Founder manual lead sets createdBy = Founder and owner = Founder",
        res.status === 201 &&
          leadData?.createdById === founder.id &&
          leadData?.ownerId === founder.id &&
          leadData?.createdBy?.id === founder.id &&
          leadData?.owner?.id === founder.id,
        `status=${res.status}, createdById=${leadData?.createdById}, ownerId=${leadData?.ownerId}`,
      );
    }

    // 7. Authenticated Employee manually creating a lead
    {
      const res = await fetch(`${baseUrl}/api/admin/leads`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${employee1Token}`,
        },
        body: JSON.stringify({
          name: "Employee Manual Lead",
          phone: "9876543214",
          message: "Created by Employee 1",
        }),
      });
      const data: any = await res.json();
      const leadData = data?.data;
      if (leadData?.id) cleanupLeadIds.push(leadData.id);

      record(
        "7. Employee manual lead sets createdBy = Employee and owner = Employee",
        res.status === 201 &&
          leadData?.createdById === employee1.id &&
          leadData?.ownerId === employee1.id &&
          leadData?.createdBy?.id === employee1.id &&
          leadData?.owner?.id === employee1.id,
        `status=${res.status}, createdById=${leadData?.createdById}, ownerId=${leadData?.ownerId}`,
      );
    }

    // 8. Employee cannot create a lead owned by another employee through request payload manipulation
    {
      const res = await fetch(`${baseUrl}/api/admin/leads`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${employee1Token}`,
        },
        body: JSON.stringify({
          name: "Employee Manipulated Lead",
          phone: "9876543215",
          ownerId: employee2.id,
          createdById: employee2.id,
        }),
      });
      const data: any = await res.json();
      record(
        "8. Employee cannot manipulate ownerId/createdById in creation payload (rejected with 400)",
        res.status === 400 && data.error?.code === "INVALID_LEAD_REQUEST",
        `status=${res.status}, code=${data.error?.code}`,
      );
    }

  } finally {
    // Clean up test leads
    if (cleanupLeadIds.length > 0) {
      await prisma.lead.deleteMany({
        where: { id: { in: cleanupLeadIds } },
      });
    }
    server.close();
    await prisma.$disconnect();
  }

  console.log("\n========================================");
  console.log(`TOTAL TESTS: ${results.length}`);
  console.log(`PASSED:      ${results.filter((r) => r.passed).length}`);
  console.log(`FAILED:      ${results.filter((r) => !r.passed).length}`);
  console.log("========================================\n");

  if (results.some((r) => !r.passed)) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Test suite fatal error:", err);
  process.exit(1);
});
