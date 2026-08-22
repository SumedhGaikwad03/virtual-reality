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
