/*
 * PURPOSE:
 * Firm contact data access repository.
 *
 * FLOW:
 * Admin / Public Site Flow -> ContactRepository -> PostgreSQL (Prisma).
 *
 * RESPONSIBILITY:
 * Provides single source of truth for persisted firm contact details (person name, phone,
 * email, office address, Google Maps URL, WhatsApp URL).
 */

import { prisma } from "../lib/prisma.js";

export const DEFAULT_FIRM_CONTACT = {
  contactPersonName: "Dipankar Jagtap",
  phone: "+91 89996 43665",
  email: "dipankarjagtap@virtual2reality.in",
  address:
    "Office No. 202, 2nd Floor\nMspace Mall, Near Mahindra Antheia\nPimpri, Pune 411018",
  googleMapsUrl: null as string | null,
  whatsappUrl:
    "https://api.whatsapp.com/send/?phone=918999643665&text&type=phone_number&app_absent=0",
};

export type UpdateFirmContactInput = {
  contactPersonName?: string;
  phone?: string;
  email?: string;
  address?: string;
  googleMapsUrl?: string | null;
  whatsappUrl?: string;
};

export class ContactRepository {
  async findContact() {
    const contact = await prisma.firmContact.findUnique({
      where: { id: "default" },
    });

    if (!contact) {
      return {
        id: "default",
        ...DEFAULT_FIRM_CONTACT,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }

    return contact;
  }

  async updateContact(data: UpdateFirmContactInput) {
    const updatePayload: Record<string, any> = {};

    if (data.contactPersonName !== undefined) {
      updatePayload.contactPersonName = data.contactPersonName.trim();
    }
    if (data.phone !== undefined) {
      updatePayload.phone = data.phone.trim();
    }
    if (data.email !== undefined) {
      updatePayload.email = data.email.trim();
    }
    if (data.address !== undefined) {
      updatePayload.address = data.address.trim();
    }
    if (data.googleMapsUrl !== undefined) {
      updatePayload.googleMapsUrl = data.googleMapsUrl ? data.googleMapsUrl.trim() : null;
    }
    if (data.whatsappUrl !== undefined) {
      updatePayload.whatsappUrl = data.whatsappUrl.trim();
    }

    return prisma.firmContact.upsert({
      where: { id: "default" },
      update: updatePayload,
      create: {
        id: "default",
        contactPersonName: data.contactPersonName?.trim() || DEFAULT_FIRM_CONTACT.contactPersonName,
        phone: data.phone?.trim() || DEFAULT_FIRM_CONTACT.phone,
        email: data.email?.trim() || DEFAULT_FIRM_CONTACT.email,
        address: data.address?.trim() || DEFAULT_FIRM_CONTACT.address,
        googleMapsUrl: data.googleMapsUrl ? data.googleMapsUrl.trim() : null,
        whatsappUrl: data.whatsappUrl?.trim() || DEFAULT_FIRM_CONTACT.whatsappUrl,
      },
    });
  }
}

export const contactRepository = new ContactRepository();
