/*
 * PURPOSE:
 * Persists authenticated admin browser push subscriptions.
 *
 * FLOW:
 * Push subscription service -> repository -> Prisma PushSubscription model.
 *
 * RESPONSIBILITY:
 * Store one subscription per endpoint, support multiple devices per admin, and remove expired endpoints.
 */

import { prisma } from "../lib/prisma.js";

const subscriptionSelect = {
  id: true,
  adminId: true,
  endpoint: true,
  p256dh: true,
  auth: true,
  userAgent: true,
  deviceLabel: true,
  lastUsedAt: true,
} as const;

export class PushSubscriptionRepository {
  findByEndpoint(endpoint: string) {
    return prisma.pushSubscription.findUnique({
      where: { endpoint },
      select: { adminId: true },
    });
  }

  upsert(data: {
    adminId: string;
    endpoint: string;
    p256dh: string;
    auth: string;
    userAgent?: string;
    deviceLabel?: string;
  }) {
    return prisma.pushSubscription.upsert({
      where: { endpoint: data.endpoint },
      create: data,
      update: {
        p256dh: data.p256dh,
        auth: data.auth,
        userAgent: data.userAgent,
        deviceLabel: data.deviceLabel,
        lastUsedAt: new Date(),
      },
      select: subscriptionSelect,
    });
  }

  findForActiveAdmins() {
    return prisma.pushSubscription.findMany({
      where: { admin: { isActive: true } },
      select: subscriptionSelect,
    });
  }

  findForAdmin(adminId: string) {
    return prisma.pushSubscription.findMany({
      where: { adminId, admin: { isActive: true } },
      select: subscriptionSelect,
    });
  }

  deleteByEndpoint(endpoint: string) {
    return prisma.pushSubscription.deleteMany({ where: { endpoint } });
  }

  deleteForAdminEndpoint(adminId: string, endpoint: string) {
    return prisma.pushSubscription.deleteMany({ where: { adminId, endpoint } });
  }
}

export const pushSubscriptionRepository = new PushSubscriptionRepository();
