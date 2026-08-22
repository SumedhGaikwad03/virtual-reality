import type { NextFunction, Request, Response } from "express";

export type AdminCreateDeveloperBody = {
  name?: unknown;
  slug?: unknown;
  description?: unknown;
  logoUrl?: unknown;
  websiteUrl?: unknown;
};

export type AdminUpdateDeveloperBody = AdminCreateDeveloperBody;

function adminValidationError(message: string) {
  const error = new Error(message);
  error.name = "AdminDeveloperValidationError";
  Object.assign(error, {
    code: "INVALID_DEVELOPER_REQUEST",
    statusCode: 400,
  });
  return error;
}

function isOptionalString(value: unknown) {
  return value === undefined || typeof value === "string";
}

function validateOptionalFields(body: AdminCreateDeveloperBody) {
  return (
    isOptionalString(body.description) &&
    isOptionalString(body.logoUrl) &&
    isOptionalString(body.websiteUrl)
  );
}

export function validateAdminCreateDeveloper(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  const body = req.body as AdminCreateDeveloperBody;

  if (
    typeof body.name !== "string" ||
    body.name.trim() === "" ||
    typeof body.slug !== "string" ||
    body.slug.trim() === "" ||
    !validateOptionalFields(body)
  ) {
    next(adminValidationError("Name and slug are required strings"));
    return;
  }

  next();
}

export function validateAdminUpdateDeveloper(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  const body = req.body as AdminUpdateDeveloperBody;
  const allowedFields = ["name", "slug", "description", "logoUrl", "websiteUrl"];
  const hasOnlyAllowedFields = Object.keys(body).every((key) =>
    allowedFields.includes(key),
  );

  if (
    !hasOnlyAllowedFields ||
    (body.name !== undefined &&
      (typeof body.name !== "string" || body.name.trim() === "")) ||
    (body.slug !== undefined &&
      (typeof body.slug !== "string" || body.slug.trim() === "")) ||
    !validateOptionalFields(body)
  ) {
    next(adminValidationError("Developer update contains invalid fields"));
    return;
  }

  next();
}

export function validateAdminDeveloperId(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  if (typeof req.params.id !== "string" || req.params.id.trim() === "") {
    next(adminValidationError("Developer id is required"));
    return;
  }

  next();
}

export function validateDeveloperParams(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  const { developerSlug } = req.params;

  if (typeof developerSlug !== "string" || developerSlug.trim() === "") {
    const error = new Error("Invalid developer route parameters");
    error.name = "InvalidDeveloperParamsError";
    Object.assign(error, {
      code: "INVALID_DEVELOPER_PARAMS",
      statusCode: 400,
    });
    next(error);
    return;
  }

  next();
}
