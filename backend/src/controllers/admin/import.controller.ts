import type { NextFunction, Request, Response } from "express";
import { analyzeImportUrl } from "../../services/import/import.service.js";
import type { AnalyzeImportBody } from "../../validators/import.validator.js";

export async function analyzeImportController(req: Request<{}, unknown, AnalyzeImportBody>, res: Response, next: NextFunction) {
  try {
    res.status(200).json(await analyzeImportUrl(req.body.url as string));
  } catch (error) {
    next(error);
  }
}
