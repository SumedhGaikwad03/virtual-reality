/*
 * PURPOSE:
 * Provides immediate communication actions for an administrative rental property.
 *
 * FLOW:
 * Rental Available list/detail -> RentalPropertyActions -> WhatsApp or telephone application.
 *
 * RESPONSIBILITY:
 * Builds user-initiated WhatsApp and tel links using available owner context
 * without exposing internal notes or private metadata.
 */

import type { AdminRentalProperty } from "../../types/admin-rental";

function whatsappNumber(phone: string) {
  return phone.replace(/[^0-9]/g, "");
}

export function RentalPropertyActions({
  property,
}: {
  property: AdminRentalProperty;
}) {
  const propertyContext = property.societyDeveloper || property.areaLocality || property.location;
  const message = [
    "Hello",
    property.ownerName,
    "— regarding your",
    property.flatType,
    "flat",
    propertyContext ? `in ${propertyContext}` : "",
    "listed with Virtual Reality Rental Desk.",
  ]
    .filter(Boolean)
    .join(" ");

  const whatsappUrl = `https://wa.me/${whatsappNumber(property.phone)}?text=${encodeURIComponent(
    message,
  )}`;

  return (
    <div
      className="admin-lead-actions"
      aria-label={`Communication actions for ${property.ownerName}`}
    >
      <a
        className="admin-action admin-action--communication"
        href={whatsappUrl}
        target="_blank"
        rel="noreferrer"
      >
        WhatsApp
      </a>
      <a
        className="admin-action admin-action--communication"
        href={`tel:${property.phone}`}
      >
        Call
      </a>
    </div>
  );
}
