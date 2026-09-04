import type { NextFunction, Request, Response } from "express";

export type LoginRequestBody = {
  email?: unknown;
  password?: unknown;
};

export type ForgotPasswordRequestBody = {
  email?: unknown;
};

export type ResetPasswordRequestBody = {
  token?: unknown;
  newPassword?: unknown;
};

export type CreateAdminRequestBody = {
  email?: unknown;
  password?: unknown;
  name?: unknown;
  firstName?: unknown;
  lastName?: unknown;
};

function validationError(message: string) {
  const error = new Error(message);
  error.name = "AuthValidationError";
  Object.assign(error, {
    code: "INVALID_AUTH_REQUEST",
    statusCode: 400,
  });
  return error;
}

export function validateCreateAdminBody(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  const body = req.body as CreateAdminRequestBody;

  if (
    typeof body.email !== "string" ||
    body.email.trim() === "" ||
    body.email.length > 255
  ) {
    next(validationError("Valid email is required"));
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(body.email.trim())) {
    next(validationError("Invalid email format"));
    return;
  }

  if (
    typeof body.password !== "string" ||
    body.password.length < 8 ||
    body.password.length > 128
  ) {
    next(validationError("Password must be between 8 and 128 characters"));
    return;
  }

  if (
    body.firstName !== undefined &&
    (typeof body.firstName !== "string" || !body.firstName.trim())
  ) {
    next(validationError("First name must be a non-empty string"));
    return;
  }

  if (
    body.lastName !== undefined &&
    (typeof body.lastName !== "string" || !body.lastName.trim())
  ) {
    next(validationError("Last name must be a non-empty string"));
    return;
  }

  if (
    body.name !== undefined &&
    (typeof body.name !== "string" || !body.name.trim())
  ) {
    next(validationError("Name must be a non-empty string"));
    return;
  }

  const derivedName =
    typeof body.name === "string" && body.name.trim()
      ? body.name.trim()
      : [body.firstName, body.lastName]
          .filter((s) => typeof s === "string" && s.trim())
          .join(" ")
          .trim();

  if (derivedName) {
    (req.body as any).name = derivedName;
  }

  next();
}

export function validateLoginBody(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  const body = req.body as LoginRequestBody;

  if (
    typeof body.email !== "string" ||
    body.email.trim() === "" ||
    body.email.length > 255 ||
    typeof body.password !== "string" ||
    body.password === "" ||
    body.password.length > 128
  ) {
    next(validationError("Email and password are required"));
    return;
  }

  next();
}

export function validateForgotPasswordBody(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  const body = req.body as ForgotPasswordRequestBody;

  if (
    typeof body.email !== "string" ||
    body.email.trim() === "" ||
    body.email.length > 255
  ) {
    next(validationError("Email is required"));
    return;
  }

  next();
}

export function validateResetPasswordBody(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  const body = req.body as ResetPasswordRequestBody;

  if (
    typeof body.token !== "string" ||
    body.token.trim() === "" ||
    body.token.length > 512 ||
    typeof body.newPassword !== "string" ||
    body.newPassword.length < 8 ||
    body.newPassword.length > 128
  ) {
    next(
      validationError(
        "Token and a password between 8 and 128 characters are required",
      ),
    );
    return;
  }

  next();
}

export type UpdateAdminProfileRequestBody = {
  name?: unknown;
  firstName?: unknown;
  lastName?: unknown;
  email?: unknown;
};

export function validateUpdateAdminProfileBody(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  const body = req.body as UpdateAdminProfileRequestBody;

  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    next(validationError("Invalid request body"));
    return;
  }

  if (body.email !== undefined) {
    if (
      typeof body.email !== "string" ||
      body.email.trim() === "" ||
      body.email.length > 255
    ) {
      next(validationError("Valid email is required"));
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email.trim())) {
      next(validationError("Invalid email format"));
      return;
    }
  }

  if (
    body.firstName !== undefined &&
    (typeof body.firstName !== "string" || body.firstName.length > 255)
  ) {
    next(validationError("First name must be a string up to 255 characters"));
    return;
  }

  if (
    body.lastName !== undefined &&
    (typeof body.lastName !== "string" || body.lastName.length > 255)
  ) {
    next(validationError("Last name must be a string up to 255 characters"));
    return;
  }

  if (
    body.name !== undefined &&
    (typeof body.name !== "string" || body.name.length > 255)
  ) {
    next(validationError("Name must be a string up to 255 characters"));
    return;
  }

  const derivedName =
    typeof body.name === "string" && body.name.trim()
      ? body.name.trim()
      : [body.firstName, body.lastName]
          .filter((s) => typeof s === "string" && (s as string).trim())
          .join(" ")
          .trim();

  if (body.name !== undefined || body.firstName !== undefined || body.lastName !== undefined) {
    (req.body as any).name = derivedName || null;
  }

  if (body.email === undefined && (req.body as any).name === undefined) {
    next(validationError("At least one field (name or email) must be provided"));
    return;
  }

  next();
}

export type UpdateAdminStatusRequestBody = {
  isActive?: unknown;
};

export function validateUpdateAdminStatusBody(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  const body = req.body as UpdateAdminStatusRequestBody;

  if (typeof body?.isActive !== "boolean") {
    next(validationError("isActive must be a boolean"));
    return;
  }

  next();
}

export type ChangeAdminPasswordRequestBody = {
  currentPassword?: unknown;
  newPassword?: unknown;
};

export function validateChangeAdminPasswordBody(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  const body = req.body as ChangeAdminPasswordRequestBody;

  if (
    typeof body?.newPassword !== "string" ||
    body.newPassword.length < 8 ||
    body.newPassword.length > 128
  ) {
    next(validationError("New password must be between 8 and 128 characters"));
    return;
  }

  if (
    body.currentPassword !== undefined &&
    (typeof body.currentPassword !== "string" || body.currentPassword.length > 128)
  ) {
    next(validationError("Current password must be a valid string"));
    return;
  }

  next();
}
