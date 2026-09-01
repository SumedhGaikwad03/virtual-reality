/*
 * PURPOSE:
 * Registers the current authenticated admin browser for Web Push notifications.
 *
 * FLOW:
 * Explicit admin action -> browser permission -> service worker PushSubscription -> admin API.
 *
 * RESPONSIBILITY:
 * Own browser capability checks and subscription serialization while leaving delivery to the backend.
 */

import {
  getAdminPushSubscriptionStatus,
  registerAdminPushSubscription,
  sendAdminPushTest,
} from "../api/admin-push-subscriptions";

function decodeVapidKey(value: string) {
  const padding = "=".repeat((4 - (value.length % 4)) % 4);
  const base64 = (value + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(base64);
  return Uint8Array.from(raw, (character) => character.charCodeAt(0));
}

export async function enableLeadNotifications() {
  const publicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
  if (!publicKey || !("Notification" in window) || !("serviceWorker" in navigator) || !("PushManager" in window)) {
    throw new Error("Push notifications are not supported in this browser or environment.");
  }

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    throw new Error("Notification permission was not granted.");
  }

  const registration = await navigator.serviceWorker.ready;
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

export async function getLeadNotificationState() {
  const publicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
  if (!publicKey || !("Notification" in window) || !("serviceWorker" in navigator) || !("PushManager" in window)) {
    return { supported: false, permission: "unsupported" as const, registered: false };
  }

  const permission = Notification.permission;
  if (permission === "denied") return { supported: true, permission, registered: false };
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();
  if (!subscription || permission !== "granted") {
    return { supported: true, permission, registered: false };
  }

  const status = await getAdminPushSubscriptionStatus();
  return { supported: true, permission, registered: status.data.registered };
}

export async function sendLeadNotificationTest() {
  const state = await getLeadNotificationState();
  if (!state.supported) throw new Error("Push notifications are not supported in this browser or environment.");
  if (state.permission !== "granted") throw new Error("Notification permission has not been granted.");
  if (!state.registered) throw new Error("This device is not registered for lead notifications.");
  return sendAdminPushTest();
}
