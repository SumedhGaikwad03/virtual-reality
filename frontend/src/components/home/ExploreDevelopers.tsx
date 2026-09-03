/*
 * PURPOSE:
 * Independent developer discovery section for the public homepage.
 *
 * FLOW:
 * Homepage Content Flow: HomePage -> ExploreDevelopers -> Row Link to /:developerSlug.
 *
 * RESPONSIBILITY:
 * Displays an independent, first-class list of published developers directly from site.developers.
 * Uses only the developer-owned banner or logo supplied by the site API; it never falls back to project media.
 */

import { Link } from "react-router-dom";
import type { SiteDeveloper } from "../../types/site";

type ExploreDevelopersProps = {
  developers?: SiteDeveloper[];
};

export function ExploreDevelopers({ developers = [] }: ExploreDevelopersProps) {
  return (
    <section className="explore-developers-section" aria-labelledby="developers-heading">
      <div className="section-header-editorial">
        <span className="section-eyebrow">PARTNERS & BUILDERS</span>
        <h2 id="developers-heading" className="section-title">
          Explore Developers
        </h2>
      </div>

      {developers.length === 0 ? (
        <p className="no-developers-notice">No developers currently available.</p>
      ) : (
        <div className="explore-developers-list" role="list">
          {developers.map((developer) => {
            const initialLetter = developer.name ? developer.name.charAt(0).toUpperCase() : "D";

            return (
              <Link
                key={developer.id}
                to={`/${developer.slug}`}
                className="developer-row-item"
                role="listitem"
              >
                <div className="developer-row-content">
                  {developer.bannerMedia ? (
                    <img
                      src={developer.bannerMedia.thumbnailUrl ?? developer.bannerMedia.url}
                      alt={developer.bannerMedia.altText || `${developer.name} brand banner`}
                      className="developer-row-logo"
                      loading="lazy"
                    />
                  ) : developer.logoUrl ? (
                    <img
                      src={developer.logoUrl}
                      alt={`${developer.name} logo`}
                      className="developer-row-logo"
                      loading="lazy"
                    />
                  ) : (
                    <div className="developer-row-badge" aria-hidden="true">
                      {initialLetter}
                    </div>
                  )}
                  <span className="developer-row-name">{developer.name}</span>
                  <span className="developer-row-meta">View Portfolio</span>
                </div>
                <span className="developer-row-arrow" aria-hidden="true">
                  →
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
