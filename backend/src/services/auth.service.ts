import bcrypt from "bcryptjs";
import { createHash, randomBytes } from "node:crypto";
import jwt, { type SignOptions } from "jsonwebtoken";
import { adminRepository } from "../repositories/admin.repository.js";

const PASSWORD_SALT_ROUNDS = 12;
const RESET_TOKEN_TTL_MS = 15 * 60 * 1000;
const MIN_PASSWORD_LENGTH = 8;
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isValidUuid(id: string): boolean {
  return typeof id === "string" && UUID_REGEX.test(id);
}

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

  if (!secret || secret.trim().length === 0) {
    throw new Error("JWT_SECRET is not configured");
  }

  if (process.env.NODE_ENV === "production" && secret.length < 32) {
    throw new Error("JWT_SECRET must be at least 32 characters long in production");
  }

  const expiresIn = process.env.JWT_EXPIRES_IN ?? "15m";

  return {
    secret,
    algorithm: "HS256" as const,
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
      algorithm: jwtConfiguration.algorithm,
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
        role: admin.role,
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

export async function listAdmins() {
  const admins = await adminRepository.findAll();
  return {
    data: admins.map((admin) => ({
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
      isActive: admin.isActive,
      createdAt: admin.createdAt,
      updatedAt: admin.updatedAt,
    })),
  };
}

export async function getAdminById(id: string) {
  if (!isValidUuid(id)) {
    throw new AuthError("ADMIN_NOT_FOUND", 404, "Administrator not found");
  }
  const admin = await adminRepository.findById(id);
  if (!admin) {
    throw new AuthError("ADMIN_NOT_FOUND", 404, "Administrator not found");
  }
  return {
    data: {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
      isActive: admin.isActive,
      createdAt: admin.createdAt,
      updatedAt: admin.updatedAt,
    },
  };
}

export async function updateAdminProfile(
  _actorAdminId: string,
  targetAdminId: string,
  input: { name?: string | null; email?: string },
) {
  if (!isValidUuid(targetAdminId)) {
    throw new AuthError("ADMIN_NOT_FOUND", 404, "Administrator not found");
  }
  const targetAdmin = await adminRepository.findById(targetAdminId);
  if (!targetAdmin) {
    throw new AuthError("ADMIN_NOT_FOUND", 404, "Administrator not found");
  }

  const updateData: { name?: string | null; email?: string } = {};

  if (input.name !== undefined) {
    updateData.name = input.name ? input.name.trim() : null;
  }

  if (input.email !== undefined) {
    const normalized = normalizeEmail(input.email);
    if (normalized !== targetAdmin.email) {
      const existing = await adminRepository.findByEmail(normalized);
      if (existing && existing.id !== targetAdminId) {
        throw new AuthError("ADMIN_EXISTS", 409, "An administrator with this email already exists");
      }
      updateData.email = normalized;
    }
  }

  try {
    const updated = await adminRepository.updateProfile(targetAdminId, updateData);
    return {
      data: {
        id: updated.id,
        email: updated.email,
        name: updated.name,
        role: updated.role,
        isActive: updated.isActive,
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt,
      },
    };
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      throw new AuthError("ADMIN_EXISTS", 409, "An administrator with this email already exists");
    }
    throw error;
  }
}

export async function updateAdminStatus(
  actorAdminId: string,
  targetAdminId: string,
  isActive: boolean,
) {
  if (!isValidUuid(targetAdminId)) {
    throw new AuthError("ADMIN_NOT_FOUND", 404, "Administrator not found");
  }
  const targetAdmin = await adminRepository.findById(targetAdminId);
  if (!targetAdmin) {
    throw new AuthError("ADMIN_NOT_FOUND", 404, "Administrator not found");
  }

  if (actorAdminId === targetAdminId && !isActive) {
    throw new AuthError(
      "ADMIN_CANNOT_DISABLE_SELF",
      400,
      "Administrators cannot deactivate their own account",
    );
  }

  if (targetAdmin.isActive && !isActive) {
    const activeCount = await adminRepository.countActive();
    if (activeCount <= 1) {
      throw new AuthError(
        "ADMIN_LAST_ACTIVE_ACCOUNT",
        400,
        "Cannot deactivate the last active administrator account",
      );
    }
  }

  const updated = await adminRepository.updateStatus(targetAdminId, isActive);
  return {
    data: {
      id: updated.id,
      email: updated.email,
      name: updated.name,
      role: updated.role,
      isActive: updated.isActive,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    },
  };
}

export async function changeAdminPassword(
  actorAdminId: string,
  targetAdminId: string,
  input: { currentPassword?: string; newPassword: string },
) {
  if (!isValidUuid(targetAdminId)) {
    throw new AuthError("ADMIN_NOT_FOUND", 404, "Administrator not found");
  }
  const targetAdmin = await adminRepository.findById(targetAdminId);
  if (!targetAdmin) {
    throw new AuthError("ADMIN_NOT_FOUND", 404, "Administrator not found");
  }

  if (input.newPassword.length < MIN_PASSWORD_LENGTH) {
    throw new AuthError("INVALID_AUTH_REQUEST", 400, "Password must be at least 8 characters");
  }

  if (actorAdminId === targetAdminId) {
    if (!input.currentPassword) {
      throw new AuthError("INVALID_CREDENTIALS", 400, "Current password is required to change password");
    }
    const isCurrentValid = await bcrypt.compare(input.currentPassword, targetAdmin.passwordHash);
    if (!isCurrentValid) {
      throw new AuthError("INVALID_CREDENTIALS", 400, "Current password is incorrect");
    }
  }

  const newHash = await bcrypt.hash(input.newPassword, PASSWORD_SALT_ROUNDS);
  await adminRepository.updatePassword(targetAdminId, newHash);

  return {
    data: {
      message: "Password updated successfully.",
    },
  };
}
