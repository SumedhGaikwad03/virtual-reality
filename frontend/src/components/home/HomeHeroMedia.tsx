/*
 * PURPOSE:
 * Displays the primary hero media asset for the homepage.
 *
 * FLOW:
 * Homepage Content Flow
 *
 * RESPONSIBILITY:
 * Selects and renders a single dominant HERO media asset from site.homeMedia using
 * deterministic priority rules (image HERO > primary image > fallback image > non-image HERO).
 */

import type { HomeMedia } from "../../types/site";

type HomeHeroMediaProps = {
  media: HomeMedia[];
};

export function HomeHeroMedia({
  media,
}: HomeHeroMediaProps) {
  // Hero selection priority (Homepage Content Flow business rule):
  // 1. IMAGE + category=HERO + isPrimary=true  — explicitly designated primary hero image
  // 2. IMAGE + category=HERO                   — category-correct hero image fallback
  // 3. IMAGE + isPrimary=true                  — primary-flagged image when no HERO category exists
  // 4. First IMAGE                             — first available image as last visual resort
  // 5. Any HERO item (video/document)          — non-image hero if no images exist
  // Returns null if no suitable asset is found; page remains functional without hero media.
  const hero =
    media.find(
      (item) =>
        item.type === "IMAGE" &&
        item.category === "HERO" &&
        item.isPrimary,
    ) ??
    media.find(
      (item) =>
        item.type === "IMAGE" && item.category === "HERO",
    ) ??
    media.find(
      (item) => item.type === "IMAGE" && item.isPrimary,
    ) ??
    media.find((item) => item.type === "IMAGE") ??
    media.find((item) => item.category === "HERO");

  if (!hero) {
    return null;
  }

  return (
    <section className="home-hero-media" aria-label="Firm visual highlight">
      {hero.type === "IMAGE" && (
        <img
          src={hero.url}
          alt={hero.altText ?? hero.title ?? "Firm visual"}
        />
      )}

      {hero.type === "VIDEO" && (
        <video
          src={hero.url}
          controls
          playsInline
          preload="metadata"
          aria-label={hero.altText ?? hero.title ?? "Firm video"}
        />
      )}

      {hero.type === "DOCUMENT" && (
        <p>
          <a
            href={hero.url}
            target="_blank"
            rel="noreferrer"
          >
            Open document ({hero.title ?? "Firm brochure"})
          </a>
        </p>
      )}

      {hero.title && (
        <div className="home-hero-media-content">
          <h2>{hero.title}</h2>
        </div>
      )}
    </section>
  );
}