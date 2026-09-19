/*
 * PURPOSE:
 * Atmospheric entry hero component for the public homepage.
 *
 * FLOW:
 * Homepage Content Flow: HomePage -> AtmosphericHero -> Responsive picture & floating typography overlay.
 *
 * RESPONSIBILITY:
 * Renders an atmospheric, non-transactional hero entry with responsive image slots (desktop/mobile)
 * and floating editorial typography (eyebrow, primary headline, supporting line) without CTA buttons.
 */

import type { HomeMedia } from "../../types/site";
import { getOptimizedImageUrl } from "../../utils/image";

type AtmosphericHeroProps = {
  name?: string | null;
  tagline?: string | null;
  description?: string | null;
  heroMedia?: HomeMedia[];
};

export function AtmosphericHero({
  name,
  tagline,
  description,
  heroMedia = [],
}: AtmosphericHeroProps) {
  // Extract primary HERO media assets or fall back to first active HERO item
  const heroItems = heroMedia.filter((item) => item.category === "HERO");
  const primaryHero = heroItems.find((item) => item.isPrimary) || heroItems[0];

  const desktopImageUrl = primaryHero?.url ? getOptimizedImageUrl(primaryHero.url) : null;
  // If a slot or dedicated mobile asset is configured, use it; otherwise fallback to primary URL
  const mobileHero = heroItems.find((item) => item.slot === "mobile") || primaryHero;
  const mobileImageUrl = mobileHero?.url ? getOptimizedImageUrl(mobileHero.url) : desktopImageUrl;

  const eyebrowText = tagline || "Curated Residential Developments & Property Advisory";
  const headlineText = name || "Find a Better Tomorrow";
  const supportingText =
    description ||
    "Discover residential developments from established developers with dedicated property guidance across Pune.";

  return (
    <section className="atmospheric-hero" aria-label="Hero">
      <div className="hero-media-wrapper">
        {desktopImageUrl ? (
          <picture>
            {mobileImageUrl && mobileImageUrl !== desktopImageUrl && (
              <source media="(max-width: 768px)" srcSet={mobileImageUrl} />
            )}
            <img
              src={desktopImageUrl}
              alt={primaryHero?.altText || primaryHero?.title || "Virtual Reality platform hero"}
              className="hero-image"
              loading="eager"
              decoding="async"
            />
          </picture>
        ) : (
          <div className="hero-fallback-bg" />
        )}
        <div className="hero-gradient-overlay" />
      </div>

      <div className="floating-hero-text">
        <div className="hero-badge-row">
          <span className="hero-eyebrow">{eyebrowText}</span>
        </div>
        <h1 className="hero-headline">{headlineText}</h1>
        {supportingText && <p className="hero-supporting">{supportingText}</p>}

        <div className="hero-action-cluster">
          <a href="#featured" className="hero-secondary-link">
            <span>Explore Developments ↓</span>
          </a>
        </div>
      </div>
    </section>
  );
}
