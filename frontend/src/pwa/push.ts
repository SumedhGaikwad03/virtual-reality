/*
 * PURPOSE:
 * Registers and manages the current authenticated admin browser for Web Push notifications.
 *
 * FLOW:
 * Explicit admin action -> browser permission -> service worker PushSubscription -> admin API.
 *
 * RESPONSIBILITY:
 * Own browser capability checks, service worker lifecycle, and subscription serialization while leaving delivery to the backend.
 */

import {
  getAdminPushSubscriptionStatus,
  registerAdminPushSubscription,
  removeAdminPushSubscription,
  sendAdminPushTest,
} from "../api/admin-push-subscriptions";

function decodeVapidKey(value: string) {
  const padding = "=".repeat((4 - (value.length % 4)) % 4);
  const base64 = (value + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(base64);
  return Uint8Array.from(raw, (character) => character.charCodeAt(0));
}

async function ensureServiceWorker(): Promise<ServiceWorkerRegistration> {
  let registration = await navigator.serviceWorker.getRegistration("/sw.js");
  if (!registration) {
    registration = await navigator.serviceWorker.register("/sw.js");
  }
  await navigator.serviceWorker.ready;
  return registration;
}

export async function enableLeadNotifications() {
  const publicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
  if (
    !publicKey ||
    !("Notification" in window) ||
    !("serviceWorker" in navigator) ||
    !("PushManager" in window)
  ) {
    throw new Error(
      "Push notifications are not supported in this browser or environment (VAPID public key missing or unsupported browser).",
    );
  }

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    throw new Error(
      permission === "denied"
        ? "Notification permission was blocked in browser settings."
        : "Notification permission was not granted.",
    );
  }

  const registration = await ensureServiceWorker();
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: decodeVapidKey(publicKey),
  });
  const json = subscription.toJSON();

  if (!json.endpoint || !json.keys?.p256dh || !json.keys.auth) {
    throw new Error("The browser returned an incomplete push subscription.");
  }

  await registerAdminPushSubscription({
    endpoint: json.endpoint,
    keys: { p256dh: json.keys.p256dh, auth: json.keys.auth },
    userAgent: navigator.userAgent,
  });
}

export async function disableLeadNotifications() {
  if (!("serviceWorker" in navigator)) return;

  const registration = await navigator.serviceWorker.getRegistration("/sw.js");
  if (!registration) return;

  const subscription = await registration.pushManager.getSubscription();
  if (subscription) {
    const endpoint = subscription.endpoint;
    try {
      await subscription.unsubscribe();
    } catch {
      // Ignore unsubscribe error if already removed
    }
    await removeAdminPushSubscription(endpoint);
  }
}

export type LeadNotificationState = {
  supported: boolean;
  permission: NotificationPermission | "unsupported";
  registered: boolean;
  deviceCount: number;
};

export async function getLeadNotificationState(): Promise<LeadNotificationState> {
  const publicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
  if (
    !publicKey ||
    !("Notification" in window) ||
    !("serviceWorker" in navigator) ||
    !("PushManager" in window)
  ) {
    return {
      supported: false,
      permission: "unsupported",
      registered: false,
      deviceCount: 0,
    };
  }

  const permission = Notification.permission;
  if (permission === "denied") {
    return {
      supported: true,
      permission,
      registered: false,
      deviceCount: 0,
    };
  }

  const registration = await navigator.serviceWorker.getRegistration("/sw.js");
  if (!registration) {
    return {
      supported: true,
      permission,
      registered: false,
      deviceCount: 0,
    };
  }

  const subscription = await registration.pushManager.getSubscription();
  if (!subscription || permission !== "granted") {
    return {
      supported: true,
      permission,
      registered: false,
      deviceCount: 0,
    };
  }

  try {
    const status = await getAdminPushSubscriptionStatus();
    return {
      supported: true,
      permission,
      registered: status.data.registered,
      deviceCount: status.data.deviceCount,
    };
  } catch {
    return {
      supported: true,
      permission,
      registered: false,
      deviceCount: 0,
    };
  }
}

export async function sendLeadNotificationTest() {
  const state = await getLeadNotificationState();
  if (!state.supported) {
    throw new Error("Push notifications are not supported in this browser or environment.");
  }
  if (state.permission !== "granted") {
    throw new Error("Notification permission has not been granted.");
  }
  if (!state.registered) {
    throw new Error("This device is not registered on the server for lead notifications.");
  }
  return sendAdminPushTest();
}
