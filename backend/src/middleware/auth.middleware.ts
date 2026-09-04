import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import type { AdminRole } from "../../generated/prisma/enums.js";
import { adminRepository } from "../repositories/admin.repository.js";

export type AuthenticatedAdmin = {
  id: string;
  email: string;
  name?: string | null;
  role: AdminRole;
};

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function authenticationError() {
  const error = new Error("Authentication required");
  error.name = "AuthenticationRequiredError";
  Object.assign(error, {
    code: "AUTHENTICATION_REQUIRED",
    statusCode: 401,
  });
  return error;
}

function forbiddenError(message = "Founder privileges required") {
  const error = new Error(message);
  error.name = "ForbiddenError";
  Object.assign(error, {
    code: "FORBIDDEN",
    statusCode: 403,
  });
  return error;
}

export async function requireAdminAuthentication(
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
    const payload = jwt.verify(token, secret, {
      algorithms: ["HS256"],
    });
    const jwtPayload = typeof payload === "string" ? undefined : payload;

    if (
      !jwtPayload ||
      typeof jwtPayload.sub !== "string" ||
      !UUID_REGEX.test(jwtPayload.sub) ||
      typeof jwtPayload.email !== "string"
    ) {
      next(authenticationError());
      return;
    }

    const admin = await adminRepository.findById(jwtPayload.sub);
    if (!admin || !admin.isActive) {
      next(authenticationError());
      return;
    }

    res.locals.admin = {
      id: admin.id,
      email: admin.email,
      name: admin.name ?? null,
      role: admin.role,
    } satisfies AuthenticatedAdmin;
    next();
  } catch {
    next(authenticationError());
  }
}

export async function requireFounderAuthentication(
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
    const payload = jwt.verify(token, secret, {
      algorithms: ["HS256"],
    });
    const jwtPayload = typeof payload === "string" ? undefined : payload;

    if (
      !jwtPayload ||
      typeof jwtPayload.sub !== "string" ||
      !UUID_REGEX.test(jwtPayload.sub) ||
      typeof jwtPayload.email !== "string"
    ) {
      next(authenticationError());
      return;
    }

    const admin = await adminRepository.findById(jwtPayload.sub);
    if (!admin || !admin.isActive) {
      next(authenticationError());
      return;
    }

    if (admin.role !== "FOUNDER") {
      next(forbiddenError());
      return;
    }

    res.locals.admin = {
      id: admin.id,
      email: admin.email,
      name: admin.name ?? null,
      role: admin.role,
    } satisfies AuthenticatedAdmin;
    next();
  } catch {
    next(authenticationError());
  }
}
