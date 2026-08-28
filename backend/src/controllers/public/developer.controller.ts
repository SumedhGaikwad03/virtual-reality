/*
 * PURPOSE:
 * Public developer HTTP controller.
 *
 * FLOW:
 * Public Developer Discovery Flow
 *
 * RESPONSIBILITY:
 * Handles incoming public GET /api/developers/:developerSlug requests,
 * invokes getPublicDeveloper service, and returns JSON response with HTTP 200.
 */

import type { NextFunction, Request, Response } from "express";
import { getPublicDeveloper } from "../../services/developer.service.js";

type DeveloperRouteParams = {
  developerSlug: string;
};

export async function getPublicDeveloperController(
  req: Request<DeveloperRouteParams>,
  res: Response,
  next: NextFunction,
) {
  try {
    const response = await getPublicDeveloper(req.params.developerSlug);
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
}
