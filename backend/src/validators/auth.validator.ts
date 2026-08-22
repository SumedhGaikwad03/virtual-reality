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

function validationError(message: string) {
  const error = new Error(message);
  error.name = "AuthValidationError";
  Object.assign(error, {
    code: "INVALID_AUTH_REQUEST",
    statusCode: 400,
  });
  return error;
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
    typeof body.password !== "string" ||
    body.password === ""
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

  if (typeof body.email !== "string" || body.email.trim() === "") {
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
    typeof body.newPassword !== "string" ||
    body.newPassword.length < 8
  ) {
    next(
      validationError(
        "Token and a password of at least 8 characters are required",
      ),
    );
    return;
  }

  next();
}
