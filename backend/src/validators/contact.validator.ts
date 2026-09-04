/*
 * PURPOSE:
 * Contact update request validation middleware.
 *
 * FLOW:
 * Admin Contact Routes -> validateContactUpdate -> contact.controller.
 *
 * RESPONSIBILITY:
 * Enforces string types, non-empty required contact fields, valid email syntax,
 * and safe HTTP/HTTPS URL protocols for Maps and WhatsApp links.
 */

import type { Request, Response, NextFunction } from "express";

export function validateContactUpdate(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  const { contactPersonName, phone, email, address, googleMapsUrl, whatsappUrl } =
    req.body;

  if (contactPersonName !== undefined) {
    if (typeof contactPersonName !== "string" || !contactPersonName.trim()) {
      return next({
        code: "INVALID_CONTACT_REQUEST",
        message: "Contact person name must be a non-empty string",
      });
    }
  }

  if (phone !== undefined) {
    if (typeof phone !== "string" || !phone.trim()) {
      return next({
        code: "INVALID_CONTACT_REQUEST",
        message: "Phone number must be a non-empty string",
      });
    }
  }

  if (email !== undefined) {
    if (
      typeof email !== "string" ||
      !email.trim() ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    ) {
      return next({
        code: "INVALID_CONTACT_REQUEST",
        message: "A valid email address is required",
      });
    }
  }

  if (address !== undefined) {
    if (typeof address !== "string" || !address.trim()) {
      return next({
        code: "INVALID_CONTACT_REQUEST",
        message: "Office address must be a non-empty string",
      });
    }
  }

  if (googleMapsUrl !== undefined && googleMapsUrl !== null && googleMapsUrl !== "") {
    if (
      typeof googleMapsUrl !== "string" ||
      (!googleMapsUrl.startsWith("https://") && !googleMapsUrl.startsWith("http://"))
    ) {
      return next({
        code: "INVALID_CONTACT_REQUEST",
        message: "Google Maps URL must be a valid HTTP or HTTPS URL",
      });
    }
  }

  if (whatsappUrl !== undefined) {
    if (
      typeof whatsappUrl !== "string" ||
      (!whatsappUrl.startsWith("https://") && !whatsappUrl.startsWith("http://"))
    ) {
      return next({
        code: "INVALID_CONTACT_REQUEST",
        message: "WhatsApp URL must be a valid HTTPS URL",
      });
    }
  }

  next();
}
