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
