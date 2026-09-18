/*
 * PURPOSE:
 * Admin rental management HTTP controllers.
 *
 * FLOW:
 * Admin Rental Management Flow
 *
 * RESPONSIBILITY:
 * Handles listing, retrieval, update, and deletion of RentalEnquiry and RentalProperty records.
 */

import type { NextFunction, Request, Response } from "express";
import type {
  RentalEnquiryStatus,
  RentalPropertyStatus,
} from "../../../generated/prisma/enums.js";
import {
  createAdminRentalEnquiry,
  createAdminRentalProperty,
  deleteRentalEnquiry,
  deleteRentalProperty,
  getRelevantAvailablePropertiesForEnquiry,
  getRentalEnquiryById,
  getRentalPropertyById,
  listRentalEnquiries,
  listRentalProperties,
  updateRentalEnquiry,
  updateRentalProperty,
  type CreateAdminRentalEnquiryInput,
  type CreateAdminRentalPropertyInput,
  type UpdateAdminRentalEnquiryInput,
  type UpdateAdminRentalPropertyInput,
} from "../../services/rental.service.js";
import type {
  AdminRentalEnquiryCreateBody,
  AdminRentalEnquiryUpdateBody,
  AdminRentalPropertyCreateBody,
  AdminRentalPropertyUpdateBody,
} from "../../validators/rental.validator.js";

type RentalIdParams = { id: string };

/*
 * -------------------------------------------------------------
 * ADMIN RENTAL ENQUIRY CONTROLLERS
 * -------------------------------------------------------------
 */
export async function createAdminRentalEnquiryController(
  req: Request<Record<string, never>, unknown, AdminRentalEnquiryCreateBody>,
  res: Response,
  next: NextFunction,
) {
  try {
    const body = req.body;
    const input: CreateAdminRentalEnquiryInput = {
      name: body.name as string,
      phone: body.phone as string,
      configuration: body.configuration as string,
      location: body.location as string | undefined,
      areaLocality: body.areaLocality as string | undefined,
      budget: body.budget as string | undefined,
      furnishing: body.furnishing as string | undefined,
      moveInTimeframe: body.moveInTimeframe as string | undefined,
      whoIsFor: body.whoIsFor as string | undefined,
      notes: body.notes as string | undefined,
      status: body.status as RentalEnquiryStatus | undefined,
      internalNotes: body.internalNotes as string | undefined,
    };

    res.status(201).json(await createAdminRentalEnquiry(input));
  } catch (error) {
    next(error);
  }
}
export async function listRentalEnquiriesController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { page, limit, search, status } = req.query;

    const options = {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      search: typeof search === "string" ? search : undefined,
      status: typeof status === "string" ? (status as RentalEnquiryStatus) : undefined,
    };

    res.status(200).json(await listRentalEnquiries(options));
  } catch (error) {
    next(error);
  }
}

export async function getRentalEnquiryController(
  req: Request<RentalIdParams>,
  res: Response,
  next: NextFunction,
) {
  try {
    res.status(200).json(await getRentalEnquiryById(req.params.id));
  } catch (error) {
    next(error);
  }
}

export async function updateRentalEnquiryController(
  req: Request<RentalIdParams, unknown, AdminRentalEnquiryUpdateBody>,
  res: Response,
  next: NextFunction,
) {
  try {
    const body = req.body;
    const input: UpdateAdminRentalEnquiryInput = {
      name: body.name as string | undefined,
      phone: body.phone as string | undefined,
      configuration: body.configuration as string | undefined,
      location: body.location as string | null | undefined,
      areaLocality: body.areaLocality as string | null | undefined,
      budget: body.budget as string | null | undefined,
      furnishing: body.furnishing as string | null | undefined,
      moveInTimeframe: body.moveInTimeframe as string | null | undefined,
      whoIsFor: body.whoIsFor as string | null | undefined,
      notes: body.notes as string | null | undefined,
      status: body.status as RentalEnquiryStatus | undefined,
      internalNotes: body.internalNotes as string | null | undefined,
    };

    res.status(200).json(await updateRentalEnquiry(req.params.id, input));
  } catch (error) {
    next(error);
  }
}

export async function deleteRentalEnquiryController(
  req: Request<RentalIdParams>,
  res: Response,
  next: NextFunction,
) {
  try {
    res.status(200).json(await deleteRentalEnquiry(req.params.id));
  } catch (error) {
    next(error);
  }
}

export async function getRelevantAvailablePropertiesController(
  req: Request<RentalIdParams>,
  res: Response,
  next: NextFunction,
) {
  try {
    res
      .status(200)
      .json(await getRelevantAvailablePropertiesForEnquiry(req.params.id));
  } catch (error) {
    next(error);
  }
}

/*
 * -------------------------------------------------------------
 * ADMIN RENTAL PROPERTY CONTROLLERS
 * -------------------------------------------------------------
 */
export async function createAdminRentalPropertyController(
  req: Request<Record<string, never>, unknown, AdminRentalPropertyCreateBody>,
  res: Response,
  next: NextFunction,
) {
  try {
    const body = req.body;
    const input: CreateAdminRentalPropertyInput = {
      ownerName: body.ownerName as string,
      phone: body.phone as string,
      flatType: body.flatType as string,
      approxSizeSqFt: body.approxSizeSqFt as number | undefined,
      location: body.location as string | undefined,
      areaLocality: body.areaLocality as string | undefined,
      societyDeveloper: body.societyDeveloper as string | undefined,
      additionalDetails: body.additionalDetails as string | undefined,
      status: body.status as RentalPropertyStatus | undefined,
      internalNotes: body.internalNotes as string | undefined,
    };

    res.status(201).json(await createAdminRentalProperty(input));
  } catch (error) {
    next(error);
  }
}

export async function listRentalPropertiesController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { page, limit, search, status } = req.query;

    const options = {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      search: typeof search === "string" ? search : undefined,
      status: typeof status === "string" ? (status as RentalPropertyStatus) : undefined,
    };

    res.status(200).json(await listRentalProperties(options));
  } catch (error) {
    next(error);
  }
}

export async function getRentalPropertyController(
  req: Request<RentalIdParams>,
  res: Response,
  next: NextFunction,
) {
  try {
    res.status(200).json(await getRentalPropertyById(req.params.id));
  } catch (error) {
    next(error);
  }
}

export async function updateRentalPropertyController(
  req: Request<RentalIdParams, unknown, AdminRentalPropertyUpdateBody>,
  res: Response,
  next: NextFunction,
) {
  try {
    const body = req.body;
    const input: UpdateAdminRentalPropertyInput = {
      ownerName: body.ownerName as string | undefined,
      phone: body.phone as string | undefined,
      flatType: body.flatType as string | undefined,
      approxSizeSqFt: body.approxSizeSqFt as number | null | undefined,
      location: body.location as string | null | undefined,
      areaLocality: body.areaLocality as string | null | undefined,
      societyDeveloper: body.societyDeveloper as string | null | undefined,
      additionalDetails: body.additionalDetails as string | null | undefined,
      status: body.status as RentalPropertyStatus | undefined,
      internalNotes: body.internalNotes as string | null | undefined,
    };

    res.status(200).json(await updateRentalProperty(req.params.id, input));
  } catch (error) {
    next(error);
  }
}

export async function deleteRentalPropertyController(
  req: Request<RentalIdParams>,
  res: Response,
  next: NextFunction,
) {
  try {
    res.status(200).json(await deleteRentalProperty(req.params.id));
  } catch (error) {
    next(error);
  }
}
