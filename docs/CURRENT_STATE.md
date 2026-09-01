# Current Project State Snapshot

---

## What is this project right now?

The **Virtual Reality Real-Estate Platform** is a production-ready, modular web application for Pune real estate discovery and lead generation.

### Runtime handoff note

The current API entrypoint is `backend/src/server.ts`, compiled to `backend/dist/src/server.js`; the development environment sets `PORT=3000`. `backend/server.js` is a legacy standalone Express app and does not mount the current admin API routes. Starting that legacy file can make Vite-proxied admin requests appear as backend 404s. The frontend uses relative `/api` requests through the Vite proxy at `frontend/vite.config.mts`.

### Product Direction
- **Rule-Based Conversational Property Discovery**: Powered by `query-builder.ts` and `useSearchChat.ts`. User answers option buttons (`[3 BHK]`, `[Wakad]`) to filter catalog properties.
- **Trusted Developer Attribution**: `GlobalHeader` displays `[Developer Name]` directly on Developer and Project pages. Platform identity (`Virtual Reality`) is established in `AboutFooter`.
- **Global Public Shell**: `PublicShell.tsx` wraps all public routes (`/`, `/search`, `/:developerSlug`, `/:developerSlug/:locationSlug/:projectSlug`). Admin routes (`/admin/*`) remain isolated.

---

## Locked Public Pages & Section Narratives

1. **Homepage (`/`)**: `AtmosphericHero` $\rightarrow$ `ExploreDevelopers` $\rightarrow$ `FeaturedProjects` $\rightarrow$ `ConversationalSearchEntry` $\rightarrow$ `FirmOverview` $\rightarrow$ `ContactSection` $\rightarrow$ `AboutFooter`.
2. **Search Page (`/search`)**: `SearchAssistant` (messages, chips, rule options) $\rightarrow$ `SearchResults` (`PropertyResultCard`).
3. **Developer Page (`/:developerSlug`)**: `DeveloperHero` $\rightarrow$ `DeveloperIntro` $\rightarrow$ `DeveloperProjects` $\rightarrow$ `DeveloperLeadSection` $\rightarrow$ `AboutFooter`.
4. **Project Page (`/:developerSlug/:locationSlug/:projectSlug`)**:
   - `ProjectHero` (Static Top Hero)
   - `ProjectSubNav` (Sticky contextual sub-navigation)
   - `ProjectOverview` (Identity narrative & optional persisted highlights)
   - `ProjectHeroCarousel` & `ProjectInteriorExteriorCarousel` (Primary project showcase)
   - `ConfigurationSection` & `ConfigurationMediaSection` (Unit configurations followed by selected configuration details/media)
   - Public top-level project media is scoped to active `PROJECT` context; configuration media remains available under `project.configurations[].media`.
   - `ProjectLocation` (Location info + `LOCATION` media image)
   - `ProjectAmenities` (Project amenities, when present)
   - `TapToExploreGallery` ("Tap to Explore" lightbox modal for active project-context `IMAGE` media)
   - `ProjectVideoSection` (Optional YouTube/Vimeo/MP4 video embed player)
   - `ProjectDeveloper` (Developer attribution card)
   - `LeadSection` (Enquiry form)
   - The former Visual Story sub-navigation item is removed because it pointed to no separate page section; the showcase components remain.
   - `AboutFooter` (Site Footer)

---

## Critical Files to Know

- `frontend/src/router/AppRouter.tsx`: Defines public shell route and admin route tree.
- `frontend/src/components/shell/PublicShell.tsx`: Public shell layout wrapper.
- `frontend/src/components/shell/GlobalHeader.tsx`: Contextual header navigation & developer branding.
- `frontend/src/components/common/ContextualEnquiryModal.tsx`: Accessible, non-intrusive contextual lead inquiry modal for Project & Developer pages.
- `frontend/src/components/project/ProjectHeroCarousel.tsx`: Showcase carousel for `HERO_CAROUSEL` media with soft crossfade, slide preloading, and visibility-change pause.
- `frontend/src/components/project/ProjectInteriorExteriorCarousel.tsx`: Combined `INTERIOR` + `EXTERIOR` visual story carousel.
- `frontend/src/context/AssistantContext.tsx`: Global search assistant overlay state & `useSearchChat`.
- `frontend/src/context/HeaderContext.tsx`: `developerName` context provider.
- `frontend/src/services/query-builder.ts`: Sequential rule engine logic.
- `backend/src/repositories/project.repository.ts`: Multi-entity publication queries and `ProjectAmenity` operations.
- `frontend/src/pages/admin/ProjectFormPage.tsx`: Admin project form with structured Project Highlights and Project Amenities authoring sections.
- `frontend/public/manifest.webmanifest` and `frontend/public/sw.js`: Installable admin PWA metadata, shell caching, and Web Push notification handling.
- `frontend/src/components/admin/LeadNotificationControl.tsx`: Explicit per-device notification permission and subscription registration control.
- `backend/src/services/notification.service.ts`: Best-effort new-lead push delivery after lead persistence.

---

## Administrative CRUD Workflows
- **Project Amenities Management**: Admin UI enables viewing, adding, editing, and deleting project amenities (`ProjectFormPage.tsx` $\rightarrow$ `admin-projects.ts` $\rightarrow$ `amenity.routes.ts` $\rightarrow$ `project.service.ts` $\rightarrow$ `project.repository.ts` $\rightarrow$ Prisma `ProjectAmenity`).
- **Public Integration**: Amenities created in admin UI instantly render on public project pages (`ProjectAmenities.tsx`) with automatic emoji icon badge mapping.
- **Project Highlights Management**: Admin UI enables optional manually authored project highlights with add, edit, remove, and reorder behavior through `/api/admin/projects/:projectId/highlights`; the public API returns persisted highlights ordered by `sortOrder` and `ProjectOverview` omits the section when empty.
- **Configuration Management**: Authenticated admins can create, list, retrieve, and update project configurations through the project-scoped configuration routes. The current fields are name, BHK, carpet area, optional built-up and super-built-up areas, price-from, and availability status; configuration media is managed separately and remains available through each configuration relationship.
- **Media Integrity**: Admin media updates revalidate the persisted ownership hierarchy against the requested context before changing metadata or activation state. Owner IDs remain immutable through the update payload, and invalid PROJECT, DEVELOPER, CONFIGURATION, or HOME context transitions are rejected.
- **Contextual Enquiry UX**: Action-driven contextual lead modal and mobile sticky bar (<768px) integrated directly into existing `createLead` API client (`lead.ts`).
- **Lead Operations**: Admin Lead Manager exposes project/developer/configuration context, WhatsApp and `tel:` actions, and a restrained green outer attention halo for `NEW` leads; `IN_PROGRESS` is displayed as “Ongoing” without changing the persisted enum.
- **Admin PWA & Push**: The admin shell is installable with static-shell-only service-worker caching. Authenticated push subscriptions support multiple devices per active admin; lead notifications contain minimal context and never cache or include lead PII.
- **Push Verification**: Leads includes the explicit notification permission control and a real backend-dispatched test notification; the UI reports unsupported, denied, unregistered, and registered device states.
- **Developer Lead Attribution**: Direct developer enquiries now forward the validated `developerId`; project and configuration enquiries retain their existing relationship-derived attribution.

---

## Immediate Next Priority
Phase 4: Site-wide visual refinement pass (typography polish, CSS design token unification, mobile spacing refinements).
