/*
 * PURPOSE:
 * Server-side Lead Authorization and Founder-Only Lead Reassignment verification test suite (Step 2).
 *
 * TESTS:
 * 1. Founder can list all leads across all owners.
 * 2. Founder can query/filter leads by ownerId.
 * 3. Founder can retrieve any lead by ID (including employee-owned leads).
 * 4. Founder can update any lead (including employee-owned leads).
 * 5. Founder can reassign lead ownership to an active employee; ownerId changes, createdById remains immutable.
 * 6. Founder reassigning to an inactive admin is rejected with 400.
 * 7. Founder reassigning to a non-existent admin is rejected with 400.
 * 8. Founder reassigning with extra fields or invalid payload is rejected with 400.
 * 9. Founder can delete any lead (including employee-owned leads).
 * 10. Employee lists only leads where ownerId === authenticated employee ID.
 * 11. Employee passing query ownerId=<founderId> cannot override ownership restriction.
 * 12. Employee can retrieve their own lead by ID.
 * 13. Employee retrieving Founder's lead by ID is rejected with 403 Forbidden.
 * 14. Employee retrieving another Employee's lead by ID is rejected with 403 Forbidden.
 * 15. Employee can update their own lead.
 * 16. Employee updating Founder's lead is rejected with 403 Forbidden.
 * 17. Employee updating another Employee's lead is rejected with 403 Forbidden.
 * 18. Employee can delete their own lead.
 * 19. Employee deleting Founder's lead is rejected with 403 Forbidden.
 * 20. Employee deleting another Employee's lead is rejected with 403 Forbidden.
 * 21. Employee attempting to reassign lead ownership (PATCH /:id/owner) is rejected with 403 Forbidden.
 * 22. Standard update endpoint (PATCH /:id) rejects attempts to modify ownerId or createdById with 400.
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

  console.log(`[LEAD AUTHORIZATION TEST SUITE] Server listening on ${baseUrl}\n`);
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

  // Setup Inactive Admin
  let inactiveAdmin = await prisma.admin.findFirst({
    where: { isActive: false },
  });

  if (!inactiveAdmin) {
    inactiveAdmin = await prisma.admin.create({
      data: {
        id: "e0000000-0000-4000-8000-000000000099",
        email: "inactive-admin@example.com",
        passwordHash: "test-hash",
        name: "Inactive Admin",
        role: "EMPLOYEE",
        isActive: false,
      },
    });
  }

  const founderToken = createToken({ sub: founder.id, email: founder.email });
  const employee1Token = createToken({ sub: employee1.id, email: employee1.email });
  const employee2Token = createToken({ sub: employee2.id, email: employee2.email });

  const cleanupLeadIds: string[] = [];

  try {
    // Seed test leads:
    // Lead A: Created by Founder, Owned by Founder
    const leadFounder = await prisma.lead.create({
      data: {
        name: "Test Founder Lead",
        phone: "+919876540001",
        email: "founder.lead@example.com",
        createdById: founder.id,
        ownerId: founder.id,
        status: "NEW",
        message: "Created and owned by Founder",
      },
    });
    cleanupLeadIds.push(leadFounder.id);

    // Lead B: Created by Employee 1, Owned by Employee 1
    const leadEmp1 = await prisma.lead.create({
      data: {
        name: "Test Employee 1 Lead",
        phone: "+919876540002",
        email: "emp1.lead@example.com",
        createdById: employee1.id,
        ownerId: employee1.id,
        status: "NEW",
        message: "Created and owned by Employee 1",
      },
    });
    cleanupLeadIds.push(leadEmp1.id);

    // Lead C: Created by Employee 2, Owned by Employee 2
    const leadEmp2 = await prisma.lead.create({
      data: {
        name: "Test Employee 2 Lead",
        phone: "+919876540003",
        email: "emp2.lead@example.com",
        createdById: employee2.id,
        ownerId: employee2.id,
        status: "NEW",
        message: "Created and owned by Employee 2",
      },
    });
    cleanupLeadIds.push(leadEmp2.id);

    // 1. Founder can list all leads across all owners
    {
      const res = await fetch(`${baseUrl}/api/admin/leads`, {
        headers: { Authorization: `Bearer ${founderToken}` },
      });
      const data: any = await res.json();
      const leadIds = (data?.data || []).map((l: any) => l.id);
      const containsAll =
        leadIds.includes(leadFounder.id) &&
        leadIds.includes(leadEmp1.id) &&
        leadIds.includes(leadEmp2.id);

      record(
        "1. Founder can list all leads across all owners",
        res.status === 200 && containsAll,
        `status=${res.status}, returnedCount=${data?.data?.length}`,
      );
    }

    // 2. Founder can query/filter leads by ownerId
    {
      const res = await fetch(`${baseUrl}/api/admin/leads?ownerId=${employee1.id}`, {
        headers: { Authorization: `Bearer ${founderToken}` },
      });
      const data: any = await res.json();
      const leadIds = (data?.data || []).map((l: any) => l.id);
      const isFiltered =
        leadIds.includes(leadEmp1.id) &&
        !leadIds.includes(leadFounder.id) &&
        !leadIds.includes(leadEmp2.id);

      record(
        "2. Founder can query/filter leads by ownerId",
        res.status === 200 && isFiltered,
        `status=${res.status}, filteredCount=${data?.data?.length}`,
      );
    }

    // 3. Founder can retrieve any lead by ID
    {
      const res = await fetch(`${baseUrl}/api/admin/leads/${leadEmp1.id}`, {
        headers: { Authorization: `Bearer ${founderToken}` },
      });
      const data: any = await res.json();

      record(
        "3. Founder can retrieve employee-owned lead by ID",
        res.status === 200 && data?.data?.id === leadEmp1.id,
        `status=${res.status}, leadId=${data?.data?.id}`,
      );
    }

    // 4. Founder can update any lead
    {
      const res = await fetch(`${baseUrl}/api/admin/leads/${leadEmp1.id}`, {
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
        "4. Founder can update employee-owned lead",
        res.status === 200 && data?.data?.notes === "Updated by Founder",
        `status=${res.status}, notes=${data?.data?.notes}`,
      );
    }

    // 5. Founder can reassign lead ownership to an active employee
    {
      const res = await fetch(`${baseUrl}/api/admin/leads/${leadFounder.id}/owner`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${founderToken}`,
        },
        body: JSON.stringify({
          ownerId: employee1.id,
        }),
      });
      const data: any = await res.json();

      record(
        "5. Founder can reassign lead ownership (ownerId changes, createdById immutable)",
        res.status === 200 &&
          data?.data?.ownerId === employee1.id &&
          data?.data?.createdById === founder.id &&
          data?.data?.owner?.email === employee1.email,
        `status=${res.status}, ownerId=${data?.data?.ownerId}, createdById=${data?.data?.createdById}`,
      );
    }

    // 6. Founder reassigning to an inactive admin is rejected with 400
    {
      const res = await fetch(`${baseUrl}/api/admin/leads/${leadEmp1.id}/owner`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${founderToken}`,
        },
        body: JSON.stringify({
          ownerId: inactiveAdmin.id,
        }),
      });
      const data: any = await res.json();

      record(
        "6. Founder reassigning to inactive admin rejected with 400",
        res.status === 400 && data?.error?.code === "INVALID_LEAD_REQUEST",
        `status=${res.status}, code=${data?.error?.code}`,
      );
    }

    // 7. Founder reassigning to a non-existent admin is rejected with 400
    {
      const res = await fetch(`${baseUrl}/api/admin/leads/${leadEmp1.id}/owner`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${founderToken}`,
        },
        body: JSON.stringify({
          ownerId: "00000000-0000-4000-8000-000000000099",
        }),
      });
      const data: any = await res.json();

      record(
        "7. Founder reassigning to non-existent admin rejected with 400",
        res.status === 400 && data?.error?.code === "INVALID_LEAD_REQUEST",
        `status=${res.status}, code=${data?.error?.code}`,
      );
    }

    // 8. Founder reassigning with extra fields is rejected with 400
    {
      const res = await fetch(`${baseUrl}/api/admin/leads/${leadEmp1.id}/owner`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${founderToken}`,
        },
        body: JSON.stringify({
          ownerId: employee2.id,
          name: "Malicious Extra Field",
        }),
      });
      const data: any = await res.json();

      record(
        "8. Founder reassigning with extra fields rejected with 400",
        res.status === 400 && data?.error?.code === "INVALID_LEAD_REQUEST",
        `status=${res.status}, code=${data?.error?.code}`,
      );
    }

    // 9. Founder can delete any lead (including employee-owned leads)
    {
      const tempLead = await prisma.lead.create({
        data: {
          name: "Temporary Employee Lead For Founder Deletion",
          phone: "+919876540099",
          createdById: employee1.id,
          ownerId: employee1.id,
          status: "NEW",
        },
      });

      const res = await fetch(`${baseUrl}/api/admin/leads/${tempLead.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${founderToken}` },
      });
      const data: any = await res.json();

      record(
        "9. Founder can delete employee-owned lead",
        res.status === 200 && data?.data?.deleted === true,
        `status=${res.status}, deleted=${data?.data?.deleted}`,
      );
    }

    // 10. Employee lists only leads where ownerId === authenticated employee ID
    {
      const res = await fetch(`${baseUrl}/api/admin/leads`, {
        headers: { Authorization: `Bearer ${employee1Token}` },
      });
      const data: any = await res.json();
      const leads = data?.data || [];
      const allOwnedByEmp1 = leads.length > 0 && leads.every((l: any) => l.ownerId === employee1.id);
      const containsEmp2Lead = leads.some((l: any) => l.id === leadEmp2.id);

      record(
        "10. Employee lists only their own leads (ownerId === employee.id)",
        res.status === 200 && allOwnedByEmp1 && !containsEmp2Lead,
        `status=${res.status}, count=${leads.length}, allOwnedByEmp1=${allOwnedByEmp1}`,
      );
    }

    // 11. Employee passing query ownerId=<founderId> cannot override ownership restriction
    {
      const res = await fetch(`${baseUrl}/api/admin/leads?ownerId=${founder.id}`, {
        headers: { Authorization: `Bearer ${employee1Token}` },
      });
      const data: any = await res.json();
      const leads = data?.data || [];
      const allOwnedByEmp1 = leads.every((l: any) => l.ownerId === employee1.id);

      record(
        "11. Employee query override attempt cannot bypass ownership filter",
        res.status === 200 && allOwnedByEmp1,
        `status=${res.status}, count=${leads.length}, allOwnedByEmp1=${allOwnedByEmp1}`,
      );
    }

    // 12. Employee can retrieve their own lead by ID
    {
      const res = await fetch(`${baseUrl}/api/admin/leads/${leadEmp1.id}`, {
        headers: { Authorization: `Bearer ${employee1Token}` },
      });
      const data: any = await res.json();

      record(
        "12. Employee can retrieve their owned lead by ID",
        res.status === 200 && data?.data?.id === leadEmp1.id,
        `status=${res.status}, leadId=${data?.data?.id}`,
      );
    }

    // 13. Employee retrieving Founder's lead by ID is rejected with 403 Forbidden
    {
      // Create fresh founder-owned lead
      const founderOnlyLead = await prisma.lead.create({
        data: {
          name: "Founder Private Lead",
          phone: "+919876540050",
          createdById: founder.id,
          ownerId: founder.id,
          status: "NEW",
        },
      });
      cleanupLeadIds.push(founderOnlyLead.id);

      const res = await fetch(`${baseUrl}/api/admin/leads/${founderOnlyLead.id}`, {
        headers: { Authorization: `Bearer ${employee1Token}` },
      });
      const data: any = await res.json();

      record(
        "13. Employee retrieving Founder-owned lead rejected with 403 Forbidden",
        res.status === 403 && data?.error?.code === "FORBIDDEN",
        `status=${res.status}, code=${data?.error?.code}`,
      );
    }

    // 14. Employee retrieving another Employee's lead by ID is rejected with 403 Forbidden
    {
      const res = await fetch(`${baseUrl}/api/admin/leads/${leadEmp2.id}`, {
        headers: { Authorization: `Bearer ${employee1Token}` },
      });
      const data: any = await res.json();

      record(
        "14. Employee retrieving another Employee's lead rejected with 403 Forbidden",
        res.status === 403 && data?.error?.code === "FORBIDDEN",
        `status=${res.status}, code=${data?.error?.code}`,
      );
    }

    // 15. Employee can update their own lead
    {
      const res = await fetch(`${baseUrl}/api/admin/leads/${leadEmp1.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${employee1Token}`,
        },
        body: JSON.stringify({
          notes: "Updated by Employee 1",
          status: "IN_PROGRESS",
        }),
      });
      const data: any = await res.json();

      record(
        "15. Employee can update their owned lead",
        res.status === 200 &&
          data?.data?.notes === "Updated by Employee 1" &&
          data?.data?.status === "IN_PROGRESS",
        `status=${res.status}, notes=${data?.data?.notes}, status=${data?.data?.status}`,
      );
    }

    // 16. Employee updating Founder's lead is rejected with 403 Forbidden
    {
      const res = await fetch(`${baseUrl}/api/admin/leads/${cleanupLeadIds[cleanupLeadIds.length - 1]}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${employee1Token}`,
        },
        body: JSON.stringify({
          notes: "Malicious update attempt",
        }),
      });
      const data: any = await res.json();

      record(
        "16. Employee updating Founder-owned lead rejected with 403 Forbidden",
        res.status === 403 && data?.error?.code === "FORBIDDEN",
        `status=${res.status}, code=${data?.error?.code}`,
      );
    }

    // 17. Employee updating another Employee's lead is rejected with 403 Forbidden
    {
      const res = await fetch(`${baseUrl}/api/admin/leads/${leadEmp2.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${employee1Token}`,
        },
        body: JSON.stringify({
          notes: "Malicious update on Employee 2 lead",
        }),
      });
      const data: any = await res.json();

      record(
        "17. Employee updating another Employee's lead rejected with 403 Forbidden",
        res.status === 403 && data?.error?.code === "FORBIDDEN",
        `status=${res.status}, code=${data?.error?.code}`,
      );
    }

    // 18. Employee can delete their own lead
    {
      const emp1TempLead = await prisma.lead.create({
        data: {
          name: "Emp1 Temp Lead for Deletion",
          phone: "+919876540088",
          createdById: employee1.id,
          ownerId: employee1.id,
          status: "NEW",
        },
      });

      const res = await fetch(`${baseUrl}/api/admin/leads/${emp1TempLead.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${employee1Token}` },
      });
      const data: any = await res.json();

      record(
        "18. Employee can delete their owned lead",
        res.status === 200 && data?.data?.deleted === true,
        `status=${res.status}, deleted=${data?.data?.deleted}`,
      );
    }

    // 19. Employee deleting Founder's lead is rejected with 403 Forbidden
    {
      const founderLeadForDelete = await prisma.lead.create({
        data: {
          name: "Founder Lead Protected From Emp Delete",
          phone: "+919876540077",
          createdById: founder.id,
          ownerId: founder.id,
          status: "NEW",
        },
      });
      cleanupLeadIds.push(founderLeadForDelete.id);

      const res = await fetch(`${baseUrl}/api/admin/leads/${founderLeadForDelete.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${employee1Token}` },
      });
      const data: any = await res.json();

      record(
        "19. Employee deleting Founder-owned lead rejected with 403 Forbidden",
        res.status === 403 && data?.error?.code === "FORBIDDEN",
        `status=${res.status}, code=${data?.error?.code}`,
      );
    }

    // 20. Employee deleting another Employee's lead is rejected with 403 Forbidden
    {
      const res = await fetch(`${baseUrl}/api/admin/leads/${leadEmp2.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${employee1Token}` },
      });
      const data: any = await res.json();

      record(
        "20. Employee deleting another Employee's lead rejected with 403 Forbidden",
        res.status === 403 && data?.error?.code === "FORBIDDEN",
        `status=${res.status}, code=${data?.error?.code}`,
      );
    }

    // 21. Employee attempting to reassign lead ownership is rejected with 403 Forbidden
    {
      const res = await fetch(`${baseUrl}/api/admin/leads/${leadEmp1.id}/owner`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${employee1Token}`,
        },
        body: JSON.stringify({
          ownerId: employee2.id,
        }),
      });
      const data: any = await res.json();

      record(
        "21. Employee attempting to reassign lead ownership rejected with 403 Forbidden",
        res.status === 403 && data?.error?.code === "FORBIDDEN",
        `status=${res.status}, code=${data?.error?.code}`,
      );
    }

    // 22. Standard update endpoint rejects attempts to modify ownerId or createdById with 400
    {
      const resOwner = await fetch(`${baseUrl}/api/admin/leads/${leadEmp1.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${employee1Token}`,
        },
        body: JSON.stringify({
          ownerId: employee2.id,
        }),
      });
      const dataOwner: any = await resOwner.json();

      const resCreator = await fetch(`${baseUrl}/api/admin/leads/${leadEmp1.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${employee1Token}`,
        },
        body: JSON.stringify({
          createdById: employee2.id,
        }),
      });
      const dataCreator: any = await resCreator.json();

      record(
        "22. Standard update endpoint rejects ownerId/createdById payload tampering with 400",
        resOwner.status === 400 &&
          dataOwner?.error?.code === "INVALID_LEAD_REQUEST" &&
          resCreator.status === 400 &&
          dataCreator?.error?.code === "INVALID_LEAD_REQUEST",
        `ownerStatus=${resOwner.status}, creatorStatus=${resCreator.status}`,
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
