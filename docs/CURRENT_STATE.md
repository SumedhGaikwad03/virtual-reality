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
- **Lead Operations**: Admin Lead Manager exposes project/developer/configuration context, WhatsApp and `tel:` actions, and a restrained green outer attention halo for `NEW` leads; `IN_PROGRESS` is displayed as “Ongoing” without changing the persisted enum.
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

## Current Status & Next Steps
- **Completed**: Core Backend, Public Pages, Media Architecture, Tara Conversational Discovery Assistant, Admin Portal & PWA, Security Hardening, SEO Phase 1 (Foundation), and SEO Phase 2 (City Hub, Location Hubs, 16-URL Sitemap, Edge Rewrites).
- **Branch**: All Phase 1 and Phase 2 work verified and integrated on `develop`.
