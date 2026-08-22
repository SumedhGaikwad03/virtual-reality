import type { NextFunction, Request, Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";

export type AuthenticatedAdmin = {
  id: string;
  email: string;
};

function authenticationError() {
  const error = new Error("Authentication required");
  error.name = "AuthenticationRequiredError";
  Object.assign(error, {
    code: "AUTHENTICATION_REQUIRED",
    statusCode: 401,
  });
  return error;
}

export function requireAdminAuthentication(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const authorization = req.header("authorization");
  const [scheme, token] = authorization?.split(" ") ?? [];
  const secret = process.env.JWT_SECRET;

  if (scheme !== "Bearer" || !token || !secret) {
    next(authenticationError());
    return;
  }

  try {
    const payload = jwt.verify(token, secret);
    const jwtPayload = typeof payload === "string" ? undefined : payload;

    if (
      !jwtPayload ||
      typeof jwtPayload.sub !== "string" ||
      typeof jwtPayload.email !== "string"
    ) {
      next(authenticationError());
      return;
    }

    res.locals.admin = {
      id: jwtPayload.sub,
      email: jwtPayload.email,
    } satisfies AuthenticatedAdmin;
    next();
  } catch {
    next(authenticationError());
  }
}
