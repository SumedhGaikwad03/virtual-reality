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
  generate404Html,
  generateSitemapXml,
  generateRobotsTxt,
} from "../../services/seo/seo-renderer.service.js";

const router = Router();

/**
 * 1. GET /seo/home - Homepage SEO Document
 */
router.get("/seo/home", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const html = await generateHomeHtml();
    res.status(200).setHeader("Content-Type", "text/html; charset=utf-8").send(html);
  } catch (error) {
    console.error("SEO /seo/home error:", error);
    res
      .status(500)
      .setHeader("Content-Type", "text/html; charset=utf-8")
      .send(generate404Html("An unexpected error occurred while loading this page."));
  }
});

/**
 * 2. GET /seo/developer/:developerSlug - Developer Page SEO Document
 */
router.get(
  "/seo/developer/:developerSlug",
  async (req: Request<{ developerSlug: string }>, res: Response, next: NextFunction) => {
    try {
      const { developerSlug } = req.params;
      const html = await generateDeveloperHtml(developerSlug);

      if (!html) {
        res
          .status(404)
          .setHeader("Content-Type", "text/html; charset=utf-8")
          .send(generate404Html("The requested developer was not found or is no longer published."));
        return;
      }

      res.status(200).setHeader("Content-Type", "text/html; charset=utf-8").send(html);
    } catch (error) {
      console.error("SEO /seo/developer error:", error);
      res
        .status(500)
        .setHeader("Content-Type", "text/html; charset=utf-8")
        .send(generate404Html("An unexpected error occurred while loading this page."));
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
    next: NextFunction,
  ) => {
    try {
      const { developerSlug, locationSlug, projectSlug } = req.params;
      const html = await generateProjectHtml(
        developerSlug,
        locationSlug,
        projectSlug,
      );

      if (!html) {
        res
          .status(404)
          .setHeader("Content-Type", "text/html; charset=utf-8")
          .send(generate404Html("The requested property was not found or is no longer published."));
        return;
      }

      res.status(200).setHeader("Content-Type", "text/html; charset=utf-8").send(html);
    } catch (error) {
      console.error("SEO /seo/project error:", error);
      res
        .status(500)
        .setHeader("Content-Type", "text/html; charset=utf-8")
        .send(generate404Html("An unexpected error occurred while loading this page."));
    }
  },
);

/**
 * 4. GET /sitemap.xml - Dynamic Search Engine XML Sitemap
 */
router.get("/sitemap.xml", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const xml = await generateSitemapXml();
    res
      .status(200)
      .setHeader("Content-Type", "application/xml; charset=utf-8")
      .setHeader("Cache-Control", "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400")
      .send(xml);
  } catch (error) {
    console.error("SEO /sitemap.xml error:", error);
    res
      .status(500)
      .setHeader("Content-Type", "application/xml; charset=utf-8")
      .send('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>');
  }
});

/**
 * 5. GET /robots.txt - Search Engine Directives
 */
router.get("/robots.txt", (_req: Request, res: Response) => {
  try {
    const txt = generateRobotsTxt();
    res
      .status(200)
      .setHeader("Content-Type", "text/plain; charset=utf-8")
      .setHeader("Cache-Control", "public, max-age=86400, s-maxage=86400")
      .send(txt);
  } catch (error) {
    console.error("SEO /robots.txt error:", error);
    res.status(500).setHeader("Content-Type", "text/plain; charset=utf-8").send("User-agent: *\nAllow: /\n");
  }
});

export default router;
