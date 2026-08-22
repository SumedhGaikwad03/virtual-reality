import express, { Router } from "express";
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

const router = Router();

router.use(express.json());

router.post("/login", validateLoginBody, loginController);
router.post(
  "/forgot-password",
  validateForgotPasswordBody,
  forgotPasswordController,
);
router.post(
  "/reset-password",
  validateResetPasswordBody,
  resetPasswordController,
);

export default router;
