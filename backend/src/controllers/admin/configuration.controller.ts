/*
 * PURPOSE:
 * Admin configuration HTTP controller.
 *
 * FLOW:
 * Admin Configuration Management Flow
 *
 * RESPONSIBILITY:
 * Handles HTTP requests for creating, listing, retrieving, and updating configurations,
 * delegating business logic to the configuration service and returning standardized JSON responses.
 */

import type { NextFunction, Request, Response } from "express";
import type { AvailabilityStatus } from "../../../generated/prisma/enums.js";
import {
  createConfiguration,
  getConfigurationById,
  listProjectConfigurations,
  updateConfiguration,
  type ConfigurationInput,
} from "../../services/configuration.service.js";
import type {
  AdminCreateConfigurationBody,
  AdminUpdateConfigurationBody,
} from "../../validators/configuration.validator.js";

type ProjectParams = { projectId: string };
type ConfigurationParams = { id: string };

export async function createConfigurationController(
  req: Request<ProjectParams, unknown, AdminCreateConfigurationBody>,
  res: Response,
  next: NextFunction,
) {
  try {
    const body = req.body;
    const response = await createConfiguration(req.params.projectId, {
      name: body.name as string,
      bhk: body.bhk as number,
      carpetArea: body.carpetArea as number,
      builtUpArea: body.builtUpArea as number | undefined,
      superBuiltUpArea: body.superBuiltUpArea as number | undefined,
      priceFrom: body.priceFrom as string,
      availabilityStatus: body.availabilityStatus as AvailabilityStatus,
    });
    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
}

export async function listProjectConfigurationsController(
  req: Request<ProjectParams>,
  res: Response,
  next: NextFunction,
) {
  try {
    res.status(200).json(await listProjectConfigurations(req.params.projectId));
  } catch (error) {
    next(error);
  }
}

export async function getConfigurationController(
  req: Request<ConfigurationParams>,
  res: Response,
  next: NextFunction,
) {
  try {
    res.status(200).json(await getConfigurationById(req.params.id));
  } catch (error) {
    next(error);
  }
}

export async function updateConfigurationController(
  req: Request<ConfigurationParams, unknown, AdminUpdateConfigurationBody>,
  res: Response,
  next: NextFunction,
) {
  try {
    res.status(200).json(
      await updateConfiguration(req.params.id, req.body as ConfigurationInput),
    );
  } catch (error) {
    next(error);
  }
}
