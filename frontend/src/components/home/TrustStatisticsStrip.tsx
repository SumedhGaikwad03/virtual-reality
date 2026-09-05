/*
 * PURPOSE:
 * Editorial trust and statistics strip displayed directly below the homepage hero.
 *
 * FLOW:
 * Homepage Journey Flow: HomePage -> AtmosphericHero -> TrustStatisticsStrip -> ExploreDevelopers.
 *
 * RESPONSIBILITY:
 * Displays verified platform pillars and metrics (Curated Developers, Prime Developments,
 * 20+ Years Advisory Leadership, Consultation-Driven Model) on a soft ivory canvas
 * with refined typography and warm sand separators.
 */

import { useAssistant } from "../../context/AssistantContext";

type TrustStatisticsStripProps = {
  developerCount?: number;
  projectCount?: number;
};

export function TrustStatisticsStrip({
  developerCount = 0,
  projectCount = 0,
}: TrustStatisticsStripProps) {
  const { openAssistant } = useAssistant();

  const devDisplay = developerCount > 0 ? `${developerCount}+` : "Top";
  const projDisplay = projectCount > 0 ? `${projectCount}+` : "Curated";

  return (
    <section className="trust-statistics-section" aria-label="Key Highlights and Trust Metrics">
      <div className="trust-statistics-grid">
        <div className="trust-stat-item">
          <span className="trust-stat-number">{devDisplay}</span>
          <div className="trust-stat-meta">
            <strong className="trust-stat-label">Trusted Developers</strong>
            <span className="trust-stat-desc">Leading builders with proven track records</span>
          </div>
        </div>

        <div className="trust-stat-divider" aria-hidden="true" />

        <div className="trust-stat-item">
          <span className="trust-stat-number">{projDisplay}</span>
          <div className="trust-stat-meta">
            <strong className="trust-stat-label">Prime Developments</strong>
            <span className="trust-stat-desc">Curated luxury residences & villas in Pune</span>
          </div>
        </div>

        <div className="trust-stat-divider" aria-hidden="true" />

        <div className="trust-stat-item">
          <span className="trust-stat-number">20+</span>
          <div className="trust-stat-meta">
            <strong className="trust-stat-label">Years of Advisory</strong>
            <span className="trust-stat-desc">Founded on architectural insight & integrity</span>
          </div>
        </div>

        <div className="trust-stat-divider" aria-hidden="true" />

        <div className="trust-stat-item trust-stat-item--action">
          <span className="trust-stat-number trust-stat-number--sparkle">✦</span>
          <div className="trust-stat-meta">
            <strong className="trust-stat-label">Property Discovery</strong>
            <button
              type="button"
              className="trust-stat-action-btn"
              onClick={openAssistant}
              aria-label="Explore properties with Tara"
            >
              Explore with Tara →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
