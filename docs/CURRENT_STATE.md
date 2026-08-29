# Current Project State Snapshot

---

## What is this project right now?

The **Virtual Reality Real-Estate Platform** is a production-ready, modular web application for Pune real estate discovery and lead generation.

### Product Direction
- **Rule-Based Conversational Property Discovery**: Powered by `query-builder.ts` and `useSearchChat.ts`. User answers option buttons (`[3 BHK]`, `[Wakad]`) to filter catalog properties.
- **Trusted Developer Attribution**: `GlobalHeader` displays `[Developer Name]` directly on Developer and Project pages. Platform identity (`Virtual Reality`) is established in `AboutFooter`.
- **Global Public Shell**: `PublicShell.tsx` wraps all public routes (`/`, `/search`, `/:developerSlug`, `/:developerSlug/:locationSlug/:projectSlug`). Admin routes (`/admin/*`) remain isolated.

---

## Locked Public Pages & Section Narratives

1. **Homepage (`/`)**: `AtmosphericHero` $\rightarrow$ `ExploreDevelopers` $\rightarrow$ `FeaturedProjects` $\rightarrow$ `ConversationalSearchEntry` $\rightarrow$ `FirmOverview` $\rightarrow$ `ContactSection` $\rightarrow$ `AboutFooter`.
2. **Search Page (`/search`)**: `SearchAssistant` (messages, chips, rule options) $\rightarrow$ `SearchResults` (`PropertyResultCard`).
3. **Developer Page (`/:developerSlug`)**: `DeveloperHero` $\rightarrow$ `DeveloperIntro` $\rightarrow$ `DeveloperProjects` $\rightarrow$ `DeveloperLeadSection` $\rightarrow$ `AboutFooter`.
4. **Project Page (`/:developerSlug/:locationSlug/:projectSlug`)**: `ProjectHero` $\rightarrow$ `ProjectSubNav` $\rightarrow$ `ProjectOverview` $\rightarrow$ `ConfigurationSection` $\rightarrow$ `ConfigurationMediaSection` $\rightarrow$ `ProjectVisualStory` $\rightarrow$ `ProjectAmenities` $\rightarrow$ `ProjectLocation` $\rightarrow$ `ProjectDeveloper` $\rightarrow$ `LeadSection` $\rightarrow$ `AboutFooter`.

---

## Critical Files to Know

- `frontend/src/router/AppRouter.tsx`: Defines public shell route and admin route tree.
- `frontend/src/components/shell/PublicShell.tsx`: Public shell layout wrapper.
- `frontend/src/components/shell/GlobalHeader.tsx`: Contextual header navigation & developer branding.
- `frontend/src/context/AssistantContext.tsx`: Global search assistant overlay state & `useSearchChat`.
- `frontend/src/context/HeaderContext.tsx`: `developerName` context provider.
- `frontend/src/services/query-builder.ts`: Sequential rule engine logic.
- `backend/src/repositories/project.repository.ts`: Multi-entity publication queries.

---

## Immediate Next Priority
Phase 4: Site-wide visual refinement pass (typography polish, CSS design token unification, mobile spacing refinements).
