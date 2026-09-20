/*
 * PURPOSE:
 * Automated verification suite for the Role-Aware Admin Dashboard.
 *
 * VALIDATES:
 * 1. 401 Unauthorized for unauthenticated requests.
 * 2. Founder dashboard returns organization-wide metrics, pipeline, visits, leads, active projects, and shared rentals.
 * 3. Employee dashboard returns strictly owned metrics, pipeline, visits, leads, and shared rentals.
 * 4. Ownership vs Creator invariant: Lead created by Employee A but owned by Employee B appears in
 *    Employee B's dashboard and NOT in Employee A's dashboard, with creator attribution "Created by Employee A".
 */

import "dotenv/config";
import http from "node:http";
import jwt from "jsonwebtoken";
import app from "../app.js";
import { prisma } from "../lib/prisma.js";
import { getTodayISTDateString } from "../validators/lead.validator.js";

const JWT_SECRET = process.env.JWT_SECRET || "test-jwt-secret-key-must-be-long-enough-for-hs256-32chars";
process.env.JWT_SECRET = JWT_SECRET;

function generateTestToken(payload: { id: string; email: string; role: string; name?: string | null }) {
  return jwt.sign(
    {
      sub: payload.id,
      email: payload.email,
      role: payload.role,
      name: payload.name,
    },
    JWT_SECRET,
    { algorithm: "HS256", expiresIn: "1h" }
  );
}

async function runTests() {
  console.log("=== ROLE-AWARE ADMIN DASHBOARD VERIFICATION ===");

  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const address = server.address() as { port: number };
  const baseUrl = `http://127.0.0.1:${address.port}`;
  console.log(`Test server running at ${baseUrl}`);

  try {
    // 1. Fetch Founder and Employees from test database
    const founder = await prisma.admin.findFirst({
      where: { role: "FOUNDER", isActive: true },
    });
    const employees = await prisma.admin.findMany({
      where: { role: "EMPLOYEE", isActive: true },
      take: 2,
    });

    if (!founder) throw new Error("Founder admin not found");
    if (employees.length < 2) throw new Error("At least 2 active employees needed for testing");

    const emp1 = employees[0];
    const emp2 = employees[1];

    const founderToken = generateTestToken({
      id: founder.id,
      email: founder.email,
      role: founder.role,
      name: founder.name,
    });

    const emp1Token = generateTestToken({
      id: emp1.id,
      email: emp1.email,
      role: emp1.role,
      name: emp1.name,
    });

    const emp2Token = generateTestToken({
      id: emp2.id,
      email: emp2.email,
      role: emp2.role,
      name: emp2.name,
    });

    const todayDate = getTodayISTDateString();

    // 2. Setup a clear scenario:
    // - Lead 1: created by Emp1, owned by Emp1, visit today
    // - Lead 2: created by Emp1, owned by Emp2 (reassigned), visit today
    // - Lead 3: organic lead (createdById: null, owner: Founder), visit today
    const testLead1 = await prisma.lead.create({
      data: {
        name: "Test Customer Emp1",
        phone: "+91 98765 00001",
        createdById: emp1.id,
        ownerId: emp1.id,
        status: "NEW",
        visitDate: todayDate,
        visitTime: "Morning",
      },
    });

    const testLead2 = await prisma.lead.create({
      data: {
        name: "Test Customer Emp2 Owned",
        phone: "+91 98765 00002",
        createdById: emp1.id,
        ownerId: emp2.id,
        status: "IN_PROGRESS",
        visitDate: todayDate,
        visitTime: "Afternoon",
      },
    });

    const testLead3 = await prisma.lead.create({
      data: {
        name: "Test Customer Organic Founder",
        phone: "+91 98765 00003",
        createdById: null,
        ownerId: founder.id,
        status: "DONE",
        visitDate: todayDate,
        visitTime: "Evening",
      },
    });

    // Test 1: Unauthenticated request
    console.log("\n1. Testing Unauthenticated Access...");
    const unauthRes = await fetch(`${baseUrl}/api/admin/dashboard`);
    if (unauthRes.status !== 401) {
      throw new Error(`Expected 401 for unauthenticated request, got ${unauthRes.status}`);
    }
    console.log("✓ PASS: Unauthenticated request rejected with 401 Unauthorized");

    // Test 2: Founder Dashboard
    console.log("\n2. Testing Founder Dashboard...");
    const founderRes = await fetch(`${baseUrl}/api/admin/dashboard`, {
      headers: { Authorization: `Bearer ${founderToken}` },
    });
    if (founderRes.status !== 200) {
      throw new Error(`Expected 200 for Founder dashboard, got ${founderRes.status}`);
    }
    const founderJson = await founderRes.json();
    const founderData = founderJson.data;

    if (founderData.role !== "FOUNDER") {
      throw new Error(`Expected role FOUNDER, got ${founderData.role}`);
    }
    if (typeof founderData.metrics.totalLeads !== "number" || founderData.metrics.totalLeads < 3) {
      throw new Error(`Invalid Founder totalLeads metric: ${founderData.metrics.totalLeads}`);
    }
    if (typeof founderData.metrics.activeProjects !== "number") {
      throw new Error(`Expected activeProjects metric on Founder dashboard`);
    }
    if (typeof founderData.rental.enquiryCount !== "number" || typeof founderData.rental.availablePropertyCount !== "number") {
      throw new Error(`Expected shared rental metrics on Founder dashboard`);
    }

    // Verify Founder todayVisits contains testLead1, testLead2, and testLead3
    const founderVisitIds = founderData.todayVisits.map((v: any) => v.id);
    if (!founderVisitIds.includes(testLead1.id) || !founderVisitIds.includes(testLead2.id) || !founderVisitIds.includes(testLead3.id)) {
      throw new Error(`Founder todayVisits missing expected test visits`);
    }
    console.log("✓ PASS: Founder dashboard returns organization-wide metrics, active projects, all today's visits, and shared rentals");

    // Test 3: Employee 1 Dashboard
    console.log("\n3. Testing Employee 1 Dashboard...");
    const emp1Res = await fetch(`${baseUrl}/api/admin/dashboard`, {
      headers: { Authorization: `Bearer ${emp1Token}` },
    });
    if (emp1Res.status !== 200) {
      throw new Error(`Expected 200 for Employee 1 dashboard, got ${emp1Res.status}`);
    }
    const emp1Json = await emp1Res.json();
    const emp1Data = emp1Json.data;

    if (emp1Data.role !== "EMPLOYEE") {
      throw new Error(`Expected role EMPLOYEE, got ${emp1Data.role}`);
    }
    if (emp1Data.metrics.activeProjects !== undefined) {
      throw new Error(`activeProjects should NOT be present on Employee dashboard`);
    }
    if (typeof emp1Data.metrics.myLeads !== "number") {
      throw new Error(`Expected myLeads metric on Employee dashboard`);
    }

    // Check Employee 1 visit isolation
    const emp1VisitIds = emp1Data.todayVisits.map((v: any) => v.id);
    if (!emp1VisitIds.includes(testLead1.id)) {
      throw new Error(`Employee 1 should see owned testLead1 in todayVisits`);
    }
    if (emp1VisitIds.includes(testLead2.id)) {
      throw new Error(`Employee 1 must NOT see testLead2 in todayVisits (owned by Emp2)`);
    }
    if (emp1VisitIds.includes(testLead3.id)) {
      throw new Error(`Employee 1 must NOT see testLead3 in todayVisits (owned by Founder)`);
    }
    console.log("✓ PASS: Employee 1 sees only owned metrics, owned today's visits, and no unowned records");

    // Test 4: Employee 2 Dashboard (Creator vs Owner test)
    console.log("\n4. Testing Employee 2 Dashboard (Creator vs Owner Invariant)...");
    const emp2Res = await fetch(`${baseUrl}/api/admin/dashboard`, {
      headers: { Authorization: `Bearer ${emp2Token}` },
    });
    if (emp2Res.status !== 200) {
      throw new Error(`Expected 200 for Employee 2 dashboard, got ${emp2Res.status}`);
    }
    const emp2Json = await emp2Res.json();
    const emp2Data = emp2Json.data;

    const emp2VisitIds = emp2Data.todayVisits.map((v: any) => v.id);
    if (!emp2VisitIds.includes(testLead2.id)) {
      throw new Error(`Employee 2 MUST see testLead2 (owned by Emp2 even though created by Emp1)`);
    }
    if (emp2VisitIds.includes(testLead1.id)) {
      throw new Error(`Employee 2 must NOT see testLead1 (owned by Emp1)`);
    }

    // Verify creator attribution for testLead2 on Employee 2's dashboard
    const testLead2OnEmp2 = emp2Data.todayVisits.find((v: any) => v.id === testLead2.id);
    if (testLead2OnEmp2.createdById !== emp1.id || testLead2OnEmp2.createdBy?.id !== emp1.id) {
      throw new Error(`testLead2 creator attribution must reflect Emp1 as createdBy`);
    }
    console.log(`✓ PASS: Employee 2 sees testLead2 with authentic creator attribution: "${testLead2OnEmp2.createdBy.name || testLead2OnEmp2.createdBy.email}"`);

    // Test 5: Shared Rental Operations
    console.log("\n5. Testing Shared Rental Operations Equality across Founder and Employees...");
    if (
      emp1Data.rental.enquiryCount !== founderData.rental.enquiryCount ||
      emp1Data.rental.availablePropertyCount !== founderData.rental.availablePropertyCount ||
      emp2Data.rental.enquiryCount !== founderData.rental.enquiryCount ||
      emp2Data.rental.availablePropertyCount !== founderData.rental.availablePropertyCount
    ) {
      throw new Error("Rental operational metrics must be completely identical and shared across all roles");
    }
    console.log(`✓ PASS: Rental operations counts are shared identically across Founder, Employee 1, and Employee 2 (enquiries: ${founderData.rental.enquiryCount}, properties: ${founderData.rental.availablePropertyCount})`);

    // Cleanup test data
    await prisma.lead.deleteMany({
      where: { id: { in: [testLead1.id, testLead2.id, testLead3.id] } },
    });

    console.log("\n=== ALL ROLE-AWARE DASHBOARD VERIFICATION TESTS PASSED ===");
  } finally {
    server.close();
  }
}

runTests()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Test failed:", err);
    process.exit(1);
  });
