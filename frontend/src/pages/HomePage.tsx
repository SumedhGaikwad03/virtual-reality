/*
 * PURPOSE:
 * Public homepage and firm identity orchestrator.
 *
 * FLOW:
 * Homepage Journey Flow:
 * AtmosphericHero -> ExploreDevelopers -> FeaturedProjects -> HomeGallery -> ConversationalSearchEntry -> FirmOverview -> ContactAdvisorySection -> AboutFooter.
 *
 * RESPONSIBILITY:
 * Coordinates homepage state, executes destination-owned hash scrolling once DOM mounts,
 * and composes the structural editorial layout per product architecture guidelines.
 * Delegates data-fetching lifecycle to the useSite hook.
 */

import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { AboutFooter } from "../components/home/AboutFooter";
import { AtmosphericHero } from "../components/home/AtmosphericHero";
import { ContactAdvisorySection } from "../components/home/ContactAdvisorySection";
import { ConversationalSearchEntry } from "../components/home/ConversationalSearchEntry";
import { ExploreDevelopers } from "../components/home/ExploreDevelopers";
import { FeaturedProjects } from "../components/home/FeaturedProjects";
import { FirmOverview } from "../components/home/FirmOverview";
import { HomeGallery } from "../components/home/HomeGallery";
import { useSite } from "../components/home/hooks/useSite";

export function HomePage() {
  const { site, isLoading, hasError } = useSite();
  const location = useLocation();

  // Destination-owned smooth scroll execution for hash navigation (direct URLs, cross-page routes, on-page clicks)
  useEffect(() => {
    if (!isLoading && site && location.hash) {
      const targetId = location.hash.replace("#", "");
      let attempts = 0;
      const maxAttempts = 12;

      const scrollInterval = setInterval(() => {
        attempts += 1;
        const el = document.getElementById(targetId);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
          clearInterval(scrollInterval);
        } else if (attempts >= maxAttempts) {
          clearInterval(scrollInterval);
        }
      }, 50);

      return () => clearInterval(scrollInterval);
    }
  }, [isLoading, site, location.hash, location.pathname]);

  if (isLoading) {
    return (
      <div className="home-loading-state" aria-busy="true">
        <p>Loading Virtual Reality...</p>
      </div>
    );
  }

  if (hasError || !site) {
    return (
      <div className="home-error-state" role="alert">
        <p>Unable to load the site. Please try refreshing.</p>
      </div>
    );
  }

  return (
    <main className="home-page-container">
      {/* 1. HERO / AMBIENCE */}
      <AtmosphericHero
        name={site.name}
        tagline={site.tagline}
        description={site.description}
        heroMedia={site.homeMedia}
      />

      {/* 2. DEVELOPERS */}
      <ExploreDevelopers developers={site.developers} />

      {/* 3. FEATURED PROJECTS */}
      <FeaturedProjects projects={site.featuredProjects} />

      {/* 4. FIRM GALLERY / MOMENTS */}
      <HomeGallery media={site.homeMedia} />

      {/* 5. CONVERSATIONAL SEARCH */}
      <ConversationalSearchEntry />

      {/* 6. FIRM OVERVIEW & FOUNDER IDENTITY */}
      <FirmOverview site={site} />

      {/* 7. CONNECT & ADVISORY SECTION */}
      <ContactAdvisorySection site={site} />

      {/* 8. ABOUT / COMPANY / FOOTER */}
      <AboutFooter site={site} />
    </main>
  );
}
