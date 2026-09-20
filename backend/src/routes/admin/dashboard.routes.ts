/*
 * PURPOSE:
 * Admin dashboard route definition.
 *
 * FLOW:
 * Admin Dashboard View -> GET /api/admin/dashboard -> Auth Middleware -> Controller.
 *
 * RESPONSIBILITY:
 * Mounts GET /api/admin/dashboard with mandatory administrator authentication.
 */

import express, { Router } from "express";
import { getDashboardController } from "../../controllers/admin/dashboard.controller.js";
import { requireAdminAuthentication } from "../../middleware/auth.middleware.js";

const router = Router();
router.use(express.json());

router.get("/", requireAdminAuthentication, getDashboardController);

export default router;
