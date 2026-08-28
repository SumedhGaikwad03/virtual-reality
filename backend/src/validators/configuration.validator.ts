/*
 * PURPOSE:
 * Request validation middlewares for configuration endpoints.
 *
 * FLOW:
 * Admin Configuration Validation Flow
 *
 * RESPONSIBILITY:
 * Validates request parameters (projectId, id) and request body payloads for creating and updating
 * configurations, enforcing positive integers for BHK and area fields, whole-number strings for price,
 * and valid AvailabilityStatus enums.
 */

import type { NextFunction, Request, Response } from "express";

export type AdminCreateConfigurationBody = {
  name?: unknown;
  bhk?: unknown;
  carpetArea?: unknown;
  builtUpArea?: unknown;
  superBuiltUpArea?: unknown;
  priceFrom?: unknown;
  availabilityStatus?: unknown;
};

export type AdminUpdateConfigurationBody = AdminCreateConfigurationBody;

const availabilityStatuses = new Set(["AVAILABLE", "LIMITED", "SOLD_OUT"]);
const createFields = [
  "name",
  "bhk",
  "carpetArea",
  "builtUpArea",
  "superBuiltUpArea",
  "priceFrom",
  "availabilityStatus",
];

function validationError(message: string) {
  const error = new Error(message);
  error.name = "ConfigurationValidationError";
  Object.assign(error, {
    code: "INVALID_CONFIGURATION_REQUEST",
    statusCode: 400,
  });
  return error;
}

// Enforces that numeric values like BHK, carpetArea, and builtUpArea are positive whole integers
function isPositiveInteger(value: unknown) {
  return typeof value === "number" && Number.isSafeInteger(value) && value > 0;
}

// Enforces that priceFrom is a string containing only digits representing paise
function isPriceString(value: unknown) {
  return typeof value === "string" && /^\d+$/.test(value);
}

function isValidOptionalNumber(value: unknown) {
  return value === undefined || isPositiveInteger(value);
}

function hasOnlyAllowedFields(body: object) {
  return Object.keys(body).every((key) => createFields.includes(key));
}

function hasValidCommonFields(body: AdminCreateConfigurationBody) {
  return (
    typeof body.name === "string" &&
    body.name.trim() !== "" &&
    isPositiveInteger(body.bhk) &&
    isPositiveInteger(body.carpetArea) &&
    isValidOptionalNumber(body.builtUpArea) &&
    isValidOptionalNumber(body.superBuiltUpArea) &&
    isPriceString(body.priceFrom) &&
    typeof body.availabilityStatus === "string" &&
    availabilityStatuses.has(body.availabilityStatus)
  );
}

export function validateAdminCreateConfiguration(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  const body = req.body as AdminCreateConfigurationBody;

  if (!hasOnlyAllowedFields(body) || !hasValidCommonFields(body)) {
    next(validationError("Invalid configuration fields"));
    return;
  }

  next();
}

export function validateAdminUpdateConfiguration(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  const body = req.body as AdminUpdateConfigurationBody;

  if (
    !hasOnlyAllowedFields(body) ||
    (body.name !== undefined &&
      (typeof body.name !== "string" || body.name.trim() === "")) ||
    (body.bhk !== undefined && !isPositiveInteger(body.bhk)) ||
    (body.carpetArea !== undefined && !isPositiveInteger(body.carpetArea)) ||
    !isValidOptionalNumber(body.builtUpArea) ||
    !isValidOptionalNumber(body.superBuiltUpArea) ||
    (body.priceFrom !== undefined && !isPriceString(body.priceFrom)) ||
    (body.availabilityStatus !== undefined &&
      (typeof body.availabilityStatus !== "string" ||
        !availabilityStatuses.has(body.availabilityStatus)))
  ) {
    next(validationError("Invalid configuration update fields"));
    return;
  }

  next();
}

export function validateConfigurationId(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  if (typeof req.params.id !== "string" || req.params.id.trim() === "") {
    next(validationError("Configuration id is required"));
    return;
  }

  next();
}

export function validateConfigurationProjectId(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  if (
    typeof req.params.projectId !== "string" ||
    req.params.projectId.trim() === ""
  ) {
    next(validationError("Project id is required"));
    return;
  }

  next();
}
