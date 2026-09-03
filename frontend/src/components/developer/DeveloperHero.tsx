/*
 * PURPOSE:
 * Renders the full-bleed atmospheric visual hero section for the public Developer page.
 *
 * FLOW:
 * Public Developer Discovery Flow: DeveloperPage -> DeveloperHero.
 *
 * RESPONSIBILITY:
 * Composes a full-width cinematic hero background with overlay typography and an integrated
 * bottom-left developer brand mark (bannerMedia -> logoUrl -> typographic badge fallback)
 * providing one unified responsive composition across desktop and mobile.
 */

import type { PublicDeveloper } from "../../types/developer";

type DeveloperHeroProps = {
  developer: PublicDeveloper;
};

export function DeveloperHero({ developer }: DeveloperHeroProps) {
  const heroMedia = developer.heroMedia;
  const heroImageUrl = heroMedia?.url || null;

  const logoUrl = developer.bannerMedia?.url || developer.logoUrl;
  const initialLetter = developer.name ? developer.name.charAt(0).toUpperCase() : "D";

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

        {/* Integrated Floating Brand Logo Mark */}
        <div className="hero-brand-mark">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={developer.bannerMedia?.altText || `${developer.name} brand mark`}
              className="hero-brand-logo"
            />
          ) : (
            <div className="hero-brand-badge-fallback">
              <span className="badge-letter">{initialLetter}</span>
              <span className="badge-wordmark">{developer.name}</span>
            </div>
          )}
        </div>

        <div className="developer-hero-actions">
          <button
            type="button"
            className="developer-hero-contact-btn"
            onClick={() => {
              const el = document.getElementById("developer-enquiry-heading");
              el?.scrollIntoView({ behavior: "smooth", block: "start" });
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
