/*
 * PURPOSE:
 * Public developer page orchestrator.
 *
 * FLOW:
 * Public Developer Discovery Flow: Route /:developerSlug -> DeveloperPage.
 *
 * RESPONSIBILITY:
 * Coordinates public developer page presentation and composes Developer sections:
 * 1. Full-bleed DeveloperHero (with integrated floating brand logo mark)
 * 2. DeveloperIntro (Identity & Overview)
 * 3. DeveloperProjects (Portfolio carousel & zero-project state)
 * 4. DeveloperLeadSection (Developer Enquiry)
 * 5. AboutFooter (Site Footer)
 * 6. Communicates developer.name context to GlobalHeader for developer brand attribution.
 */

import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { AboutFooter } from "../components/home/AboutFooter";
import { useSite } from "../components/home/hooks/useSite";
import { DeveloperHero } from "../components/developer/DeveloperHero";
import { DeveloperIntro } from "../components/developer/DeveloperIntro";
import { DeveloperLeadSection } from "../components/developer/DeveloperLeadSection";
import { DeveloperProjects } from "../components/developer/DeveloperProjects";
import { ContextualEnquiryModal } from "../components/common/ContextualEnquiryModal";
import { useDeveloper } from "../components/developer/hooks/useDeveloper";
import { useHeader } from "../context/HeaderContext";
import { useAssistant } from "../context/AssistantContext";

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

export function DeveloperPage() {
  const { developerSlug } = useParams<{ developerSlug: string }>();
  const { developer, isLoading, loadError } = useDeveloper(developerSlug);
  const { site } = useSite();
  const { setDeveloperName } = useHeader();
  const { isOpen: isAssistantOpen, closeAssistant } = useAssistant();

  const [isEnquiryModalOpen, setIsEnquiryModalOpen] = useState(false);
  const enquiryTriggerRef = useRef<HTMLElement | null>(null);

  // Communicate developer.name context to GlobalHeader
  useEffect(() => {
    if (developer?.name) {
      setDeveloperName(developer.name);
    }
    return () => {
      setDeveloperName(null);
    };
  }, [developer?.name, setDeveloperName]);

  const openEnquiryModal = (triggerElement?: HTMLElement | null) => {
    if (isAssistantOpen) {
      closeAssistant({ reset: false });
    }
    if (triggerElement) {
      enquiryTriggerRef.current = triggerElement;
    }
    setIsEnquiryModalOpen(true);
  };

  const handleCloseEnquiryModal = () => {
    setIsEnquiryModalOpen(false);
  };

  if (isLoading) {
    return (
      <div className="home-loading-state" aria-busy="true">
        <p>Loading developer profile...</p>
      </div>
    );
  }

  if (loadError === "not-found" || !developer) {
    return (
      <div className="developer-not-found-state">
        <h2>Developer Not Found</h2>
        <p>The requested developer profile is not available.</p>
      </div>
    );
  }

  return (
    <div className="developer-page-container">
      <main className="developer-page-main">
        {/* 1. Full-Bleed Atmospheric Hero with Integrated Floating Brand Mark */}
        <DeveloperHero
          developer={developer}
          onOpenEnquiry={(triggerEl) => openEnquiryModal(triggerEl)}
        />

        {/* 2. Developer Introduction / Identity */}
        <DeveloperIntro developer={developer} />

        {/* 3. Projects by Developer Portfolio */}
        <DeveloperProjects developer={developer} />

        {/* 4. Developer Enquiry (In-Page Conversion Section) */}
        <DeveloperLeadSection developer={developer} />
      </main>

      {/* Reused Contextual Enquiry Sheet */}
      <ContextualEnquiryModal
        isOpen={isEnquiryModalOpen}
        onClose={handleCloseEnquiryModal}
        contextType="developer"
        entityName={developer.name}
        developerName={developer.name}
        developerId={developer.id}
        triggerRef={enquiryTriggerRef}
        initialIntent="REQUEST_CALLBACK"
      />

      {/* 5. Footer */}
      <AboutFooter site={site || defaultSiteFallback} />
    </div>
  );
}
