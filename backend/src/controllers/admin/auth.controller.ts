import type { NextFunction, Request, Response } from "express";
import {
  changeAdminPassword,
  createAdmin,
  forgotPassword,
  getAdminById,
  listAdmins,
  login,
  resetPassword,
  updateAdminProfile,
  updateAdminStatus,
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

export async function createAdminController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { email, password, name } = req.body as {
      email: string;
      password: string;
      name?: string;
    };

    const newAdmin = await createAdmin({
      email,
      password,
      name,
    });

    res.status(201).json({
      data: {
        id: newAdmin.id,
        email: newAdmin.email,
        name: newAdmin.name,
        role: newAdmin.role,
        isActive: newAdmin.isActive,
        createdAt: newAdmin.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function listAdminsController(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const response = await listAdmins();
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
}

export async function getAdminController(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
) {
  try {
    const response = await getAdminById(req.params.id);
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
}

export async function updateAdminProfileController(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
) {
  try {
    const actorAdminId = res.locals.admin.id;
    const targetAdminId = req.params.id;
    const body = req.body as { name?: string | null; email?: string };

    const response = await updateAdminProfile(actorAdminId, targetAdminId, body);
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
}

export async function updateAdminStatusController(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
) {
  try {
    const actorAdminId = res.locals.admin.id;
    const targetAdminId = req.params.id;
    const { isActive } = req.body as { isActive: boolean };

    const response = await updateAdminStatus(actorAdminId, targetAdminId, isActive);
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
}

export async function changeAdminPasswordController(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
) {
  try {
    const actorAdminId = res.locals.admin.id;
    const targetAdminId = req.params.id;
    const body = req.body as { currentPassword?: string; newPassword: string };

    const response = await changeAdminPassword(actorAdminId, targetAdminId, body);
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
}
