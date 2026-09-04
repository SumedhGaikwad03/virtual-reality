/*
 * PURPOSE:
 * Delivers minimal new-lead Web Push notifications to active admin devices.
 *
 * FLOW:
 * Persisted lead -> notification service -> active subscriptions -> browser service worker.
 *
 * RESPONSIBILITY:
 * Keep push delivery best-effort and isolated from the source-of-truth lead transaction.
 */

import webpush from "web-push";
import { pushSubscriptionRepository } from "../repositories/push-subscription.repository.js";

type NewLeadNotification = {
  id: string;
  projectName?: string | null;
  configurationName?: string | null;
};

type PushPayload = {
  title: string;
  body: string;
  url: string;
};

export class NotificationServiceError extends Error {
  constructor(
    public readonly code: "PUSH_SERVICE_NOT_CONFIGURED",
    public readonly statusCode: 503,
    message: string,
  ) {
    super(message);
    this.name = "NotificationServiceError";
  }
}

function vapidConfiguration() {
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT;
  return publicKey && privateKey && subject
    ? { publicKey, privateKey, subject }
    : null;
}

async function sendToSubscriptions(
  subscriptions: Awaited<ReturnType<typeof pushSubscriptionRepository.findForActiveAdmins>>,
  payloadData: PushPayload,
) {
  if (subscriptions.length === 0) return false;

  const vapid = vapidConfiguration();
  if (!vapid) {
    throw new NotificationServiceError(
      "PUSH_SERVICE_NOT_CONFIGURED",
      503,
      "Web Push VAPID configuration is incomplete",
    );
  }

  webpush.setVapidDetails(vapid.subject, vapid.publicKey, vapid.privateKey);
  const payload = JSON.stringify(payloadData);

  await Promise.allSettled(subscriptions.map(async (subscription) => {
    try {
      await webpush.sendNotification({
        endpoint: subscription.endpoint,
        keys: { p256dh: subscription.p256dh, auth: subscription.auth },
      }, payload);
    } catch (error) {
      const statusCode = typeof error === "object" && error !== null && "statusCode" in error
        ? error.statusCode
        : undefined;
      if (statusCode === 404 || statusCode === 410) {
        await pushSubscriptionRepository.deleteByEndpoint(subscription.endpoint);
      } else {
        console.error("Web Push delivery failed", { statusCode });
      }
    }
  }));

  return true;
}

export async function notifyNewLead(lead: NewLeadNotification) {
  const subscriptions = await pushSubscriptionRepository.findForActiveAdmins();
  const context = [lead.projectName, lead.configurationName].filter(Boolean).join(" · ");
  await sendToSubscriptions(subscriptions, {
    title: "New enquiry",
    body: context || "A new enquiry is ready to review.",
    url: `/admin/leads/${lead.id}`,
  });
}

export async function notifyTestPush(adminId: string) {
  const subscriptions = await pushSubscriptionRepository.findForAdmin(adminId);
  await sendToSubscriptions(subscriptions, {
    title: "Virtual Reality — Test Notification",
    body: "Push notifications are working correctly on this device.",
    url: "/admin/leads",
  });
  return subscriptions.length;
}
