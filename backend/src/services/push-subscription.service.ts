/*
 * PURPOSE:
 * Owns authenticated push subscription registration and removal workflows.
 *
 * FLOW:
 * Push subscription controller -> service -> subscription repository.
 *
 * RESPONSIBILITY:
 * Bind browser endpoints to the authenticated admin identity without trusting client-supplied ownership.
 */

import { pushSubscriptionRepository } from "../repositories/push-subscription.repository.js";

export class PushSubscriptionOwnershipError extends Error {
  code = "PUSH_SUBSCRIPTION_OWNERSHIP_CONFLICT";
  statusCode = 409;

  constructor() {
    super("Push subscription is already registered to another admin");
    this.name = "PushSubscriptionOwnershipError";
  }
}

export async function registerPushSubscription(
  adminId: string,
  input: {
    endpoint: string;
    keys: { p256dh: string; auth: string };
    userAgent?: string;
    deviceLabel?: string;
  },
) {
  const existing = await pushSubscriptionRepository.findByEndpoint(input.endpoint);
  if (existing && existing.adminId !== adminId) {
    throw new PushSubscriptionOwnershipError();
  }

  return {
    data: await pushSubscriptionRepository.upsert({
      adminId,
      endpoint: input.endpoint,
      p256dh: input.keys.p256dh,
      auth: input.keys.auth,
      userAgent: input.userAgent,
      deviceLabel: input.deviceLabel,
    }),
  };
}

export async function removePushSubscription(adminId: string, endpoint: string) {
  await pushSubscriptionRepository.deleteForAdminEndpoint(adminId, endpoint);
  return { data: { removed: true } };
}

export async function getPushSubscriptionStatus(adminId: string) {
  const subscriptions = await pushSubscriptionRepository.findForAdmin(adminId);
  return { data: { registered: subscriptions.length > 0, deviceCount: subscriptions.length } };
}
