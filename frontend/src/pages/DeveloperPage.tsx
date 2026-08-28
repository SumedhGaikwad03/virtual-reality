/*
 * PURPOSE:
 * Public developer page orchestrator.
 *
 * FLOW:
 * Public Developer Discovery Flow
 *
 * RESPONSIBILITY:
 * Coordinates public developer page presentation and composes Developer sections.
 * Delegates data-fetching lifecycle to the useDeveloper hook.
 */

import { useParams } from "react-router-dom";
import { DeveloperHeader } from "../components/developer/DeveloperHeader";
import { DeveloperMedia } from "../components/developer/DeveloperMedia";
import { DeveloperOverview } from "../components/developer/DeveloperOverview";
import { ProjectList } from "../components/developer/ProjectList";
import { useDeveloper } from "../components/developer/hooks/useDeveloper";

export function DeveloperPage() {
  const { developerSlug } = useParams<{ developerSlug: string }>();
  const { developer, isLoading, loadError } = useDeveloper(developerSlug);

  if (isLoading) {
    return <p>Loading developer...</p>;
  }

  if (loadError === "not-found") {
    return <p>Developer not found.</p>;
  }

  if (loadError || !developer) {
    return <p>Unable to load this developer.</p>;
  }

  return (
    <main className="developer-page">
      <DeveloperHeader developer={developer} />

      <DeveloperOverview developer={developer} />

      {developer.media.length > 0 && (
        <DeveloperMedia media={developer.media} />
      )}

      <ProjectList
        developerSlug={developer.slug}
        projects={developer.projects}
      />
    </main>
  );
}
