/*
 * PURPOSE:
 * Public homepage orchestrator.
 *
 * FLOW:
 * Homepage Journey Flow:
 * AtmosphericHero -> ExploreDevelopers -> FeaturedProjects -> ConversationalSearchEntry -> AboutFooter + FloatingSearchControl.
 *
 * RESPONSIBILITY:
 * Coordinates homepage state and composes the structural editorial layout per product architecture guidelines.
 * Delegates data-fetching lifecycle to the useSite hook.
 */

import { AboutFooter } from "../components/home/AboutFooter";
import { AtmosphericHero } from "../components/home/AtmosphericHero";
import { ConversationalSearchEntry } from "../components/home/ConversationalSearchEntry";
import { ExploreDevelopers } from "../components/home/ExploreDevelopers";
import { FeaturedProjects } from "../components/home/FeaturedProjects";
import { FloatingSearchControl } from "../components/home/FloatingSearchControl";
import { useSite } from "../components/home/hooks/useSite";

export function HomePage() {
  const { site, isLoading, hasError } = useSite();

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

      {/* 4. CONVERSATIONAL SEARCH */}
      <ConversationalSearchEntry />

      {/* 5. ABOUT / COMPANY / FOOTER */}
      <AboutFooter site={site} />

      {/* 6. PERSISTENT SEARCH CHAT CONTROL */}
      <FloatingSearchControl />
    </main>
  );
}
