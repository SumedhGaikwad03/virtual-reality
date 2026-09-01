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

---

## Phase 7: Realistic Text-Only Development Dataset Seeding
- Created `seed-dev-dataset.ts` populating 3 developers, 6 projects (2 per developer), 30 configurations (5 per project), 21 highlights, and 32 amenities across Pune localities (Hinjewadi, Pimpri, Kharadi, Magarpatta).
- Provided varied BHK inventory combinations (`2 BHK`, `2 BHK Plus`, `3 BHK`, `3 BHK Plus`, `4 BHK`, `4 BHK Plus`, `5 BHK`) with realistic carpet areas (690–3400 sq ft) and prices (₹62 Lakhs–₹5.6 Crores).
- Zero image/media records created (`Media` table count = 0).
- Preserved existing `Admin` authentication account (`admin@example.com`).

---

## Phase 8: Project Amenities Admin Management Workflow
- Implemented RESTful sub-resource admin endpoints for project amenities: `GET /api/admin/projects/:projectId/amenities`, `POST /api/admin/projects/:projectId/amenities`, `PATCH /api/admin/projects/:projectId/amenities/:amenityId`, and `DELETE /api/admin/projects/:projectId/amenities/:amenityId`.
- Extended `projectRepository` and `projectService` to query, create, update, and delete amenities with duplicate name validation and sort order tracking.
- Included `amenities` in `adminProjectSelect` for administrative inspection when loading project details in admin UI.
- Updated `ProjectFormPage.tsx` with a dedicated, structured "Project Amenities" CRUD management section supporting inline viewing, adding, editing, and deleting amenities.
- Updated `admin/projects.css` with responsive layout rules for desktop and mobile amenity management rows.
- Verified that newly created/updated admin amenities render seamlessly on the public Project page (`ProjectAmenities.tsx`) with automatic emoji icon badge mapping.

- Verified query-builder rule engine dynamically generates interactive questions and matches from the new Pune dataset.
