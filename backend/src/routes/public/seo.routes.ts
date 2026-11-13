/*
 * PURPOSE:
 * Public SEO HTTP route definitions and handlers.
 *
 * FLOW:
 * Public Web Request -> seo.routes.ts -> seo-renderer.service.ts -> HTML/XML/Text Response.
 *
 * RESPONSIBILITY:
 * Exposes endpoints for crawler-optimized HTML documents, dynamic sitemap.xml, and robots.txt:
 * - GET /seo/home
 * - GET /seo/developer/:developerSlug
 * - GET /seo/project/:developerSlug/:locationSlug/:projectSlug
 * - GET /seo/location/:locationSlug
 * - GET /seo/city-hub
 * - GET /sitemap.xml
 * - GET /robots.txt
 *
 * INVARIANTS:
 * - Returns text/html for SEO pages and 404 documents.
 * - Returns application/xml for sitemap.xml.
 * - Returns text/plain for robots.txt.
 * - Non-existent or unpublished entities return HTTP 404 with <meta name="robots" content="noindex, nofollow">.
 * - Never leaks stack traces, database errors, or internal credentials to the client.
 */

import { Router, type Request, type Response, type NextFunction } from "express";
import {
  generateHomeHtml,
  generateDeveloperHtml,
  generateProjectHtml,
  generateLocationHtml,
  generateCityHubHtml,
  generate404Html,
  generateSitemapXml,
  generateRobotsTxt,
} from "../../services/seo/seo-renderer.service.js";

export const CACHE_POLICY_LONG =
  "public, max-age=60, s-maxage=86400, stale-while-revalidate=604800";
export const CACHE_POLICY_HOME =
  "public, max-age=60, s-maxage=43200, stale-while-revalidate=604800";
export const CACHE_POLICY_NOT_FOUND =
  "public, max-age=0, s-maxage=60, must-revalidate";
export const CACHE_POLICY_ERROR = "no-cache, no-store, must-revalidate";

export const EMERGENCY_500_HTML = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="robots" content="noindex, nofollow" />
    <title>Server Error</title>
  </head>
  <body style="font-family: system-ui, -apple-system, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background-color: #f9fafb; color: #111827;">
    <main style="max-width: 600px; padding: 32px; text-align: center; background: #ffffff; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
      <h1 style="font-size: 24px; font-weight: 700; margin-bottom: 12px;">Server Error</h1>
      <p style="font-size: 15px; color: #4b5563; margin-bottom: 24px;">An unexpected error occurred while loading this page. Please try again later.</p>
      <a href="/" style="display: inline-block; padding: 10px 20px; background-color: #172f68; color: #ffffff; border-radius: 6px; text-decoration: none; font-weight: 600;">Return to Homepage</a>
    </main>
  </body>
</html>`;

export interface SeoRendererDependencies {
  generateHomeHtml: () => Promise<string>;
  generateDeveloperHtml: (developerSlug: string) => Promise<string | null>;
  generateProjectHtml: (
    developerSlug: string,
    locationSlug: string,
    projectSlug: string,
  ) => Promise<string | null>;
  generateLocationHtml: (locationSlug: string) => Promise<string | null>;
  generateCityHubHtml: () => Promise<string>;
  generate404Html: (message?: string) => Promise<string>;
  generateSitemapXml: () => Promise<string>;
  generateRobotsTxt: () => string;
}

const defaultDependencies: SeoRendererDependencies = {
  generateHomeHtml,
  generateDeveloperHtml,
  generateProjectHtml,
  generateLocationHtml,
  generateCityHubHtml,
  generate404Html,
  generateSitemapXml,
  generateRobotsTxt,
};

async function handleRouteError(
  res: Response,
  routeName: string,
  error: unknown,
  deps: SeoRendererDependencies,
): Promise<void> {
  console.error(`SEO ${routeName} error:`, error);

  if (res.headersSent) {
    return;
  }

  res
    .status(500)
    .setHeader("Content-Type", "text/html; charset=utf-8")
    .setHeader("Cache-Control", CACHE_POLICY_ERROR);

  try {
    const errorHtml = await deps.generate404Html(
      "An unexpected error occurred while loading this page.",
    );
    res.send(errorHtml);
  } catch (renderError) {
    console.error(`SEO ${routeName} fallback render error:`, renderError);
    if (!res.headersSent) {
      res.send(EMERGENCY_500_HTML);
    }
  }
}

export function createSeoRouter(
  deps: SeoRendererDependencies = defaultDependencies,
): Router {
  const router = Router();

  /**
   * 1. GET /seo/home - Homepage SEO Document
   */
  router.get("/seo/home", async (_req: Request, res: Response, _next: NextFunction) => {
    try {
      const html = await deps.generateHomeHtml();
      res
        .status(200)
        .setHeader("Content-Type", "text/html; charset=utf-8")
        .setHeader("Cache-Control", CACHE_POLICY_HOME)
        .send(html);
    } catch (error) {
      await handleRouteError(res, "/seo/home", error, deps);
    }
  });

  /**
   * 2. GET /seo/developer/:developerSlug - Developer Page SEO Document
   */
  router.get(
    "/seo/developer/:developerSlug",
    async (req: Request<{ developerSlug: string }>, res: Response, _next: NextFunction) => {
      try {
        const { developerSlug } = req.params;
        const html = await deps.generateDeveloperHtml(developerSlug);

        if (!html) {
          const notFoundHtml = await deps.generate404Html(
            "The requested developer was not found or is no longer published.",
          );
          res
            .status(404)
            .setHeader("Content-Type", "text/html; charset=utf-8")
            .setHeader("Cache-Control", CACHE_POLICY_NOT_FOUND)
            .send(notFoundHtml);
          return;
        }

        res
          .status(200)
          .setHeader("Content-Type", "text/html; charset=utf-8")
          .setHeader("Cache-Control", CACHE_POLICY_LONG)
          .send(html);
      } catch (error) {
        await handleRouteError(res, "/seo/developer", error, deps);
      }
    },
  );

  /**
   * 3. GET /seo/project/:developerSlug/:locationSlug/:projectSlug - Project Page SEO Document
   */
  router.get(
    "/seo/project/:developerSlug/:locationSlug/:projectSlug",
    async (
      req: Request<{
        developerSlug: string;
        locationSlug: string;
        projectSlug: string;
      }>,
      res: Response,
      _next: NextFunction,
    ) => {
      try {
        const { developerSlug, locationSlug, projectSlug } = req.params;
        const html = await deps.generateProjectHtml(
          developerSlug,
          locationSlug,
          projectSlug,
        );

        if (!html) {
          const notFoundHtml = await deps.generate404Html(
            "The requested property was not found or is no longer published.",
          );
          res
            .status(404)
            .setHeader("Content-Type", "text/html; charset=utf-8")
            .setHeader("Cache-Control", CACHE_POLICY_NOT_FOUND)
            .send(notFoundHtml);
          return;
        }

        res
          .status(200)
          .setHeader("Content-Type", "text/html; charset=utf-8")
          .setHeader("Cache-Control", CACHE_POLICY_LONG)
          .send(html);
      } catch (error) {
        await handleRouteError(res, "/seo/project", error, deps);
      }
    },
  );

  /**
   * 4. GET /seo/location/:locationSlug - Location Hub SEO Document
   */
  router.get(
    "/seo/location/:locationSlug",
    async (req: Request<{ locationSlug: string }>, res: Response, _next: NextFunction) => {
      try {
        const { locationSlug } = req.params;
        const html = await deps.generateLocationHtml(locationSlug);

        if (!html) {
          const notFoundHtml = await deps.generate404Html(
            "The requested location was not found or has no published projects.",
          );
          res
            .status(404)
            .setHeader("Content-Type", "text/html; charset=utf-8")
            .setHeader("Cache-Control", CACHE_POLICY_NOT_FOUND)
            .send(notFoundHtml);
          return;
        }

        res
          .status(200)
          .setHeader("Content-Type", "text/html; charset=utf-8")
          .setHeader("Cache-Control", CACHE_POLICY_LONG)
          .send(html);
      } catch (error) {
        await handleRouteError(res, "/seo/location", error, deps);
      }
    },
  );

  /**
   * 5. GET /seo/city-hub - Pune City Hub SEO Document
   */
  router.get("/seo/city-hub", async (_req: Request, res: Response, _next: NextFunction) => {
    try {
      const html = await deps.generateCityHubHtml();
      res
        .status(200)
        .setHeader("Content-Type", "text/html; charset=utf-8")
        .setHeader("Cache-Control", CACHE_POLICY_LONG)
        .send(html);
    } catch (error) {
      await handleRouteError(res, "/seo/city-hub", error, deps);
    }
  });

  /**
   * 6. GET /sitemap.xml - Dynamic Search Engine XML Sitemap
   */
  router.get("/sitemap.xml", async (_req: Request, res: Response, _next: NextFunction) => {
    try {
      const xml = await deps.generateSitemapXml();
      res
        .status(200)
        .setHeader("Content-Type", "application/xml; charset=utf-8")
        .setHeader(
          "Cache-Control",
          "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
        )
        .send(xml);
    } catch (error) {
      console.error("SEO /sitemap.xml error:", error);
      if (!res.headersSent) {
        res
          .status(500)
          .setHeader("Content-Type", "application/xml; charset=utf-8")
          .setHeader("Cache-Control", CACHE_POLICY_ERROR)
          .send(
            '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>',
          );
      }
    }
  });

  /**
   * 7. GET /robots.txt - Search Engine Directives
   */
  router.get("/robots.txt", (_req: Request, res: Response) => {
    try {
      const txt = deps.generateRobotsTxt();
      res
        .status(200)
        .setHeader("Content-Type", "text/plain; charset=utf-8")
        .setHeader("Cache-Control", "public, max-age=86400, s-maxage=86400")
        .send(txt);
    } catch (error) {
      console.error("SEO /robots.txt error:", error);
      if (!res.headersSent) {
        res
          .status(500)
          .setHeader("Content-Type", "text/plain; charset=utf-8")
          .setHeader("Cache-Control", CACHE_POLICY_ERROR)
          .send("User-agent: *\nAllow: /\n");
      }
    }
  });

  return router;
}

const defaultRouter = createSeoRouter();
export default defaultRouter;
