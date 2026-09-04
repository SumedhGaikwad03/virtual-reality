/*
 * PURPOSE:
 * Admin firm profile controller.
 *
 * FLOW:
 * Admin Firm Profile Routes -> Firm Profile Controller -> Firm Profile Repository.
 *
 * RESPONSIBILITY:
 * Handles fetching and updating persisted company overview and founder profile details for authenticated administrators.
 */

import type { Request, Response, NextFunction } from "express";
import { firmProfileRepository } from "../../repositories/firm-profile.repository.js";

export async function getFirmProfileController(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const profile = await firmProfileRepository.findProfile();
    res.json({
      data: profile,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateFirmProfileController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const {
      founderName,
      founderTitle,
      founderExperience,
      founderBio,
      founderImageMediaId,
      companyDescription,
    } = req.body;

    const updated = await firmProfileRepository.updateProfile({
      founderName,
      founderTitle,
      founderExperience,
      founderBio,
      founderImageMediaId,
      companyDescription,
    });

    res.json({
      data: updated,
    });
  } catch (error) {
    next(error);
  }
}
