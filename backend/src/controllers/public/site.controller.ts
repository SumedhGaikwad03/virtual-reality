/*
 * PURPOSE:
 * Public site HTTP controller.
 *
 * FLOW:
 * Homepage Content Flow
 *
 * RESPONSIBILITY:
 * Handles incoming HTTP GET requests for public site data, delegates to getSite service,
 * returns JSON response with HTTP 200, and forwards unhandled errors to Express next().
 */

import type { NextFunction, Request, Response } from "express";
import { getSite } from "../../services/site.service.js";

export async function getSiteController(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    res.status(200).json(await getSite());
  } catch (error) {
    next(error);
  }
}
