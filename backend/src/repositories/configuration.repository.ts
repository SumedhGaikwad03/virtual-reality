/*
 * PURPOSE:
 * Configuration data access repository.
 *
 * FLOW:
 * Configuration Persistence Flow
 *
 * RESPONSIBILITY:
 * Executes Prisma queries for Configuration persistence:
 * - Creates configurations with BigInt priceFrom.
 * - Retrieves configurations by project ID ordered by BHK asc, name asc, id asc.
 * - Finds and updates configurations by ID.
 */

import { prisma } from "../lib/prisma.js";
import type { AvailabilityStatus } from "../../generated/prisma/enums.js";

const configurationSelect = {
  id: true,
  projectId: true,
  name: true,
  bhk: true,
  carpetArea: true,
  builtUpArea: true,
  superBuiltUpArea: true,
  priceFrom: true,
  availabilityStatus: true,
  createdAt: true,
  updatedAt: true,
} as const;

export class ConfigurationRepository {
  create(data: {
    projectId: string;
    name: string;
    bhk: number;
    carpetArea: number;
    builtUpArea?: number;
    superBuiltUpArea?: number;
    priceFrom: bigint;
    availabilityStatus: AvailabilityStatus;
  }) {
    return prisma.configuration.create({
      data,
      select: configurationSelect,
    });
  }

  findManyByProjectId(projectId: string) {
    return prisma.configuration.findMany({
      where: { projectId },
      // Standard ordering: lowest BHK first, then alphabetically by name, then deterministic ID
      orderBy: [{ bhk: "asc" }, { name: "asc" }, { id: "asc" }],
      // Bounded project configuration limit: Caps unit configurations per project to 50 items
      take: 50,
      select: configurationSelect,
    });
  }

  findById(id: string) {
    return prisma.configuration.findUnique({
      where: { id },
      select: configurationSelect,
    });
  }

  update(
    id: string,
    data: {
      name?: string;
      bhk?: number;
      carpetArea?: number;
      builtUpArea?: number;
      superBuiltUpArea?: number;
      priceFrom?: bigint;
      availabilityStatus?: AvailabilityStatus;
    },
  ) {
    return prisma.configuration.update({
      where: { id },
      data,
      select: configurationSelect,
    });
  }
}

export const configurationRepository = new ConfigurationRepository();
