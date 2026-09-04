/*
 * PURPOSE:
 * Lead submission, update, and query request validation middleware.
 *
 * FLOW:
 * Public Lead Capture Flow & Admin Lead CRUD Flow
 *
 * RESPONSIBILITY:
 * Validates public lead capture, administrative manual lead creation, partial updates, ID parameters, and query options.
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

export type AdminLeadCreateBody = {
  name?: unknown;
  phone?: unknown;
  email?: unknown;
  developerId?: unknown;
  projectId?: unknown;
  configurationId?: unknown;
  message?: unknown;
  status?: unknown;
  notes?: unknown;
};

export type AdminLeadUpdateBody = {
  name?: unknown;
  phone?: unknown;
  email?: unknown;
  developerId?: unknown;
  projectId?: unknown;
  configurationId?: unknown;
  message?: unknown;
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

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim() !== "";
}

function hasOnlyFields(value: unknown, fields: string[]) {
  return isRecord(value) && Object.keys(value).every((key) => fields.includes(key));
}

export function normalizeIndianPhone(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const cleaned = raw.trim().replace(/[\s\-\(\)\.]/g, "");
  const match = cleaned.match(/^(?:\+?91|0)?([6-9]\d{9})$/);
  if (!match) return null;
  return `+91${match[1]}`;
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
  const normalizedPhone = normalizeIndianPhone(body?.phone);

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
    !normalizedPhone ||
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
  body.phone = normalizedPhone;
  next();
}

export function validateCreateAdminLead(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  const body = req.body as AdminLeadCreateBody;
  const validEmail =
    body?.email === undefined ||
    body?.email === null ||
    body?.email === "" ||
    (typeof body?.email === "string" &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email));
  const normalizedPhone = normalizeIndianPhone(body?.phone);

  if (
    !hasOnlyFields(body, [
      "name",
      "phone",
      "email",
      "developerId",
      "projectId",
      "configurationId",
      "message",
      "status",
      "notes",
    ]) ||
    !isNonEmptyString(body?.name) ||
    !normalizedPhone ||
    !validEmail ||
    (body?.developerId !== undefined &&
      body?.developerId !== null &&
      !isNonEmptyString(body.developerId)) ||
    (body?.projectId !== undefined &&
      body?.projectId !== null &&
      !isNonEmptyString(body.projectId)) ||
    (body?.configurationId !== undefined &&
      body?.configurationId !== null &&
      !isNonEmptyString(body.configurationId)) ||
    (body?.message !== undefined &&
      body?.message !== null &&
      typeof body.message !== "string") ||
    (body?.status !== undefined &&
      (typeof body.status !== "string" || !leadStatuses.has(body.status))) ||
    (body?.notes !== undefined &&
      body?.notes !== null &&
      typeof body.notes !== "string")
  ) {
    next(validationError("Name, valid phone, and valid lead fields are required"));
    return;
  }

  body.phone = normalizedPhone;
  if (body.email === "") body.email = null;
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
    !hasOnlyFields(body, [
      "name",
      "phone",
      "email",
      "developerId",
      "projectId",
      "configurationId",
      "message",
      "status",
      "notes",
    ])
  ) {
    next(validationError("Invalid lead update fields"));
    return;
  }

  if (body?.name !== undefined && !isNonEmptyString(body.name)) {
    next(validationError("Lead name cannot be empty"));
    return;
  }

  if (body?.phone !== undefined) {
    const normalized = normalizeIndianPhone(body.phone);
    if (!normalized) {
      next(validationError("A valid phone number is required"));
      return;
    }
    body.phone = normalized;
  }

  if (
    body?.email !== undefined &&
    body.email !== null &&
    body.email !== "" &&
    (typeof body.email !== "string" ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email))
  ) {
    next(validationError("Invalid email address format"));
    return;
  }
  if (body?.email === "") body.email = null;

  if (
    body?.developerId !== undefined &&
    body.developerId !== null &&
    !isNonEmptyString(body.developerId)
  ) {
    next(validationError("Invalid developer ID"));
    return;
  }

  if (
    body?.projectId !== undefined &&
    body.projectId !== null &&
    !isNonEmptyString(body.projectId)
  ) {
    next(validationError("Invalid project ID"));
    return;
  }

  if (
    body?.configurationId !== undefined &&
    body.configurationId !== null &&
    !isNonEmptyString(body.configurationId)
  ) {
    next(validationError("Invalid configuration ID"));
    return;
  }

  if (
    body?.message !== undefined &&
    body.message !== null &&
    typeof body.message !== "string"
  ) {
    next(validationError("Invalid message format"));
    return;
  }

  if (
    body?.status !== undefined &&
    (typeof body.status !== "string" || !leadStatuses.has(body.status))
  ) {
    next(validationError("Invalid lead status"));
    return;
  }

  if (
    body?.notes !== undefined &&
    body.notes !== null &&
    typeof body.notes !== "string"
  ) {
    next(validationError("Invalid notes format"));
    return;
  }

  next();
}

export function validateListLeadsQuery(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  const { page, limit, status, search, developerId, projectId, configurationId } = req.query;

  if (page !== undefined) {
    const parsedPage = Number(page);
    if (!Number.isInteger(parsedPage) || parsedPage < 1) {
      next(validationError("Page query parameter must be a positive integer"));
      return;
    }
  }

  if (limit !== undefined) {
    const parsedLimit = Number(limit);
    if (!Number.isInteger(parsedLimit) || parsedLimit < 1 || parsedLimit > 100) {
      next(validationError("Limit query parameter must be an integer between 1 and 100"));
      return;
    }
  }

  if (status !== undefined && (typeof status !== "string" || !leadStatuses.has(status))) {
    next(validationError("Invalid status query parameter"));
    return;
  }

  if (search !== undefined && typeof search !== "string") {
    next(validationError("Search parameter must be a string"));
    return;
  }

  if (developerId !== undefined && typeof developerId !== "string") {
    next(validationError("Developer ID parameter must be a string"));
    return;
  }

  if (projectId !== undefined && typeof projectId !== "string") {
    next(validationError("Project ID parameter must be a string"));
    return;
  }

  if (configurationId !== undefined && typeof configurationId !== "string") {
    next(validationError("Configuration ID parameter must be a string"));
    return;
  }

  next();
}
