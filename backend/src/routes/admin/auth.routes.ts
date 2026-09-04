/*
 * PURPOSE:
 * Admin authentication HTTP route configuration and endpoint rate-limiting.
 *
 * FLOW:
 * Admin Authentication Flow
 *
 * RESPONSIBILITY:
 * Mounts login, forgot-password, and reset-password routes, enforcing strict rate-limiting
 * to protect against credential stuffing, brute-force attacks, and password-reset flooding.
 */

import express, { Router } from "express";
import rateLimit from "express-rate-limit";
import {
  changeAdminPasswordController,
  createAdminController,
  forgotPasswordController,
  getAdminController,
  listAdminsController,
  loginController,
  resetPasswordController,
  updateAdminProfileController,
  updateAdminStatusController,
} from "../../controllers/admin/auth.controller.js";
import {
  requireAdminAuthentication,
  requireFounderAuthentication,
} from "../../middleware/auth.middleware.js";
import {
  validateChangeAdminPasswordBody,
  validateCreateAdminBody,
  validateForgotPasswordBody,
  validateLoginBody,
  validateResetPasswordBody,
  validateUpdateAdminProfileBody,
  validateUpdateAdminStatusBody,
} from "../../validators/auth.validator.js";

/*
 * Login Rate Limiter:
 * Stricter threshold (5 attempts per 15 minutes per IP) to mitigate brute-force password guessing
 * and credential stuffing on admin accounts.
 */
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    error: {
      code: "AUTH_RATE_LIMITED",
      message: "Too many login attempts. Please try again later.",
    },
  },
});

/*
 * Forgot-Password Rate Limiter:
 * Dedicated threshold (5 requests per 15 minutes per IP) to prevent email enumeration,
 * reset-token generation flooding, and outbound resource exhaustion.
 */
const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    error: {
      code: "AUTH_RATE_LIMITED",
      message: "Too many password reset requests. Please try again later.",
    },
  },
});

const router = Router();

router.use(express.json());

router.post("/login", loginLimiter, validateLoginBody, loginController);
router.post(
  "/forgot-password",
  forgotPasswordLimiter,
  validateForgotPasswordBody,
  forgotPasswordController,
);
router.post(
  "/reset-password",
  forgotPasswordLimiter,
  validateResetPasswordBody,
  resetPasswordController,
);

/*
 * Admin Account Management Routes:
 * Protected exclusively by requireFounderAuthentication (FOUNDER role required).
 * Mounted under both /admins and /accounts for naming flexibility and backwards compatibility.
 */
// 1. List all administrators
router.get("/admins", requireFounderAuthentication, listAdminsController);
router.get("/accounts", requireFounderAuthentication, listAdminsController);

// 2. Create an administrator
router.post(
  "/admins",
  requireFounderAuthentication,
  validateCreateAdminBody,
  createAdminController,
);
router.post(
  "/accounts",
  requireFounderAuthentication,
  validateCreateAdminBody,
  createAdminController,
);

// 3. Get single administrator
router.get("/admins/:id", requireFounderAuthentication, getAdminController);
router.get("/accounts/:id", requireFounderAuthentication, getAdminController);

// 4. Update administrator profile (name, email)
router.patch(
  "/admins/:id",
  requireFounderAuthentication,
  validateUpdateAdminProfileBody,
  updateAdminProfileController,
);
router.patch(
  "/accounts/:id",
  requireFounderAuthentication,
  validateUpdateAdminProfileBody,
  updateAdminProfileController,
);

// 5. Update administrator status (activate / deactivate)
router.patch(
  "/admins/:id/status",
  requireFounderAuthentication,
  validateUpdateAdminStatusBody,
  updateAdminStatusController,
);
router.patch(
  "/accounts/:id/status",
  requireFounderAuthentication,
  validateUpdateAdminStatusBody,
  updateAdminStatusController,
);

// 6. Change administrator password
router.patch(
  "/admins/:id/password",
  requireFounderAuthentication,
  validateChangeAdminPasswordBody,
  changeAdminPasswordController,
);
router.patch(
  "/accounts/:id/password",
  requireFounderAuthentication,
  validateChangeAdminPasswordBody,
  changeAdminPasswordController,
);

export default router;
