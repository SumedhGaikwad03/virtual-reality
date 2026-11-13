import assert from "node:assert/strict";
import http from "node:http";
import test, { after, before, describe } from "node:test";
import express from "express";
import {
  createSeoRouter,
  CACHE_POLICY_LONG,
  CACHE_POLICY_HOME,
  CACHE_POLICY_NOT_FOUND,
  CACHE_POLICY_ERROR,
  EMERGENCY_500_HTML,
  type SeoRendererDependencies,
} from "./seo.routes.js";

// Ensure DATABASE_URL is set so prisma initialization does not throw if imported transitively
process.env.DATABASE_URL =
  process.env.DATABASE_URL || "postgresql://mock:mock@localhost:5432/mock";

describe("SEO Route-Level Cache and Error Hardening Tests", () => {
  let server: http.Server;
  let baseUrl: string;

  // Active mock implementations for the test suite
  const mockDeps: SeoRendererDependencies = {
    generateHomeHtml: async () => "<!doctype html><html><body>Home Mock</body></html>",
    generateDeveloperHtml: async (slug: string) => {
      if (slug === "valid-dev") {
        return "<!doctype html><html><body>Developer Mock</body></html>";
      }
      if (slug === "error-dev") {
        throw new Error("Simulated database failure for developer");
      }
      return null;
    },
    generateProjectHtml: async (_dev: string, _loc: string, proj: string) => {
      if (proj === "valid-project") {
        return "<!doctype html><html><body>Project Mock</body></html>";
      }
      if (proj === "error-project") {
        throw new Error("Simulated database failure for project");
      }
      return null;
    },
    generateLocationHtml: async (loc: string) => {
      if (loc === "valid-loc") {
        return "<!doctype html><html><body>Location Mock</body></html>";
      }
      if (loc === "error-loc") {
        throw new Error("Simulated database failure for location");
      }
      return null;
    },
    generateCityHubHtml: async () =>
      "<!doctype html><html><body>City Hub Mock</body></html>",
    generate404Html: async (msg?: string) =>
      `<!doctype html><html><body>404 Mock: ${msg || "Not Found"}</body></html>`,
    generateSitemapXml: async () =>
      '<?xml version="1.0" encoding="UTF-8"?><urlset></urlset>',
    generateRobotsTxt: () => "User-agent: *\nAllow: /\n",
  };

  before(async () => {
    const app = express();
    const router = createSeoRouter(mockDeps);
    app.use(router);

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

  // 1. Homepage 200 cache policy
  test("1. GET /seo/home returns HTTP 200 with CACHE_POLICY_HOME", async () => {
    const res = await fetch(`${baseUrl}/seo/home`);
    assert.equal(res.status, 200);
    assert.equal(res.headers.get("cache-control"), CACHE_POLICY_HOME);
    assert.equal(
      res.headers.get("content-type"),
      "text/html; charset=utf-8",
    );
    const body = await res.text();
    assert.match(body, /Home Mock/);
  });

  // 2. Project 200 cache policy
  test("2. GET /seo/project/... returns HTTP 200 with CACHE_POLICY_LONG", async () => {
    const res = await fetch(`${baseUrl}/seo/project/dev/loc/valid-project`);
    assert.equal(res.status, 200);
    assert.equal(res.headers.get("cache-control"), CACHE_POLICY_LONG);
    assert.equal(
      res.headers.get("content-type"),
      "text/html; charset=utf-8",
    );
    const body = await res.text();
    assert.match(body, /Project Mock/);
  });

  // 3. Developer 200 cache policy
  test("3. GET /seo/developer/:slug returns HTTP 200 with CACHE_POLICY_LONG", async () => {
    const res = await fetch(`${baseUrl}/seo/developer/valid-dev`);
    assert.equal(res.status, 200);
    assert.equal(res.headers.get("cache-control"), CACHE_POLICY_LONG);
    assert.equal(
      res.headers.get("content-type"),
      "text/html; charset=utf-8",
    );
    const body = await res.text();
    assert.match(body, /Developer Mock/);
  });

  // 4. Location 200 cache policy
  test("4. GET /seo/location/:slug returns HTTP 200 with CACHE_POLICY_LONG", async () => {
    const res = await fetch(`${baseUrl}/seo/location/valid-loc`);
    assert.equal(res.status, 200);
    assert.equal(res.headers.get("cache-control"), CACHE_POLICY_LONG);
    assert.equal(
      res.headers.get("content-type"),
      "text/html; charset=utf-8",
    );
    const body = await res.text();
    assert.match(body, /Location Mock/);
  });

  // 5. City-hub 200 cache policy
  test("5. GET /seo/city-hub returns HTTP 200 with CACHE_POLICY_LONG", async () => {
    const res = await fetch(`${baseUrl}/seo/city-hub`);
    assert.equal(res.status, 200);
    assert.equal(res.headers.get("cache-control"), CACHE_POLICY_LONG);
    assert.equal(
      res.headers.get("content-type"),
      "text/html; charset=utf-8",
    );
    const body = await res.text();
    assert.match(body, /City Hub Mock/);
  });

  // 6. Project 404 cache policy
  test("6. GET /seo/project/... returns HTTP 404 with CACHE_POLICY_NOT_FOUND", async () => {
    const res = await fetch(`${baseUrl}/seo/project/dev/loc/missing-project`);
    assert.equal(res.status, 404);
    assert.equal(res.headers.get("cache-control"), CACHE_POLICY_NOT_FOUND);
    assert.equal(
      res.headers.get("content-type"),
      "text/html; charset=utf-8",
    );
    const body = await res.text();
    assert.match(body, /404 Mock/);
  });

  // 7. Developer 404 cache policy
  test("7. GET /seo/developer/:slug returns HTTP 404 with CACHE_POLICY_NOT_FOUND", async () => {
    const res = await fetch(`${baseUrl}/seo/developer/missing-dev`);
    assert.equal(res.status, 404);
    assert.equal(res.headers.get("cache-control"), CACHE_POLICY_NOT_FOUND);
    assert.equal(
      res.headers.get("content-type"),
      "text/html; charset=utf-8",
    );
    const body = await res.text();
    assert.match(body, /404 Mock/);
  });

  // 8. Location 404 cache policy
  test("8. GET /seo/location/:slug returns HTTP 404 with CACHE_POLICY_NOT_FOUND", async () => {
    const res = await fetch(`${baseUrl}/seo/location/missing-loc`);
    assert.equal(res.status, 404);
    assert.equal(res.headers.get("cache-control"), CACHE_POLICY_NOT_FOUND);
    assert.equal(
      res.headers.get("content-type"),
      "text/html; charset=utf-8",
    );
    const body = await res.text();
    assert.match(body, /404 Mock/);
  });

  // 9. All 500 responses use no-store
  test("9a. GET /seo/home returns HTTP 500 with CACHE_POLICY_ERROR on failure", async () => {
    const orig = mockDeps.generateHomeHtml;
    mockDeps.generateHomeHtml = async () => {
      throw new Error("Database connection timeout");
    };
    try {
      const res = await fetch(`${baseUrl}/seo/home`);
      assert.equal(res.status, 500);
      assert.equal(res.headers.get("cache-control"), CACHE_POLICY_ERROR);
      const body = await res.text();
      assert.doesNotMatch(body, /Database connection timeout/);
    } finally {
      mockDeps.generateHomeHtml = orig;
    }
  });

  test("9b. GET /seo/developer/:slug returns HTTP 500 with CACHE_POLICY_ERROR on failure", async () => {
    const res = await fetch(`${baseUrl}/seo/developer/error-dev`);
    assert.equal(res.status, 500);
    assert.equal(res.headers.get("cache-control"), CACHE_POLICY_ERROR);
    const body = await res.text();
    assert.doesNotMatch(body, /Simulated database failure/);
  });

  test("9c. GET /seo/project/... returns HTTP 500 with CACHE_POLICY_ERROR on failure", async () => {
    const res = await fetch(`${baseUrl}/seo/project/dev/loc/error-project`);
    assert.equal(res.status, 500);
    assert.equal(res.headers.get("cache-control"), CACHE_POLICY_ERROR);
    const body = await res.text();
    assert.doesNotMatch(body, /Simulated database failure/);
  });

  test("9d. GET /seo/location/:slug returns HTTP 500 with CACHE_POLICY_ERROR on failure", async () => {
    const res = await fetch(`${baseUrl}/seo/location/error-loc`);
    assert.equal(res.status, 500);
    assert.equal(res.headers.get("cache-control"), CACHE_POLICY_ERROR);
    const body = await res.text();
    assert.doesNotMatch(body, /Simulated database failure/);
  });

  test("9e. GET /seo/city-hub returns HTTP 500 with CACHE_POLICY_ERROR on failure", async () => {
    const orig = mockDeps.generateCityHubHtml;
    mockDeps.generateCityHubHtml = async () => {
      throw new Error("City hub render error");
    };
    try {
      const res = await fetch(`${baseUrl}/seo/city-hub`);
      assert.equal(res.status, 500);
      assert.equal(res.headers.get("cache-control"), CACHE_POLICY_ERROR);
      const body = await res.text();
      assert.doesNotMatch(body, /City hub render error/);
    } finally {
      mockDeps.generateCityHubHtml = orig;
    }
  });

  test("9f. GET /sitemap.xml returns HTTP 500 with CACHE_POLICY_ERROR on failure", async () => {
    const orig = mockDeps.generateSitemapXml;
    mockDeps.generateSitemapXml = async () => {
      throw new Error("Sitemap query failure");
    };
    try {
      const res = await fetch(`${baseUrl}/sitemap.xml`);
      assert.equal(res.status, 500);
      assert.equal(res.headers.get("cache-control"), CACHE_POLICY_ERROR);
      const body = await res.text();
      assert.match(body, /<urlset/);
      assert.doesNotMatch(body, /Sitemap query failure/);
    } finally {
      mockDeps.generateSitemapXml = orig;
    }
  });

  test("9g. GET /robots.txt returns HTTP 500 with CACHE_POLICY_ERROR on failure", async () => {
    const orig = mockDeps.generateRobotsTxt;
    mockDeps.generateRobotsTxt = () => {
      throw new Error("Robots generation failure");
    };
    try {
      const res = await fetch(`${baseUrl}/robots.txt`);
      assert.equal(res.status, 500);
      assert.equal(res.headers.get("cache-control"), CACHE_POLICY_ERROR);
      const body = await res.text();
      assert.match(body, /User-agent: \*/);
      assert.doesNotMatch(body, /Robots generation failure/);
    } finally {
      mockDeps.generateRobotsTxt = orig;
    }
  });

  // 10. Fallback renderer failure resilience
  test("10a. Severe failure: if generate404Html throws during 500 error, returns EMERGENCY_500_HTML with no-store", async () => {
    const origHome = mockDeps.generateHomeHtml;
    const orig404 = mockDeps.generate404Html;
    mockDeps.generateHomeHtml = async () => {
      throw new Error("Primary renderer crash");
    };
    mockDeps.generate404Html = async () => {
      throw new Error("Fallback 404 renderer crash");
    };

    try {
      const res = await fetch(`${baseUrl}/seo/home`);
      assert.equal(res.status, 500);
      assert.equal(res.headers.get("cache-control"), CACHE_POLICY_ERROR);
      const body = await res.text();
      assert.equal(body, EMERGENCY_500_HTML);
      assert.doesNotMatch(body, /Primary renderer crash/);
      assert.doesNotMatch(body, /Fallback 404 renderer crash/);
    } finally {
      mockDeps.generateHomeHtml = origHome;
      mockDeps.generate404Html = orig404;
    }
  });

  test("10b. If generate404Html throws during 404 handling, securely escalates to 500 with no-store", async () => {
    const orig404 = mockDeps.generate404Html;
    mockDeps.generate404Html = async () => {
      throw new Error("Asset discovery catastrophic failure during 404");
    };

    try {
      const res = await fetch(`${baseUrl}/seo/developer/non-existent-entity`);
      assert.equal(res.status, 500);
      assert.equal(res.headers.get("cache-control"), CACHE_POLICY_ERROR);
      const body = await res.text();
      assert.equal(body, EMERGENCY_500_HTML);
      assert.doesNotMatch(body, /Asset discovery catastrophic failure/);
    } finally {
      mockDeps.generate404Html = orig404;
    }
  });
});
