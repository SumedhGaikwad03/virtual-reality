/*
 * PURPOSE:
 * Public rental submissions HTTP controllers.
 *
 * FLOW:
 * Public Rental Submissions Flow
 *
 * RESPONSIBILITY:
 * Extracts validated rental enquiry and owner property submission data from request,
 * delegates to rental service, and returns HTTP 201 response.
 */

import type { NextFunction, Request, Response } from "express";
import {
  createRentalEnquiry,
  createRentalProperty,
  type CreateRentalEnquiryInput,
  type CreateRentalPropertyInput,
} from "../../services/rental.service.js";
import type {
  PublicRentalEnquiryBody,
  PublicRentalPropertyBody,
} from "../../validators/rental.validator.js";

export async function createRentalEnquiryController(
  req: Request<{}, unknown, PublicRentalEnquiryBody>,
  res: Response,
  next: NextFunction,
) {
  try {
    const body = req.body;
    const result = await createRentalEnquiry({
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
    } satisfies CreateRentalEnquiryInput);

    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

export async function createRentalPropertyController(
  req: Request<{}, unknown, PublicRentalPropertyBody>,
  res: Response,
  next: NextFunction,
) {
  try {
    const body = req.body;
    const result = await createRentalProperty({
      ownerName: body.ownerName as string,
      phone: body.phone as string,
      flatType: body.flatType as string,
      approxSizeSqFt: body.approxSizeSqFt as number | undefined,
      location: body.location as string | undefined,
      areaLocality: body.areaLocality as string | undefined,
      societyDeveloper: body.societyDeveloper as string | undefined,
      additionalDetails: body.additionalDetails as string | undefined,
    } satisfies CreateRentalPropertyInput);

    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}
