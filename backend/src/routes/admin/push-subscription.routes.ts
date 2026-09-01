/*
 * PURPOSE:
 * Defines authenticated push subscription endpoints for the admin workspace.
 *
 * FLOW:
 * /api/admin/push-subscriptions -> auth -> validation -> controller -> service.
 *
 * RESPONSIBILITY:
 * Expose registration and removal while keeping subscription ownership server-derived.
 */

import express, { Router } from "express";
import {
  getPushSubscriptionStatusController,
  registerPushSubscriptionController,
  removePushSubscriptionController,
} from "../../controllers/admin/push-subscription.controller.js";
import { sendTestPushController } from "../../controllers/admin/push-test.controller.js";
import { requireAdminAuthentication } from "../../middleware/auth.middleware.js";
import {
  validatePushSubscription,
  validatePushSubscriptionRemoval,
} from "../../validators/push-subscription.validator.js";

const router = Router();
router.use(express.json());
router.use(requireAdminAuthentication);
router.get("/", getPushSubscriptionStatusController);
router.post("/test", sendTestPushController);
router.post("/", validatePushSubscription, registerPushSubscriptionController);
router.delete("/", validatePushSubscriptionRemoval, removePushSubscriptionController);

export default router;
