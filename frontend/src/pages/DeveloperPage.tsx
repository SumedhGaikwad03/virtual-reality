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
 * 6. FloatingSearchControl (Persistent Assistant Access)
 * 7. Communicates developer.name context to GlobalHeader for developer brand attribution.
 */

import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { AboutFooter } from "../components/home/AboutFooter";
import { FloatingSearchControl } from "../components/home/FloatingSearchControl";
import { useSite } from "../components/home/hooks/useSite";
import { DeveloperHero } from "../components/developer/DeveloperHero";
import { DeveloperIntro } from "../components/developer/DeveloperIntro";
import { DeveloperLeadSection } from "../components/developer/DeveloperLeadSection";
import { DeveloperProjects } from "../components/developer/DeveloperProjects";
import { useDeveloper } from "../components/developer/hooks/useDeveloper";
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

export function DeveloperPage() {
  const { developerSlug } = useParams<{ developerSlug: string }>();
  const { developer, isLoading, loadError } = useDeveloper(developerSlug);
  const { site } = useSite();
  const { setDeveloperName } = useHeader();

  // Communicate developer.name context to GlobalHeader
  useEffect(() => {
    if (developer?.name) {
      setDeveloperName(developer.name);
    }
    return () => {
      setDeveloperName(null);
    };
  }, [developer?.name, setDeveloperName]);

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
        <DeveloperHero developer={developer} />

        {/* 2. Developer Introduction / Identity */}
        <DeveloperIntro developer={developer} />

        {/* 3. Projects by Developer */}
        <DeveloperProjects developer={developer} />

        {/* 4. Developer Enquiry */}
        <DeveloperLeadSection developer={developer} />
      </main>

      {/* 5. Footer */}
      <AboutFooter site={site || defaultSiteFallback} />

      {/* 6. Persistent Floating Control */}
      <FloatingSearchControl />
    </div>
  );
}
