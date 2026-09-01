/*
 * PURPOSE:
 * Sends an authenticated end-to-end Web Push test to the current admin's devices.
 *
 * FLOW:
 * Leads page -> authenticated admin route -> notification service -> service worker.
 *
 * RESPONSIBILITY:
 * Verify that the registered subscription can receive a real push without creating a lead.
 */

import type { NextFunction, Request, Response } from "express";
import { notifyTestPush } from "../../services/notification.service.js";

export async function sendTestPushController(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const deviceCount = await notifyTestPush(res.locals.admin.id);
    res.status(200).json({ data: { sent: deviceCount > 0, deviceCount } });
  } catch (error) {
    next(error);
  }
}
