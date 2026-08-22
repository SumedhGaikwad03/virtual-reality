import bcrypt from "bcryptjs";
import { createHash, randomBytes } from "node:crypto";
import jwt, { type SignOptions } from "jsonwebtoken";
import { adminRepository } from "../repositories/admin.repository.js";

const PASSWORD_SALT_ROUNDS = 12;
const RESET_TOKEN_TTL_MS = 15 * 60 * 1000;
const MIN_PASSWORD_LENGTH = 8;

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export class AuthError extends Error {
  constructor(
    public readonly code: string,
    public readonly statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = "AuthError";
  }
}

export class AdminCreationError extends Error {
  constructor(
    public readonly code: "ADMIN_EXISTS",
    message: string,
  ) {
    super(message);
    this.name = "AdminCreationError";
  }
}

function isUniqueConstraintError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2002"
  );
}

export async function createAdmin(input: {
  email: string;
  password: string;
  name?: string;
}) {
  if (input.password.length < MIN_PASSWORD_LENGTH) {
    throw new Error("Password must be at least 8 characters");
  }

  const email = normalizeEmail(input.email);
  const existingAdmin = await adminRepository.findByEmail(email);

  if (existingAdmin) {
    throw new AdminCreationError(
      "ADMIN_EXISTS",
      "An admin with this email already exists",
    );
  }

  try {
    return await adminRepository.createAdmin({
      email,
      passwordHash: await bcrypt.hash(input.password, PASSWORD_SALT_ROUNDS),
      ...(input.name?.trim() ? { name: input.name.trim() } : {}),
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      throw new AdminCreationError(
        "ADMIN_EXISTS",
        "An admin with this email already exists",
      );
    }
    throw error;
  }
}

function hashResetToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function getJwtConfiguration() {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }

  const expiresIn = process.env.JWT_EXPIRES_IN ?? "15m";

  return {
    secret,
    expiresIn: expiresIn as SignOptions["expiresIn"],
  };
}

export async function login(email: string, password: string) {
  const admin = await adminRepository.findByEmail(normalizeEmail(email));
  const isValidPassword = admin
    ? await bcrypt.compare(password, admin.passwordHash)
    : false;

  if (!admin || !admin.isActive || !isValidPassword) {
    throw new AuthError(
      "AUTHENTICATION_FAILED",
      401,
      "Invalid email or password",
    );
  }

  const jwtConfiguration = getJwtConfiguration();
  const accessToken = jwt.sign(
    {
      sub: admin.id,
      email: admin.email,
    },
    jwtConfiguration.secret,
    {
      expiresIn: jwtConfiguration.expiresIn,
    },
  );

  return {
    data: {
      accessToken,
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        isActive: admin.isActive,
      },
    },
  };
}

export async function forgotPassword(email: string) {
  const admin = await adminRepository.findByEmail(normalizeEmail(email));
  const responseData: {
    message: string;
    resetToken?: string;
  } = {
    message:
      "If an account exists for this email, a password reset link has been generated.",
  };

  if (!admin || !admin.isActive) {
    return { data: responseData };
  }

  const rawToken = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);

  await adminRepository.createPasswordResetToken(
    admin.id,
    hashResetToken(rawToken),
    expiresAt,
  );

  if (process.env.NODE_ENV === "development") {
    responseData.resetToken = rawToken;
  }

  return { data: responseData };
}

export async function resetPassword(token: string, newPassword: string) {
  const tokenRecord = await adminRepository.findUsablePasswordResetToken(
    hashResetToken(token),
    new Date(),
  );

  if (!tokenRecord || !tokenRecord.admin.isActive) {
    throw new AuthError(
      "INVALID_RESET_TOKEN",
      400,
      "Invalid or expired password reset token",
    );
  }

  const passwordHash = await bcrypt.hash(newPassword, PASSWORD_SALT_ROUNDS);
  const resetSucceeded = await adminRepository.resetPassword(
    tokenRecord.id,
    tokenRecord.adminId,
    passwordHash,
    new Date(),
  );

  if (!resetSucceeded) {
    throw new AuthError(
      "INVALID_RESET_TOKEN",
      400,
      "Invalid or expired password reset token",
    );
  }

  return {
    data: {
      message: "Password has been reset successfully.",
    },
  };
}
