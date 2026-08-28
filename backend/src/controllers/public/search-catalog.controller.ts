/*
 * PURPOSE:
 * Public search catalog HTTP controller.
 *
 * FLOW:
 * Guided Search Flow
 *
 * RESPONSIBILITY:
 * Handles incoming requests for the public search catalog and delegates to the search catalog service.
 */

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
