/*
 * PURPOSE:
 * Rental domain business logic service for Renter Enquiries and Owner Properties.
 *
 * FLOW:
 * Public Rental Submissions & Admin Rental Management Flow
 *
 * RESPONSIBILITY:
 * - Creates public rental enquiries and dispatches admin push notifications.
 * - Creates public owner property submissions and dispatches admin push notifications.
 * - Manages admin listing, retrieval, update, and deletion for enquiries and properties.
 * - Ensures public responses strictly do not leak internal notes or unnecessary metadata.
 */

import type {
  RentalEnquiryStatus,
  RentalPropertyStatus,
} from "../../generated/prisma/enums.js";
import type { AuthenticatedAdmin } from "../middleware/auth.middleware.js";
import {
  rentalRepository,
  type RentalEnquiryFindManyOptions,
  type RentalEnquiryUpdateData,
  type RentalPropertyFindManyOptions,
  type RentalPropertyUpdateData,
} from "../repositories/rental.repository.js";
import {
  notifyNewRentalEnquiry,
  notifyNewRentalProperty,
} from "./notification.service.js";

export type CreateRentalEnquiryInput = {
  name: string;
  phone: string;
  configuration: string;
  location?: string;
  areaLocality?: string;
  budget?: string;
  furnishing?: string;
  moveInTimeframe?: string;
  whoIsFor?: string;
  notes?: string;
};

export type CreateRentalPropertyInput = {
  ownerName: string;
  phone: string;
  flatType: string;
  approxSizeSqFt?: number;
  location?: string;
  areaLocality?: string;
  societyDeveloper?: string;
  additionalDetails?: string;
};

export type CreateAdminRentalEnquiryInput = {
  name: string;
  phone: string;
  configuration: string;
  location?: string;
  areaLocality?: string;
  budget?: string;
  furnishing?: string;
  moveInTimeframe?: string;
  whoIsFor?: string;
  notes?: string;
  status?: RentalEnquiryStatus;
  internalNotes?: string;
};

export type CreateAdminRentalPropertyInput = {
  ownerName: string;
  phone: string;
  flatType: string;
  approxSizeSqFt?: number;
  location?: string;
  areaLocality?: string;
  societyDeveloper?: string;
  additionalDetails?: string;
  status?: RentalPropertyStatus;
  internalNotes?: string;
};

export type UpdateAdminRentalEnquiryInput = {
  name?: string;
  phone?: string;
  configuration?: string;
  location?: string | null;
  areaLocality?: string | null;
  budget?: string | null;
  furnishing?: string | null;
  moveInTimeframe?: string | null;
  whoIsFor?: string | null;
  notes?: string | null;
  status?: RentalEnquiryStatus;
  internalNotes?: string | null;
};

export type UpdateAdminRentalPropertyInput = {
  ownerName?: string;
  phone?: string;
  flatType?: string;
  approxSizeSqFt?: number | null;
  location?: string | null;
  areaLocality?: string | null;
  societyDeveloper?: string | null;
  additionalDetails?: string | null;
  status?: RentalPropertyStatus;
  internalNotes?: string | null;
};

export class RentalServiceError extends Error {
  constructor(
    public readonly code:
      | "RENTAL_ENQUIRY_NOT_FOUND"
      | "RENTAL_PROPERTY_NOT_FOUND",
    public readonly statusCode: 404,
    message: string,
  ) {
    super(message);
    this.name = "RentalServiceError";
  }
}

/*
 * -------------------------------------------------------------
 * RENTAL ENQUIRY (Demands / Seekers)
 * -------------------------------------------------------------
 */
export async function createRentalEnquiry(input: CreateRentalEnquiryInput) {
  const enquiry = await rentalRepository.createEnquiry({
    name: input.name,
    phone: input.phone,
    configuration: input.configuration,
    location: input.location,
    areaLocality: input.areaLocality,
    budget: input.budget,
    furnishing: input.furnishing,
    moveInTimeframe: input.moveInTimeframe,
    whoIsFor: input.whoIsFor,
    notes: input.notes,
    status: "NEW",
  });

  // Best-effort push notification: never block or reject on notification failure
  void notifyNewRentalEnquiry({
    id: enquiry.id,
    name: enquiry.name,
    configuration: enquiry.configuration,
    location: enquiry.location,
    areaLocality: enquiry.areaLocality,
  }).catch(() => undefined);

  // Return clean, non-sensitive response for public consumer
  return {
    data: {
      id: enquiry.id,
      status: enquiry.status,
      createdAt: enquiry.createdAt,
    },
  };
}

export async function createAdminRentalEnquiry(
  input: CreateAdminRentalEnquiryInput,
  actorAdmin?: AuthenticatedAdmin,
) {
  const enquiry = await rentalRepository.createEnquiry({
    name: input.name,
    phone: input.phone,
    configuration: input.configuration,
    location: input.location,
    areaLocality: input.areaLocality,
    budget: input.budget,
    furnishing: input.furnishing,
    moveInTimeframe: input.moveInTimeframe,
    whoIsFor: input.whoIsFor,
    notes: input.notes,
    status: input.status ?? "NEW",
    internalNotes: input.internalNotes,
    createdById: actorAdmin?.id ?? null,
  });

  return { data: enquiry };
}

export async function listRentalEnquiries(options?: RentalEnquiryFindManyOptions) {
  const result = await rentalRepository.findManyEnquiries(options);
  return {
    data: result.enquiries,
    pagination: {
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: result.totalPages,
    },
  };
}

export async function getRentalEnquiryById(id: string) {
  const enquiry = await rentalRepository.findEnquiryById(id);
  if (!enquiry) {
    throw new RentalServiceError(
      "RENTAL_ENQUIRY_NOT_FOUND",
      404,
      "Rental enquiry not found",
    );
  }
  return { data: enquiry };
}

export async function updateRentalEnquiry(
  id: string,
  input: UpdateAdminRentalEnquiryInput,
) {
  const existing = await rentalRepository.findEnquiryById(id);
  if (!existing) {
    throw new RentalServiceError(
      "RENTAL_ENQUIRY_NOT_FOUND",
      404,
      "Rental enquiry not found",
    );
  }

  const updateData: RentalEnquiryUpdateData = {};
  if (input.name !== undefined) updateData.name = input.name;
  if (input.phone !== undefined) updateData.phone = input.phone;
  if (input.configuration !== undefined) updateData.configuration = input.configuration;
  if (input.location !== undefined) updateData.location = input.location;
  if (input.areaLocality !== undefined) updateData.areaLocality = input.areaLocality;
  if (input.budget !== undefined) updateData.budget = input.budget;
  if (input.furnishing !== undefined) updateData.furnishing = input.furnishing;
  if (input.moveInTimeframe !== undefined) updateData.moveInTimeframe = input.moveInTimeframe;
  if (input.whoIsFor !== undefined) updateData.whoIsFor = input.whoIsFor;
  if (input.notes !== undefined) updateData.notes = input.notes;
  if (input.status !== undefined) updateData.status = input.status;
  if (input.internalNotes !== undefined) updateData.internalNotes = input.internalNotes;

  const updated = await rentalRepository.updateEnquiry(id, updateData);
  return { data: updated };
}

export async function deleteRentalEnquiry(id: string) {
  const existing = await rentalRepository.findEnquiryById(id);
  if (!existing) {
    throw new RentalServiceError(
      "RENTAL_ENQUIRY_NOT_FOUND",
      404,
      "Rental enquiry not found",
    );
  }

  await rentalRepository.deleteEnquiry(id);
  return { data: { deleted: true, id } };
}

/*
 * -------------------------------------------------------------
 * RENTAL PROPERTY (Supplies / Landlords)
 * -------------------------------------------------------------
 */
export async function createRentalProperty(input: CreateRentalPropertyInput) {
  const property = await rentalRepository.createProperty({
    ownerName: input.ownerName,
    phone: input.phone,
    flatType: input.flatType,
    approxSizeSqFt: input.approxSizeSqFt,
    location: input.location,
    areaLocality: input.areaLocality,
    societyDeveloper: input.societyDeveloper,
    additionalDetails: input.additionalDetails,
    status: "NEW",
  });

  // Best-effort push notification
  void notifyNewRentalProperty({
    id: property.id,
    ownerName: property.ownerName,
    flatType: property.flatType,
    societyDeveloper: property.societyDeveloper,
    areaLocality: property.areaLocality,
    location: property.location,
  }).catch(() => undefined);

  // Return clean, non-sensitive response for public consumer
  return {
    data: {
      id: property.id,
      status: property.status,
      createdAt: property.createdAt,
    },
  };
}

export async function createAdminRentalProperty(input: CreateAdminRentalPropertyInput) {
  const property = await rentalRepository.createProperty({
    ownerName: input.ownerName,
    phone: input.phone,
    flatType: input.flatType,
    approxSizeSqFt: input.approxSizeSqFt,
    location: input.location,
    areaLocality: input.areaLocality,
    societyDeveloper: input.societyDeveloper,
    additionalDetails: input.additionalDetails,
    status: input.status ?? "NEW",
    internalNotes: input.internalNotes,
  });

  return { data: property };
}

export async function listRentalProperties(options?: RentalPropertyFindManyOptions) {
  const result = await rentalRepository.findManyProperties(options);
  return {
    data: result.properties,
    pagination: {
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: result.totalPages,
    },
  };
}

export async function getRentalPropertyById(id: string) {
  const property = await rentalRepository.findPropertyById(id);
  if (!property) {
    throw new RentalServiceError(
      "RENTAL_PROPERTY_NOT_FOUND",
      404,
      "Rental property not found",
    );
  }
  return { data: property };
}

export async function updateRentalProperty(
  id: string,
  input: UpdateAdminRentalPropertyInput,
) {
  const existing = await rentalRepository.findPropertyById(id);
  if (!existing) {
    throw new RentalServiceError(
      "RENTAL_PROPERTY_NOT_FOUND",
      404,
      "Rental property not found",
    );
  }

  const updateData: RentalPropertyUpdateData = {};
  if (input.ownerName !== undefined) updateData.ownerName = input.ownerName;
  if (input.phone !== undefined) updateData.phone = input.phone;
  if (input.flatType !== undefined) updateData.flatType = input.flatType;
  if (input.approxSizeSqFt !== undefined) updateData.approxSizeSqFt = input.approxSizeSqFt;
  if (input.location !== undefined) updateData.location = input.location;
  if (input.areaLocality !== undefined) updateData.areaLocality = input.areaLocality;
  if (input.societyDeveloper !== undefined) updateData.societyDeveloper = input.societyDeveloper;
  if (input.additionalDetails !== undefined) updateData.additionalDetails = input.additionalDetails;
  if (input.status !== undefined) updateData.status = input.status;
  if (input.internalNotes !== undefined) updateData.internalNotes = input.internalNotes;

  const updated = await rentalRepository.updateProperty(id, updateData);
  return { data: updated };
}

export async function deleteRentalProperty(id: string) {
  const existing = await rentalRepository.findPropertyById(id);
  if (!existing) {
    throw new RentalServiceError(
      "RENTAL_PROPERTY_NOT_FOUND",
      404,
      "Rental property not found",
    );
  }

  await rentalRepository.deleteProperty(id);
  return { data: { deleted: true, id } };
}

/*
 * -------------------------------------------------------------
 * RELEVANT AVAILABLE PROPERTIES FOR ENQUIRIES (Admin operations desk)
 * -------------------------------------------------------------
 */
export async function getRelevantAvailablePropertiesForEnquiry(
  enquiryId: string,
) {
  const enquiry = await rentalRepository.findEnquiryById(enquiryId);
  if (!enquiry) {
    throw new RentalServiceError(
      "RENTAL_ENQUIRY_NOT_FOUND",
      404,
      "Rental enquiry not found",
    );
  }

  const properties = await rentalRepository.findRelevantAvailableProperties({
    configuration: enquiry.configuration,
    location: enquiry.location,
    areaLocality: enquiry.areaLocality,
    limit: 6,
  });

  return { data: properties };
}

