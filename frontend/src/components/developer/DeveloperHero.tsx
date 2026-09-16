/*
 * PURPOSE:
 * Renders the full-bleed atmospheric visual hero section for the public Developer page.
 *
 * FLOW:
 * Public Developer Discovery Flow: DeveloperPage -> DeveloperHero.
 *
 * RESPONSIBILITY:
 * Composes a full-width cinematic hero background with overlay typography and direct enquiry CTA button.
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
      <div className="developer-hero-media-wrapper">
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
        <div className="developer-hero-gradient-overlay" />
      </div>

      <div className="floating-developer-hero-content">
        <span className="developer-hero-eyebrow">DEVELOPER PROFILE</span>
        <h1 className="developer-hero-headline">{developer.name}</h1>

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
    </section>
  );
}
