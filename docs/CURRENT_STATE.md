# Current Project State Snapshot

---

## What is this project right now?

The **Virtual Reality Real-Estate Platform** is a production-ready, modular web application for Pune real estate discovery and lead generation.

### Runtime handoff note

The current API entrypoint is `backend/src/server.ts`, compiled to `backend/dist/src/server.js`; the development environment sets `PORT=3000`. `backend/server.js` is a legacy standalone Express app and does not mount the current admin API routes. Starting that legacy file can make Vite-proxied admin requests appear as backend 404s. The frontend uses relative `/api` requests through the Vite proxy at `frontend/vite.config.mts`.

Admin authentication now exposes an explicit session-readiness state before protected routes render. Expired stored JWTs are cleared before they can authorize the shell; a 401 from an admin API also clears the token and redirects through the existing unauthorized event. No token refresh or single-session invalidation is implemented.

Admin JWTs use `JWT_EXPIRES_IN` when configured and otherwise expire after 15 minutes. There is no refresh token: the access token and validated admin identity are stored separately in browser `localStorage`, malformed/expired local tokens are cleared, and the backend remains authoritative through JWT verification. Logout clears both values. Sessions are browser/device-local and independent.

The authenticated Admin Dashboard uses existing `getLeads()` and `getProjects()` responses for exactly four operational KPIs: leads created today, all `NEW` leads requiring attention, `IN_PROGRESS` leads, and published projects. It shows up to five recent unattended leads with the shared WhatsApp/Call `LeadActions` component and an additional compact `IN_PROGRESS` work queue; no activity/audit API is invented. The login response's existing admin name/email is persisted alongside the access token for the dashboard greeting and cleared on logout.

### Product Direction
- **Rule-Based Conversational Property Discovery**: Powered by `query-builder.ts`, `assistant-dialogue.ts`, and `useSearchChat.ts`. User answers option buttons (`[3 BHK]`, `[Wakad]`) to progressively filter published catalog inventory with warm, human-friendly concierge dialogue from **Tara · Property Discovery Advisor**. Every option is strictly derived from remaining candidate inventory (100% database grounded, no non-existent choices). Questions stop automatically once candidate inventory reaches $\le 3$ unique projects (`PROJECT_STOPPING_THRESHOLD = 3`) or 1 project. Starting prices are cleanly formatted (`₹ 1.50 Cr+`, `₹ 95 Lakhs+`).
- **Trusted Developer Attribution**: `GlobalHeader` displays `[Developer Name]` directly on Developer and Project pages. Platform identity (`Virtual Reality`) is established in `AboutFooter`.
- **Global Public Shell**: `PublicShell.tsx` wraps all public routes (`/`, `/search`, `/:developerSlug`, `/:developerSlug/:locationSlug/:projectSlug`). Admin routes (`/admin/*`) remain isolated.

---

## Locked Public Pages & Section Narratives

1. **Homepage (`/`)**: `AtmosphericHero` $\rightarrow$ `ExploreDevelopers` $\rightarrow$ `FeaturedProjects` $\rightarrow$ `ConversationalSearchEntry` $\rightarrow$ `FirmOverview` $\rightarrow$ `ContactSection` $\rightarrow$ `AboutFooter`.
2. **Search Page (`/search`)**: `SearchAssistant` (Tara advisor identity & avatar, messages, context trail, rule options) $\rightarrow$ `SearchResults` (`PropertyResultCard`).
3. **Developer Page (`/:developerSlug`)**: `DeveloperHero` $\rightarrow$ `DeveloperIntro` $\rightarrow$ `DeveloperProjects` $\rightarrow$ `DeveloperLeadSection` $\rightarrow$ `AboutFooter`.
4. **Project Page (`/:developerSlug/:locationSlug/:projectSlug`)**:
   - `ProjectHero` (Static Top Hero)
   - `ProjectSubNav` (Sticky contextual sub-navigation)
   - `ProjectOverview` (Identity narrative & optional persisted highlights)
   - Optional `ProjectVideoSection` (only when a valid project video exists)
   - `ProjectInteriorExteriorCarousel` (PROJECT-context interior/exterior showcase, when available)
   - `ProjectAmenities` (concise amenity scan)
   - `ProjectHeroCarousel` (PROJECT-context featured showcase, when available)
   - `ConfigurationSection` & `ConfigurationMediaSection` (clean unit summaries followed by selected configuration details/media)
   - Public top-level project media is scoped to active `PROJECT` context; configuration media remains available under `project.configurations[].media`.
   - `ProjectLocation` (Location info + project-owned `LOCATION` media image)
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
- `frontend/src/services/query-builder.ts`: Sequential rule engine logic and candidate filtering.
- `frontend/src/services/assistant-dialogue.ts`: Tara conversational presentation and acknowledgement dialogue layer.
- `frontend/src/components/search/TaraAvatar.tsx`: Reusable Tara visual avatar token component.
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
- **Media Listing Boundaries**: `/admin/media` is the global Home Media workspace and its root controller explicitly lists only `context=HOME` records, regardless of any conflicting query value. The separate context path and developer, project, and configuration owner listings are constrained to their requested or matching context, preventing descendant media from leaking across admin workflows.
- **Public Media Presentation**: Project pages consume only PROJECT-context media; configuration media remains under `project.configurations[].media`. Homepage developer discovery consumes direct DEVELOPER-context `DEVELOPER_BANNER` media before the existing developer logo, with no project/configuration fallback.
- **Public Project Discovery Hierarchy**: Project pages progressively disclose Overview, optional highlights/video, interior/exterior showcase, amenities, featured showcase, configurations, location, gallery, and enquiry. Public configuration cards omit built-up and super-built-up areas while URL selection remains `?configuration=<configurationId>`.
- **Public Navigation**: Project pages expose compact in-page Explore navigation to existing section anchors. Homepage developer cards are fully clickable and use direct `DEVELOPER_BANNER` media or the developer logo; developer official website URLs remain admin-managed but are not exposed in the public page. Essential location map links remain available.
# Current Project State Snapshot

---

## What is this project right now?

The **Virtual Reality Real-Estate Platform** is a production-ready, modular web application for Pune real estate discovery and lead generation.

### Runtime handoff note

The current API entrypoint is `backend/src/server.ts`, compiled to `backend/dist/src/server.js`; the development environment sets `PORT=3000`. `backend/server.js` is a legacy standalone Express app and does not mount the current admin API routes. Starting that legacy file can make Vite-proxied admin requests appear as backend 404s. The frontend uses relative `/api` requests through the Vite proxy at `frontend/vite.config.mts`.

Admin authentication now exposes an explicit session-readiness state before protected routes render. Expired stored JWTs are cleared before they can authorize the shell; a 401 from an admin API also clears the token and redirects through the existing unauthorized event. No token refresh or single-session invalidation is implemented.

Admin JWTs use `JWT_EXPIRES_IN` when configured and otherwise expire after 15 minutes. There is no refresh token: the access token and validated admin identity are stored separately in browser `localStorage`, malformed/expired local tokens are cleared, and the backend remains authoritative through JWT verification. Logout clears both values. Sessions are browser/device-local and independent.

The authenticated Admin Dashboard uses existing `getLeads()` and `getProjects()` responses for exactly four operational KPIs: leads created today, all `NEW` leads requiring attention, `IN_PROGRESS` leads, and published projects. It shows up to five recent unattended leads with the shared WhatsApp/Call `LeadActions` component and an additional compact `IN_PROGRESS` work queue; no activity/audit API is invented. The login response's existing admin name/email is persisted alongside the access token for the dashboard greeting and cleared on logout.

### Product Direction
- **Rule-Based Conversational Property Discovery**: Powered by `query-builder.ts`, `assistant-dialogue.ts`, and `useSearchChat.ts`. User answers option buttons (`[3 BHK]`, `[Wakad]`) to progressively filter published catalog inventory with warm, human-friendly concierge dialogue from **Tara · Property Discovery Advisor**. Every option is strictly derived from remaining candidate inventory (100% database grounded, no non-existent choices). Questions stop automatically once candidate inventory reaches $\le 3$ unique projects (`PROJECT_STOPPING_THRESHOLD = 3`) or 1 project. Starting prices are cleanly formatted (`₹ 1.50 Cr+`, `₹ 95 Lakhs+`).
- **Trusted Developer Attribution**: `GlobalHeader` displays `[Developer Name]` directly on Developer and Project pages. Platform identity (`Virtual Reality`) is established in `AboutFooter`.
- **Global Public Shell**: `PublicShell.tsx` wraps all public routes (`/`, `/search`, `/:developerSlug`, `/:developerSlug/:locationSlug/:projectSlug`). Admin routes (`/admin/*`) remain isolated.

---

## Locked Public Pages & Section Narratives

1. **Homepage (`/`)**: `AtmosphericHero` $\rightarrow$ `ExploreDevelopers` $\rightarrow$ `FeaturedProjects` $\rightarrow$ `ConversationalSearchEntry` $\rightarrow$ `FirmOverview` $\rightarrow$ `ContactSection` $\rightarrow$ `AboutFooter`.
2. **Search Page (`/search`)**: `SearchAssistant` (Tara advisor identity & avatar, messages, context trail, rule options) $\rightarrow$ `SearchResults` (`PropertyResultCard`).
3. **Developer Page (`/:developerSlug`)**: `DeveloperHero` $\rightarrow$ `DeveloperIntro` $\rightarrow$ `DeveloperProjects` $\rightarrow$ `DeveloperLeadSection` $\rightarrow$ `AboutFooter`.
4. **Project Page (`/:developerSlug/:locationSlug/:projectSlug`)**:
   - `ProjectHero` (Static Top Hero)
   - `ProjectSubNav` (Sticky contextual sub-navigation)
   - `ProjectOverview` (Identity narrative & optional persisted highlights)
   - Optional `ProjectVideoSection` (only when a valid project video exists)
   - `ProjectInteriorExteriorCarousel` (PROJECT-context interior/exterior showcase, when available)
   - `ProjectAmenities` (concise amenity scan)
   - `ProjectHeroCarousel` (PROJECT-context featured showcase, when available)
   - `ConfigurationSection` & `ConfigurationMediaSection` (clean unit summaries followed by selected configuration details/media)
   - Public top-level project media is scoped to active `PROJECT` context; configuration media remains available under `project.configurations[].media`.
   - `ProjectLocation` (Location info + project-owned `LOCATION` media image)
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
- `frontend/src/services/query-builder.ts`: Sequential rule engine logic and candidate filtering.
- `frontend/src/services/assistant-dialogue.ts`: Tara conversational presentation and acknowledgement dialogue layer.
- `frontend/src/components/search/TaraAvatar.tsx`: Reusable Tara visual avatar token component.
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
- **Media Listing Boundaries**: `/admin/media` is the global Home Media workspace and its root controller explicitly lists only `context=HOME` records, regardless of any conflicting query value. The separate context path and developer, project, and configuration owner listings are constrained to their requested or matching context, preventing descendant media from leaking across admin workflows.
- **Public Media Presentation**: Project pages consume only PROJECT-context media; configuration media remains under `project.configurations[].media`. Homepage developer discovery consumes direct DEVELOPER-context `DEVELOPER_BANNER` media before the existing developer logo, with no project/configuration fallback.
- **Public Project Discovery Hierarchy**: Project pages progressively disclose Overview, optional highlights/video, interior/exterior showcase, amenities, featured showcase, configurations, location, gallery, and enquiry. Public configuration cards omit built-up and super-built-up areas while URL selection remains `?configuration=<configurationId>`.
- **Public Navigation**: Project pages expose compact in-page Explore navigation to existing section anchors. Homepage developer cards are fully clickable and use direct `DEVELOPER_BANNER` media or the developer logo; developer official website URLs remain admin-managed but are not exposed in the public page. Essential location map links remain available.
- **Configuration Admin UX**: Configuration list/edit pages use the shared primary/secondary action treatment, identify the owning project, and expose Back to Configurations and Manage Configuration Media actions. Actions stack on narrow screens without changing configuration or media APIs.
- **Admin Navigation and Mobile Layout**: Primary navigation exposes Developers, Projects, Media, Leads, and Import; configurations remain project-scoped rather than appearing as a standalone global destination. Project/configuration rows and media grids stack at the mobile breakpoint. Lead notification controls are presented inside the Leads workspace.
- **Contextual Project Workspace**: Opening an existing project enters a project-scoped workspace with Overview, Media, Configurations, Highlights & Amenities, and Preview navigation. The workspace reuses `ProjectFormPage`, `ProjectMediaPage`, `ProjectConfigurationsPage`, and the existing configuration/media routes; highlights and amenities remain independently persisted from the project form.
- **Project Workspace UX**: The Overview now shows available project content status, identifies unsaved project/highlight/configuration changes, and keeps successful project/configuration edits in context. New records continue into their saved contextual edit workflow; preview is explicitly the persisted public page.
- **Admin Mobile Layout**: At phone widths the admin shell collapses into a compact header row with an independently scrollable navigation strip. Admin content, cards, controls, project readiness panels, and workspace navigation have explicit shrink/max-width constraints; readiness panels use two columns on larger phones and one column below 380px. Public pages and API behavior are unchanged.
- **Responsive Admin Navigation**: Desktop keeps the full familiar navigation. Phone widths expose Admin, Projects, and Leads directly, while Developers, Media, Import, and Logout are available through the compact More menu; the menu is contained within the shell and does not widen the document.
- **Contextual Enquiry UX**: Action-driven contextual lead modal and mobile sticky bar (<768px) integrated directly into existing `createLead` API client (`lead.ts`).
- **Lead Operations & Structured Visit Scheduling**: Admin Lead Manager exposes project/developer/configuration context, structured `visitDate` (`YYYY-MM-DD`) and `visitTime` (`Morning`, `Afternoon`, `Evening`), WhatsApp and `tel:` actions, multi-token whitespace search across name, phone, email, message, notes, and related developer/project/configuration names/localities, instant search clear, and a restrained green outer attention halo for `NEW` leads; `IN_PROGRESS` is displayed as “Ongoing” without changing the persisted enum. Existing historical leads with `null` visit fields remain completely compatible.
- **Admin PWA & Push**: The admin shell is installable with static-shell-only service-worker caching. Authenticated push subscriptions support multiple devices per active admin; lead notifications contain minimal context and never cache or include lead PII.
- **Push Verification**: Leads includes the explicit notification permission control and a real backend-dispatched test notification; the UI reports unsupported, denied, unregistered, and registered device states.
- **Developer Lead Attribution**: Direct developer enquiries now forward the validated `developerId`; project and configuration enquiries retain their existing relationship-derived attribution.
- **Developer & Project Activation / Deactivation Controls**: Admin UI exposes `publishStatus` as explicit **Active** (`PUBLISHED`) and **Inactive** (`DRAFT`) controls on Developers (`DevelopersPage.tsx`, `DeveloperFormPage.tsx`) and Projects (`ProjectsPage.tsx`, `ProjectFormPage.tsx`). Deactivating requires explicit confirmation via `DeactivateDeveloperModal.tsx` or `DeactivateProjectModal.tsx` explaining that public visibility will be removed while existing data is preserved. Deactivation strictly updates the single entity's database row with zero cascade overwrites to child/parent records. When a Project is marked `PUBLISHED` under an inactive Developer (`DRAFT`), an informational parent deactivation warning is rendered on the project workspace.
  - Vercel edge rewrites (`vercel.json`) proxy public traffic to the Express backend (`seo.routes.ts` ➔ `seo-renderer.service.ts`) while keeping `/search` and `/admin/*` as client-side Vite SPAs.
  - Pre-renders full semantic HTML with Open Graph, Twitter Cards, Canonical URLs, and Schema.org JSON-LD structured data for:
    - Homepage (`/` with `WebSite` and `Organization`)
    - Pune City Hub (`/projects-in-pune` with `Place`, `ItemList` of 6 projects, and `BreadcrumbList`)
    - Locality Hubs (`/location/kharadi`, `/location/pimpri`, `/location/hinjewadi`, `/location/magarpatta` with `Place`, `ItemList`, and `BreadcrumbList`)
    - Developer Profiles (`/:developerSlug` with `Organization` and `BreadcrumbList`)
    - Project Details (`/:developerSlug/:locationSlug/:projectSlug` with `ApartmentComplex`, `Offer`, and `BreadcrumbList`)
# Current Project State Snapshot

---

## What is this project right now?

The **Virtual Reality Real-Estate Platform** is a production-ready, modular web application for Pune real estate discovery and lead generation.

### Runtime handoff note

The current API entrypoint is `backend/src/server.ts`, compiled to `backend/dist/src/server.js`; the development environment sets `PORT=3000`. `backend/server.js` is a legacy standalone Express app and does not mount the current admin API routes. Starting that legacy file can make Vite-proxied admin requests appear as backend 404s. The frontend uses relative `/api` requests through the Vite proxy at `frontend/vite.config.mts`.

Admin authentication now exposes an explicit session-readiness state before protected routes render. Expired stored JWTs are cleared before they can authorize the shell; a 401 from an admin API also clears the token and redirects through the existing unauthorized event. No token refresh or single-session invalidation is implemented.

Admin JWTs use `JWT_EXPIRES_IN` when configured and otherwise expire after 15 minutes. There is no refresh token: the access token and validated admin identity are stored separately in browser `localStorage`, malformed/expired local tokens are cleared, and the backend remains authoritative through JWT verification. Logout clears both values. Sessions are browser/device-local and independent.

The authenticated Admin Dashboard uses existing `getLeads()` and `getProjects()` responses for exactly four operational KPIs: leads created today, all `NEW` leads requiring attention, `IN_PROGRESS` leads, and published projects. It shows up to five recent unattended leads with the shared WhatsApp/Call `LeadActions` component and an additional compact `IN_PROGRESS` work queue; no activity/audit API is invented. The login response's existing admin name/email is persisted alongside the access token for the dashboard greeting and cleared on logout.

### Product Direction
- **Rule-Based Conversational Property Discovery**: Powered by `query-builder.ts`, `assistant-dialogue.ts`, and `useSearchChat.ts`. User answers option buttons (`[3 BHK]`, `[Wakad]`) to progressively filter published catalog inventory with warm, human-friendly concierge dialogue from **Tara · Property Discovery Advisor**. Every option is strictly derived from remaining candidate inventory (100% database grounded, no non-existent choices). Questions stop automatically once candidate inventory reaches $\le 3$ unique projects (`PROJECT_STOPPING_THRESHOLD = 3`) or 1 project. Starting prices are cleanly formatted (`₹ 1.50 Cr+`, `₹ 95 Lakhs+`).
- **Trusted Developer Attribution**: `GlobalHeader` displays `[Developer Name]` directly on Developer and Project pages. Platform identity (`Virtual Reality`) is established in `AboutFooter`.
- **Global Public Shell**: `PublicShell.tsx` wraps all public routes (`/`, `/search`, `/:developerSlug`, `/:developerSlug/:locationSlug/:projectSlug`). Admin routes (`/admin/*`) remain isolated.

---

## Locked Public Pages & Section Narratives

1. **Homepage (`/`)**: `AtmosphericHero` $\rightarrow$ `TrustStatisticsStrip` $\rightarrow$ `FeaturedProjects` $\rightarrow$ `ExploreDevelopers` $\rightarrow$ `HomeGallery` $\rightarrow$ `FirmOverview` $\rightarrow$ `ContactAdvisorySection` $\rightarrow$ `AboutFooter`.
2. **Search Page (`/search`)**: `SearchAssistant` (Tara advisor identity & avatar, messages, context trail, rule options) $\rightarrow$ `SearchResults` (`PropertyResultCard`). Canonical full-page property search destination.
3. **Developer Page (`/:developerSlug`)**: `DeveloperHero` $\rightarrow$ `DeveloperIntro` $\rightarrow$ `DeveloperProjects` $\rightarrow$ `DeveloperLeadSection` $\rightarrow$ `AboutFooter`.
4. **Project Page (`/:developerSlug/:locationSlug/:projectSlug`)**:
   - `ProjectHero` (Static Top Hero)
   - `ProjectSubNav` (Sticky contextual sub-navigation)
   - `ProjectOverview` (Identity narrative & optional persisted highlights)
   - Optional `ProjectVideoSection` (only when a valid project video exists)
   - `ProjectInteriorExteriorCarousel` (PROJECT-context interior/exterior showcase, when available)
   - `ProjectAmenities` (concise amenity scan)
   - `ProjectHeroCarousel` (PROJECT-context featured showcase, when available)
   - `ConfigurationSection` & `ConfigurationMediaSection` (clean unit summaries followed by selected configuration details/media)
   - Public top-level project media is scoped to active `PROJECT` context; configuration media remains available under `project.configurations[].media`.
   - `ProjectLocation` (Location info + project-owned `LOCATION` media image)
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
- `frontend/src/services/query-builder.ts`: Sequential rule engine logic and candidate filtering.
- `frontend/src/services/assistant-dialogue.ts`: Tara conversational presentation and acknowledgement dialogue layer.
- `frontend/src/components/search/TaraAvatar.tsx`: Reusable Tara visual avatar token component.
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
- **Media Listing Boundaries**: `/admin/media` is the global Home Media workspace and its root controller explicitly lists only `context=HOME` records, regardless of any conflicting query value. The separate context path and developer, project, and configuration owner listings are constrained to their requested or matching context, preventing descendant media from leaking across admin workflows.
- **Public Media Presentation**: Project pages consume only PROJECT-context media; configuration media remains under `project.configurations[].media`. Homepage developer discovery consumes direct DEVELOPER-context `DEVELOPER_BANNER` media before the existing developer logo, with no project/configuration fallback.
- **Public Project Discovery Hierarchy**: Project pages progressively disclose Overview, optional highlights/video, interior/exterior showcase, amenities, featured showcase, configurations, location, gallery, and enquiry. Public configuration cards omit built-up and super-built-up areas while URL selection remains `?configuration=<configurationId>`.
- **Public Navigation**: Project pages expose compact in-page Explore navigation to existing section anchors. Homepage developer cards are fully clickable and use direct `DEVELOPER_BANNER` media or the developer logo; developer official website URLs remain admin-managed but are not exposed in the public page. Essential location map links remain available.
- **Configuration Admin UX**: Configuration list/edit pages use the shared primary/secondary action treatment, identify the owning project, and expose Back to Configurations and Manage Configuration Media actions. Actions stack on narrow screens without changing configuration or media APIs.
- **Admin Navigation and Mobile Layout**: Primary navigation exposes Developers, Projects, Media, Leads, and Import; configurations remain project-scoped rather than appearing as a standalone global destination. Project/configuration rows and media grids stack at the mobile breakpoint. Lead notification controls are presented inside the Leads workspace.
- **Contextual Project Workspace**: Opening an existing project enters a project-scoped workspace with Overview, Media, Configurations, Highlights & Amenities, and Preview navigation. The workspace reuses `ProjectFormPage`, `ProjectMediaPage`, `ProjectConfigurationsPage`, and the existing configuration/media routes; highlights and amenities remain independently persisted from the project form.
- **Project Workspace UX**: The Overview now shows available project content status, identifies unsaved project/highlight/configuration changes, and keeps successful project/configuration edits in context. New records continue into their saved contextual edit workflow; preview is explicitly the persisted public page.
- **Admin Mobile Layout**: At phone widths the admin shell collapses into a compact header row with an independently scrollable navigation strip. Admin content, cards, controls, project readiness panels, and workspace navigation have explicit shrink/max-width constraints; readiness panels use two columns on larger phones and one column below 380px. Public pages and API behavior are unchanged.
- **Responsive Admin Navigation**: Desktop keeps the full familiar navigation. Phone widths expose Admin, Projects, and Leads directly, while Developers, Media, Import, and Logout are available through the compact More menu; the menu is contained within the shell and does not widen the document.
- **Contextual Enquiry UX**: Action-driven contextual lead modal and mobile sticky bar (<768px) integrated directly into existing `createLead` API client (`lead.ts`).
- **Lead Operations & Ownership Foundation (Step 1)**:
  - Extended PostgreSQL `Lead` model with `createdById` (nullable UUID string with FK to `Admin.id` on delete set null) and `ownerId` (nullable UUID string with FK to `Admin.id` on delete set null).
  - Extended PostgreSQL `Admin` model with `createdLeads` (`@relation("LeadCreatedBy")`) and `ownedLeads` (`@relation("LeadOwner")`).
  - Database indexes: `@@index([createdById])` and `@@index([ownerId])`.
  - Database migration `20260919200000_add_lead_ownership_fields` safely backfills all existing organic/legacy leads to the primary active Founder administrator.
  - Server-side ownership assignment:
    - **Organic website leads**: `createdById = null`, `ownerId = Founder`.
    - **Authenticated manual admin leads**: `createdById = actorAdminId`, `ownerId = actorAdminId`.
  - Request validation (`hasOnlyFields`) strictly rejects any attempt by public callers or employees to inject `ownerId` or `createdById` with HTTP 400.
  - Admin Lead Manager exposes project/developer/configuration context, WhatsApp and `tel:` actions, and a restrained green outer attention halo for `NEW` leads; `IN_PROGRESS` is displayed as “Ongoing” without changing the persisted enum.
- **Admin PWA & Push**: The admin shell is installable with static-shell-only service-worker caching. Authenticated push subscriptions support multiple devices per active admin; lead notifications contain minimal context and never cache or include lead PII.
- **Push Verification**: Leads includes the explicit notification permission control and a real backend-dispatched test notification; the UI reports unsupported, denied, unregistered, and registered device states.
- **Developer Lead Attribution**: Direct developer enquiries now forward the validated `developerId`; project and configuration enquiries retain their existing relationship-derived attribution.
- **Security & Authentication Architecture**: Short-lived JWTs (default 15-minute lifetime) signed with HMAC-SHA256 (`HS256`) and verified server-side with pinned algorithm configuration. `JWT_SECRET` must be non-empty and at least 32 characters in production. All admin endpoints enforce `requireAdminAuthentication`. Login and lead endpoints are strictly rate limited, input lengths are bounded against DoS, and all user-supplied URLs enforce `http:`/`https:` protocol whitelists. The scraper features DNS resolution and private/loopback IP validation against SSRF.
- **Server-Side SEO Pre-Rendering & Edge Rewrites (Phase 1 & Phase 2)**:
  - Vercel edge rewrites (`vercel.json`) proxy public traffic to the Express backend (`seo.routes.ts` ➔ `seo-renderer.service.ts`) while keeping `/search` and `/admin/*` as client-side Vite SPAs.
  - Pre-renders full semantic HTML with Open Graph, Twitter Cards, Canonical URLs, and Schema.org JSON-LD structured data for:
    - Homepage (`/` with `WebSite` and `Organization`)
    - Pune City Hub (`/projects-in-pune` with `Place`, `ItemList` of 6 projects, and `BreadcrumbList`)
    - Locality Hubs (`/location/kharadi`, `/location/pimpri`, `/location/hinjewadi`, `/location/magarpatta` with `Place`, `ItemList`, and `BreadcrumbList`)
    - Developer Profiles (`/:developerSlug` with `Organization` and `BreadcrumbList`)
    - Project Details (`/:developerSlug/:locationSlug/:projectSlug` with `ApartmentComplex`, `Offer`, and `BreadcrumbList`)
  - Dynamic XML Sitemap (`/sitemap.xml`) indexing 16 published URLs with valid ISO `<lastmod>` timestamps.
  - Robots directives (`/robots.txt`) declaring sitemap and disallowing administrative/internal paths.
  - Enforces strict publication boundary (`publishStatus === "PUBLISHED"` on both project and developer) returning HTTP 404 + noindex on draft or missing entities.

---

### Rental Desk Operations & Admin Workflows (Step 4A, 4B & 4C)
  - **Public Rental Portal**: Dedicated seeker Rental Desk (`/rentals`) and owner Property Desk (`/rentals/list-property`) for Pune rental enquiries and flat submissions without public listings, renter accounts, or search complexity. `/rentals/list-property` features a full-weight immersive architectural hero with smooth scroll navigation to the submission section and 3-step process pillars.
  - **Admin Navigation**: Nested "Rentals" section in admin sidebar (`Enquiries` and `Available`).
  - **Rental Enquiries Management (`/admin/rentals/enquiries`, `/:id`)**: Multi-token whitespace keyword search across seeker name, phone, email, configuration, location, furnishing, and notes; status filters (`ALL`, `NEW`, `CONTACTED`, `MATCHED`, `CLOSED`, `ARCHIVED`); count badges; attention indicators for uncontacted `NEW` enquiries; detailed requirement breakdown; editable internal notes; prefilled WhatsApp and call actions; safe deletion confirmation modal; pagination.
  - **Available Properties Management (`/admin/rentals/available`, `/:id`)**: Multi-token whitespace keyword search across owner name, phone, flat type, approx size sq ft, location, locality, society/developer, additional details, and internal notes; status filters (`ALL`, `NEW`, `VERIFIED`, `AVAILABLE`, `RENTED`, `ARCHIVED`); owner contact & flat specification breakdown; editable internal notes; prefilled WhatsApp and call actions; safe deletion confirmation modal; pagination.
  - **Contextual Discovery (Step 4C)**: Surfacing relevant `AVAILABLE` rental properties inside Enquiry Detail (`/admin/rentals/enquiries/:id`) via `GET /api/admin/rentals/enquiries/:id/available-properties`. Uses deterministic matching on configuration/BHK and location/locality without scoring, AI, or persistent connection tables. Admin reviews candidates and records decisions directly in standard internal notes.
  - **Isolated Rental Domain**: Backend models `RentalEnquiry` and `RentalProperty` operate independently from sales leads, Tara conversational search, and project catalog. No `RentalConnection` model or relationship table exists.

---

- **Developer & Project Activation Hierarchy (Step 1, 2 & 3)**:
  - **Independent Database Statuses**: `Developer.publishStatus` (`DRAFT` | `PUBLISHED`) and `Project.publishStatus` (`DRAFT` | `PUBLISHED`) remain completely independent in PostgreSQL. Project lifecycle `status` (`UPCOMING`, `ONGOING`, `READY_TO_MOVE`, etc.) and Configuration `availabilityStatus` (`AVAILABLE`, `LIMITED`, `SOLD_OUT`) are preserved with zero cascades or overwrites when parent entities are deactivated.
  - **Admin Deactivation Controls**: Admin Developers and Projects workspaces feature dedicated Deactivate/Activate modals with clear warning dialogs. When a Developer is `DRAFT`, child projects in the admin UI display an informative warning callout (`Parent Developer Deactivated`) while retaining their own stored status.
  - **Effective Public Visibility Model**: Derived dynamically on read across all 10 public endpoints (Developer API, Project API, Locality Hubs, Conversational Search Assistant, Tara Catalog, Public Site API, Featured Projects, SEO HTML Pre-rendering, and Dynamic XML Sitemap). A project or configuration is publicly accessible if and only if both `developer.publishStatus === "PUBLISHED"` and `project.publishStatus === "PUBLISHED"`. Deactivating a developer immediately conceals all child projects from public discovery and returns 404 on direct routes without altering child database records.

---

### Public Discovery & Tara Architecture Refactor (Phases 1, 2 & 3)
  - **Primary Entry Point (Phase 1)**: The global persistent floating control (`FloatingSearchControl.tsx`) is now the sole interactive entry point for launching the Tara property discovery overlay (`PropertyAssistantOverlay.tsx`).
  - **Navbar Streamlining (Phase 1)**: Removed the `✦ Tara` action button from desktop header actions and the mobile drawer (`GlobalHeader.tsx`), ensuring a clean navigation hierarchy focusing on primary firm pages and Contact & Advisory.
  - **Homepage Focus (Phase 1)**: Removed redundant conversational CTA card (`ConversationalSearchEntry.tsx`), hero buttons and quick preference chips (`AtmosphericHero.tsx`), trust strip action buttons (`TrustStatisticsStrip.tsx`), and advisory callouts (`ContactAdvisorySection.tsx`), allowing the homepage to present an uninterrupted architectural journey.
  - **Premium Editorial Overlay UI (Phase 2 & 2.1)**: Redesigned the Tara popup and mobile bottom-sheet with brand architectural design system tokens (`#18382E`, `#A99168`, `#202622`, `#F6F6F3`, `#E6E6E2`), Playfair serif headers, clean message bubbles, refined option cards, responsive touch targets ($\ge 44\text{px}$), and smart compact project cards for 1-2 matches.
  - **Buy vs Rent Intent Entry (Phase 3)**: When a session begins, Tara prompts `"Hello, I'm Tara. What are you looking to do?"` with two discrete choices: `[ Buy a Home ]` and `[ Rent a Home ]`. Selecting **Buy** transitions into the existing deterministic property search sequence. Selecting **Rent** immediately navigates via React Router to `/rentals` and closes the overlay without querying rental inventory or invoking backend rental services.
  - **Canonical Search Route**: `/search` remains the dedicated, full-page property discovery destination rendering `SearchAssistant` and `SearchResults`.
  - **Navigation Bar Layout Robustness (Phase 59)**: Replaced artificial fixed widths (`max-width: 20rem` / `11.5rem`) on `.global-brand-name` with flexible flexbox allocation (`flex: 0 1 auto; min-width: 0; max-width: 100%`) alongside protected right controls (`flex-shrink: 0`), allowing arbitrarily long developer and project names to render gracefully without premature ellipsis.
  - **Automatic "Let's Connect" Advisory Popup (Phases 60 & 61)**: Proactive, non-intrusive concierge advisory invitation (`AdvisoryPopupModal.tsx`) mounting in `PublicShell.tsx` on a 5-second session timer with `sessionStorage` suppression (explicitly excluding `/rentals/list-property`). Desktop and mobile "Contact & Advisory" header buttons (`GlobalHeader.tsx`) trigger the same experience via `AdvisoryContext`. Clicking `[ Let's Connect → ]` smoothly reveals the inquiry form submitting to `createLead` (`POST /api/leads`), with phone/WhatsApp shortcuts, full accessibility (`role="dialog"`, focus trap, Escape dismiss), and zero conflict with Tara.
  - **Public Global Navigation Streamlining (Phase 62)**: Removed the `Rentals` navigation link from desktop primary navigation and the mobile drawer (`GlobalHeader.tsx`), establishing a clean 3-link primary header (`Home`, `About`, `Privacy Policy`) and `Contact & Advisory` action button. The Seeker Rental Desk (`/rentals`), Owner Property Desk (`/rentals/list-property`), Tara `RENT A HOME` handoff, and backend rental services remain 100% active and accessible.
  - **Contextual Project Enquiry & "Schedule a Visit" (Phase 63)**: High-intent project conversion experience (`ContextualEnquiryModal.tsx`) supporting discrete `SCHEDULE_VISIT` (2-step progressive disclosure with visit date calendar picker, Morning/Afternoon/Evening time slot selector, and optional notes) and `REQUEST_CALLBACK` (streamlined single-step callback request). Features desktop right drawer geometry (~440px) preserving visible project background, mobile bottom-sheet with safe-area padding, project context cards with thumbnails, active `?configuration=<id>` preservation, calm confirmation state, and zero collision with Tara or general advisory popups.
  - **Standalone Property Enquiry (`/enquiry`) & Dedicated Visits Workspace (`/admin/visits`) (Phases 64-67 & Phase 75)**: Standalone consultation brief outside `PublicShell` writing structured `visitDate` (`YYYY-MM-DD`) and optional `visitTime` (`Morning`, `Afternoon`, `Evening`) into `Lead` records. Operational admin workspace (`/admin/visits`) provides full CRUD management of scheduled property visits across `TODAY`, `UPCOMING`, and `PAST` operational views, manual visit creation (`+ Add Visit`) with cascading developer $\rightarrow$ project $\rightarrow$ configuration resolution, inline visit editing, safe cancellation/permanent deletion confirmation modal (`CancelVisitModal`), and direct WhatsApp, Call, and Lead Detail actions without separate database entities or scheduling complexity.

---

- **Cloudinary Media Delivery Optimization (Phase 1 & Phase 2)**:
  - **Frontend Delivery-Only Optimization (`frontend/src/utils/image.ts`)**: Injects Cloudinary dynamic URL transformation parameters at presentation time via `getOptimizedImageUrl(url, options?)`.
  - **Phase 1 (`f_auto,q_auto`)**: Delivers automatic modern format negotiation (WebP/AVIF) and automatic perceptual quality compression across all public image presentation components.
  - **Phase 2 (Targeted Width Optimization with `c_limit`)**: Delivers size-constrained representations for high-impact, low-risk contexts without cropping or altering aspect ratios:
    - **Project & Developer Cards (`w_800,c_limit`)**: `FeaturedProjectCard`, `ProjectCard`, `ExploreDevelopers` banners, `DeveloperProjects` carousel cards.
    - **Gallery Thumbnails (`w_200,c_limit`)**: `TapToExploreGallery` modal thumbnail strip buttons and `ContextualEnquiryModal` project thumbnail.
    - **Project Location / Map Preview (`w_1200,c_limit`)**: `ProjectLocation` in-page map preview.
  - **High-Detail Quality Preservation**: Full-bleed heroes (`ProjectHero`, `DeveloperHero`, `AtmosphericHero`), lightboxes (`ProjectImageLightbox`, gallery modal stage, location map modal), full-size gallery views, and configuration floor plans intentionally remain unconstrained on `f_auto,q_auto` to preserve zoom clarity and fine architectural details.
  - **Data Integrity & Storage Invariants**: Original Cloudinary cloud assets remain untouched; PostgreSQL database `Media.url` remains the raw original source URL; backend models, routes, and controllers are completely unmodified.
  - **Validation**: Visual validation confirmed correct rendering with zero layout/crop regressions, and Network inspection confirmed materially smaller transferred byte payloads for all targeted card, thumbnail, and map contexts.

- **Lead Operations, Ownership & Role-Based Authorization (Steps 1, 2 & 3)**:
  - Extended PostgreSQL `Lead` model with `createdById` and `ownerId` (nullable UUID strings with foreign keys to `Admin.id` on delete set null).
  - Extended PostgreSQL `Admin` model with `createdLeads` (`@relation("LeadCreatedBy")`) and `ownedLeads` (`@relation("LeadOwner")`).
  - Database migration `20260919200000_add_lead_ownership_fields` safely backfilled all existing organic/legacy leads to the primary active Founder administrator.
  - Server-side ownership assignment:
    - **Organic website leads**: `createdById = null`, `ownerId = Founder`.
    - **Authenticated manual admin leads & visits**: `createdById = actorAdminId`, `ownerId = actorAdminId`.
  - Request validation (`hasOnlyFields`) strictly rejects any attempt by callers to inject `ownerId` or `createdById` with HTTP 400.
  - **Founder Authorization**: Full global access to list, inspect, update, reschedule, cancel, and delete all Leads and scheduled Visits; exclusive permission to reassign lead ownership via `PATCH /api/admin/leads/:id/owner` (which dynamically reassigns visit operational access).
  - **Employee Authorization**: Scoped strictly to records where `ownerId === authenticatedEmployee.id`. Attempts to read, update, reschedule, cancel, or delete unowned Leads or Visits are rejected with HTTP 403 Forbidden.
  - **Employee/Founder Admin Access Boundary (Step 5)**:
  - **Role-Aware Navigation (`AdminLayout.tsx`)**: Employees see only Dashboard (`/admin`), Leads (`/admin/leads`), Visits (`/admin/visits`), Rentals (`/admin/rentals/enquiries` and `/admin/rentals/available`), and Logout. Projects, Developers, Configurations, Media, Import, Firm Profile, Contact, and Accounts navigation links and menus are completely hidden for Employees.
  - **Frontend Route Protection (`FounderRoute`, `AppRouter.tsx`)**: All Founder-only routes are protected by `<FounderRoute>`. Direct URL access by Employees redirects smoothly to `/admin` without rendering unauthorized views or firing unauthorized API requests.
  - **Backend Route Authorization (`auth.middleware.ts`, admin routers)**: All Founder-only API endpoints (Developers, Projects, Configurations, Amenities, Highlights, Media, Import, Firm Profile, Contact, Accounts) are protected by `requireFounderAuthentication`. Employee requests receive HTTP 403 Forbidden with `{ error: { code: "FORBIDDEN", message: "Founder privileges required" } }`. Unauthenticated requests receive HTTP 401.
  - **Founder Lead Reassignment UI (Step 7)**:
    - Added Owner display on Lead Detail (`LeadDetailPage.tsx`).
    - Founder-only `[ Change Owner ]` button opens `ReassignLeadOwnerModal.tsx` displaying eligible active administrators.
    - Submits to `PATCH /api/admin/leads/:id/owner` updating `Lead.ownerId` immediately while preserving historical `Lead.createdById`.
    - Scheduled Visits automatically follow the new owner through `Lead.ownerId` derivation.

  - **Final RBAC Audit & Hardening (Step 8)**: Completed full verification of Lead Ownership, Role-Based Authorization, Founder Reassignment, Visit Authorization derivation, Rental Operations queues, Founder route boundaries, and Dashboard scoping across all automated verification suites (22/22 Leads, 20/20 Visits, 5/5 Dashboard, 7/7 Ownership, 15/15 Security).

---

## Current Status & Next Steps
- **Completed**: Core Backend, Public Pages, Media Architecture, Tara Conversational Discovery Assistant, Admin Portal & PWA, Security Hardening, SEO Pre-Rendering & Edge Rewrites, Public Rental Desk, Admin Rental Operations (Steps 4A-4C), Admin Sales Leads Multi-Token Search, Hierarchical Developer/Project Activation & Public Visibility (Steps 1-3), Tara Refactor Phases 1-3, Navigation Layout Robustness, Automatic Advisory Popup, Public Navigation Streamlining, Contextual Project Enquiry, Standalone Public Enquiry Page, Dedicated Admin Visits Workspace & Full Visit CRUD (`/admin/visits`), Cloudinary Delivery Optimization Phases 1 & 2 (`f_auto,q_auto` + targeted width delivery), Lead Ownership Foundation (Step 1), Lead Authorization & Founder Reassignment (Step 2), Lead Creator Identity Badge (Step 2.1), Visit Authorization & Scoped Employee Access (Step 3), Rental Enquiry Creator Identity (Step 4), Visit Card Creator Tag, Employee/Founder Admin Access Boundary (Step 5), Role-Aware Admin Dashboard, Founder Lead Reassignment UI (Step 7), Final RBAC Audit & Hardening (Step 8).
- **Branch**: All core platform, rental capabilities, admin hierarchy controls, streamlined public discovery, media delivery optimizations, role-aware workspaces, and lead ownership RBAC milestone verified on `main`.




