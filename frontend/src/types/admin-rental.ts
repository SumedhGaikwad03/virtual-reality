/*
 * PURPOSE:
 * Administrative TypeScript definitions for the Rental domain.
 *
 * FLOW:
 * Admin Rental API Client -> Admin Rental Components & Pages.
 *
 * RESPONSIBILITY:
 * Outlines domain models, status enums, query parameters, update inputs,
 * and API responses for Rental Enquiries and Rental Properties.
 */

export type RentalEnquiryStatus =
  | "NEW"
  | "CONTACTED"
  | "MATCHED"
  | "CLOSED"
  | "ARCHIVED";

export type AdminRentalEnquiry = {
  id: string;
  name: string;
  phone: string;
  configuration: string;
  location: string | null;
  areaLocality: string | null;
  budget: string | null;
  furnishing: string | null;
  moveInTimeframe: string | null;
  whoIsFor: string | null;
  notes: string | null;
  status: RentalEnquiryStatus;
  internalNotes: string | null;
  createdById?: string | null;
  createdBy?: {
    id: string;
    name: string | null;
    email: string;
    role: string;
  } | null;
  createdAt: string;
  updatedAt: string;
};

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type AdminRentalEnquiryQuery = {
  page?: number;
  limit?: number;
  search?: string;
  status?: RentalEnquiryStatus;
};

export type AdminRentalEnquiryCreateInput = {
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

export type AdminRentalEnquiryUpdateInput = {
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

export type AdminRentalEnquiryResponse = {
  data: AdminRentalEnquiry;
};

export type AdminRentalEnquiriesResponse = {
  data: AdminRentalEnquiry[];
  pagination: PaginationMeta;
};

export type AdminRentalEnquiryDeleteResponse = {
  data: {
    deleted: boolean;
    id: string;
  };
};

/*
 * -------------------------------------------------------------
 * RENTAL PROPERTIES (Supplies / Landlords)
 * -------------------------------------------------------------
 */

export type RentalPropertyStatus =
  | "NEW"
  | "VERIFIED"
  | "AVAILABLE"
  | "RENTED"
  | "ARCHIVED";

export type AdminRentalProperty = {
  id: string;
  ownerName: string;
  phone: string;
  flatType: string;
  approxSizeSqFt: number | null;
  location: string | null;
  areaLocality: string | null;
  societyDeveloper: string | null;
  additionalDetails: string | null;
  status: RentalPropertyStatus;
  internalNotes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AdminRentalPropertyQuery = {
  page?: number;
  limit?: number;
  search?: string;
  status?: RentalPropertyStatus;
};

export type AdminRentalPropertyCreateInput = {
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

export type AdminRentalPropertyUpdateInput = {
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

export type AdminRentalPropertyResponse = {
  data: AdminRentalProperty;
};

export type AdminRentalPropertiesResponse = {
  data: AdminRentalProperty[];
  pagination: PaginationMeta;
};

export type AdminRentalPropertyDeleteResponse = {
  data: {
    deleted: boolean;
    id: string;
  };
};

