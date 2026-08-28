/*
 * PURPOSE:
 * Admin configuration domain type definitions.
 *
 * FLOW:
 * Admin Configuration Management Flow
 *
 * RESPONSIBILITY:
 * Defines TypeScript types for AdminConfiguration entity, input payload, availability status enum,
 * and API responses. priceFrom is represented as a string representing paise.
 */

export type AvailabilityStatus = "AVAILABLE" | "LIMITED" | "SOLD_OUT";

export type AdminConfiguration = {
  id: string;
  projectId: string;
  name: string;
  bhk: number;
  carpetArea: number;
  builtUpArea: number | null;
  superBuiltUpArea: number | null;
  priceFrom: string;
  availabilityStatus: AvailabilityStatus;
  createdAt: string;
  updatedAt: string;
};

export type AdminConfigurationInput = {
  name: string;
  bhk: number;
  carpetArea: number;
  builtUpArea?: number;
  superBuiltUpArea?: number;
  priceFrom: string;
  availabilityStatus: AvailabilityStatus;
};

export type AdminConfigurationResponse = { data: AdminConfiguration };
export type AdminConfigurationsResponse = { data: AdminConfiguration[] };
