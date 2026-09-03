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

## Phase 18: Admin Experience Simplification

- Added an explicit frontend auth-readiness state before protected admin routes render.
- Added client-side expiry handling for stored JWTs while retaining server-side 401 handling as authoritative.
- Removed the non-functional global Configurations navigation item, placed notification controls inside Leads, and added focused mobile stacking for admin lists and media grids.
- Added a contextual Project Workspace around existing project admin routes, with clear Overview, Media, Configurations, Highlights & Amenities, and public Preview navigation. Existing direct routes and independent save boundaries remain intact.
- Refined the workspace for non-technical admins with overview readiness cues, local unsaved/success feedback, contextual post-save routing, and explicit project-versus-configuration media guidance.
- Added shared mobile Admin shell constraints: compact header navigation, contained scrollable nav rows, shrinkable content children, and phone-specific readiness-card stacking.
- Added a compact mobile More menu for secondary admin destinations and a four-KPI operational Admin Dashboard with existing lead actions and work queues.
- Corrected admin media context routing and owner listing boundaries so `/admin/media` is explicitly HOME-scoped and HOME, DEVELOPER, PROJECT, and CONFIGURATION workflows cannot expose descendant media through shared ownership IDs.
- Preserved the returned authenticated admin name/email through refresh and used it in the dashboard greeting; added an operational Ongoing Leads queue for `IN_PROGRESS` records.

---

## Phase 19: Public Project Discovery Refinement

- Reordered the Project Page to progressively disclose optional video, interior/exterior showcase, amenities, featured showcase, configurations, location, gallery, and enquiry.
- Simplified public configuration cards to BHK/name, carpet area, starting price, availability, and the existing selection CTA; built-up fields remain available in the backend/admin model.
- Scoped homepage project-card imagery and homepage developer banners to their owning media contexts, with no cross-context fallback.

## Phase 20: Public Navigation and Link Refinement

- Added responsive `Explore this project` anchor navigation using existing project section destinations.
- Refined homepage developer discovery into fully clickable visual cards sourced from direct developer banners or logos.
- Removed public developer official-website links while retaining the stored/admin-managed field; essential project map links remain.

## Phase 21: Admin Authentication and Configuration UX

- Documented the existing 15-minute JWT default, no-refresh-token model, local expiry/malformed-token cleanup, backend-authoritative 401 handling, and independent browser/device sessions.
- Added consistent primary and secondary action styling to configuration list/edit workflows, with project context and configuration-media navigation kept visible on mobile.

---

## Phase 17: Highlight Proxy Diagnosis and Lead Attention Refinement

- Confirmed the highlight client correctly uses the shared `/api` path and the Vite proxy already forwards it to the configured backend port; a stale/not-running backend process can produce the observed 5173/404 rather than a missing highlight route.
- Refined `NEW` Lead Manager rows with a contained green outer halo and reduced-motion handling, without changing `Ongoing` or `Done` cards or lead status behavior.
- Documented the supported backend entrypoint and the legacy `backend/server.js` runtime distinction after tracing the 5173/404 failure mode.
## Admin Action Consistency

- Refined Admin action consistency across project, developer, lead, import, workspace, and form workflows using shared primary, secondary, utility, communication, and responsive treatments without changing behavior.

---

## Phase 22: Property Discovery Assistant Stabilization & Inventory Grounding

- **100% Database/Catalog Grounding (`query-builder.ts`)**: Every selectable option (BHK, location, developer, budget, project status, availability) is derived strictly from candidate catalog inventory matching all active filters. Non-existent choices are never shown to users.
- **Project-Level Intelligent Stopping (`PROJECT_STOPPING_THRESHOLD = 3`)**: Questioning stops immediately once remaining candidate inventory narrows to $\le 3$ unique projects (or 1 project) after a selection, presenting results directly rather than over-questioning.
- **No-Op Question Elimination**: Questions with $\le 1$ option or questions that provide no narrowing separation across remaining projects are skipped automatically.
- **Conversational Tone & Natural Phrasing**: Questions and assistant replies use warm, human-friendly wording (*"What kind of home are you looking for?"*, *"Where would you like to live?"*, *"What budget feels right for you?"*) without claiming to be an AI or LLM.
- **Price Formatting**: Integrated `formatPrice` into `PropertyResultCard.tsx` and `QuerySummary.tsx`, rendering standard Indian real estate price denominations (`₹ 1.50 Cr+`, `₹ 95 Lakhs+`) instead of raw paise numbers.
- **Targeted Zero-Result Recovery (`SearchAssistantEmptyState.tsx`)**: Replaced generic recovery buttons with targeted filter relaxation shortcuts based only on active user filters, plus a clean "Start over" reset action.
- **Mobile & Overlay Polish**: Verified zero horizontal overflow, natural option button wrapping, responsive result card stacking, and full vertical scrollability across 320px–430px viewports.

---

## Phase 23: Admin UX Polish Pass

- **Mobile "More" Popover Menu (`AdminLayout.tsx` & `admin.css`)**: Upgraded the mobile More menu into a compact, polished popover dropdown with click-outside listener, Escape key dismissal, automatic close on item click, comfortable $\ge 44\text{px}$ touch targets, and a clearly separated destructive logout action. Zero viewport overflow across 320px–430px.
- **Consistent Action Hierarchy & Glorified Link Elimination**: Eliminated arbitrary underlined hyperlinks across all Admin screens (`ProjectsPage`, `ProjectFormPage`, `ProjectMediaPage`, `ProjectConfigurationsPage`, `ConfigurationFormPage`, `ConfigurationMediaPage`, `DevelopersPage`, `DeveloperFormPage`, `DeveloperMediaSection`, `LeadDetailPage`). Standardized on Primary (`.admin-action--primary`), Secondary (`.admin-action--secondary`), Utility (`.admin-action--utility`), Communication (`.admin-action--communication`), and Danger (`.admin-action--danger`).
- **Project Workspace Header Hierarchy**: Cleaned up the top breadcrumb area across all project-scoped sub-pages (`admin-top-bar`), separating parent navigation from workspace tabs (`Overview`, `Media`, `Configurations`, `Highlights & Amenities`, `Preview`).
- **Admin Login Page Polish (`AdminLoginPage.tsx`)**: Elevated the internal administration portal feel with a clean centered card, brand eyebrow, crisp input focus rings, structured error alerts, and full mobile responsiveness.
- **Dynamic Authenticated Admin Greeting (`AdminDashboardPage.tsx`)**: Derives greeting name dynamically from the authenticated admin identity (`admin.name` or fallback local email name) across page reloads without hardcoding.
- **Dashboard Visual Refinement (`dashboard.css`)**: Polished 4-KPI metrics grid with clear bold counts and uppercase labels, scannable lead cards with time badges and communication action pills, and serene empty states.

---

## Phase 24: Security Audit & JWT Authentication Hardening

- **JWT Signing & Verification Hardening (`auth.service.ts` & `auth.middleware.ts`)**:
  - Explicitly pinned HMAC-SHA256 (`algorithm: "HS256"`) in both `jwt.sign` and `jwt.verify` to eliminate algorithm confusion and potential `none` or asymmetric verification attacks.
  - Enforced strict `JWT_SECRET` validation (ensuring non-empty secret, and requiring minimum 32 characters in production environments).
- **Authentication DoS & Payload Boundary Hardening (`auth.validator.ts`)**:
  - Implemented maximum string length checks on email ($\le 255\text{ chars}$), password ($\le 128\text{ chars}$), and token ($\le 512\text{ chars}$) to prevent CPU exhaustion on `bcrypt.compare` during brute-force or fuzzing attempts.
- **End-to-End Security Boundary Audit**:
  - Verified 100% of admin endpoints enforce server-side `requireAdminAuthentication`.
  - Verified media update endpoints (`updateMedia`) validate context against persistent database relations rather than client-supplied owner fields.
  - Verified public lead submission (`validatePublicLead`) strictly rejects administrative fields (`status`, `notes`) and is protected by `submissionLimiter` (20/15m/IP).
  - Verified admin login is rate limited (5/15m/IP).
  - Verified SSRF mitigation in import scraper with DNS resolution and private/loopback IP validation.
- **Frontend Session Expiry UX (`admin-client.ts` & `ProtectedRoute.tsx`)**:
  - Verified clean 401 handling, clearing local tokens, triggering `virtual-reality.admin-unauthorized`, redirecting to `/admin/login`, and preserving the intended route in state for post-login redirection.

---

## Phase 25: Product Polish + Release Readiness

- **Action System Standardized (`HomeMediaPage.tsx`)**: Upgraded Home media activation buttons and upload form submit button to unified `.admin-action` classes (`.admin-action--primary`, `.admin-action--secondary`).
- **Full Application Readiness Audit**: Performed complete end-to-end verification covering Public Experience, Admin Workspaces, Media Ownership, Search Discovery Assistant, Lead Lifecycle, Security Boundaries, Database Integrity (0 violations across 23 media records, 30 configurations, 6 projects, 3 developers), and Outbound Links (all external links verified with `rel="noopener noreferrer"`).
- **Build & Quality Validation**: Validated clean production builds across frontend (`vite build` in 1.02s) and backend (`tsc`), Prisma 7 schema validation, zero whitespace git diff errors, and 15/15 passing security regression tests.
