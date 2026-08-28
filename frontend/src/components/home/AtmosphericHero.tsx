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

  const desktopImageUrl = primaryHero?.url || null;
  // If a slot or dedicated mobile asset is configured, use it; otherwise fallback to primary URL
  const mobileHero = heroItems.find((item) => item.slot === "mobile") || primaryHero;
  const mobileImageUrl = mobileHero?.url || desktopImageUrl;

  const eyebrowText = tagline || "REDEFINING REAL ESTATE DISCOVERY";
  const headlineText = name || "Find a place that feels like home.";
  const supportingText =
    description ||
    "Explore architectural landmarks and curated luxury residences across prime locations.";

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
        <span className="hero-eyebrow">{eyebrowText}</span>
        <h1 className="hero-headline">{headlineText}</h1>
        {supportingText && <p className="hero-supporting">{supportingText}</p>}
      </div>
    </section>
  );
}
