/*
 * PURPOSE:
 * Renders the concise developer overview and identity section.
 *
 * FLOW:
 * Public Developer Discovery Flow: DeveloperPage -> DeveloperIntro.
 *
 * RESPONSIBILITY:
 * Displays developer description, overview details, and official website outbound link.
 */

import type { PublicDeveloper } from "../../types/developer";

type DeveloperIntroProps = {
  developer: PublicDeveloper;
};

export function DeveloperIntro({ developer }: DeveloperIntroProps) {
  return (
    <section className="developer-intro-section" aria-labelledby="developer-about-heading">
      <div className="developer-intro-container">
        <span className="section-eyebrow">ABOUT THE DEVELOPER</span>
        <h2 id="developer-about-heading" className="developer-intro-title">
          {developer.name}
        </h2>
        {developer.description ? (
          <p className="developer-intro-description">{developer.description}</p>
        ) : (
          <p className="developer-intro-description fallback">
            Distinguished real-estate developer committed to architectural elegance, structural excellence, and prime location developments.
          </p>
        )}
      </div>
    </section>
  );
}
