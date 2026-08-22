import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getProject, ProjectApiError } from "../api/project";
import { ConfigurationSection } from "../components/project/ConfigurationSection";
import { HeroSection } from "../components/project/HeroSection";
import { LeadSection } from "../components/project/LeadSection";
import { MediaSection } from "../components/project/MediaSection";
import { ProjectHeader } from "../components/project/ProjectHeader";
import { ProjectOverview } from "../components/project/ProjectOverview";
import type { Project } from "../types/project";

export function ProjectPage() {
  const { developerSlug, locationSlug, projectSlug } = useParams<{
    developerSlug: string;
    locationSlug: string;
    projectSlug: string;
  }>();
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<"not-found" | "error" | null>(
    null,
  );

  useEffect(() => {
    const controller = new AbortController();

    if (!developerSlug || !locationSlug || !projectSlug) {
      setIsLoading(false);
      setLoadError("error");
      return () => controller.abort();
    }

    setIsLoading(true);
    setLoadError(null);
    setProject(null);

    getProject(developerSlug, locationSlug, projectSlug, controller.signal)
      .then(setProject)
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        if (error instanceof ProjectApiError && error.status === 404) {
          setLoadError("not-found");
        } else {
          setLoadError("error");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      });

    return () => controller.abort();
  }, [developerSlug, locationSlug, projectSlug]);

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
      <HeroSection media={project.media} />
      <ProjectOverview project={project} />
      <ConfigurationSection configurations={project.configurations} />
      <MediaSection media={project.media} />
      <LeadSection project={project} />
    </main>
  );
}
