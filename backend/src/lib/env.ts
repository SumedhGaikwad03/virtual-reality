/*
 * PURPOSE:
 * Fail-fast startup environment configuration validator.
 *
 * FLOW:
 * Server Boot -> validateEnvironment() -> app.listen()
 *
 * RESPONSIBILITY:
 * Validates critical environment variables before the HTTP server begins accepting traffic.
 * Enforces production security constraints (e.g. JWT secret length >= 32 chars, DB URL, Cloudinary credentials)
 * without exposing secret values in logs or error messages.
 */

export function validateEnvironment(): void {
  const isProduction = process.env.NODE_ENV === "production";
  const errors: string[] = [];

  // Database URL
  if (!process.env.DATABASE_URL || process.env.DATABASE_URL.trim() === "") {
    errors.push("DATABASE_URL is required and cannot be empty.");
  }

  // JWT Secret
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret || jwtSecret.trim() === "") {
    errors.push("JWT_SECRET is required and cannot be empty.");
  } else if (isProduction && jwtSecret.length < 32) {
    errors.push("JWT_SECRET must be at least 32 characters long in production.");
  }

  // Cloudinary storage configuration
  if (isProduction) {
    if (!process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME.trim() === "") {
      errors.push("CLOUDINARY_CLOUD_NAME is required in production.");
    }
    if (!process.env.CLOUDINARY_API_KEY || process.env.CLOUDINARY_API_KEY.trim() === "") {
      errors.push("CLOUDINARY_API_KEY is required in production.");
    }
    if (!process.env.CLOUDINARY_API_SECRET || process.env.CLOUDINARY_API_SECRET.trim() === "") {
      errors.push("CLOUDINARY_API_SECRET is required in production.");
    }
  }

  // VAPID Web Push configuration (if any VAPID variable is provided, all required components must be present)
  const vapidPublic = process.env.VAPID_PUBLIC_KEY;
  const vapidPrivate = process.env.VAPID_PRIVATE_KEY;
  const vapidSubject = process.env.VAPID_SUBJECT;
  if (vapidPublic || vapidPrivate || vapidSubject) {
    if (!vapidPublic || vapidPublic.trim() === "") {
      errors.push("VAPID_PUBLIC_KEY is required when Web Push is configured.");
    }
    if (!vapidPrivate || vapidPrivate.trim() === "") {
      errors.push("VAPID_PRIVATE_KEY is required when Web Push is configured.");
    }
    if (!vapidSubject || vapidSubject.trim() === "") {
      errors.push("VAPID_SUBJECT is required when Web Push is configured (e.g. mailto:admin@virtual2reality.in).");
    }
  }

  if (errors.length > 0) {
    const message = `[FATAL] Startup environment validation failed:\n- ${errors.join("\n- ")}`;
    console.error(message);
    throw new Error(message);
  }
}
