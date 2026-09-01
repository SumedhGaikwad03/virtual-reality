/*
 * PURPOSE:
 * Provides immediate communication actions for an administrative lead.
 *
 * FLOW:
 * Lead Manager list/detail -> LeadActions -> WhatsApp or phone application.
 *
 * RESPONSIBILITY:
 * Build user-initiated WhatsApp and tel links without sending messages or owning lead state.
 */

import type { AdminLead } from "../../types/admin-lead";

function whatsappNumber(phone: string) {
  return phone.replace(/[^0-9]/g, "");
}

export function LeadActions({ lead }: { lead: AdminLead }) {
  const message = [
    "Hello",
    lead.name,
    lead.project?.name ? `regarding ${lead.project.name}` : "regarding your enquiry",
    lead.configuration?.name ? `(${lead.configuration.name})` : "",
  ].filter(Boolean).join(" ");
  const whatsappUrl = `https://wa.me/${whatsappNumber(lead.phone)}?text=${encodeURIComponent(message)}`;

  return (
    <div className="admin-lead-actions" aria-label={`Actions for ${lead.name}`}>
      <a href={whatsappUrl} target="_blank" rel="noreferrer">WhatsApp</a>
      <a href={`tel:${lead.phone}`}>Call</a>
    </div>
  );
}
