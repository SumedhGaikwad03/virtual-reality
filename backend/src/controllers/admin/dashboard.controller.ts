/*
 * PURPOSE:
 * Admin dashboard HTTP controller.
 *
 * FLOW:
 * Admin Dashboard Route -> getDashboardController -> dashboard.service.ts -> HTTP 200 JSON.
 *
 * RESPONSIBILITY:
 * Extracts authenticated administrator identity from res.locals.admin and returns
 * role-scoped dashboard metrics, pipeline summary, today's visits, recent leads, and rental counts.
 */

import type { Request, Response, NextFunction } from "express";
import { getDashboardData } from "../../services/dashboard.service.js";

export async function getDashboardController(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const admin = res.locals.admin;
    const result = await getDashboardData(admin);
    res.status(200).json({ data: result });
  } catch (error) {
    next(error);
  }
}
