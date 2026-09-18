/*
 * PURPOSE:
 * Provides immediate communication actions for an administrative rental enquiry.
 *
 * FLOW:
 * Rental Enquiries list/detail -> RentalEnquiryActions -> WhatsApp or telephone application.
 *
 * RESPONSIBILITY:
 * Builds user-initiated WhatsApp and tel links using available enquiry context
 * without exposing internal notes or private metadata.
 */

import type { AdminRentalEnquiry } from "../../types/admin-rental";

function whatsappNumber(phone: string) {
  return phone.replace(/[^0-9]/g, "");
}

export function RentalEnquiryActions({
  enquiry,
}: {
  enquiry: AdminRentalEnquiry;
}) {
  const locationText = enquiry.areaLocality || enquiry.location;
  const message = [
    "Hello",
    enquiry.name,
    "— regarding your rental requirement for",
    enquiry.configuration,
    locationText ? `in ${locationText}` : "",
    "on Virtual Reality.",
  ]
    .filter(Boolean)
    .join(" ");

  const whatsappUrl = `https://wa.me/${whatsappNumber(enquiry.phone)}?text=${encodeURIComponent(
    message,
  )}`;

  return (
    <div
      className="admin-lead-actions"
      aria-label={`Communication actions for ${enquiry.name}`}
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
        href={`tel:${enquiry.phone}`}
      >
        Call
      </a>
    </div>
  );
}
