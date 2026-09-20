/*
 * PURPOSE:
 * Visit Authorization & Employee Access verification test suite (Step 3).
 *
 * TESTS:
 * 1. Founder can list all scheduled Visits across all owners.
 * 2. Employee 1 sees only Visits belonging to Employee 1's Leads.
 * 3. Employee 2's Visits do not appear in Employee 1's list.
 * 4. Founder can retrieve any Visit by ID.
 * 5. Employee 1 can retrieve their own Visit by ID.
 * 6. Employee 1 retrieving Employee 2's Visit is rejected with 403 Forbidden.
 * 7. Founder can create a Visit.
 * 8. Employee 1 can create a Visit on their own Lead.
 * 9. Employee 1 attempting to schedule/update a Visit on Employee 2's Lead is rejected with 403 Forbidden.
 * 10. Founder can update any Visit.
 * 11. Employee 1 can update their own Visit.
 * 12. Employee 1 updating Employee 2's Visit is rejected with 403 Forbidden.
 * 13. Founder can cancel any Visit schedule (visitDate = null, visitTime = null).
 * 14. Employee 1 can cancel their own Visit schedule.
 * 15. Employee 1 attempting to cancel Employee 2's Visit schedule is rejected with 403 Forbidden.
 * 16. Employee 1 can delete their own Visit / Lead record.
 * 17. Employee 1 attempting to delete Employee 2's Visit is rejected with 403 Forbidden.
 * 18. Today filtering operates correctly within the authorized scope.
 * 19. Upcoming filtering operates correctly within the authorized scope.
 * 20. Past filtering operates correctly within the authorized scope.
 * 21. General enquiry Visits (without project/developer) respect ownership.
 * 22. Lead reassignment automatically changes Visit visibility:
 *     - Old owner loses access
 *     - New owner gains access
 *     - Founder retains access
 * 23. Zero separate Visit ownership tables/columns exist (verifies Lead.ownerId derivation).
 */

import "dotenv/config";
import http from "node:http";
import jwt from "jsonwebtoken";
import app from "../app.js";
import { prisma } from "../lib/prisma.js";
import { getTodayISTDateString } from "../validators/lead.validator.js";

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

  console.log(`[VISIT AUTHORIZATION TEST SUITE] Server listening on ${baseUrl}\n`);
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

  const todayStr = getTodayISTDateString();
  const upcomingStr = "2099-12-31";
  const pastStr = "2020-01-01";

  try {
    // Seed Visits:
    // Visit A: Founder's Today Visit
    const visitFounder = await prisma.lead.create({
      data: {
        name: "Founder Scheduled Visit",
        phone: "+919876590001",
        createdById: founder.id,
        ownerId: founder.id,
        visitDate: todayStr,
        visitTime: "Morning",
        status: "NEW",
        message: "Founder Visit",
      },
    });
    cleanupLeadIds.push(visitFounder.id);

    // Visit B1: Employee 1 Today Visit
    const visitEmp1Today = await prisma.lead.create({
      data: {
        name: "Employee 1 Today Visit",
        phone: "+919876590002",
        createdById: employee1.id,
        ownerId: employee1.id,
        visitDate: todayStr,
        visitTime: "Afternoon",
        status: "NEW",
        message: "Emp1 Today",
      },
    });
    cleanupLeadIds.push(visitEmp1Today.id);

    // Visit B2: Employee 1 Upcoming Visit
    const visitEmp1Upcoming = await prisma.lead.create({
      data: {
        name: "Employee 1 Upcoming Visit",
        phone: "+919876590003",
        createdById: employee1.id,
        ownerId: employee1.id,
        visitDate: upcomingStr,
        visitTime: "Evening",
        status: "NEW",
        message: "Emp1 Upcoming",
      },
    });
    cleanupLeadIds.push(visitEmp1Upcoming.id);

    // Visit B3: Employee 1 Past Visit
    const visitEmp1Past = await prisma.lead.create({
      data: {
        name: "Employee 1 Past Visit",
        phone: "+919876590004",
        createdById: employee1.id,
        ownerId: employee1.id,
        visitDate: pastStr,
        visitTime: "Morning",
        status: "DONE",
        message: "Emp1 Past",
      },
    });
    cleanupLeadIds.push(visitEmp1Past.id);

    // Visit C: Employee 2 Today Visit
    const visitEmp2Today = await prisma.lead.create({
      data: {
        name: "Employee 2 Today Visit",
        phone: "+919876590005",
        createdById: employee2.id,
        ownerId: employee2.id,
        visitDate: todayStr,
        visitTime: "Morning",
        status: "NEW",
        message: "Emp2 Today",
      },
    });
    cleanupLeadIds.push(visitEmp2Today.id);

    // 1. Founder can list all scheduled Visits across all owners
    {
      const res = await fetch(`${baseUrl}/api/admin/visits`, {
        headers: { Authorization: `Bearer ${founderToken}` },
      });
      const data: any = await res.json();
      const allVisits = [
        ...(data?.data?.today || []),
        ...(data?.data?.upcoming || []),
        ...(data?.data?.past || []),
      ];
      const visitIds = allVisits.map((v: any) => v.id);

      const hasAll =
        visitIds.includes(visitFounder.id) &&
        visitIds.includes(visitEmp1Today.id) &&
        visitIds.includes(visitEmp1Upcoming.id) &&
        visitIds.includes(visitEmp1Past.id) &&
        visitIds.includes(visitEmp2Today.id);

      record(
        "1. Founder can list all scheduled Visits across all owners",
        res.status === 200 && hasAll,
        `status=${res.status}, totalVisits=${visitIds.length}`,
      );
    }

    // 2. Employee 1 sees only Visits belonging to Employee 1's Leads
    // 3. Employee 2's Visits do not appear in Employee 1's list
    {
      const res = await fetch(`${baseUrl}/api/admin/visits`, {
        headers: { Authorization: `Bearer ${employee1Token}` },
      });
      const data: any = await res.json();
      const emp1Visits = [
        ...(data?.data?.today || []),
        ...(data?.data?.upcoming || []),
        ...(data?.data?.past || []),
      ];
      const allOwnedByEmp1 = emp1Visits.every((v: any) => v.ownerId === employee1.id);
      const containsEmp2 = emp1Visits.some((v: any) => v.id === visitEmp2Today.id);
      const containsFounder = emp1Visits.some((v: any) => v.id === visitFounder.id);

      record(
        "2 & 3. Employee 1 sees only own Visits; Employee 2 / Founder Visits excluded",
        res.status === 200 && allOwnedByEmp1 && !containsEmp2 && !containsFounder,
        `status=${res.status}, count=${emp1Visits.length}, allOwnedByEmp1=${allOwnedByEmp1}`,
      );
    }

    // 4. Founder can retrieve any Visit by ID
    {
      const res = await fetch(`${baseUrl}/api/admin/visits/${visitEmp1Today.id}`, {
        headers: { Authorization: `Bearer ${founderToken}` },
      });
      const data: any = await res.json();

      record(
        "4. Founder can retrieve employee's Visit by ID",
        res.status === 200 && data?.data?.id === visitEmp1Today.id,
        `status=${res.status}, visitId=${data?.data?.id}`,
      );
    }

    // 5. Employee 1 can retrieve their own Visit by ID
    {
      const res = await fetch(`${baseUrl}/api/admin/visits/${visitEmp1Today.id}`, {
        headers: { Authorization: `Bearer ${employee1Token}` },
      });
      const data: any = await res.json();

      record(
        "5. Employee 1 can retrieve own Visit by ID",
        res.status === 200 && data?.data?.id === visitEmp1Today.id,
        `status=${res.status}, visitId=${data?.data?.id}`,
      );
    }

    // 6. Employee 1 retrieving Employee 2's Visit is rejected with 403 Forbidden
    {
      const res = await fetch(`${baseUrl}/api/admin/visits/${visitEmp2Today.id}`, {
        headers: { Authorization: `Bearer ${employee1Token}` },
      });
      const data: any = await res.json();

      record(
        "6. Employee 1 retrieving Employee 2's Visit rejected with 403 Forbidden",
        res.status === 403 && data?.error?.code === "FORBIDDEN",
        `status=${res.status}, code=${data?.error?.code}`,
      );
    }

    // 7. Founder can create a Visit
    {
      const res = await fetch(`${baseUrl}/api/admin/visits`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${founderToken}`,
        },
        body: JSON.stringify({
          name: "Founder New Scheduled Visit",
          phone: "+919876590077",
          visitDate: todayStr,
          visitTime: "Evening",
        }),
      });
      const data: any = await res.json();
      if (data?.data?.id) cleanupLeadIds.push(data.data.id);

      record(
        "7. Founder can create a Visit (createdBy = Founder, owner = Founder)",
        res.status === 201 &&
          data?.data?.createdById === founder.id &&
          data?.data?.ownerId === founder.id,
        `status=${res.status}, ownerId=${data?.data?.ownerId}`,
      );
    }

    // 8. Employee 1 can create a Visit on their own Lead
    {
      const res = await fetch(`${baseUrl}/api/admin/visits`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${employee1Token}`,
        },
        body: JSON.stringify({
          name: "Employee 1 New Scheduled Visit",
          phone: "+919876590088",
          visitDate: upcomingStr,
          visitTime: "Morning",
        }),
      });
      const data: any = await res.json();
      if (data?.data?.id) cleanupLeadIds.push(data.data.id);

      record(
        "8. Employee 1 can create a Visit (createdBy = Employee 1, owner = Employee 1)",
        res.status === 201 &&
          data?.data?.createdById === employee1.id &&
          data?.data?.ownerId === employee1.id,
        `status=${res.status}, ownerId=${data?.data?.ownerId}`,
      );
    }

    // 9. Employee 1 attempting to schedule/update a Visit on Employee 2's Lead is rejected with 403 Forbidden
    {
      const res = await fetch(`${baseUrl}/api/admin/visits/${visitEmp2Today.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${employee1Token}`,
        },
        body: JSON.stringify({
          visitDate: "2099-11-11",
          visitTime: "Evening",
        }),
      });
      const data: any = await res.json();

      record(
        "9. Employee 1 scheduling/updating Visit on Employee 2's Lead rejected with 403 Forbidden",
        res.status === 403 && data?.error?.code === "FORBIDDEN",
        `status=${res.status}, code=${data?.error?.code}`,
      );
    }

    // 10. Founder can update any Visit
    {
      const res = await fetch(`${baseUrl}/api/admin/visits/${visitEmp1Today.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${founderToken}`,
        },
        body: JSON.stringify({
          notes: "Updated by Founder",
        }),
      });
      const data: any = await res.json();

      record(
        "10. Founder can update any Visit",
        res.status === 200 && data?.data?.notes === "Updated by Founder",
        `status=${res.status}, notes=${data?.data?.notes}`,
      );
    }

    // 11. Employee 1 can update their own Visit
    {
      const res = await fetch(`${baseUrl}/api/admin/visits/${visitEmp1Today.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${employee1Token}`,
        },
        body: JSON.stringify({
          notes: "Updated by Employee 1",
        }),
      });
      const data: any = await res.json();

      record(
        "11. Employee 1 can update own Visit",
        res.status === 200 && data?.data?.notes === "Updated by Employee 1",
        `status=${res.status}, notes=${data?.data?.notes}`,
      );
    }

    // 12. Employee 1 updating Employee 2's Visit is rejected with 403 Forbidden
    {
      const res = await fetch(`${baseUrl}/api/admin/visits/${visitEmp2Today.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${employee1Token}`,
        },
        body: JSON.stringify({
          notes: "Malicious update on Employee 2 Visit",
        }),
      });
      const data: any = await res.json();

      record(
        "12. Employee 1 updating Employee 2's Visit rejected with 403 Forbidden",
        res.status === 403 && data?.error?.code === "FORBIDDEN",
        `status=${res.status}, code=${data?.error?.code}`,
      );
    }

    // 13. Founder can cancel any Visit schedule (visitDate = null, visitTime = null)
    {
      const tempFounderVisit = await prisma.lead.create({
        data: {
          name: "Temp Founder Visit For Cancel",
          phone: "+919876590091",
          createdById: employee2.id,
          ownerId: employee2.id,
          visitDate: todayStr,
          status: "NEW",
        },
      });
      cleanupLeadIds.push(tempFounderVisit.id);

      const res = await fetch(`${baseUrl}/api/admin/visits/${tempFounderVisit.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${founderToken}`,
        },
        body: JSON.stringify({
          visitDate: null,
          visitTime: null,
        }),
      });
      const data: any = await res.json();

      record(
        "13. Founder can cancel any Visit schedule (clears visitDate/visitTime, preserves Lead)",
        res.status === 200 && data?.data?.visitDate === null && data?.data?.visitTime === null,
        `status=${res.status}, visitDate=${data?.data?.visitDate}`,
      );
    }

    // 14. Employee 1 can cancel their own Visit schedule
    {
      const tempEmp1Visit = await prisma.lead.create({
        data: {
          name: "Temp Emp1 Visit For Cancel",
          phone: "+919876590092",
          createdById: employee1.id,
          ownerId: employee1.id,
          visitDate: todayStr,
          status: "NEW",
        },
      });
      cleanupLeadIds.push(tempEmp1Visit.id);

      const res = await fetch(`${baseUrl}/api/admin/visits/${tempEmp1Visit.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${employee1Token}`,
        },
        body: JSON.stringify({
          visitDate: null,
          visitTime: null,
        }),
      });
      const data: any = await res.json();

      record(
        "14. Employee 1 can cancel own Visit schedule",
        res.status === 200 && data?.data?.visitDate === null && data?.data?.visitTime === null,
        `status=${res.status}, visitDate=${data?.data?.visitDate}`,
      );
    }

    // 15. Employee 1 attempting to cancel Employee 2's Visit schedule is rejected with 403 Forbidden
    {
      const res = await fetch(`${baseUrl}/api/admin/visits/${visitEmp2Today.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${employee1Token}`,
        },
        body: JSON.stringify({
          visitDate: null,
          visitTime: null,
        }),
      });
      const data: any = await res.json();

      record(
        "15. Employee 1 attempting to cancel Employee 2's Visit rejected with 403 Forbidden",
        res.status === 403 && data?.error?.code === "FORBIDDEN",
        `status=${res.status}, code=${data?.error?.code}`,
      );
    }

    // 16. Employee 1 can delete their own Visit / Lead record
    {
      const tempEmp1Delete = await prisma.lead.create({
        data: {
          name: "Temp Emp1 Visit For Delete",
          phone: "+919876590093",
          createdById: employee1.id,
          ownerId: employee1.id,
          visitDate: todayStr,
          status: "NEW",
        },
      });

      const res = await fetch(`${baseUrl}/api/admin/visits/${tempEmp1Delete.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${employee1Token}` },
      });
      const data: any = await res.json();

      record(
        "16. Employee 1 can delete own Visit / Lead record",
        res.status === 200 && data?.data?.deleted === true,
        `status=${res.status}, deleted=${data?.data?.deleted}`,
      );
    }

    // 17. Employee 1 attempting to delete Employee 2's Visit is rejected with 403 Forbidden
    {
      const res = await fetch(`${baseUrl}/api/admin/visits/${visitEmp2Today.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${employee1Token}` },
      });
      const data: any = await res.json();

      record(
        "17. Employee 1 deleting Employee 2's Visit rejected with 403 Forbidden",
        res.status === 403 && data?.error?.code === "FORBIDDEN",
        `status=${res.status}, code=${data?.error?.code}`,
      );
    }

    // 18. Today filtering operates correctly within authorized scope
    // 19. Upcoming filtering operates correctly within authorized scope
    // 20. Past filtering operates correctly within authorized scope
    {
      const res = await fetch(`${baseUrl}/api/admin/visits`, {
        headers: { Authorization: `Bearer ${employee1Token}` },
      });
      const data: any = await res.json();
      const todayIds = (data?.data?.today || []).map((v: any) => v.id);
      const upcomingIds = (data?.data?.upcoming || []).map((v: any) => v.id);
      const pastIds = (data?.data?.past || []).map((v: any) => v.id);

      const hasToday = todayIds.includes(visitEmp1Today.id) && !todayIds.includes(visitEmp2Today.id);
      const hasUpcoming = upcomingIds.includes(visitEmp1Upcoming.id);
      const hasPast = pastIds.includes(visitEmp1Past.id);

      record(
        "18, 19 & 20. Today, Upcoming, and Past filters are correctly categorized within authorized scope",
        res.status === 200 && hasToday && hasUpcoming && hasPast,
        `hasToday=${hasToday}, hasUpcoming=${hasUpcoming}, hasPast=${hasPast}`,
      );
    }

    // 21. General enquiry Visits (without project/developer) respect ownership
    {
      const generalVisitEmp1 = await prisma.lead.create({
        data: {
          name: "General Enquiry Visit Emp1",
          phone: "+919876590094",
          developerId: null,
          projectId: null,
          configurationId: null,
          createdById: employee1.id,
          ownerId: employee1.id,
          visitDate: todayStr,
          status: "NEW",
        },
      });
      cleanupLeadIds.push(generalVisitEmp1.id);

      const resEmp1 = await fetch(`${baseUrl}/api/admin/visits/${generalVisitEmp1.id}`, {
        headers: { Authorization: `Bearer ${employee1Token}` },
      });
      const resEmp2 = await fetch(`${baseUrl}/api/admin/visits/${generalVisitEmp1.id}`, {
        headers: { Authorization: `Bearer ${employee2Token}` },
      });

      record(
        "21. General enquiry Visits respect ownership without project context",
        resEmp1.status === 200 && resEmp2.status === 403,
        `emp1Status=${resEmp1.status}, emp2Status=${resEmp2.status}`,
      );
    }

    // 22. Lead reassignment automatically changes Visit visibility
    {
      const reassignLead = await prisma.lead.create({
        data: {
          name: "Reassignable Visit Lead",
          phone: "+919876590095",
          createdById: employee1.id,
          ownerId: employee1.id,
          visitDate: todayStr,
          status: "NEW",
        },
      });
      cleanupLeadIds.push(reassignLead.id);

      // Step A: Employee 1 can view, Employee 2 cannot
      const stepA_Emp1 = await fetch(`${baseUrl}/api/admin/visits/${reassignLead.id}`, {
        headers: { Authorization: `Bearer ${employee1Token}` },
      });
      const stepA_Emp2 = await fetch(`${baseUrl}/api/admin/visits/${reassignLead.id}`, {
        headers: { Authorization: `Bearer ${employee2Token}` },
      });

      // Step B: Founder reassigns Lead to Employee 2
      const reassignRes = await fetch(`${baseUrl}/api/admin/leads/${reassignLead.id}/owner`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${founderToken}`,
        },
        body: JSON.stringify({ ownerId: employee2.id }),
      });

      // Step C: Employee 1 loses access, Employee 2 gains access, Founder retains access
      const stepC_Emp1 = await fetch(`${baseUrl}/api/admin/visits/${reassignLead.id}`, {
        headers: { Authorization: `Bearer ${employee1Token}` },
      });
      const stepC_Emp2 = await fetch(`${baseUrl}/api/admin/visits/${reassignLead.id}`, {
        headers: { Authorization: `Bearer ${employee2Token}` },
      });
      const stepC_Founder = await fetch(`${baseUrl}/api/admin/visits/${reassignLead.id}`, {
        headers: { Authorization: `Bearer ${founderToken}` },
      });

      const transferSuccess =
        stepA_Emp1.status === 200 &&
        stepA_Emp2.status === 403 &&
        reassignRes.status === 200 &&
        stepC_Emp1.status === 403 &&
        stepC_Emp2.status === 200 &&
        stepC_Founder.status === 200;

      record(
        "22. Lead reassignment automatically updates Visit access dynamically",
        transferSuccess,
        `stepA_Emp1=${stepA_Emp1.status}, stepA_Emp2=${stepA_Emp2.status}, stepC_Emp1=${stepC_Emp1.status}, stepC_Emp2=${stepC_Emp2.status}, founder=${stepC_Founder.status}`,
      );
    }

    // 23. Zero separate Visit ownership fields exist
    {
      const sample = await prisma.lead.findFirst({ where: { visitDate: { not: null } } });
      const keys = Object.keys(sample || {});
      const hasDuplicateVisitOwner = keys.includes("visitOwnerId") || keys.includes("visitCreatedById");

      record(
        "23. Zero separate Visit ownership fields exist in schema",
        !hasDuplicateVisitOwner,
        `hasDuplicateVisitOwner=${hasDuplicateVisitOwner}`,
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
