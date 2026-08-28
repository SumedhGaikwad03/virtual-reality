/*
 * PURPOSE:
 * Public project page orchestrator.
 *
 * FLOW:
 * Public Project Discovery Flow
 *
 * RESPONSIBILITY:
 * Coordinates the public project page presentation, manages configuration URL selection state
 * (?configuration=<id>), handles "Contact Now" smooth scrolling, and composes Project sections.
 * Delegates data-fetching lifecycle to the useProject hook.
 */

import { useRef } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { ConfigurationMediaSection } from "../components/project/ConfigurationMediaSection";
import { ConfigurationSection } from "../components/project/ConfigurationSection";
import { HeroSection } from "../components/project/HeroSection";
import { LeadSection } from "../components/project/LeadSection";
import { MediaSection } from "../components/project/MediaSection";
import { ProjectHeader } from "../components/project/ProjectHeader";
import { ProjectHeroCarousel } from "../components/project/ProjectHeroCarousel";
import { ProjectOverview } from "../components/project/ProjectOverview";
import { useProject } from "../components/project/hooks/useProject";

export function ProjectPage() {
  const { developerSlug, locationSlug, projectSlug } = useParams<{
    developerSlug: string;
    locationSlug: string;
    projectSlug: string;
  }>();

  // URL state: ?configuration=<configurationId>
  // Preserved directly in the page orchestrator for shareable, refresh-safe deep linking.
  const [searchParams, setSearchParams] = useSearchParams();
  const configurationId = searchParams.get("configuration");

  const contactRef = useRef<HTMLFormElement | null>(null);

  const { project, isLoading, loadError } = useProject(
    developerSlug,
    locationSlug,
    projectSlug,
  );

  const selectedConfiguration = project
    ? project.configurations.find((c) => c.id === configurationId)
    : undefined;

  function handleSelectConfiguration(id: string) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (next.get("configuration") === id) {
        next.delete("configuration");
      } else {
        next.set("configuration", id);
      }
      return next;
    });
  }

  function handleContactClick() {
    contactRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });

    contactRef.current?.querySelector<HTMLInputElement>("input")?.focus();
  }

  if (isLoading) {
    return <p>Loading project...</p>;
  }

  if (loadError === "not-found") {
    return <p>Project not found.</p>;
  }

  if (loadError || !project) {
    return <p>Unable to load this project.</p>;
  }

  return (
    <main className="project-page">
      <ProjectHeader project={project} />

      <button type="button" onClick={handleContactClick}>
        Contact Now
      </button>

      <HeroSection media={project.media} />

      <ProjectHeroCarousel media={project.media} />

      <ProjectOverview project={project} />

      <ConfigurationSection
        configurations={project.configurations}
        selectedConfigurationId={configurationId}
        onSelectConfiguration={handleSelectConfiguration}
      />

      {selectedConfiguration && (
        <ConfigurationMediaSection
          configuration={selectedConfiguration}
        />
      )}

      <MediaSection media={project.media} />

      <LeadSection
        project={project}
        selectedConfigurationId={selectedConfiguration?.id ?? null}
        contactRef={contactRef}
      />
    </main>
  );
}