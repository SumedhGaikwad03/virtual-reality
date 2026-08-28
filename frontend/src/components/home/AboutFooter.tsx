/*
 * PURPOSE:
 * Combined About and Footer identity section for the public homepage.
 *
 * FLOW:
 * Homepage Content Flow: HomePage -> AboutFooter -> Navigation & Contact Links.
 *
 * RESPONSIBILITY:
 * Presents company overview, brand philosophy, founder/leadership presence,
 * contact details, and site footer navigation links in a calm, editorial layout.
 */

import { Link } from "react-router-dom";
import type { Site } from "../../types/site";

type AboutFooterProps = {
  site: Site;
};

export function AboutFooter({ site }: AboutFooterProps) {
  const currentYear = new Date().getFullYear();
  const companyName = site.name || "Virtual Reality";

  return (
    <footer className="about-footer-section" aria-label="Company identity and footer">
      <div className="about-footer-main">
        <div className="about-brand-column">
          {site.logoUrl ? (
            <img src={site.logoUrl} alt={companyName} className="footer-brand-logo" />
          ) : (
            <span className="footer-brand-text">{companyName}</span>
          )}
          {site.tagline && <p className="footer-brand-tagline">{site.tagline}</p>}
          <p className="footer-about-description">
            {site.description ||
              "Virtual Reality is a real-estate discovery platform showcasing prime residential developments and architectural landmarks."}
          </p>
        </div>

        <div className="footer-nav-column">
          <h3 className="footer-column-title">Navigation</h3>
          <ul className="footer-nav-list">
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/search">Ask the Assistant</Link>
            </li>
          </ul>
        </div>

        <div className="footer-contact-column">
          <h3 className="footer-column-title">Contact & Location</h3>
          <address className="footer-contact-address">
            {site.contact.address && <p>{site.contact.address}</p>}
            {site.contact.phone && (
              <p>
                Phone: <a href={`tel:${site.contact.phone}`}>{site.contact.phone}</a>
              </p>
            )}
            {site.contact.email && (
              <p>
                Email: <a href={`mailto:${site.contact.email}`}>{site.contact.email}</a>
              </p>
            )}
          </address>
        </div>
      </div>

      <div className="footer-bottom-bar">
        <p className="footer-copyright">
          © {currentYear} {companyName}. All rights reserved.
        </p>
        <p className="footer-attribution">Architectural Real Estate Platform</p>
      </div>
    </footer>
  );
}
