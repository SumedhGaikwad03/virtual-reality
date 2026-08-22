import type { NextFunction, Request, Response } from "express";

function validationError(message: string) {
  const error = new Error(message);
  Object.assign(error, { code: "INVALID_IMPORT_REQUEST", statusCode: 400 });
  return error;
}

export type AnalyzeImportBody = { url?: unknown };

export function validateAnalyzeImport(req: Request, _res: Response, next: NextFunction) {
  const body = req.body as AnalyzeImportBody;
  try {
    const url = new URL(typeof body?.url === "string" ? body.url : "");
    if (!['http:', 'https:'].includes(url.protocol)) throw new Error();
  } catch {
    next(validationError("A valid HTTP or HTTPS URL is required"));
    return;
  }
  next();
}
