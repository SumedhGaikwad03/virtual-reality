/*
 * PURPOSE:
 * Public project page orchestrator enforcing the project discovery and conversion narrative.
 *
 * FLOW:
 * Public Project Discovery Flow: Route /:developerSlug/:locationSlug/:projectSlug -> ProjectPage.
 *
 * RESPONSIBILITY:
 * Thin orchestrator component coordinating public project page presentation, configuration selection state
 * (?configuration=<id>), smooth-scroll CTA contact action, and section ordering:
 * 1. GlobalHeader (rendered via PublicShell)
 * 2. Static Top Hero (ProjectHero)
 * 3. Sticky Sub-Navigation (ProjectSubNav)
 * 4. Project Overview / optional Key Highlights (ProjectOverview)
 * 5. Optional Project Video (ProjectVideoSection)
 * 6. Interior & Exterior Showcase (ProjectInteriorExteriorCarousel)
 * 7. Amenities (ProjectAmenities)
 * 8. Featured Showcase (ProjectHeroCarousel)
 * 9. Available Configurations (ConfigurationSection)
 * 10. Configuration-Specific Media (ConfigurationMediaSection)
 * 11. Location with Location Image (ProjectLocation)
 * 12. Project Gallery / Construction Media (TapToExploreGallery)
 * 13. Developer Attribution (ProjectDeveloper)
 * 14. Lead / Enquiry Section (LeadSection), then Footer (AboutFooter)
 */

import { useEffect, useRef, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { AboutFooter } from "../components/home/AboutFooter";
import { FloatingSearchControl } from "../components/home/FloatingSearchControl";
import { useSite } from "../components/home/hooks/useSite";
import { ContextualEnquiryModal } from "../components/common/ContextualEnquiryModal";
import { ConfigurationMediaSection } from "../components/project/ConfigurationMediaSection";
import { ConfigurationSection } from "../components/project/ConfigurationSection";
import { LeadSection } from "../components/project/LeadSection";
import { ProjectAmenities } from "../components/project/ProjectAmenities";
import { ProjectDeveloper } from "../components/project/ProjectDeveloper";
import { ProjectExploreNav } from "../components/project/ProjectExploreNav";
import { ProjectHero } from "../components/project/ProjectHero";
import { ProjectHeroCarousel } from "../components/project/ProjectHeroCarousel";
import { ProjectInteriorExteriorCarousel } from "../components/project/ProjectInteriorExteriorCarousel";
import { ProjectLocation } from "../components/project/ProjectLocation";
import { ProjectOverview } from "../components/project/ProjectOverview";
import { ProjectSubNav } from "../components/project/ProjectSubNav";
import { ProjectVideoSection } from "../components/project/ProjectVideoSection";
import { TapToExploreGallery } from "../components/project/TapToExploreGallery";
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
  const [searchParams, setSearchParams] = useSearchParams();
  const configurationId = searchParams.get("configuration");

  const contactRef = useRef<HTMLFormElement | null>(null);
  const [isEnquiryModalOpen, setIsEnquiryModalOpen] = useState(false);
  const enquiryTriggerRef = useRef<HTMLElement | null>(null);

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

  const openEnquiryModal = (triggerElement?: HTMLElement | null) => {
    if (triggerElement) enquiryTriggerRef.current = triggerElement;
    setIsEnquiryModalOpen(true);
  };

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
  const hasInteriorExterior = project.media.some(
    (item) => item.category === "INTERIOR" || item.category === "EXTERIOR",
  );
  const hasFeaturedShowcase = project.media.some(
    (item) => item.category === "HERO_CAROUSEL",
  );
  const hasShowcase = hasInteriorExterior || hasFeaturedShowcase;
  const hasGallery = project.media.some(
    (item) => item.type === "IMAGE" && (item.category === "GALLERY" || item.category === "CONSTRUCTION"),
  );

  // Extract location media if present (category === "LOCATION")
  const locationMedia = project.media.find(
    (item) => item.category === "LOCATION",
  );

  return (
    <div className="project-page-container">
      <main className="project-page-main">
        {/* 1. Static Top Hero (IMAGE / EMOTION & Primary CTA) */}
        <ProjectHero
          project={project}
          contactRef={contactRef}
          onOpenEnquiry={openEnquiryModal}
        />

        {/* Sticky Contextual Sub-Navigation */}
        <ProjectSubNav
          hasConfigurations={hasConfigurations}
          hasAmenities={hasAmenities}
        />

        {/* 2. Project Overview / Identity Narrative and optional Key Highlights */}
        <ProjectOverview project={project} />

        <ProjectExploreNav
          hasConfigurations={hasConfigurations}
          hasShowcase={hasShowcase}
          showcaseTarget={hasInteriorExterior ? "project-showcase-heading" : "project-featured-showcase-heading"}
          hasAmenities={hasAmenities}
          hasGallery={hasGallery}
        />

        {/* 3. Optional project video; the component returns null when unavailable. */}
        <ProjectVideoSection media={project.media} />

        {/* 4. Project Showcase: combined Interior + Exterior carousel */}
        <ProjectInteriorExteriorCarousel media={project.media} />

        {/* 5. Amenities & Features Grid */}
        <ProjectAmenities amenities={project.amenities} />

        {/* 6. Featured showcase: HERO_CAROUSEL media */}
        <ProjectHeroCarousel media={project.media} />

        {/* 7. Available Configurations */}
        <ConfigurationSection
          configurations={project.configurations}
          selectedConfigurationId={configurationId}
          onSelectConfiguration={handleSelectConfiguration}
        />

        {/* 8. Configuration-Specific Media */}
        {selectedConfiguration && (
          <ConfigurationMediaSection
            configuration={selectedConfiguration}
            onOpenEnquiry={openEnquiryModal}
          />
        )}

        {/* 9. Location Section with Location Media Image */}
        <ProjectLocation
          location={project.location}
          locationMedia={locationMedia}
        />

        {/* 10. Tap to Explore Project Gallery; component returns null without valid project images */}
        <TapToExploreGallery media={project.media} />

        {/* 11. Developer Attribution Card */}
        <ProjectDeveloper developer={project.developer} />

        {/* 12. Lead Enquiry Section — final conversion step */}
        <LeadSection
          project={project}
          selectedConfigurationId={selectedConfiguration?.id ?? null}
          contactRef={contactRef}
        />
      </main>

      {/* Restrained Mobile Sticky Enquiry Action Bar */}
      {!isEnquiryModalOpen && (
        <aside className="mobile-sticky-enquiry-bar" aria-label="Mobile quick enquiry">
          <div className="mobile-sticky-enquiry-content">
            <span className="mobile-sticky-project-name">{project.name}</span>
            <button
              type="button"
              className="mobile-sticky-enquiry-btn"
              onClick={(e) => openEnquiryModal(e.currentTarget)}
            >
              Enquire Now →
            </button>
          </div>
        </aside>
      )}

      {/* Contextual Enquiry Modal */}
      <ContextualEnquiryModal
        isOpen={isEnquiryModalOpen}
        onClose={() => setIsEnquiryModalOpen(false)}
        contextType="project"
        entityName={project.name}
        developerName={project.developer.name}
        projectId={project.id}
        developerId={project.developer.id}
        configurationId={selectedConfiguration?.id}
        triggerRef={enquiryTriggerRef}
      />

      {/* 13. Site Footer */}
      <AboutFooter site={site || defaultSiteFallback} />

      {/* 14. Persistent Floating Assistant Control */}
      <FloatingSearchControl />
    </div>
  );
}
