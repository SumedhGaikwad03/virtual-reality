/*
 * PURPOSE:
 * Validates admin location snapshot update payloads.
 *
 * FLOW:
 * Authenticated request -> validateLocationUpdate -> location controller.
 *
 * RESPONSIBILITY:
 * Enforces strict coordinate validation and rejects client identity tampering.
 */

import type { NextFunction, Request, Response } from "express";

export type UpdateLocationRequestBody = {
  latitude?: unknown;
  longitude?: unknown;
};

function validationError(message: string) {
  const error = new Error(message);
  error.name = "LocationValidationError";
  Object.assign(error, {
    code: "INVALID_LOCATION_REQUEST",
    statusCode: 400,
  });
  return error;
}

function hasOnlyFields(value: unknown, fields: string[]) {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    Object.keys(value).every((key) => fields.includes(key))
  );
}

export function validateLocationUpdate(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  const body = req.body as UpdateLocationRequestBody;

  if (
    !body ||
    !hasOnlyFields(body, ["latitude", "longitude"])
  ) {
    next(validationError("Request body must contain only latitude and longitude"));
    return;
  }

  if (
    typeof body.latitude !== "number" ||
    !Number.isFinite(body.latitude) ||
    body.latitude < -90 ||
    body.latitude > 90
  ) {
    next(validationError("Latitude must be a finite number between -90 and 90"));
    return;
  }

  if (
    typeof body.longitude !== "number" ||
    !Number.isFinite(body.longitude) ||
    body.longitude < -180 ||
    body.longitude > 180
  ) {
    next(validationError("Longitude must be a finite number between -180 and 180"));
    return;
  }

  next();
}
