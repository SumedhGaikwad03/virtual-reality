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

---

## Phase 9: Public Project Page Media Narrative & External Video Workflow
- Implemented backend endpoint `POST /api/admin/media/url` and validator `validateMediaUrlCreation` to allow creating media assets from external URLs (YouTube, Vimeo, Cloudinary links) without requiring raw file uploads.
- Updated Admin Media UI (`ProjectMediaPage.tsx`) with a mode toggle (Local File Upload vs External Media URL) for managing project media.
- Refactored public Project Page (`ProjectPage.tsx`) to strictly enforce the 14-step agreed visual media narrative:
  1. `GlobalHeader` (PublicShell)
  2. `ProjectHero` (Static top hero - strictly excludes `HERO_CAROUSEL` media)
  3. `ProjectSubNav` (Sticky contextual section navigation)
  4. `ProjectOverview` (Identity narrative & highlights)
  5. `ProjectHeroCarousel` (Top visual showcase carousel for `category === "HERO_CAROUSEL"`)
  6. `ProjectInteriorExteriorCarousel` (Combined Interior + Exterior Visual Carousel merging `INTERIOR` and `EXTERIOR` media)
  7. `ConfigurationSection` (Unit configurations selection)
  8. `ConfigurationMediaSection` (Configuration floor plans & unit media)
  9. `ProjectLocation` (Location section combining address, Google Maps link, and `LOCATION` category media image)
  10. `TapToExploreGallery` ("Tap to Explore" lightbox modal trigger for `GALLERY` and `CONSTRUCTION` media)
  11. `ProjectVideoSection` (Optional project video embed player with YouTube/Vimeo embed URL normalization)
  12. `ProjectAmenities` & `ProjectDeveloper` (Amenities floating cards & Developer card)
  13. `LeadSection` (Enquiry form)
  14. `AboutFooter` (Site Footer)
- Retired monolithic dumping ground component `MediaSection.tsx` and container `ProjectVisualStory.tsx` to prevent duplicate media rendering.
- Updated `project.css` with responsive styling across 320px–1440px+ viewports, smooth transitions, focus traps, body scroll locking, and `prefers-reduced-motion` compliance.

---

## Phase 10: Visual Media Refinement & Contextual Enquiry UX
- **Hero Carousel Visual Refinement (`ProjectHeroCarousel.tsx`)**: Replaced thumbnail URLs with full-resolution primary media URLs (`item.url`), framed container with wide cinematic aspect-ratio bounds (`21 / 9` desktop, `16 / 9` mobile) to eliminate empty whitespace margins, added slide preloading (`new Image().src`), document visibility pause (`visibilitychange`), and soft crossfade opacity transitions (800ms).
- **Interior + Exterior Combined Carousel Rework (`ProjectInteriorExteriorCarousel.tsx`)**: Combined `INTERIOR` and `EXTERIOR` photography into a single sequence, single primary image framing on mobile with zero horizontal overflow, 5.5s autoplay, hover/focus/tab-hidden pause, preloading, and category badges ("Interior Space" / "Exterior & Architecture").
- **Contextual Enquiry Modal (`ContextualEnquiryModal.tsx`)**: Created reusable, non-intrusive contextual enquiry modal supporting Project and Developer page contexts, with focus trapping, auto-focus, Escape key listener, backdrop click close, body scroll locking, and focus restoration.
- **Mobile Sticky Enquiry Action Bar (`ProjectPage.tsx` & `project.css`)**: Added restrained sticky enquiry bar (`[ Project Name · Enquire ]`) at the bottom of narrow mobile viewports (<768px) with `env(safe-area-inset-bottom)` safe-area padding.
- **Enquiry Flow Integration**: Reused existing `createLead` API client (`lead.ts`) without creating duplicate backend endpoints or modifying schema.

---

## Phase 11: Developer Page Visual Carousel Refinement & Floating Control Polish
- **Developer Media Showcase Carousel (`DeveloperMediaCarousel.tsx`)**: Created dedicated developer showcase carousel component rendering `developer.media` with wide cinematic aspect-ratio bounds (`21 / 9` desktop, `16 / 9` mobile), eliminating arbitrary fixed heights and empty vertical whitespace margins around the visual stage.
- **Sleek Floating Controls & Padded Indicators**: Replaced generic browser `‹ Previous` / `Next ›` buttons with sleek floating translucent circular arrow controls (`←` and `→`) and formatted slide counter indicator as padded numbers (`01 / 02`) overlaid on the image stage.
- **Project Hero Carousel Alignment (`ProjectHeroCarousel.tsx`)**: Aligned `ProjectHeroCarousel` controls and counter overlay with the same sleek floating arrow buttons (`←` / `→`) and padded indicator overlay (`01 / 02`) for site-wide visual consistency.
- **Floating Assistant Control Positioning (`home.css`)**: Positioned `.floating-search-control-container` on mobile viewports (`bottom: calc(4.5rem + env(safe-area-inset-bottom, 0px))`) to prevent overlapping developer page enquiry forms, CTAs, or sticky bars.

---

## Phase 12: Public Project Media Boundary

- Scoped the public top-level `project.media` relation to active `PROJECT`-context media. Configuration media remains available through `project.configurations[].media` and no longer enters top-level project media presentation.

---

## Phase 13: Project Gallery Eligibility

- Updated `TapToExploreGallery` to include active project-scoped `IMAGE` media regardless of specialized project category, while excluding `VIDEO` and `DOCUMENT` records. Configuration media remains isolated through configuration relationships.

---

## Phase 14: Admin PWA, Lead Actions, and Web Push

- Added an installable admin PWA manifest, branded icon, standalone metadata, static-shell service worker, offline live-data notice, and no API/lead PII caching.
- Added responsive operational lead actions for WhatsApp and phone calls, developer context, readable status labels, and subtle NEW-lead attention behavior while preserving `NEW`, `IN_PROGRESS`, and `DONE` storage values.
- Added authenticated multi-device `PushSubscription` persistence, VAPID-backed best-effort new-lead notifications, expired endpoint cleanup, and notification deep links to the existing protected lead detail route.
- Added backend-backed notification status and real test-push verification in the Leads page; permission alone is not reported as an active subscription.
- Corrected direct developer enquiry attribution so the validated `developerId` is persisted through the existing lead service/repository flow.

---

## Phase 15: Project Page Information Architecture Refinement

- Reordered the public Project Page so the project showcase is followed immediately by available configurations and selected configuration media, then location, amenities, project gallery, optional video, developer attribution, and enquiry.
- Preserved optional Key Highlights behavior: the highlights block renders only for persisted project highlights and leaves no empty section when none exist.
- Removed the redundant `Visual Story` sub-navigation item while retaining the existing showcase carousels.
- Confirmed configuration-owned media remains available through `project.configurations[].media`; top-level `project.media` remains limited to active `PROJECT` context.

---

## Phase 16: Project Key Highlights Authoring

- Reused the existing `ProjectHighlight` model and public DTO flow; no schema or migration was required.
- Added authenticated project highlight CRUD endpoints and included ordered highlights in the admin project response.
- Added optional repeatable Key Highlights authoring to `ProjectFormPage`, including add, edit, remove, reorder, and a 12-item limit. Blank rows are ignored on save.
- Preserved public behavior: `ProjectOverview` renders only persisted highlights and renders no empty section.

---

## Phase 17: Media Ownership Integrity Hardening

- Revalidated persisted developer/project/configuration ownership against the requested media context before admin metadata or activation updates, preventing invalid context transitions while preserving legitimate metadata edits.

---

## Phase 17: Highlight Proxy Diagnosis and Lead Attention Refinement

- Confirmed the highlight client correctly uses the shared `/api` path and the Vite proxy already forwards it to the configured backend port; a stale/not-running backend process can produce the observed 5173/404 rather than a missing highlight route.
- Refined `NEW` Lead Manager rows with a contained green outer halo and reduced-motion handling, without changing `Ongoing` or `Done` cards or lead status behavior.
- Documented the supported backend entrypoint and the legacy `backend/server.js` runtime distinction after tracing the 5173/404 failure mode.
