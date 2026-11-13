/*
 * PURPOSE:
 * Public property search HTTP controller.
 *
 * FLOW:
 * Natural Language Search Flow
 *
 * RESPONSIBILITY:
 * Receives validated text search queries, invokes query generation to parse structured filters,
 * and calls the search service to retrieve matching property configurations.
 */

import type { NextFunction, Request, Response } from "express";
import { generatePropertySearchQuery } from "../../services/search/query-generator.service.js";
import { searchProperties } from "../../services/search/search.service.js";
import { CACHE_POLICY_SEARCH } from "../../constants/cache.js";

export async function searchController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const query = generatePropertySearchQuery(req.query.q as string);
    const results = await searchProperties(query);
    res
      .setHeader("Cache-Control", CACHE_POLICY_SEARCH)
      .status(200)
      .json(results);
  } catch (error) {
    next(error);
  }
}
