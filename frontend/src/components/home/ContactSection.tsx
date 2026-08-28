/*
 * PURPOSE:
 * Renders the site contact information section on the homepage.
 *
 * FLOW:
 * Homepage Content Flow
 *
 * RESPONSIBILITY:
 * Displays firm phone link, email link, and postal address.
 * Returns null if all contact fields are empty/unavailable.
 */

import type { SiteContact } from "../../types/site";

type ContactSectionProps = {
  contact: SiteContact;
};

export function ContactSection({ contact }: ContactSectionProps) {
  const hasContact = Boolean(contact.phone || contact.email || contact.address);

  if (!hasContact) {
    return null;
  }

  return (
    <section>
      <h2>Contact</h2>
      {contact.phone && <a href={`tel:${contact.phone}`}>{contact.phone}</a>}
      {contact.email && <a href={`mailto:${contact.email}`}>{contact.email}</a>}
      {contact.address && <p>{contact.address}</p>}
    </section>
  );
}
