import assert from "node:assert/strict";
import http from "node:http";
import test, { after, before, describe } from "node:test";
import jwt from "jsonwebtoken";
import app from "../app.js";
import {
  CACHE_POLICY_CATALOG,
  CACHE_POLICY_SEARCH,
  CACHE_POLICY_NOT_FOUND,
  CACHE_POLICY_PRIVATE,
  CACHE_POLICY_ERROR,
} from "../constants/cache.js";
import { siteRepository } from "../repositories/site.repository.js";
import { contactRepository, DEFAULT_FIRM_CONTACT } from "../repositories/contact.repository.js";
import { firmProfileRepository, DEFAULT_FIRM_PROFILE } from "../repositories/firm-profile.repository.js";
import { developerRepository } from "../repositories/developer.repository.js";
import { projectRepository } from "../repositories/project.repository.js";
import { searchCatalogRepository } from "../repositories/search-catalog.repository.js";
import { searchRepository } from "../repositories/search.repository.js";
import { adminRepository } from "../repositories/admin.repository.js";
import { leadRepository } from "../repositories/lead.repository.js";
import { rentalRepository } from "../repositories/rental.repository.js";

// Ensure environment variables are initialized for testing
process.env.DATABASE_URL =
  process.env.DATABASE_URL || "postgresql://mock:mock@localhost:5432/mock";
process.env.JWT_SECRET = process.env.JWT_SECRET || "test-jwt-secret-key-32-chars-long";

describe("Public & Admin API Cache-Control Integration Tests", () => {
  let server: http.Server;
  let baseUrl: string;

  const validAdminId = "00000000-0000-0000-0000-000000000001";
  const validEmployeeId = "00000000-0000-0000-0000-000000000002";

  const jwtSecret = process.env.JWT_SECRET || "test-jwt-secret";

  const founderToken = jwt.sign(
    { sub: validAdminId, email: "founder@test.com" },
    jwtSecret,
    { algorithm: "HS256" },
  );

  const employeeToken = jwt.sign(
    { sub: validEmployeeId, email: "employee@test.com" },
    jwtSecret,
    { algorithm: "HS256" },
  );

  before(async () => {
    server = http.createServer(app);
    await new Promise<void>((resolve) => {
      server.listen(0, "127.0.0.1", () => resolve());
    });

    const address = server.address();
    if (!address || typeof address === "string") {
      throw new Error("Failed to bind ephemeral test server address");
    }
    baseUrl = `http://127.0.0.1:${address.port}`;
  });

  after(async () => {
    if (server) {
      await new Promise<void>((resolve, reject) => {
        server.close((err) => (err ? reject(err) : resolve()));
      });
    }
  });

  // 1. Successful /api/site returns the public catalog policy
  test("1. GET /api/site returns 200 with CACHE_POLICY_CATALOG", async (t) => {
    t.mock.method(siteRepository, "findHomeMedia", async () => []);
    t.mock.method(siteRepository, "findFeaturedProjects", async () => []);
    t.mock.method(siteRepository, "findPublishedDevelopers", async () => []);
    t.mock.method(contactRepository, "findContact", async () => DEFAULT_FIRM_CONTACT);
    t.mock.method(firmProfileRepository, "findProfile", async () => DEFAULT_FIRM_PROFILE);

    const res = await fetch(`${baseUrl}/api/site`);
    assert.equal(res.status, 200);
    assert.equal(res.headers.get("cache-control"), CACHE_POLICY_CATALOG);
    const json = await res.json();
    assert.ok(json.data);
  });

  // 2. Successful developer response returns the public catalog policy
  test("2. GET /api/developers/:slug returns 200 with CACHE_POLICY_CATALOG", async (t) => {
    t.mock.method(developerRepository, "findPublicDeveloper", async (slug: string) => ({
      id: "dev-1",
      name: "Prestige Group",
      slug,
      description: "Leading builder",
      logoUrl: null,
      websiteUrl: null,
      media: [],
      projects: [],
    }));

    const res = await fetch(`${baseUrl}/api/developers/prestige-group`);
    assert.equal(res.status, 200);
    assert.equal(res.headers.get("cache-control"), CACHE_POLICY_CATALOG);
    const json = await res.json();
    assert.equal(json.data.slug, "prestige-group");
  });

  // 3. Successful project response returns the public catalog policy
  test("3. GET /api/developers/:dev/:loc/:proj returns 200 with CACHE_POLICY_CATALOG", async (t) => {
    t.mock.method(projectRepository, "findPublicProject", async (dev: string, loc: string, proj: string) => ({
      id: "proj-1",
      name: "Prestige Sanctuary",
      slug: proj,
      locationName: "Nandi Hills",
      locationSlug: loc,
      status: "UNDER_CONSTRUCTION",
      developer: { id: "dev-1", name: "Prestige Group", slug: dev },
      configurations: [],
      media: [],
      amenities: [],
      highlights: [],
    }));

    const res = await fetch(`${baseUrl}/api/developers/prestige-group/nandi-hills/prestige-sanctuary`);
    assert.equal(res.status, 200);
    assert.equal(res.headers.get("cache-control"), CACHE_POLICY_CATALOG);
    const json = await res.json();
    assert.equal(json.data.slug, "prestige-sanctuary");
  });

  // 4. Successful search catalog response returns the public catalog policy
  test("4. GET /api/search/catalog returns 200 with CACHE_POLICY_CATALOG", async (t) => {
    t.mock.method(searchCatalogRepository, "findCatalog", async () => []);

    const res = await fetch(`${baseUrl}/api/search/catalog`);
    assert.equal(res.status, 200);
    assert.equal(res.headers.get("cache-control"), CACHE_POLICY_CATALOG);
    const json = await res.json();
    assert.ok(Array.isArray(json.data));
  });

  // 5. Successful search response returns the short public search policy
  test("5. GET /api/search?q=... returns 200 with CACHE_POLICY_SEARCH", async (t) => {
    t.mock.method(searchRepository, "findProperties", async () => []);

    const res = await fetch(`${baseUrl}/api/search?q=baner+pune`);
    assert.equal(res.status, 200);
    assert.equal(res.headers.get("cache-control"), CACHE_POLICY_SEARCH);
    const json = await res.json();
    assert.ok(Array.isArray(json.data));
  });

  // 6. Deliberate missing developer returns the short 404 policy
  test("6. GET /api/developers/non-existent returns 404 with CACHE_POLICY_NOT_FOUND", async (t) => {
    t.mock.method(developerRepository, "findPublicDeveloper", async () => null);

    const res = await fetch(`${baseUrl}/api/developers/non-existent`);
    assert.equal(res.status, 404);
    assert.equal(res.headers.get("cache-control"), CACHE_POLICY_NOT_FOUND);
    const json = await res.json();
    assert.equal(json.error.code, "DEVELOPER_NOT_FOUND");
  });

  // 7. Deliberate missing project returns the short 404 policy
  test("7. GET /api/developers/.../missing-proj returns 404 with CACHE_POLICY_NOT_FOUND", async (t) => {
    t.mock.method(projectRepository, "findPublicProject", async () => null);

    const res = await fetch(`${baseUrl}/api/developers/dev/loc/missing-proj`);
    assert.equal(res.status, 404);
    assert.equal(res.headers.get("cache-control"), CACHE_POLICY_NOT_FOUND);
    const json = await res.json();
    assert.equal(json.error.code, "PROJECT_NOT_FOUND");
  });

  // 8. Service failure returns 500 with no-store
  test("8. Service failure on /api/site returns 500 with CACHE_POLICY_ERROR", async (t) => {
    t.mock.method(siteRepository, "findHomeMedia", async () => {
      throw new Error("Neon database connection timeout");
    });

    const res = await fetch(`${baseUrl}/api/site`);
    assert.equal(res.status, 500);
    assert.equal(res.headers.get("cache-control"), CACHE_POLICY_ERROR);
    const json = await res.json();
    assert.equal(json.error.code, "INTERNAL_SERVER_ERROR");
  });

  // 9. Invalid request returns an appropriate non-cacheable response
  test("9. Missing search query returns 400 with CACHE_POLICY_ERROR", async () => {
    const res = await fetch(`${baseUrl}/api/search`);
    assert.equal(res.status, 400);
    assert.equal(res.headers.get("cache-control"), CACHE_POLICY_ERROR);
    const json = await res.json();
    assert.equal(json.error.code, "SEARCH_QUERY_REQUIRED");
  });

  // 10. Unauthenticated admin request returns no-store
  test("10. Unauthenticated admin request returns 401 with CACHE_POLICY_PRIVATE", async () => {
    const res = await fetch(`${baseUrl}/api/admin/dashboard`);
    assert.equal(res.status, 401);
    assert.equal(res.headers.get("cache-control"), CACHE_POLICY_PRIVATE);
    const json = await res.json();
    assert.equal(json.error.code, "AUTHENTICATION_REQUIRED");
  });

  // 11. Unauthorized admin request returns no-store
  test("11. Unauthorized employee request to founder route returns 403 with CACHE_POLICY_PRIVATE", async (t) => {
    t.mock.method(adminRepository, "findById", async () => ({
      id: validEmployeeId,
      email: "employee@test.com",
      role: "EMPLOYEE",
      isActive: true,
    }));

    const res = await fetch(`${baseUrl}/api/admin/locations`, {
      headers: { Authorization: `Bearer ${employeeToken}` },
    });
    assert.equal(res.status, 403);
    assert.equal(res.headers.get("cache-control"), CACHE_POLICY_PRIVATE);
    const json = await res.json();
    assert.equal(json.error.code, "FORBIDDEN");
  });

  // 12. Successful admin response cannot be publicly cached
  test("12. Successful founder request returns 200 with CACHE_POLICY_PRIVATE", async (t) => {
    t.mock.method(adminRepository, "findById", async () => ({
      id: validAdminId,
      email: "founder@test.com",
      role: "FOUNDER",
      isActive: true,
    }));
    t.mock.method(adminRepository, "findAllActiveLocations", async () => []);

    const res = await fetch(`${baseUrl}/api/admin/locations`, {
      headers: { Authorization: `Bearer ${founderToken}` },
    });
    assert.equal(res.status, 200);
    assert.equal(res.headers.get("cache-control"), CACHE_POLICY_PRIVATE);
  });

  // 13. Lead submission response cannot be cached
  test("13. POST /api/leads returns 201 with CACHE_POLICY_PRIVATE", async (t) => {
    t.mock.method(leadRepository, "create", async () => ({
      id: "lead-123",
      name: "Rohit Sharma",
      phone: "9876543210",
      email: null,
      developerId: null,
      projectId: null,
      configurationId: null,
      message: "Interested in 3BHK",
      visitDate: null,
      visitTime: null,
      status: "NEW",
      source: "WEBSITE",
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    const res = await fetch(`${baseUrl}/api/leads`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Rohit Sharma",
        phone: "9876543210",
        message: "Interested in 3BHK",
      }),
    });

    assert.equal(res.status, 201);
    assert.equal(res.headers.get("cache-control"), CACHE_POLICY_PRIVATE);
  });

  // 14. Rental enquiry response cannot be cached
  test("14. POST /api/rentals/enquiries returns 201 with CACHE_POLICY_PRIVATE", async (t) => {
    t.mock.method(rentalRepository, "createEnquiry", async () => ({
      id: "enq-123",
      name: "Ananya",
      phone: "9123456789",
      configuration: "2 BHK",
      location: "Baner",
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    const res = await fetch(`${baseUrl}/api/rentals/enquiries`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Ananya",
        phone: "9123456789",
        configuration: "2 BHK",
        location: "Baner",
      }),
    });

    assert.equal(res.status, 201);
    assert.equal(res.headers.get("cache-control"), CACHE_POLICY_PRIVATE);
  });

  // 15. Rental property submission response cannot be cached
  test("15. POST /api/rentals/properties returns 201 with CACHE_POLICY_PRIVATE", async (t) => {
    t.mock.method(rentalRepository, "createProperty", async () => ({
      id: "prop-123",
      ownerName: "Deepak",
      phone: "9988776655",
      flatType: "3 BHK",
      location: "Kothrud",
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    const res = await fetch(`${baseUrl}/api/rentals/properties`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ownerName: "Deepak",
        phone: "9988776655",
        flatType: "3 BHK",
        location: "Kothrud",
      }),
    });

    assert.equal(res.status, 201);
    assert.equal(res.headers.get("cache-control"), CACHE_POLICY_PRIVATE);
  });

  // 16. Admin PROJECT_NOT_FOUND error must remain private (never public edge cached)
  test("16. Admin GET with missing project returns 404 with CACHE_POLICY_PRIVATE", async (t) => {
    t.mock.method(adminRepository, "findById", async () => ({
      id: validAdminId,
      email: "founder@test.com",
      role: "FOUNDER",
      isActive: true,
    }));
    t.mock.method(projectRepository, "findById", async () => null);

    const res = await fetch(`${baseUrl}/api/admin/projects/non-existent-id/amenities`, {
      headers: { Authorization: `Bearer ${founderToken}` },
    });
    assert.equal(res.status, 404);
    assert.equal(res.headers.get("cache-control"), CACHE_POLICY_PRIVATE);
    const json = await res.json();
    assert.equal(json.error.code, "PROJECT_NOT_FOUND");
  });

  // 17. Lead POST failure with PROJECT_NOT_FOUND must never be publicly edge cached
  test("17. Lead POST with missing project returns 404 with CACHE_POLICY_ERROR", async (t) => {
    t.mock.method(projectRepository, "findById", async () => null);

    const res = await fetch(`${baseUrl}/api/leads`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Test User",
        phone: "9876543210",
        projectId: "00000000-0000-0000-0000-000000000099",
      }),
    });
    assert.equal(res.status, 404);
    assert.equal(res.headers.get("cache-control"), CACHE_POLICY_ERROR);
    const json = await res.json();
    assert.equal(json.error.code, "PROJECT_NOT_FOUND");
  });
});
