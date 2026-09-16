/*
 * PURPOSE:
 * Renders the visual-first hero section and dedicated editorial information block for the public Developer page.
 *
 * FLOW:
 * Public Developer Discovery Flow: DeveloperPage -> DeveloperHero.
 *
 * RESPONSIBILITY:
 * Composes an immersive visual developer hero image followed by a structured editorial information block
 * presenting developer eyebrow label, name headline, logo mark, and direct contact CTA button.
 */

import type { PublicDeveloper } from "../../types/developer";
import { scrollToElement } from "../../scroll/scrollTo";

type DeveloperHeroProps = {
  developer: PublicDeveloper;
};

export function DeveloperHero({ developer }: DeveloperHeroProps) {
  const heroMedia = developer.heroMedia;
  const heroImageUrl = heroMedia?.url || null;

  return (
    <section className="developer-hero" aria-label={`${developer.name} profile hero`}>
      {/* 1. Immersive Visual-First Hero Image */}
      <div className="developer-hero-media">
        {heroImageUrl ? (
          <img
            src={heroImageUrl}
            alt={heroMedia?.altText || `${developer.name} atmospheric profile hero`}
            className="developer-hero-image"
            loading="eager"
            decoding="async"
          />
        ) : (
          <div className="developer-hero-fallback-bg" />
        )}
      </div>

      {/* 2. Dedicated Editorial Developer Information Block */}
      <div className="developer-hero-info">
        <div className="developer-hero-info-inner">
          <span className="developer-hero-eyebrow">DEVELOPER PROFILE</span>
          <h1 className="developer-hero-headline">{developer.name}</h1>

          {developer.logoUrl && (
            <div className="developer-hero-logo-wrapper">
              <img
                src={developer.logoUrl}
                alt={`${developer.name} logo`}
                className="developer-hero-logo"
              />
            </div>
          )}

          <div className="developer-hero-actions">
            <button
              type="button"
              className="developer-hero-contact-btn"
              onClick={() => {
                scrollToElement("developer-enquiry-heading");
                const el = document.getElementById("developer-enquiry-heading");
                el?.parentElement?.querySelector<HTMLInputElement>("input")?.focus();
              }}
            >
              Enquire with {developer.name} →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
