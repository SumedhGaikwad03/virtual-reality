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
  forgotPasswordController,
  loginController,
  resetPasswordController,
} from "../../controllers/admin/auth.controller.js";
import {
  validateForgotPasswordBody,
  validateLoginBody,
  validateResetPasswordBody,
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
  validateResetPasswordBody,
  resetPasswordController,
);

export default router;

