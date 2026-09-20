/*
 * PURPOSE:
 * Admin location snapshot HTTP controller.
 *
 * FLOW:
 * Client -> Route -> Auth Middleware -> Validator -> location.controller -> admin.repository.
 *
 * RESPONSIBILITY:
 * - Accepts employee location snapshot updates with server timestamp.
 * - Exposes active admin location snapshots to Founder.
 */

import type { NextFunction, Request, Response } from "express";
import type { AuthenticatedAdmin } from "../../middleware/auth.middleware.js";
import { adminRepository } from "../../repositories/admin.repository.js";

export async function updateLocationController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const admin = res.locals.admin as AuthenticatedAdmin;
    const { latitude, longitude } = req.body as {
      latitude: number;
      longitude: number;
    };

    const now = new Date();
    const updated = await adminRepository.updateLocation(admin.id, {
      lastLatitude: latitude,
      lastLongitude: longitude,
      lastLocationAt: now,
    });

    res.status(200).json({
      data: {
        latitude: updated.lastLatitude,
        longitude: updated.lastLongitude,
        lastLocationAt: updated.lastLocationAt ? updated.lastLocationAt.toISOString() : null,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getLocationsController(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const admins = await adminRepository.findAllActiveLocations();

    const data = admins.map((admin) => ({
      id: admin.id,
      name: admin.name ?? null,
      email: admin.email,
      role: admin.role,
      latitude: admin.lastLatitude,
      longitude: admin.lastLongitude,
      lastLocationAt: admin.lastLocationAt ? admin.lastLocationAt.toISOString() : null,
    }));

    res.status(200).json({ data });
  } catch (error) {
    next(error);
  }
}
