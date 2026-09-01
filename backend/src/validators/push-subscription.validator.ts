/*
 * PURPOSE:
 * Validates browser PushSubscription registration payloads.
 *
 * FLOW:
 * Authenticated request -> validator -> push subscription controller.
 *
 * RESPONSIBILITY:
 * Accept only the browser subscription fields required to register or remove a device endpoint.
 */

import type { NextFunction, Request, Response } from "express";

export type PushSubscriptionBody = {
  endpoint?: unknown;
  keys?: { p256dh?: unknown; auth?: unknown };
  userAgent?: unknown;
  deviceLabel?: unknown;
};

export type PushSubscriptionRemovalBody = {
  endpoint?: unknown;
};

function invalidSubscription() {
  const error = new Error("Invalid push subscription");
  Object.assign(error, { code: "INVALID_PUSH_SUBSCRIPTION", statusCode: 400 });
  return error;
}

function validString(value: unknown, maxLength: number) {
  return typeof value === "string" && value.trim().length > 0 && value.length <= maxLength;
}

function hasOnlyFields(value: unknown, fields: string[]) {
  return typeof value === "object" && value !== null && !Array.isArray(value) &&
    Object.keys(value).every((key) => fields.includes(key));
}

export function validatePushSubscription(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  const body = req.body as PushSubscriptionBody;
  if (
    !body ||
    !hasOnlyFields(body, ["endpoint", "keys", "userAgent", "deviceLabel"]) ||
    !validString(body?.endpoint, 2048) ||
    !body.keys ||
    !hasOnlyFields(body.keys, ["p256dh", "auth"]) ||
    !validString(body.keys.p256dh, 512) ||
    !validString(body.keys.auth, 512) ||
    (body.userAgent !== undefined && !validString(body.userAgent, 512)) ||
    (body.deviceLabel !== undefined && !validString(body.deviceLabel, 120))
  ) {
    next(invalidSubscription());
    return;
  }
  next();
}

export function validatePushEndpoint(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  if (!validString(req.params.endpoint, 2048)) {
    next(invalidSubscription());
    return;
  }
  next();
}

export function validatePushSubscriptionRemoval(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  const body = req.body as PushSubscriptionRemovalBody;
  if (!validString(body?.endpoint, 2048)) {
    next(invalidSubscription());
    return;
  }
  next();
}
