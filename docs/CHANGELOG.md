# Architectural Changelog

---

## Phase 1: Core Backend & Data Model Foundation
- Created Prisma 7 ORM models: `Developer`, `Project`, `Configuration`, `Media`, `Lead`, `Admin`.
- Configured PostgreSQL driver adapter (`@prisma/adapter-pg`).
- Implemented layered backend architecture: Route -> Validator -> Controller -> Service -> Repository.
- Enforced multi-entity publication boundary (`Project.publishStatus === "PUBLISHED" && Developer.publishStatus === "PUBLISHED"`).
- Integrated Cloudinary external media adapter mapping (`IMAGE`, `VIDEO`, `DOCUMENT`).

---

## Phase 2: Public Page Architecture & Thin Orchestrators
- Implemented thin page orchestrators: `HomePage.tsx`, `DeveloperPage.tsx`, `ProjectPage.tsx`, `SearchPage.tsx`.
- Refactored `DeveloperPage` to use `useDeveloper` hook, full-bleed `DeveloperHero`, and portfolio carousel.
- Refactored `ProjectPage` with 10-step narrative structure, edge-to-edge `ProjectHero`, unit configuration selector (`?configuration=<id>`), `ConfigurationMediaSection`, `ProjectVisualStory`, `ProjectAmenities`, `ProjectLocation`, `ProjectDeveloper`, and `LeadSection`.
- Created sticky `ProjectSubNav.tsx` section anchor navigation.

---

## Phase 3: Pure Rule-Based Conversational Search Discovery
- Transitioned away from free-text search inputs and NLP parsers.
- Built client-side deterministic rule engine (`query-builder.ts`) with sequential rule evaluation (`bhkRule` -> `locationRule` -> `developerRule` -> `priceRule` -> `availabilityRule`).
- Built `useSearchChat.ts` hook for cached catalog fetching, query state tracking, option selections, chip removals, and matching property lists.
- Built modular conversational UI components: `SearchAssistant.tsx`, `AssistantHeader.tsx`, `ConversationMessages.tsx`, `QuerySummary.tsx`, `RuleOptions.tsx`, `SearchResults.tsx`, `PropertyResultCard.tsx`.

---

## Phase 4: Application-Wide Assistant Overlay & Mobile Sheet
- Created `AssistantContext.tsx` provider holding shared `useSearchChat()` state and `isOpen` overlay state.
- Created `PropertyAssistantOverlay.tsx` rendering floating panel on desktop and bottom sheet on mobile.
- Updated `ConversationalSearchEntry.tsx` on Homepage and `FloatingSearchControl.tsx` to invoke `openAssistant()` without forcing page navigation.

---

## Phase 5: Global Site Shell & Header Developer Attribution
- Built `PublicShell.tsx` layout route wrapping public routes (`/`, `/search`, `/:developerSlug`, `/:developerSlug/:locationSlug/:projectSlug`).
- Built `GlobalHeader.tsx` with desktop links, mobile navigation drawer, and assistant trigger.
- Created `HeaderContext.tsx` allowing `DeveloperPage` (`developer.name`) and `ProjectPage` (`project.developer.name`) to publish developer name context directly into `GlobalHeader`.
- Refactored header branding to prominently display `[Developer Name]` in developer context, while establishing `Virtual Reality` in `AboutFooter.tsx`.
- Guaranteed zero horizontal page overflow across desktop and mobile.

---

## Phase 6: Development Database Reset & Real Content Entry Preparation
- Executed atomic Prisma transaction clearing all dummy real-estate property data (`Developer`, `Project`, `Configuration`, `ProjectHighlight`, `ProjectAmenity`, `Media`, `Lead`).
- Preserved existing `Admin` user credentials (`admin@example.com`) and authentication infrastructure.
- Deleted all 24 dummy Cloudinary assets from cloud storage cleanly with zero orphaned assets.
- Created `reset-dev-data.ts` administrative script for atomic database reset.
- Verified seed script (`seed.ts`) only seeds admin credentials from environment variables without regenerating demo data.
- Verified clean empty-state rendering across public pages (`/`, `/search`, `/:developerSlug`, `/:developerSlug/:locationSlug/:projectSlug`) and admin CRUD panels.
