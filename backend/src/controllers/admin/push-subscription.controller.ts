/*
 * PURPOSE:
 * Handles authenticated push subscription HTTP requests.
 *
 * FLOW:
 * Admin route -> authentication middleware -> controller -> subscription service.
 *
 * RESPONSIBILITY:
 * Read the authenticated admin identity from request locals and never accept ownership from the client.
 */

import type { NextFunction, Request, Response } from "express";
import {
  getPushSubscriptionStatus,
  registerPushSubscription,
  removePushSubscription,
} from "../../services/push-subscription.service.js";
import type {
  PushSubscriptionBody,
  PushSubscriptionRemovalBody,
} from "../../validators/push-subscription.validator.js";

export async function registerPushSubscriptionController(
  req: Request<{}, unknown, PushSubscriptionBody>,
  res: Response,
  next: NextFunction,
) {
  try {
    const body = req.body;
    res.status(201).json(await registerPushSubscription(res.locals.admin.id, {
      endpoint: body.endpoint as string,
      keys: {
        p256dh: body.keys?.p256dh as string,
        auth: body.keys?.auth as string,
      },
      userAgent: body.userAgent as string | undefined,
      deviceLabel: body.deviceLabel as string | undefined,
    }));
  } catch (error) {
    next(error);
  }
}

export async function getPushSubscriptionStatusController(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    res.status(200).json(await getPushSubscriptionStatus(res.locals.admin.id));
  } catch (error) {
    next(error);
  }
}

export async function removePushSubscriptionController(
  req: Request<{}, unknown, PushSubscriptionRemovalBody>,
  res: Response,
  next: NextFunction,
) {
  try {
    res.status(200).json(await removePushSubscription(res.locals.admin.id, req.body.endpoint as string));
  } catch (error) {
    next(error);
  }
}
