/*
 * PURPOSE:
 * Rental domain submission, update, and query validation middleware.
 *
 * FLOW:
 * Public Rental Submissions & Admin Rental Management Flows
 *
 * RESPONSIBILITY:
 * Validates and normalizes public renter requirements, public owner property submissions,
 * administrative updates, ID parameters, and query parameters.
 */

import type { NextFunction, Request, Response } from "express";
import { normalizeIndianPhone } from "./lead.validator.js";

export type PublicRentalEnquiryBody = {
  name?: unknown;
  phone?: unknown;
  configuration?: unknown;
  location?: unknown;
  areaLocality?: unknown;
  budget?: unknown;
  furnishing?: unknown;
  moveInTimeframe?: unknown;
  whoIsFor?: unknown;
  notes?: unknown;
};

export type PublicRentalPropertyBody = {
  ownerName?: unknown;
  phone?: unknown;
  flatType?: unknown;
  approxSizeSqFt?: unknown;
  location?: unknown;
  areaLocality?: unknown;
  societyDeveloper?: unknown;
  additionalDetails?: unknown;
};

export type AdminRentalEnquiryCreateBody = {
  name?: unknown;
  phone?: unknown;
  configuration?: unknown;
  location?: unknown;
  areaLocality?: unknown;
  budget?: unknown;
  furnishing?: unknown;
  moveInTimeframe?: unknown;
  whoIsFor?: unknown;
  notes?: unknown;
  status?: unknown;
  internalNotes?: unknown;
};

export type AdminRentalPropertyCreateBody = {
  ownerName?: unknown;
  phone?: unknown;
  flatType?: unknown;
  approxSizeSqFt?: unknown;
  location?: unknown;
  areaLocality?: unknown;
  societyDeveloper?: unknown;
  additionalDetails?: unknown;
  status?: unknown;
  internalNotes?: unknown;
};

export type AdminRentalEnquiryUpdateBody = {
  name?: unknown;
  phone?: unknown;
  configuration?: unknown;
  location?: unknown;
  areaLocality?: unknown;
  budget?: unknown;
  furnishing?: unknown;
  moveInTimeframe?: unknown;
  whoIsFor?: unknown;
  notes?: unknown;
  status?: unknown;
  internalNotes?: unknown;
};

export type AdminRentalPropertyUpdateBody = {
  ownerName?: unknown;
  phone?: unknown;
  flatType?: unknown;
  approxSizeSqFt?: unknown;
  location?: unknown;
  areaLocality?: unknown;
  societyDeveloper?: unknown;
  additionalDetails?: unknown;
  status?: unknown;
  internalNotes?: unknown;
};

const rentalEnquiryStatuses = new Set([
  "NEW",
  "CONTACTED",
  "MATCHED",
  "CLOSED",
  "ARCHIVED",
]);

const rentalPropertyStatuses = new Set([
  "NEW",
  "VERIFIED",
  "AVAILABLE",
  "RENTED",
  "ARCHIVED",
]);

function validationError(message: string) {
  const error = new Error(message);
  error.name = "RentalValidationError";
  Object.assign(error, { code: "INVALID_RENTAL_REQUEST", statusCode: 400 });
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

/*
 * -------------------------------------------------------------
 * PUBLIC RENTER ENQUIRY VALIDATION
 * Required: name, phone, configuration, and at least location OR areaLocality
 * Optional: budget, furnishing, moveInTimeframe, whoIsFor, notes
 * -------------------------------------------------------------
 */
export function validatePublicRentalEnquiry(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  const body = req.body as PublicRentalEnquiryBody;

  if (
    !hasOnlyFields(body, [
      "name",
      "phone",
      "configuration",
      "location",
      "areaLocality",
      "budget",
      "furnishing",
      "moveInTimeframe",
      "whoIsFor",
      "notes",
    ])
  ) {
    next(validationError("Invalid rental enquiry fields provided"));
    return;
  }

  if (!isNonEmptyString(body?.name) || body.name.trim().length > 100) {
    next(validationError("Name is required and must be under 100 characters"));
    return;
  }

  const normalizedPhone = normalizeIndianPhone(body?.phone);
  if (!normalizedPhone) {
    next(validationError("A valid 10-digit Indian phone number is required"));
    return;
  }

  if (!isNonEmptyString(body?.configuration) || body.configuration.trim().length > 50) {
    next(validationError("Configuration (e.g. 2 BHK) is required and must be under 50 characters"));
    return;
  }

  const hasLocation = isNonEmptyString(body?.location);
  const hasAreaLocality = isNonEmptyString(body?.areaLocality);
  if (!hasLocation && !hasAreaLocality) {
    next(validationError("Preferred location or area/locality is required"));
    return;
  }

  if (body?.location !== undefined && typeof body.location === "string" && body.location.trim().length > 100) {
    next(validationError("Location must be under 100 characters"));
    return;
  }

  if (body?.areaLocality !== undefined && typeof body.areaLocality === "string" && body.areaLocality.trim().length > 150) {
    next(validationError("Area/locality must be under 150 characters"));
    return;
  }

  if (body?.budget !== undefined && typeof body.budget === "string" && body.budget.trim().length > 100) {
    next(validationError("Budget info must be under 100 characters"));
    return;
  }

  if (body?.furnishing !== undefined && typeof body.furnishing === "string" && body.furnishing.trim().length > 50) {
    next(validationError("Furnishing preference must be under 50 characters"));
    return;
  }

  if (body?.moveInTimeframe !== undefined && typeof body.moveInTimeframe === "string" && body.moveInTimeframe.trim().length > 50) {
    next(validationError("Move-in timeframe must be under 50 characters"));
    return;
  }

  if (body?.whoIsFor !== undefined && typeof body.whoIsFor === "string" && body.whoIsFor.trim().length > 50) {
    next(validationError("Who this is for must be under 50 characters"));
    return;
  }

  if (body?.notes !== undefined && typeof body.notes === "string" && body.notes.trim().length > 2000) {
    next(validationError("Notes must be under 2000 characters"));
    return;
  }

  // Normalize trimmed fields
  body.name = body.name.trim();
  body.phone = normalizedPhone;
  body.configuration = body.configuration.trim();
  if (typeof body.location === "string") body.location = body.location.trim() || undefined;
  if (typeof body.areaLocality === "string") body.areaLocality = body.areaLocality.trim() || undefined;
  if (typeof body.budget === "string") body.budget = body.budget.trim() || undefined;
  if (typeof body.furnishing === "string") body.furnishing = body.furnishing.trim() || undefined;
  if (typeof body.moveInTimeframe === "string") body.moveInTimeframe = body.moveInTimeframe.trim() || undefined;
  if (typeof body.whoIsFor === "string") body.whoIsFor = body.whoIsFor.trim() || undefined;
  if (typeof body.notes === "string") body.notes = body.notes.trim() || undefined;

  next();
}

/*
 * -------------------------------------------------------------
 * PUBLIC OWNER PROPERTY SUBMISSION VALIDATION
 * Required: ownerName, phone, flatType, and at least location OR areaLocality
 * Optional: approxSizeSqFt, societyDeveloper, additionalDetails
 * -------------------------------------------------------------
 */
export function validatePublicRentalProperty(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  const body = req.body as PublicRentalPropertyBody;

  if (
    !hasOnlyFields(body, [
      "ownerName",
      "phone",
      "flatType",
      "approxSizeSqFt",
      "location",
      "areaLocality",
      "societyDeveloper",
      "additionalDetails",
    ])
  ) {
    next(validationError("Invalid rental property fields provided"));
    return;
  }

  if (!isNonEmptyString(body?.ownerName) || body.ownerName.trim().length > 100) {
    next(validationError("Owner name is required and must be under 100 characters"));
    return;
  }

  const normalizedPhone = normalizeIndianPhone(body?.phone);
  if (!normalizedPhone) {
    next(validationError("A valid 10-digit Indian phone number is required"));
    return;
  }

  if (!isNonEmptyString(body?.flatType) || body.flatType.trim().length > 50) {
    next(validationError("Flat type (e.g. 2 BHK) is required and must be under 50 characters"));
    return;
  }

  const hasLocation = isNonEmptyString(body?.location);
  const hasAreaLocality = isNonEmptyString(body?.areaLocality);
  if (!hasLocation && !hasAreaLocality) {
    next(validationError("Property location or area/locality is required"));
    return;
  }

  if (body?.approxSizeSqFt !== undefined && body.approxSizeSqFt !== null && body.approxSizeSqFt !== "") {
    const parsed = Number(body.approxSizeSqFt);
    if (!Number.isInteger(parsed) || parsed <= 0 || parsed > 50000) {
      next(validationError("Approximate size must be a positive integer under 50,000 sq ft"));
      return;
    }
    body.approxSizeSqFt = parsed;
  } else {
    body.approxSizeSqFt = undefined;
  }

  if (body?.location !== undefined && typeof body.location === "string" && body.location.trim().length > 100) {
    next(validationError("Location must be under 100 characters"));
    return;
  }

  if (body?.areaLocality !== undefined && typeof body.areaLocality === "string" && body.areaLocality.trim().length > 150) {
    next(validationError("Area/locality must be under 150 characters"));
    return;
  }

  if (body?.societyDeveloper !== undefined && typeof body.societyDeveloper === "string" && body.societyDeveloper.trim().length > 150) {
    next(validationError("Society/developer name must be under 150 characters"));
    return;
  }

  if (body?.additionalDetails !== undefined && typeof body.additionalDetails === "string" && body.additionalDetails.trim().length > 3000) {
    next(validationError("Additional details must be under 3000 characters"));
    return;
  }

  // Normalize trimmed fields
  body.ownerName = body.ownerName.trim();
  body.phone = normalizedPhone;
  body.flatType = body.flatType.trim();
  if (typeof body.location === "string") body.location = body.location.trim() || undefined;
  if (typeof body.areaLocality === "string") body.areaLocality = body.areaLocality.trim() || undefined;
  if (typeof body.societyDeveloper === "string") body.societyDeveloper = body.societyDeveloper.trim() || undefined;
  if (typeof body.additionalDetails === "string") body.additionalDetails = body.additionalDetails.trim() || undefined;

  next();
}

/*
 * -------------------------------------------------------------
 * ADMIN MANUAL RENTAL ENQUIRY CREATION VALIDATION
 * Required: name, phone, configuration, and at least location OR areaLocality
 * Optional: budget, furnishing, moveInTimeframe, whoIsFor, notes, status, internalNotes
 * -------------------------------------------------------------
 */
export function validateAdminRentalEnquiryCreate(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  const body = req.body as AdminRentalEnquiryCreateBody;

  if (
    !hasOnlyFields(body, [
      "name",
      "phone",
      "configuration",
      "location",
      "areaLocality",
      "budget",
      "furnishing",
      "moveInTimeframe",
      "whoIsFor",
      "notes",
      "status",
      "internalNotes",
    ])
  ) {
    next(validationError("Invalid rental enquiry fields provided"));
    return;
  }

  if (!isNonEmptyString(body?.name) || body.name.trim().length > 100) {
    next(validationError("Name is required and must be under 100 characters"));
    return;
  }

  const normalizedPhone = normalizeIndianPhone(body?.phone);
  if (!normalizedPhone) {
    next(validationError("A valid 10-digit Indian phone number is required"));
    return;
  }

  if (!isNonEmptyString(body?.configuration) || body.configuration.trim().length > 50) {
    next(validationError("Configuration (e.g. 2 BHK) is required and must be under 50 characters"));
    return;
  }

  const hasLocation = isNonEmptyString(body?.location);
  const hasAreaLocality = isNonEmptyString(body?.areaLocality);
  if (!hasLocation && !hasAreaLocality) {
    next(validationError("Preferred location or area/locality is required"));
    return;
  }

  if (body?.location !== undefined && typeof body.location === "string" && body.location.trim().length > 100) {
    next(validationError("Location must be under 100 characters"));
    return;
  }

  if (body?.areaLocality !== undefined && typeof body.areaLocality === "string" && body.areaLocality.trim().length > 150) {
    next(validationError("Area/locality must be under 150 characters"));
    return;
  }

  if (body?.budget !== undefined && typeof body.budget === "string" && body.budget.trim().length > 100) {
    next(validationError("Budget info must be under 100 characters"));
    return;
  }

  if (body?.furnishing !== undefined && typeof body.furnishing === "string" && body.furnishing.trim().length > 50) {
    next(validationError("Furnishing preference must be under 50 characters"));
    return;
  }

  if (body?.moveInTimeframe !== undefined && typeof body.moveInTimeframe === "string" && body.moveInTimeframe.trim().length > 50) {
    next(validationError("Move-in timeframe must be under 50 characters"));
    return;
  }

  if (body?.whoIsFor !== undefined && typeof body.whoIsFor === "string" && body.whoIsFor.trim().length > 50) {
    next(validationError("Who this is for must be under 50 characters"));
    return;
  }

  if (body?.notes !== undefined && typeof body.notes === "string" && body.notes.trim().length > 2000) {
    next(validationError("Notes must be under 2000 characters"));
    return;
  }

  if (body?.status !== undefined && (typeof body.status !== "string" || !rentalEnquiryStatuses.has(body.status))) {
    next(validationError("Invalid rental enquiry status"));
    return;
  }

  if (body?.internalNotes !== undefined && typeof body.internalNotes === "string" && body.internalNotes.trim().length > 5000) {
    next(validationError("Internal notes must be under 5000 characters"));
    return;
  }

  // Normalize trimmed fields
  body.name = body.name.trim();
  body.phone = normalizedPhone;
  body.configuration = body.configuration.trim();
  if (typeof body.location === "string") body.location = body.location.trim() || undefined;
  if (typeof body.areaLocality === "string") body.areaLocality = body.areaLocality.trim() || undefined;
  if (typeof body.budget === "string") body.budget = body.budget.trim() || undefined;
  if (typeof body.furnishing === "string") body.furnishing = body.furnishing.trim() || undefined;
  if (typeof body.moveInTimeframe === "string") body.moveInTimeframe = body.moveInTimeframe.trim() || undefined;
  if (typeof body.whoIsFor === "string") body.whoIsFor = body.whoIsFor.trim() || undefined;
  if (typeof body.notes === "string") body.notes = body.notes.trim() || undefined;
  if (typeof body.internalNotes === "string") body.internalNotes = body.internalNotes.trim() || undefined;

  next();
}

/*
 * -------------------------------------------------------------
 * ADMIN MANUAL RENTAL PROPERTY CREATION VALIDATION
 * Required: ownerName, phone, flatType, and at least location OR areaLocality
 * Optional: approxSizeSqFt, societyDeveloper, additionalDetails, status, internalNotes
 * -------------------------------------------------------------
 */
export function validateAdminRentalPropertyCreate(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  const body = req.body as AdminRentalPropertyCreateBody;

  if (
    !hasOnlyFields(body, [
      "ownerName",
      "phone",
      "flatType",
      "approxSizeSqFt",
      "location",
      "areaLocality",
      "societyDeveloper",
      "additionalDetails",
      "status",
      "internalNotes",
    ])
  ) {
    next(validationError("Invalid rental property fields provided"));
    return;
  }

  if (!isNonEmptyString(body?.ownerName) || body.ownerName.trim().length > 100) {
    next(validationError("Owner name is required and must be under 100 characters"));
    return;
  }

  const normalizedPhone = normalizeIndianPhone(body?.phone);
  if (!normalizedPhone) {
    next(validationError("A valid 10-digit Indian phone number is required"));
    return;
  }

  if (!isNonEmptyString(body?.flatType) || body.flatType.trim().length > 50) {
    next(validationError("Flat type (e.g. 2 BHK) is required and must be under 50 characters"));
    return;
  }

  const hasLocation = isNonEmptyString(body?.location);
  const hasAreaLocality = isNonEmptyString(body?.areaLocality);
  if (!hasLocation && !hasAreaLocality) {
    next(validationError("Property location or area/locality is required"));
    return;
  }

  if (body?.approxSizeSqFt !== undefined && body.approxSizeSqFt !== null && body.approxSizeSqFt !== "") {
    const parsed = Number(body.approxSizeSqFt);
    if (!Number.isInteger(parsed) || parsed <= 0 || parsed > 50000) {
      next(validationError("Approximate size must be a positive integer under 50,000 sq ft"));
      return;
    }
    body.approxSizeSqFt = parsed;
  } else {
    body.approxSizeSqFt = undefined;
  }

  if (body?.location !== undefined && typeof body.location === "string" && body.location.trim().length > 100) {
    next(validationError("Location must be under 100 characters"));
    return;
  }

  if (body?.areaLocality !== undefined && typeof body.areaLocality === "string" && body.areaLocality.trim().length > 150) {
    next(validationError("Area/locality must be under 150 characters"));
    return;
  }

  if (body?.societyDeveloper !== undefined && typeof body.societyDeveloper === "string" && body.societyDeveloper.trim().length > 150) {
    next(validationError("Society/developer name must be under 150 characters"));
    return;
  }

  if (body?.additionalDetails !== undefined && typeof body.additionalDetails === "string" && body.additionalDetails.trim().length > 3000) {
    next(validationError("Additional details must be under 3000 characters"));
    return;
  }

  if (body?.status !== undefined && (typeof body.status !== "string" || !rentalPropertyStatuses.has(body.status))) {
    next(validationError("Invalid rental property status"));
    return;
  }

  if (body?.internalNotes !== undefined && typeof body.internalNotes === "string" && body.internalNotes.trim().length > 5000) {
    next(validationError("Internal notes must be under 5000 characters"));
    return;
  }

  // Normalize trimmed fields
  body.ownerName = body.ownerName.trim();
  body.phone = normalizedPhone;
  body.flatType = body.flatType.trim();
  if (typeof body.location === "string") body.location = body.location.trim() || undefined;
  if (typeof body.areaLocality === "string") body.areaLocality = body.areaLocality.trim() || undefined;
  if (typeof body.societyDeveloper === "string") body.societyDeveloper = body.societyDeveloper.trim() || undefined;
  if (typeof body.additionalDetails === "string") body.additionalDetails = body.additionalDetails.trim() || undefined;
  if (typeof body.internalNotes === "string") body.internalNotes = body.internalNotes.trim() || undefined;

  next();
}

/*
 * -------------------------------------------------------------
 * ADMIN RENTAL ENQUIRY UPDATE VALIDATION
 * -------------------------------------------------------------
 */
export function validateAdminRentalEnquiryUpdate(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  const body = req.body as AdminRentalEnquiryUpdateBody;

  if (
    !hasOnlyFields(body, [
      "name",
      "phone",
      "configuration",
      "location",
      "areaLocality",
      "budget",
      "furnishing",
      "moveInTimeframe",
      "whoIsFor",
      "notes",
      "status",
      "internalNotes",
    ])
  ) {
    next(validationError("Invalid rental enquiry update fields"));
    return;
  }

  if (body?.name !== undefined && (!isNonEmptyString(body.name) || body.name.trim().length > 100)) {
    next(validationError("Name must not be empty and must be under 100 characters"));
    return;
  }

  if (body?.phone !== undefined) {
    const normalized = normalizeIndianPhone(body.phone);
    if (!normalized) {
      next(validationError("A valid 10-digit Indian phone number is required"));
      return;
    }
    body.phone = normalized;
  }

  if (body?.configuration !== undefined && (!isNonEmptyString(body.configuration) || body.configuration.trim().length > 50)) {
    next(validationError("Configuration must not be empty and must be under 50 characters"));
    return;
  }

  if (body?.status !== undefined && (typeof body.status !== "string" || !rentalEnquiryStatuses.has(body.status))) {
    next(validationError("Invalid rental enquiry status"));
    return;
  }

  if (body?.notes !== undefined && body.notes !== null && typeof body.notes !== "string") {
    next(validationError("Notes must be a string"));
    return;
  }

  if (body?.internalNotes !== undefined && body.internalNotes !== null && typeof body.internalNotes !== "string") {
    next(validationError("Internal notes must be a string"));
    return;
  }

  next();
}

/*
 * -------------------------------------------------------------
 * ADMIN RENTAL PROPERTY UPDATE VALIDATION
 * -------------------------------------------------------------
 */
export function validateAdminRentalPropertyUpdate(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  const body = req.body as AdminRentalPropertyUpdateBody;

  if (
    !hasOnlyFields(body, [
      "ownerName",
      "phone",
      "flatType",
      "approxSizeSqFt",
      "location",
      "areaLocality",
      "societyDeveloper",
      "additionalDetails",
      "status",
      "internalNotes",
    ])
  ) {
    next(validationError("Invalid rental property update fields"));
    return;
  }

  if (body?.ownerName !== undefined && (!isNonEmptyString(body.ownerName) || body.ownerName.trim().length > 100)) {
    next(validationError("Owner name must not be empty and must be under 100 characters"));
    return;
  }

  if (body?.phone !== undefined) {
    const normalized = normalizeIndianPhone(body.phone);
    if (!normalized) {
      next(validationError("A valid 10-digit Indian phone number is required"));
      return;
    }
    body.phone = normalized;
  }

  if (body?.flatType !== undefined && (!isNonEmptyString(body.flatType) || body.flatType.trim().length > 50)) {
    next(validationError("Flat type must not be empty and must be under 50 characters"));
    return;
  }

  if (body?.approxSizeSqFt !== undefined && body.approxSizeSqFt !== null) {
    const parsed = Number(body.approxSizeSqFt);
    if (!Number.isInteger(parsed) || parsed <= 0 || parsed > 50000) {
      next(validationError("Approximate size must be a positive integer under 50,000 sq ft"));
      return;
    }
    body.approxSizeSqFt = parsed;
  }

  if (body?.status !== undefined && (typeof body.status !== "string" || !rentalPropertyStatuses.has(body.status))) {
    next(validationError("Invalid rental property status"));
    return;
  }

  if (body?.additionalDetails !== undefined && body.additionalDetails !== null && typeof body.additionalDetails !== "string") {
    next(validationError("Additional details must be a string"));
    return;
  }

  if (body?.internalNotes !== undefined && body.internalNotes !== null && typeof body.internalNotes !== "string") {
    next(validationError("Internal notes must be a string"));
    return;
  }

  next();
}

/*
 * -------------------------------------------------------------
 * PARAMETERS & QUERY VALIDATION
 * -------------------------------------------------------------
 */
export function validateRentalId(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  if (typeof req.params.id !== "string" || req.params.id.trim() === "") {
    next(validationError("Rental ID is required"));
    return;
  }
  next();
}

export function validateListRentalEnquiriesQuery(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  const { page, limit, status, search } = req.query;

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

  if (status !== undefined && (typeof status !== "string" || !rentalEnquiryStatuses.has(status))) {
    next(validationError("Invalid status query parameter"));
    return;
  }

  if (search !== undefined && typeof search !== "string") {
    next(validationError("Search parameter must be a string"));
    return;
  }

  next();
}

export function validateListRentalPropertiesQuery(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  const { page, limit, status, search } = req.query;

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

  if (status !== undefined && (typeof status !== "string" || !rentalPropertyStatuses.has(status))) {
    next(validationError("Invalid status query parameter"));
    return;
  }

  if (search !== undefined && typeof search !== "string") {
    next(validationError("Search parameter must be a string"));
    return;
  }

  next();
}
