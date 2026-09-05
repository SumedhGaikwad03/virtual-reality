/*
 * PURPOSE:
 * Combined About and Footer identity section for the public homepage.
 *
 * FLOW:
 * Homepage Content Flow: HomePage -> AboutFooter -> Navigation & Contact Links.
 *
 * RESPONSIBILITY:
 * Presents company overview, brand philosophy, founder/leadership presence,
 * persisted contact details, and site footer navigation links with interactive
 * Call, WhatsApp, Email, Maps, and Copy Number action controls.
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import type { Site } from "../../types/site";

type AboutFooterProps = {
  site: Site;
};

export function AboutFooter({ site }: AboutFooterProps) {
  const currentYear = new Date().getFullYear();
  const companyName = site.name || "Virtual Reality";
  const [copySuccess, setCopySuccess] = useState(false);

  const contact = site.contact;
  const rawPhone = contact.phone ? contact.phone.replace(/\s+/g, "") : "";

  function handleCopyNumber() {
    if (contact.phone) {
      navigator.clipboard.writeText(contact.phone);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  }

  const effectiveMapsUrl =
    contact.googleMapsUrl ||
    (contact.address
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          contact.address,
        )}`
      : null);

  const whatsappUrl =
    contact.whatsappUrl ||
    (rawPhone
      ? `https://api.whatsapp.com/send/?phone=${rawPhone.replace(/^\+/, "")}&text&type=phone_number&app_absent=0`
      : null);

  return (
    <footer className="about-footer-section" aria-label="Company identity and footer">
      <div className="about-footer-main">
        {/* Brand & Philosophy Column */}
        <div className="about-brand-column">
          {site.logoUrl ? (
            <img src={site.logoUrl} alt={companyName} className="footer-brand-logo" />
          ) : (
            <span className="footer-brand-text">{companyName}</span>
          )}
          {site.tagline && <p className="footer-brand-tagline">{site.tagline}</p>}
          <p className="footer-about-description">
            {site.firmProfile?.companyDescription ||
              site.description ||
              "Virtual Reality is a real-estate discovery platform showcasing prime residential developments and architectural landmarks."}
          </p>
        </div>

        {/* Navigation Column */}
        <div className="footer-nav-column">
          <h3 className="footer-column-title">Navigation</h3>
          <ul className="footer-nav-list">
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/projects-in-pune">Pune Developments</Link>
            </li>
            <li>
              <Link to="/search">Discover with Tara</Link>
            </li>
            <li>
              <Link to="/privacy-policy">Privacy Policy</Link>
            </li>
          </ul>
        </div>

        {/* Persisted Contact & Quick Actions Column */}
        <div className="footer-contact-column">
          <h3 className="footer-column-title">Contact & Advisory</h3>
          <div className="footer-contact-body">
            {contact.contactPersonName && (
              <p className="footer-contact-person">
                <strong>{contact.contactPersonName}</strong>
                <span className="footer-person-tag">Representative</span>
              </p>
            )}

            {contact.address && (
              <address className="footer-contact-address">
                {contact.address.split("\n").map((line, idx) => (
                  <span key={idx} className="footer-address-line">
                    {line}
                  </span>
                ))}
              </address>
            )}

            {/* Quick Action Pill Suite */}
            <div className="footer-action-pills" role="group" aria-label="Contact actions">
              {contact.phone && (
                <a
                  href={`tel:${rawPhone}`}
                  className="footer-action-pill footer-action-pill--call"
                  aria-label={`Call ${contact.phone}`}
                >
                  <span aria-hidden="true">📞</span> Call
                </a>
              )}

              {whatsappUrl && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-action-pill footer-action-pill--whatsapp"
                  aria-label="Chat on WhatsApp"
                >
                  <span aria-hidden="true">💬</span> WhatsApp
                </a>
              )}

              {contact.email && (
                <a
                  href={`mailto:${contact.email}`}
                  className="footer-action-pill footer-action-pill--email"
                  aria-label={`Email ${contact.email}`}
                >
                  <span aria-hidden="true">✉</span> Email
                </a>
              )}

              {contact.phone && (
                <button
                  type="button"
                  onClick={handleCopyNumber}
                  className="footer-action-pill footer-action-pill--copy"
                  aria-label="Copy phone number"
                >
                  <span aria-hidden="true">📋</span> {copySuccess ? "Copied!" : "Copy"}
                </button>
              )}

              {effectiveMapsUrl && (
                <a
                  href={effectiveMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-action-pill footer-action-pill--maps"
                  aria-label="View on Google Maps"
                >
                  <span aria-hidden="true">📍</span> Maps
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="footer-bottom-bar">
        <p className="footer-copyright">
          © {currentYear} {companyName}. All rights reserved.
        </p>
        <div className="footer-bottom-links">
          <Link to="/privacy-policy" className="footer-bottom-privacy-link">
            Privacy Policy
          </Link>
          <span className="footer-bottom-separator" aria-hidden="true">·</span>
          <span className="footer-attribution">Architectural Real Estate Platform</span>
        </div>
      </div>
    </footer>
  );
}
