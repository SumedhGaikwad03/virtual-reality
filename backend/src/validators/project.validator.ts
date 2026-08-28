/*
 * PURPOSE:
 * Request validation middlewares for project endpoints.
 *
 * FLOW:
 * Public Project Discovery Flow & Admin Project Management Flow
 *
 * RESPONSIBILITY:
 * Validates request params (developerSlug, locationSlug, projectSlug) for public project requests
 * and validates body payloads (enums, types, required fields) for admin create/update requests.
 */

import type { NextFunction, Request, Response } from "express";

export type AdminCreateProjectBody = {
  developerId?: unknown;
  name?: unknown;
  slug?: unknown;
  description?: unknown;
  locationName?: unknown;
  locationSlug?: unknown;
  address?: unknown;
  mapsUrl?: unknown;
  status?: unknown;
  featured?: unknown;
  publishStatus?: unknown;
};

export type AdminUpdateProjectBody = AdminCreateProjectBody;

const projectStatuses = new Set([
  "UPCOMING",
  "ONGOING",
  "READY_TO_MOVE",
  "COMPLETED",
  "SOLD_OUT",
]);

const publishStatuses = new Set(["DRAFT", "PUBLISHED"]);

function adminProjectValidationError(message: string) {
  const error = new Error(message);
  error.name = "AdminProjectValidationError";
  Object.assign(error, {
    code: "INVALID_PROJECT_REQUEST",
    statusCode: 400,
  });
  return error;
}

function isNonEmptyString(value: unknown) {
  return typeof value === "string" && value.trim() !== "";
}

function isOptionalString(value: unknown) {
  return value === undefined || typeof value === "string";
}

/*
 * URL Protocol Security:
 * Strictly enforces http: and https: protocols on mapsUrl to prevent
 * Stored XSS via executable or browser-sensitive schemes (e.g. javascript:, data:, vbscript:).
 */
function isValidOptionalHttpUrl(value: unknown): boolean {
  if (value === undefined || value === null || value === "") {
    return true;
  }

  if (typeof value !== "string") {
    return false;
  }

  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function hasValidOptionalFields(body: AdminCreateProjectBody) {
  return (
    isOptionalString(body.description) &&
    isValidOptionalHttpUrl(body.mapsUrl) &&
    (body.featured === undefined || typeof body.featured === "boolean") &&
    (body.publishStatus === undefined ||
      (typeof body.publishStatus === "string" &&
        publishStatuses.has(body.publishStatus)))
  );
}

export function validateAdminCreateProject(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  const body = req.body as AdminCreateProjectBody;

  if (
    !isNonEmptyString(body.developerId) ||
    !isNonEmptyString(body.name) ||
    !isNonEmptyString(body.slug) ||
    !isNonEmptyString(body.locationName) ||
    !isNonEmptyString(body.locationSlug) ||
    !isNonEmptyString(body.address) ||
    typeof body.status !== "string" ||
    !projectStatuses.has(body.status) ||
    !hasValidOptionalFields(body)
  ) {
    next(adminProjectValidationError("Invalid project fields"));
    return;
  }

  next();
}

export function validateAdminUpdateProject(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  const body = req.body as AdminUpdateProjectBody;
  const allowedFields = [
    "developerId",
    "name",
    "slug",
    "description",
    "locationName",
    "locationSlug",
    "address",
    "mapsUrl",
    "status",
    "featured",
    "publishStatus",
  ];
  const hasOnlyAllowedFields = Object.keys(body).every((key) =>
    allowedFields.includes(key),
  );
  const nonEmptyFields = [
    body.developerId,
    body.name,
    body.slug,
    body.locationName,
    body.locationSlug,
    body.address,
  ];

  if (
    !hasOnlyAllowedFields ||
    nonEmptyFields.some(
      (value) => value !== undefined && !isNonEmptyString(value),
    ) ||
    (body.status !== undefined &&
      (typeof body.status !== "string" || !projectStatuses.has(body.status))) ||
    !hasValidOptionalFields(body)
  ) {
    next(adminProjectValidationError("Invalid project update fields"));
    return;
  }

  next();
}

export function validateAdminProjectId(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  if (typeof req.params.id !== "string" || req.params.id.trim() === "") {
    next(adminProjectValidationError("Project id is required"));
    return;
  }

  next();
}

export function validateProjectParams(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  const { developerSlug, locationSlug, projectSlug } = req.params;

  if (
    typeof developerSlug !== "string" ||
    developerSlug.trim() === "" ||
    typeof locationSlug !== "string" ||
    locationSlug.trim() === "" ||
    typeof projectSlug !== "string" ||
    projectSlug.trim() === ""
  ) {
    const error = new Error("Invalid project route parameters");
    error.name = "InvalidProjectParamsError";
    Object.assign(error, {
      code: "INVALID_PROJECT_PARAMS",
      statusCode: 400,
    });
    next(error);
    return;
  }

  next();
}
