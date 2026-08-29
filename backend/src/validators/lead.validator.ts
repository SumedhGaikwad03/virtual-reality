/*
 * PURPOSE:
 * Lead submission and update request validation middleware.
 *
 * FLOW:
 * Public Lead Capture Flow & Admin Lead Triage Flow
 *
 * RESPONSIBILITY:
 * Validates public lead inputs (name, phone, optional email, optional project/configuration IDs)
 * and administrative status/notes update payloads.
 */

import type { NextFunction, Request, Response } from "express";

export type PublicLeadBody = {
  name?: unknown;
  phone?: unknown;
  email?: unknown;
  developerId?: unknown;
  projectId?: unknown;
  configurationId?: unknown;
  message?: unknown;
};

export type AdminLeadUpdateBody = {
  status?: unknown;
  notes?: unknown;
};

const leadStatuses = new Set(["NEW", "IN_PROGRESS", "DONE"]);

function validationError(message: string) {
  const error = new Error(message);
  error.name = "LeadValidationError";
  Object.assign(error, { code: "INVALID_LEAD_REQUEST", statusCode: 400 });
  return error;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown) {
  return typeof value === "string" && value.trim() !== "";
}

function hasOnlyFields(value: unknown, fields: string[]) {
  return isRecord(value) && Object.keys(value).every((key) => fields.includes(key));
}

export function validatePublicLead(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  const body = req.body as PublicLeadBody;
  const validEmail =
    body?.email === undefined ||
    (typeof body?.email === "string" &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email));
  const validPhone =
    typeof body?.phone === "string" &&
    body.phone.trim().length >= 3 &&
    body.phone.trim().length <= 30;

  if (
    !hasOnlyFields(body, [
      "name",
      "phone",
      "email",
      "developerId",
      "projectId",
      "configurationId",
      "message",
    ]) ||
    !isNonEmptyString(body?.name) ||
    !validPhone ||
    !validEmail ||
    (body?.developerId !== undefined && !isNonEmptyString(body.developerId)) ||
    (body?.projectId !== undefined && !isNonEmptyString(body.projectId)) ||
    (body?.configurationId !== undefined &&
      !isNonEmptyString(body.configurationId)) ||
    (body?.message !== undefined && typeof body.message !== "string")
  ) {
    next(validationError("Name and a valid phone number are required"));
    return;
  }
  next();
}

export function validateLeadId(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  if (typeof req.params.id !== "string" || req.params.id.trim() === "") {
    next(validationError("Lead id is required"));
    return;
  }
  next();
}

export function validateAdminLeadUpdate(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  const body = req.body as AdminLeadUpdateBody;
  if (
    !hasOnlyFields(body, ["status", "notes"]) ||
    (body?.status !== undefined &&
      (typeof body.status !== "string" || !leadStatuses.has(body.status))) ||
    (body?.notes !== undefined &&
      body.notes !== null &&
      typeof body.notes !== "string")
  ) {
    next(validationError("Invalid lead update fields"));
    return;
  }
  next();
}
