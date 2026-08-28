/*
 * PURPOSE:
 * Search query parameter validation middleware.
 *
 * FLOW:
 * Natural Language Search Validation Flow
 *
 * RESPONSIBILITY:
 * Validates that incoming public text search requests supply a non-empty query parameter
 * within safety length bounds (<= 200 characters).
 */

import type { NextFunction, Request, Response } from "express";

export function validateSearchQuery(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  const query = req.query.q;

  if (typeof query !== "string" || query.trim() === "") {
    const error = new Error("Search query is required");
    error.name = "SearchQueryRequiredError";
    Object.assign(error, {
      code: "SEARCH_QUERY_REQUIRED",
      statusCode: 400,
    });
    next(error);
    return;
  }

  if (query.length > 200) {
    const error = new Error("Search query is too long");
    error.name = "SearchQueryTooLongError";
    Object.assign(error, {
      code: "SEARCH_QUERY_TOO_LONG",
      statusCode: 400,
    });
    next(error);
    return;
  }

  next();
}
