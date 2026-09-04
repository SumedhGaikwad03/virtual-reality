/*
 * PURPOSE:
 * Firm profile update validation middleware.
 *
 * FLOW:
 * Admin Firm Profile Routes -> validateFirmProfileUpdate -> firm-profile.controller.
 *
 * RESPONSIBILITY:
 * Enforces string types, required non-empty founder name and title, and safe string constraints.
 */

import type { Request, Response, NextFunction } from "express";

export function validateFirmProfileUpdate(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  const {
    founderName,
    founderTitle,
    founderExperience,
    founderBio,
    founderImageMediaId,
    companyDescription,
  } = req.body;

  if (founderName !== undefined) {
    if (typeof founderName !== "string" || !founderName.trim()) {
      return next({
        code: "INVALID_FIRM_PROFILE_REQUEST",
        message: "Founder name must be a non-empty string",
      });
    }
  }

  if (founderTitle !== undefined) {
    if (typeof founderTitle !== "string" || !founderTitle.trim()) {
      return next({
        code: "INVALID_FIRM_PROFILE_REQUEST",
        message: "Founder title must be a non-empty string",
      });
    }
  }

  if (founderExperience !== undefined) {
    if (typeof founderExperience !== "string" || !founderExperience.trim()) {
      return next({
        code: "INVALID_FIRM_PROFILE_REQUEST",
        message: "Founder experience statement must be a non-empty string",
      });
    }
  }

  if (founderBio !== undefined && founderBio !== null && founderBio !== "") {
    if (typeof founderBio !== "string") {
      return next({
        code: "INVALID_FIRM_PROFILE_REQUEST",
        message: "Founder bio must be a string",
      });
    }
  }

  if (companyDescription !== undefined && companyDescription !== null && companyDescription !== "") {
    if (typeof companyDescription !== "string") {
      return next({
        code: "INVALID_FIRM_PROFILE_REQUEST",
        message: "Company description must be a string",
      });
    }
  }

  if (
    founderImageMediaId !== undefined &&
    founderImageMediaId !== null &&
    founderImageMediaId !== ""
  ) {
    if (typeof founderImageMediaId !== "string") {
      return next({
        code: "INVALID_FIRM_PROFILE_REQUEST",
        message: "Founder image media ID must be a string",
      });
    }
  }

  next();
}
