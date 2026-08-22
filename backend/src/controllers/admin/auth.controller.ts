import type { NextFunction, Request, Response } from "express";
import {
  forgotPassword,
  login,
  resetPassword,
} from "../../services/auth.service.js";
import type {
  ForgotPasswordRequestBody,
  LoginRequestBody,
  ResetPasswordRequestBody,
} from "../../validators/auth.validator.js";

export async function loginController(
  req: Request<{}, unknown, LoginRequestBody>,
  res: Response,
  next: NextFunction,
) {
  try {
    const body = req.body as { email: string; password: string };
    res.status(200).json(await login(body.email, body.password));
  } catch (error) {
    next(error);
  }
}

export async function forgotPasswordController(
  req: Request<{}, unknown, ForgotPasswordRequestBody>,
  res: Response,
  next: NextFunction,
) {
  try {
    const body = req.body as { email: string };
    res.status(200).json(await forgotPassword(body.email));
  } catch (error) {
    next(error);
  }
}

export async function resetPasswordController(
  req: Request<{}, unknown, ResetPasswordRequestBody>,
  res: Response,
  next: NextFunction,
) {
  try {
    const body = req.body as { token: string; newPassword: string };
    res.status(200).json(await resetPassword(body.token, body.newPassword));
  } catch (error) {
    next(error);
  }
}
