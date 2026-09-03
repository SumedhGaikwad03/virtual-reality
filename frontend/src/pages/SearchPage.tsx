/*
 * PURPOSE:
 * Public Conversational Property Discovery Assistant page orchestrator.
 *
 * FLOW:
 * Public Search Discovery Flow: Route /search -> SearchPage.
 *
 * RESPONSIBILITY:
 * Orchestrates full search results page displaying the shared assistant state and property results list:
 * 1. SearchAssistant (Shared conversational query builder)
 * 2. SearchResults (Matching property result cards)
 * 3. AboutFooter (Site footer)
 * 4. FloatingSearchControl (Persistent assistant access)
 */

import { AboutFooter } from "../components/home/AboutFooter";
import { FloatingSearchControl } from "../components/home/FloatingSearchControl";
import { useSite } from "../components/home/hooks/useSite";
import { SearchAssistant } from "../components/search/SearchAssistant";
import { SearchResults } from "../components/search/SearchResults";
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

export function SearchPage() {
  const { searchChat } = useAssistant();
  const { site } = useSite();

  const matches = searchChat.state ? searchChat.state.matches : [];

  return (
    <div className="search-page-container">
      <main className="search-page-main">
        {/* 1. Conversational Search Assistant Interface */}
        <SearchAssistant {...searchChat} />

        {/* 2. Matching Property Results List */}
        <SearchResults matches={matches} />
      </main>

      {/* 3. Site Footer */}
      <AboutFooter site={site || defaultSiteFallback} />

      {/* 4. Persistent Floating Assistant Control */}
      <FloatingSearchControl />
    </div>
  );
}