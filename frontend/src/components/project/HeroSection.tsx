/*
 * PURPOSE:
 * Displays the primary hero visual for a project on the public project page.
 *
 * FLOW:
 * Public Project Media Flow
 *
 * RESPONSIBILITY:
 * Selects and renders a single dominant hero image from the project's media array
 * using deterministic category and primary flag priority rules.
 */

import type { Media } from "../../types/project";

type HeroSectionProps = {
  media: Media[];
};

export function HeroSection({ media }: HeroSectionProps) {
  // Hero selection priority (Public Project Media Flow business rule):
  // 1. IMAGE + category=HERO + isPrimary=true  — explicitly designated primary hero image
  // 2. IMAGE + category=HERO                   — category-correct hero image fallback
  // 3. IMAGE + isPrimary=true                  — primary-flagged image when no HERO category exists
  // 4. First IMAGE                             — first available image as last visual resort
  // Returns fallback message if no image is available in project media.
  const hero =
    media.find(
      (item) =>
        item.type === "IMAGE" &&
        item.category === "HERO" &&
        item.isPrimary,
    ) ??
    media.find(
      (item) => item.type === "IMAGE" && item.category === "HERO",
    ) ??
    media.find(
      (item) => item.type === "IMAGE" && item.isPrimary,
    ) ??
    media.find((item) => item.type === "IMAGE");

  if (!hero) {
    return <section aria-label="Project hero">No project image available.</section>;
  }

  return (
    <section aria-label="Project hero">
      <img
        className="project-hero-image"
        src={hero.url}
        alt={hero.altText ?? "Project image"}
      />
    </section>
  );
}
