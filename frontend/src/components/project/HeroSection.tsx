import type { Media } from "../../types/project";

type HeroSectionProps = {
  media: Media[];
};

export function HeroSection({ media }: HeroSectionProps) {
  const hero =
    media.find((item) => item.type === "IMAGE" && item.category === "HERO") ??
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
