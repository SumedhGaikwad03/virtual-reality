import type { NextFunction, Request, Response } from "express";
import { getSearchCatalog } from "../../services/search/search-catalog.service.js";

export async function searchCatalogController(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    res.status(200).json(await getSearchCatalog());
  } catch (error) {
    next(error);
  }
}

