/*
 * PURPOSE:
 * Public API client for rental submissions (Renters and Owners).
 *
 * FLOW:
 * RenterEnquiryForm / OwnerPropertyForm -> rental.api.ts -> backend /api/rentals/* endpoints.
 *
 * RESPONSIBILITY:
 * Dispatches public rental enquiry and owner property submissions, handling responses and errors.
 */

import { API_BASE_URL } from "./config";

export type SubmitRentalEnquiryPayload = {
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

export type SubmitRentalPropertyPayload = {
  ownerName: string;
  phone: string;
  flatType: string;
  approxSizeSqFt?: number;
  location?: string;
  areaLocality?: string;
  societyDeveloper?: string;
  additionalDetails?: string;
};

export type RentalSubmissionResponse = {
  data: {
    id: string;
    status: string;
    createdAt: string;
  };
};

export class RentalApiError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly statusCode?: number,
  ) {
    super(message);
    this.name = "RentalApiError";
  }
}

export async function submitRentalEnquiry(
  payload: SubmitRentalEnquiryPayload,
): Promise<RentalSubmissionResponse> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}/rentals/enquiries`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new RentalApiError("Unable to connect to the rental service. Please try again.");
  }

  const json = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMessage =
      json?.error?.message || "We could not submit your rental enquiry. Please verify your details and try again.";
    throw new RentalApiError(errorMessage, json?.error?.code, response.status);
  }

  return json as RentalSubmissionResponse;
}

export async function submitRentalProperty(
  payload: SubmitRentalPropertyPayload,
): Promise<RentalSubmissionResponse> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}/rentals/properties`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new RentalApiError("Unable to connect to the rental service. Please try again.");
  }

  const json = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMessage =
      json?.error?.message || "We could not submit your property details. Please verify your details and try again.";
    throw new RentalApiError(errorMessage, json?.error?.code, response.status);
  }

  return json as RentalSubmissionResponse;
}
