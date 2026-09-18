/*
 * PURPOSE:
 * Rental Desk advisory closing & direct contact section.
 *
 * FLOW:
 * RentalsPage -> RentalClosingSection -> useSite() contact details.
 *
 * RESPONSIBILITY:
 * Reinforces the connection-layer advisory model and provides direct telephone,
 * WhatsApp, and office address paths for immediate inquiries.
 */

import type { SiteData } from "../../types/site";

type RentalClosingSectionProps = {
  site: SiteData;
};

export function RentalClosingSection({ site }: RentalClosingSectionProps) {
  const contact = site.contact;
  const phoneLink = contact?.phone ? `tel:${contact.phone.replace(/[^+\d]/g, "")}` : null;
  const emailLink = contact?.email ? `mailto:${contact.email}` : null;
  const whatsappUrl = contact?.whatsappUrl || null;

  return (
    <section className="rental-closing-section" aria-labelledby="rental-closing-heading">
      <div className="rental-section-container">
        <div className="rental-closing-card">
          <div className="rental-closing-content">
            <span className="rental-eyebrow">DIRECT ADVISORY</span>
            <h2 id="rental-closing-heading" className="rental-closing-title">
              Speak directly with our Rental Desk.
            </h2>
            <p className="rental-closing-desc">
              Whether you are relocating to Pune, seeking a specific residence, or listing your property, our team is available to assist you personally.
            </p>

            <div className="rental-closing-contact-grid">
              {contact?.phone && (
                <div className="rental-closing-item">
                  <span className="rental-contact-label">Telephone</span>
                  {phoneLink ? (
                    <a href={phoneLink} className="rental-contact-val">
                      {contact.phone}
                    </a>
                  ) : (
                    <span className="rental-contact-val">{contact.phone}</span>
                  )}
                </div>
              )}

              {contact?.email && (
                <div className="rental-closing-item">
                  <span className="rental-contact-label">Email Inquiries</span>
                  {emailLink ? (
                    <a href={emailLink} className="rental-contact-val">
                      {contact.email}
                    </a>
                  ) : (
                    <span className="rental-contact-val">{contact.email}</span>
                  )}
                </div>
              )}

              {contact?.address && (
                <div className="rental-closing-item">
                  <span className="rental-contact-label">Advisory Office</span>
                  <p className="rental-contact-val address-text">{contact.address}</p>
                </div>
              )}
            </div>

            {whatsappUrl && (
              <div className="rental-closing-actions">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rental-whatsapp-pill-btn"
                >
                  <span>Chat with Rental Desk on WhatsApp →</span>
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
