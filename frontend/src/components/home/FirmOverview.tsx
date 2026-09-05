/*
 * PURPOSE:
 * Displays the firm overview, founder biography, and company identity on the public homepage.
 *
 * FLOW:
 * Homepage Journey Flow: HomePage -> FirmOverview -> Founder & Company Identity.
 *
 * RESPONSIBILITY:
 * Consumes persisted FirmProfile data (founderName, founderTitle, founderExperience,
 * founderBio, companyDescription, founderImage) and renders a responsive,
 * architectural leadership showcase with 3 refined commitments and graceful fallback for missing media.
 */

import type { Site } from "../../types/site";

type FirmOverviewProps = {
  site: Site;
};

export function FirmOverview({ site }: FirmOverviewProps) {
  const profile = site.firmProfile;

  const founderName = profile?.founderName || "Dipankar Jagtap";
  const founderTitle = profile?.founderTitle || "Founder of Virtual Reality";
  const founderExperience =
    profile?.founderExperience ||
    "20+ years of experience in the real estate industry";
  const founderBio =
    profile?.founderBio ||
    "Dipankar Jagtap has shaped the real estate landscape across Pune, delivering distinguished residential and commercial landmarks with exceptional architectural integrity.";
  const companyDescription =
    profile?.companyDescription ||
    site.description ||
    "Virtual Reality is a real-estate discovery platform showcasing prime residential developments and architectural landmarks.";

  const founderImage = profile?.founderImage;

  const monogram = founderName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <section
      id="about"
      className="firm-overview-section"
      aria-label="Firm Leadership and Overview"
    >
      <div className="section-header-editorial">
        <span className="section-eyebrow">BRAND PHILOSOPHY & LEADERSHIP</span>
        <h2 className="section-title">More than spaces. A better way of living.</h2>
        <p className="section-subtitle">
          Shaping Pune's real estate landscape through architectural discernment, verified inventory, and consultative advisory.
        </p>
      </div>

      <div className="firm-overview-card">
        {/* Founder Portrait & Credential Column */}
        <div className="founder-identity-col">
          <div className="founder-portrait-frame">
            {founderImage?.url ? (
              <img
                src={founderImage.url}
                alt={founderImage.altText || founderName}
                className="founder-portrait-img"
                loading="lazy"
              />
            ) : (
              <div
                className="founder-monogram-placeholder"
                aria-label={`${founderName} initials`}
              >
                <span>{monogram}</span>
              </div>
            )}
            <div className="founder-badge-pill">
              <span className="founder-badge-dot" aria-hidden="true" />
              <span>{founderExperience}</span>
            </div>
          </div>

          <div className="founder-name-group">
            <h3 className="founder-name">{founderName}</h3>
            <p className="founder-title">{founderTitle}</p>
          </div>
        </div>

        {/* Narrative & Company Overview Column */}
        <div className="founder-narrative-col">
          {founderBio && (
            <div className="founder-quote-block">
              <span className="quote-mark" aria-hidden="true">
                “
              </span>
              <p className="founder-bio-text">{founderBio}</p>
            </div>
          )}

          <div className="company-philosophy-block">
            <h4 className="company-overview-heading">About Virtual Reality</h4>
            <p className="company-description-text">{companyDescription}</p>
          </div>

          {/* Core Commitments (3 Editorial Pillars) */}
          <div className="firm-pillars-grid">
            <div className="firm-pillar-item">
              <span className="pillar-index">01</span>
              <div className="pillar-content">
                <strong>Curated Portfolio</strong>
                <span>Verified residential inventory & prime developments across Pune</span>
              </div>
            </div>

            <div className="firm-pillar-item">
              <span className="pillar-index">02</span>
              <div className="pillar-content">
                <strong>Unbiased Advisory</strong>
                <span>Direct, consultation-driven guidance without sales pressure</span>
              </div>
            </div>

            <div className="firm-pillar-item">
              <span className="pillar-index">03</span>
              <div className="pillar-content">
                <strong>Preference Discovery</strong>
                <span>Curated requirement matching powered by Tara, our property discovery advisor</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
