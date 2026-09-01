/*
 * PURPOSE:
 * Admin project amenity HTTP controller.
 *
 * FLOW:
 * Admin Project Amenity Management Flow
 *
 * RESPONSIBILITY:
 * Handles incoming admin HTTP requests for listing, creating, updating, and deleting project amenities.
 */

import type { NextFunction, Request, Response } from "express";
import {
  createProjectAmenity,
  deleteProjectAmenity,
  listProjectAmenities,
  updateProjectAmenity,
} from "../../services/project.service.js";

type ProjectAmenityParams = { projectId: string; amenityId?: string };

export async function listProjectAmenitiesController(
  req: Request<ProjectAmenityParams>,
  res: Response,
  next: NextFunction,
) {
  try {
    const result = await listProjectAmenities(req.params.projectId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function createProjectAmenityController(
  req: Request<ProjectAmenityParams, unknown, { name: string; sortOrder?: number }>,
  res: Response,
  next: NextFunction,
) {
  try {
    const result = await createProjectAmenity(req.params.projectId, req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

export async function updateProjectAmenityController(
  req: Request<ProjectAmenityParams, unknown, { name?: string; sortOrder?: number }>,
  res: Response,
  next: NextFunction,
) {
  try {
    const result = await updateProjectAmenity(
      req.params.projectId,
      req.params.amenityId as string,
      req.body,
    );
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function deleteProjectAmenityController(
  req: Request<ProjectAmenityParams>,
  res: Response,
  next: NextFunction,
) {
  try {
    const result = await deleteProjectAmenity(
      req.params.projectId,
      req.params.amenityId as string,
    );
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
