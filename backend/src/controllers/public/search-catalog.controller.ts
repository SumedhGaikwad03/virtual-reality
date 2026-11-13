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
import { CACHE_POLICY_CATALOG } from "../../constants/cache.js";

export async function searchCatalogController(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const catalog = await getSearchCatalog();
    res
      .setHeader("Cache-Control", CACHE_POLICY_CATALOG)
      .status(200)
      .json(catalog);
  } catch (error) {
    next(error);
  }
}
