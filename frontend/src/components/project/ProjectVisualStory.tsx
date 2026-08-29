/*
 * PURPOSE:
 * Composes the Project Visual Story section on the public Project page.
 *
 * FLOW:
 * Public Project Media Flow: ProjectPage -> ProjectVisualStory -> (ProjectHeroCarousel + MediaSection).
 *
 * RESPONSIBILITY:
 * Encapsulates the visual exploration experience, rendering the featured showcase carousel
 * (HERO_CAROUSEL media) alongside categorized project media galleries (GALLERY, EXTERIOR, INTERIOR, LOCATION, CONSTRUCTION, PROJECT_VIDEO).
 */

import type { Media } from "../../types/project";
import { MediaSection } from "./MediaSection";
import { ProjectHeroCarousel } from "./ProjectHeroCarousel";

type ProjectVisualStoryProps = {
  media: Media[];
};

export function ProjectVisualStory({ media }: ProjectVisualStoryProps) {
  return (
    <section id="project-visual-story-heading" className="project-visual-story-section" aria-label="Project Visual Story">
      <ProjectHeroCarousel media={media} />
      <MediaSection media={media} />
    </section>
  );
}
