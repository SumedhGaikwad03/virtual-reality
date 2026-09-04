/*
 * PURPOSE:
 * Admin contact controller.
 *
 * FLOW:
 * Admin Contact Routes -> Contact Controller -> Contact Repository.
 *
 * RESPONSIBILITY:
 * Handles fetching and updating persisted firm contact configuration for authenticated administrators.
 */

import type { Request, Response, NextFunction } from "express";
import { contactRepository } from "../../repositories/contact.repository.js";

export async function getContactController(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const contact = await contactRepository.findContact();
    res.json({
      data: {
        id: contact.id,
        contactPersonName: contact.contactPersonName,
        phone: contact.phone,
        email: contact.email,
        address: contact.address,
        googleMapsUrl: contact.googleMapsUrl,
        whatsappUrl: contact.whatsappUrl,
        updatedAt: contact.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function updateContactController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const {
      contactPersonName,
      phone,
      email,
      address,
      googleMapsUrl,
      whatsappUrl,
    } = req.body;

    const updated = await contactRepository.updateContact({
      contactPersonName,
      phone,
      email,
      address,
      googleMapsUrl,
      whatsappUrl,
    });

    res.json({
      data: {
        id: updated.id,
        contactPersonName: updated.contactPersonName,
        phone: updated.phone,
        email: updated.email,
        address: updated.address,
        googleMapsUrl: updated.googleMapsUrl,
        whatsappUrl: updated.whatsappUrl,
        updatedAt: updated.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
}
