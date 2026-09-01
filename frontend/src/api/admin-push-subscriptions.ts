/*
 * PURPOSE:
 * Provides authenticated admin push-subscription API calls.
 *
 * FLOW:
 * Browser PushSubscription -> admin API client -> authenticated backend subscription boundary.
 *
 * RESPONSIBILITY:
 * Serialize browser subscription data without exposing or accepting an admin ownership field.
 */

import { adminRequest } from "./admin-client";

export type RegisterPushSubscriptionInput = {
  endpoint: string;
  keys: { p256dh: string; auth: string };
  userAgent?: string;
  deviceLabel?: string;
};

export type PushSubscriptionStatus = {
  data: { registered: boolean; deviceCount: number };
};

export type PushTestResponse = {
  data: { sent: boolean; deviceCount: number };
};

export function getAdminPushSubscriptionStatus() {
  return adminRequest<PushSubscriptionStatus>("/admin/push-subscriptions");
}

export function registerAdminPushSubscription(input: RegisterPushSubscriptionInput) {
  return adminRequest("/admin/push-subscriptions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}

export function removeAdminPushSubscription(endpoint: string) {
  return adminRequest("/admin/push-subscriptions", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ endpoint }),
  });
}

export function sendAdminPushTest() {
  return adminRequest<PushTestResponse>("/admin/push-subscriptions/test", {
    method: "POST",
  });
}
