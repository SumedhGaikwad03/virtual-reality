/*
 * PURPOSE:
 * Configuration application service layer.
 *
 * FLOW:
 * Configuration Business Logic Flow
 *
 * RESPONSIBILITY:
 * Encapsulates business rules for property configurations:
 * - Enforces parent project existence before creating or listing configurations.
 * - Converts string priceFrom to BigInt for safe database persistence without floating-point issues.
 * - Serializes BigInt priceFrom back to string for API response DTOs.
 * - Maps not-found and validation failures to domain errors.
 */

import type { AvailabilityStatus } from "../../generated/prisma/enums.js";
import { projectRepository } from "../repositories/project.repository.js";
import { configurationRepository } from "../repositories/configuration.repository.js";

export type ConfigurationInput = {
  name?: string;
  bhk?: number;
  carpetArea?: number;
  builtUpArea?: number;
  superBuiltUpArea?: number;
  priceFrom?: string;
  availabilityStatus?: AvailabilityStatus;
};

export type CreateConfigurationInput = Required<
  Pick<
    ConfigurationInput,
    "name" | "bhk" | "carpetArea" | "priceFrom" | "availabilityStatus"
  >
> &
  Omit<
    ConfigurationInput,
    "name" | "bhk" | "carpetArea" | "priceFrom" | "availabilityStatus"
  >;

export class ConfigurationServiceError extends Error {
  constructor(
    public readonly code:
      | "PROJECT_NOT_FOUND"
      | "CONFIGURATION_NOT_FOUND"
      | "INVALID_CONFIGURATION_REQUEST",
    public readonly statusCode: 400 | 404,
    message: string,
  ) {
    super(message);
    this.name = "ConfigurationServiceError";
  }
}

// Converts the Prisma entity to an API response DTO, safely converting BigInt priceFrom to string
function toConfigurationResponse(configuration: {
  id: string;
  projectId: string;
  name: string;
  bhk: number;
  carpetArea: number;
  builtUpArea: number | null;
  superBuiltUpArea: number | null;
  priceFrom: bigint;
  availabilityStatus: AvailabilityStatus;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: configuration.id,
    projectId: configuration.projectId,
    name: configuration.name,
    bhk: configuration.bhk,
    carpetArea: configuration.carpetArea,
    builtUpArea: configuration.builtUpArea,
    superBuiltUpArea: configuration.superBuiltUpArea,
    priceFrom: configuration.priceFrom.toString(),
    availabilityStatus: configuration.availabilityStatus,
    createdAt: configuration.createdAt,
    updatedAt: configuration.updatedAt,
  };
}

// Converts string price in paise to BigInt for exact database storage
function toBigInt(value: string) {
  try {
    return BigInt(value);
  } catch {
    throw new ConfigurationServiceError(
      "INVALID_CONFIGURATION_REQUEST",
      400,
      "priceFrom must be a string containing a whole number",
    );
  }
}

// Verifies that the parent project exists before adding configurations to it
async function ensureProjectExists(projectId: string) {
  if (!(await projectRepository.findById(projectId))) {
    throw new ConfigurationServiceError(
      "PROJECT_NOT_FOUND",
      404,
      "Project not found",
    );
  }
}

export async function createConfiguration(
  projectId: string,
  input: CreateConfigurationInput,
) {
  await ensureProjectExists(projectId);

  const configuration = await configurationRepository.create({
    projectId,
    name: input.name,
    bhk: input.bhk,
    carpetArea: input.carpetArea,
    builtUpArea: input.builtUpArea,
    superBuiltUpArea: input.superBuiltUpArea,
    priceFrom: toBigInt(input.priceFrom),
    availabilityStatus: input.availabilityStatus,
  });

  return { data: toConfigurationResponse(configuration) };
}

export async function listProjectConfigurations(projectId: string) {
  await ensureProjectExists(projectId);
  const configurations = await configurationRepository.findManyByProjectId(projectId);
  return { data: configurations.map(toConfigurationResponse) };
}

export async function getConfigurationById(id: string) {
  const configuration = await configurationRepository.findById(id);

  if (!configuration) {
    throw new ConfigurationServiceError(
      "CONFIGURATION_NOT_FOUND",
      404,
      "Configuration not found",
    );
  }

  return { data: toConfigurationResponse(configuration) };
}

export async function updateConfiguration(
  id: string,
  input: ConfigurationInput,
) {
  const existing = await configurationRepository.findById(id);

  if (!existing) {
    throw new ConfigurationServiceError(
      "CONFIGURATION_NOT_FOUND",
      404,
      "Configuration not found",
    );
  }

  const configuration = await configurationRepository.update(id, {
    name: input.name,
    bhk: input.bhk,
    carpetArea: input.carpetArea,
    builtUpArea: input.builtUpArea,
    superBuiltUpArea: input.superBuiltUpArea,
    priceFrom:
      input.priceFrom === undefined ? undefined : toBigInt(input.priceFrom),
    availabilityStatus: input.availabilityStatus,
  });

  return { data: toConfigurationResponse(configuration) };
}
