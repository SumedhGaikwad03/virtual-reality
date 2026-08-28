/*
 * PURPOSE:
 * Express application bootstrap, HTTP security header configuration, CORS policy enforcement,
 * route mounting, and centralized error handling.
 *
 * FLOW:
 * Application Entry & Middleware Flow
 *
 * RESPONSIBILITY:
 * Mounts Helmet security headers, CORS origin whitelisting, API routes, and global error handling.
 */

import express from "express";
import helmet from "helmet";
import cors from "cors";

import authRoutes from "./routes/admin/auth.routes.js";
import adminDeveloperRoutes from "./routes/admin/developer.routes.js";
import adminProjectRoutes from "./routes/admin/project.routes.js";
import adminMediaRoutes from "./routes/admin/media.routes.js";
import adminLeadRoutes from "./routes/admin/lead.routes.js";
import adminImportRoutes from "./routes/admin/import.routes.js";
import {
  configurationRouter,
  projectRouter as projectConfigurationRouter,
} from "./routes/admin/configuration.routes.js";
import developerRoutes from "./routes/public/developer.routes.js";
import projectRoutes from "./routes/public/project.routes.js";
import searchRoutes from "./routes/public/search.routes.js";
import siteRoutes from "./routes/public/site.routes.js";
import leadRoutes from "./routes/public/lead.routes.js";

const app = express();

/*
 * Security Headers (Helmet):
 * Applies baseline security headers (X-Content-Type-Options: nosniff, Referrer-Policy, X-Frame-Options: SAMEORIGIN).
 * - contentSecurityPolicy is disabled at the API boundary because this is a JSON REST service, not an HTML server.
 * - crossOriginResourcePolicy is set to 'cross-origin' to permit frontend consumption across different origins/ports.
 * - HSTS is only active in production to avoid forcing HTTPS on local HTTP development servers.
 */
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
    hsts: process.env.NODE_ENV === "production" ? undefined : false,
  }),
);

/*
 * Cross-Origin Resource Sharing (CORS):
 * Restricts browser-initiated requests to authorized frontend origins.
 * - In production: checks environment-defined ALLOWED_ORIGINS/CORS_ORIGIN, falling back to official production domains.
 * - In development: permits standard Vite local development origins (localhost / 127.0.0.1 on any local port).
 * - Supports preflight caching (24h) and standard methods/headers used by public and admin API clients.
 */
function getCorsOrigins(): string[] {
  const envOrigins = process.env.ALLOWED_ORIGINS || process.env.CORS_ORIGIN;
  if (envOrigins) {
    return envOrigins
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean);
  }

  return [
    "https://www.virtual2reality.in",
    "https://virtual2reality.in",
    "http://localhost:5173",
    "http://localhost:4173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
  ];
}

const allowedOrigins = getCorsOrigins();

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser requests (e.g. server-to-server, curl, Postman) where origin is undefined
      if (!origin) {
        callback(null, true);
        return;
      }

      const isDev = process.env.NODE_ENV !== "production";
      const isLocalhost = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(
        origin,
      );

      if (allowedOrigins.includes(origin) || (isDev && isLocalhost)) {
        callback(null, true);
      } else {
        // Disallow origin by omitting CORS headers (clean browser-side blocking without 500 crashes)
        callback(null, false);
      }
    },
    methods: ["GET", "POST", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    maxAge: 86400,
  }),
);


app.use("/api/developers", projectRoutes);
app.use("/api/developers", developerRoutes);
app.use("/api/search", searchRoutes);
//console.log("SEARCH ROUTES REGISTERED");
app.use("/api/site", siteRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/admin/auth", authRoutes);
app.use("/api/admin/developers", adminDeveloperRoutes);
app.use("/api/admin/projects", adminProjectRoutes);
app.use("/api/admin/projects/:projectId/configurations", projectConfigurationRouter);
app.use("/api/admin/configurations", configurationRouter);
app.use("/api/admin/media", adminMediaRoutes);
app.use("/api/admin/leads", adminLeadRoutes);
app.use("/api/admin/import", adminImportRoutes);

app.use((error: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (error?.code === "PROJECT_NOT_FOUND") {
    res.status(404).json({
      error: {
        code: "PROJECT_NOT_FOUND",
        message: "Project not found",
      },
    });
    return;
  }

  if (error?.code === "INVALID_PROJECT_PARAMS") {
    res.status(400).json({
      error: {
        code: "INVALID_PROJECT_PARAMS",
        message: "Invalid project route parameters",
      },
    });
    return;
  }

  if (error?.code === "DEVELOPER_NOT_FOUND") {
    res.status(404).json({
      error: {
        code: "DEVELOPER_NOT_FOUND",
        message: "Developer not found",
      },
    });
    return;
  }

  if (error?.code === "INVALID_DEVELOPER_PARAMS") {
    res.status(400).json({
      error: {
        code: "INVALID_DEVELOPER_PARAMS",
        message: "Invalid developer route parameters",
      },
    });
    return;
  }

  if (error?.code === "AUTHENTICATION_FAILED") {
    res.status(401).json({
      error: {
        code: "AUTHENTICATION_FAILED",
        message: "Invalid email or password",
      },
    });
    return;
  }

  if (error?.code === "INVALID_RESET_TOKEN") {
    res.status(400).json({
      error: {
        code: "INVALID_RESET_TOKEN",
        message: "Invalid or expired password reset token",
      },
    });
    return;
  }

  if (error?.code === "INVALID_AUTH_REQUEST") {
    res.status(400).json({
      error: {
        code: "INVALID_AUTH_REQUEST",
        message: error.message,
      },
    });
    return;
  }

  if (error?.code === "AUTHENTICATION_REQUIRED") {
    res.status(401).json({
      error: {
        code: "AUTHENTICATION_REQUIRED",
        message: "Authentication required",
      },
    });
    return;
  }

  if (error?.code === "DEVELOPER_SLUG_EXISTS") {
    res.status(409).json({
      error: {
        code: "DEVELOPER_SLUG_EXISTS",
        message: "Developer slug already exists",
      },
    });
    return;
  }

  if (error?.code === "INVALID_DEVELOPER_REQUEST") {
    res.status(400).json({
      error: {
        code: "INVALID_DEVELOPER_REQUEST",
        message: error.message,
      },
    });
    return;
  }

  if (error?.code === "PROJECT_SLUG_EXISTS") {
    res.status(409).json({
      error: {
        code: "PROJECT_SLUG_EXISTS",
        message: "Project slug already exists",
      },
    });
    return;
  }

  if (error?.code === "INVALID_PROJECT_REQUEST") {
    res.status(400).json({
      error: {
        code: "INVALID_PROJECT_REQUEST",
        message: error.message,
      },
    });
    return;
  }

  if (error?.code === "CONFIGURATION_NOT_FOUND") {
    res.status(404).json({
      error: {
        code: "CONFIGURATION_NOT_FOUND",
        message: "Configuration not found",
      },
    });
    return;
  }

  if (error?.code === "INVALID_CONFIGURATION_REQUEST") {
    res.status(400).json({
      error: {
        code: "INVALID_CONFIGURATION_REQUEST",
        message: error.message,
      },
    });
    return;
  }

  if (error?.code === "INVALID_MEDIA_OWNER") {
    res.status(400).json({
      error: {
        code: "INVALID_MEDIA_OWNER",
        message: "Media must belong to either a project or a configuration",
      },
    });
    return;
  }

  if (error?.code === "INVALID_MEDIA_REQUEST") {
    res.status(400).json({
      error: {
        code: "INVALID_MEDIA_REQUEST",
        message: error.message,
      },
    });
    return;
  }

  if (error?.code === "MEDIA_NOT_FOUND") {
    res.status(404).json({
      error: {
        code: "MEDIA_NOT_FOUND",
        message: "Media not found",
      },
    });
    return;
  }

  if (error?.code === "MEDIA_STORAGE_NOT_CONFIGURED") {
    res.status(500).json({
      error: {
        code: "MEDIA_STORAGE_NOT_CONFIGURED",
        message: "Media storage is not configured",
      },
    });
    return;
  }

  if (error?.code === "MEDIA_STORAGE_ERROR") {
    res.status(502).json({
      error: {
        code: "MEDIA_STORAGE_ERROR",
        message: "Media storage operation failed",
      },
    });
    return;
  }

  if (error?.code === "LIMIT_FILE_SIZE") {
    res.status(400).json({
      error: {
        code: "MEDIA_FILE_TOO_LARGE",
        message: "Media file exceeds the allowed size",
      },
    });
    return;
  }

  if (error?.code === "CONFIGURATION_PROJECT_MISMATCH") {
    res.status(400).json({
      error: {
        code: "CONFIGURATION_PROJECT_MISMATCH",
        message: "Configuration does not belong to the specified project",
      },
    });
    return;
  }

  if (error?.code === "LEAD_NOT_FOUND") {
    res.status(404).json({
      error: { code: "LEAD_NOT_FOUND", message: "Lead not found" },
    });
    return;
  }

  if (error?.code === "INVALID_LEAD_REQUEST") {
    res.status(400).json({
      error: { code: "INVALID_LEAD_REQUEST", message: error.message },
    });
    return;
  }

  if (error?.code === "INVALID_IMPORT_REQUEST") {
    res.status(400).json({
      error: { code: "INVALID_IMPORT_REQUEST", message: error.message },
    });
    return;
  }

  if (error?.code === "IMPORT_ANALYZE_FAILED") {
    res.status(502).json({
      error: { code: "IMPORT_ANALYZE_FAILED", message: "Unable to analyze this page" },
    });
    return;
  }

  if (error?.code === "SEARCH_QUERY_REQUIRED" || error?.code === "SEARCH_QUERY_TOO_LONG") {
    res.status(400).json({
      error: {
        code: error.code,
        message: error.message,
      },
    });
    return;
  }


  console.error(error);
  res.status(500).json({
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "Internal server error",
    },
  });
});

export default app;
