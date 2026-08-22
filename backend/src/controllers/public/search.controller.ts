import type { NextFunction, Request, Response } from "express";
import { generatePropertySearchQuery } from "../../services/search/query-generator.service.js";
import { searchProperties } from "../../services/search/search.service.js";

export async function searchController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const query = generatePropertySearchQuery(req.query.q as string);
    res.status(200).json(await searchProperties(query));
  } catch (error) {
    next(error);
  }
}
