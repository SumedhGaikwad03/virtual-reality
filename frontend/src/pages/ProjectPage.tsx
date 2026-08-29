/*
 * PURPOSE:
 * Public project page orchestrator locking final information architecture and component boundaries.
 *
 * FLOW:
 * Public Project Discovery Flow: Route /:developerSlug/:locationSlug/:projectSlug -> ProjectPage.
 *
 * RESPONSIBILITY:
 * Thin orchestrator component coordinating public project page presentation, configuration selection state
 * (?configuration=<id>), smooth-scroll CTA contact action, and section ordering:
 * 1. ProjectHero (IMAGE / EMOTION & Primary CTA)
 * 2. ProjectSubNav (Sticky contextual section navigation bar)
 * 3. ProjectOverview (WHAT IS THIS PROJECT? - Identity narrative, address, and highlights)
 * 4. ConfigurationSection & ConfigurationMediaSection (WHAT CAN I BUY? - Unit configurations & floor plans)
 * 5. ProjectVisualStory (SHOW ME THE PROJECT - Featured carousel & categorized galleries)
 * 6. ProjectAmenities (WHAT DOES IT OFFER? - Amenities & features grid)
 * 7. ProjectLocation (WHERE IS IT? - Locality, address, and Google Maps link)
 * 8. ProjectDeveloper (WHO BUILT IT? - Developer card & bidirectional Developer Page link)
 * 9. LeadSection (I WANT TO KNOW MORE - Canonical project enquiry form)
 * 10. AboutFooter (Site Footer)
 * 11. FloatingSearchControl (Persistent Assistant Access)
 * 12. Communicates project.developer.name context to GlobalHeader for developer brand attribution.
 */

import { useEffect, useRef } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { AboutFooter } from "../components/home/AboutFooter";
import { FloatingSearchControl } from "../components/home/FloatingSearchControl";
import { useSite } from "../components/home/hooks/useSite";
import { ConfigurationMediaSection } from "../components/project/ConfigurationMediaSection";
import { ConfigurationSection } from "../components/project/ConfigurationSection";
import { LeadSection } from "../components/project/LeadSection";
import { ProjectAmenities } from "../components/project/ProjectAmenities";
import { ProjectDeveloper } from "../components/project/ProjectDeveloper";
import { ProjectHero } from "../components/project/ProjectHero";
import { ProjectLocation } from "../components/project/ProjectLocation";
import { ProjectOverview } from "../components/project/ProjectOverview";
import { ProjectSubNav } from "../components/project/ProjectSubNav";
import { ProjectVisualStory } from "../components/project/ProjectVisualStory";
import { useProject } from "../components/project/hooks/useProject";
import { useHeader } from "../context/HeaderContext";

const defaultSiteFallback = {
  name: "Virtual Reality",
  tagline: "Architectural Real Estate Platform",
  description: "Virtual Reality is a real-estate discovery platform showcasing prime residential developments and architectural landmarks.",
  logoUrl: null,
  contact: {
    phone: null,
    email: null,
    address: null,
  },
  homeMedia: [],
  featuredProjects: [],
  developers: [],
};

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

  const { site } = useSite();
  const { setDeveloperName } = useHeader();

  // Communicate project.developer.name context to GlobalHeader
  useEffect(() => {
    if (project?.developer?.name) {
      setDeveloperName(project.developer.name);
    }
    return () => {
      setDeveloperName(null);
    };
  }, [project?.developer?.name, setDeveloperName]);

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

  if (isLoading) {
    return (
      <div className="home-loading-state" aria-busy="true">
        <p>Loading project details...</p>
      </div>
    );
  }

  if (loadError === "not-found") {
    return (
      <div className="developer-not-found-state">
        <h2>Project Not Found</h2>
        <p>The requested project profile is not available.</p>
      </div>
    );
  }

  if (loadError || !project) {
    return (
      <div className="developer-not-found-state">
        <h2>Error Loading Project</h2>
        <p>Unable to load project details. Please try again later.</p>
      </div>
    );
  }

  const hasConfigurations = project.configurations.length > 0;
  const hasAmenities = project.amenities.length > 0;

  return (
    <div className="project-page-container">
      <main className="project-page-main">
        {/* 1. Project Hero (IMAGE / EMOTION & Primary CTA) */}
        <ProjectHero project={project} contactRef={contactRef} />

        {/* Sticky Sub-Navigation */}
        <ProjectSubNav
          hasConfigurations={hasConfigurations}
          hasAmenities={hasAmenities}
        />

        {/* 2. Project Overview / Identity (WHAT IS THIS PROJECT?) */}
        <ProjectOverview project={project} />

        {/* 3. Configurations (WHAT CAN I BUY?) */}
        <ConfigurationSection
          configurations={project.configurations}
          selectedConfigurationId={configurationId}
          onSelectConfiguration={handleSelectConfiguration}
        />

        {selectedConfiguration && (
          <ConfigurationMediaSection configuration={selectedConfiguration} />
        )}

        {/* 4. Project Visual Story (SHOW ME THE PROJECT) */}
        <ProjectVisualStory media={project.media} />

        {/* 5. Amenities & Features (WHAT DOES IT OFFER?) */}
        <ProjectAmenities amenities={project.amenities} />

        {/* 6. Location (WHERE IS IT?) */}
        <ProjectLocation location={project.location} />

        {/* 7. Developer (WHO BUILT IT?) */}
        <ProjectDeveloper developer={project.developer} />

        {/* 8. Project Enquiry (I WANT TO KNOW MORE) */}
        <LeadSection
          project={project}
          selectedConfigurationId={selectedConfiguration?.id ?? null}
          contactRef={contactRef}
        />
      </main>

      {/* 9. Footer & Site Identity */}
      <AboutFooter site={site || defaultSiteFallback} />

      {/* 10. Persistent Floating Control */}
      <FloatingSearchControl />
    </div>
  );
}