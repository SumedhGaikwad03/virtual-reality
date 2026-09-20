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

---

## Phase 26: Property Discovery Assistant Hardening & In-Memory Catalog Engine

- **Pure Deterministic In-Memory Engine**: Refined client-side conversational assistant to load the public catalog projection once (`GET /api/search/catalog`) on search session initialization. All multi-turn question evaluations, filter constraints, candidate inventory slices, and option recalculations execute purely in browser memory with zero per-click network overhead.
- **Robust Loading, Error & Retry Lifecycle (`useSearchChat.ts` & `SearchAssistant.tsx`)**: Added resilient loading state, empty catalog explanation, and structured error recovery with a direct "Retry" button that clears cached catalog promises and re-fetches cleanly.
- **Catalog Grounding & No-Phantom-Option Rule**: Verified 100% of presented options (BHK, location, budget, developer, project status, availability) derive strictly from currently viable inventory matches. Single-option questions and no-op rules are automatically skipped.
- **Distinct Project-Level Stopping**: Enforced intelligent stopping threshold (`PROJECT_STOPPING_THRESHOLD = 3` unique projects) preventing over-questioning and immediately presenting result cards with deep links (`/:devSlug/:locSlug/:projSlug?configuration=:configId`).
- **Targeted Zero-Result Recovery (`SearchAssistantEmptyState.tsx`)**: Restricts recovery actions strictly to relaxing active user filters (budget, location, configuration, developer, status, availability) alongside a clean "Start over" reset.
- **Regression Test Verification**: Created and passed 10/10 automated regression tests verifying grounding, stopping thresholds, multi-config project deduplication, no-op skipping, zero-match recovery, rollback, reset, currency formatting, deep-linking, and public repository projection.

---

## Phase 28: Tara Assistant UI Design Restructuring & Conversational Polish

- **Mascot & Visual Identity (`TaraAvatar.tsx` & `AssistantHeader.tsx`)**: Rebranded property discovery companion to **Tara · Property Discovery Advisor** with a dedicated, reusable architectural SVG avatar component (`TaraAvatar.tsx`) supporting responsive sizes (`sm`, `md`, `lg`) and future custom image assets without religious or robotic clichés.
- **Immediate Non-Verbose Opening State**: Streamlined the opening screen to eliminate multi-layered verbose paragraphs. Users immediately see Tara's profile identity and the concise opening question (*"What are you looking for?"*) with selectable options.
- **Subtle Query Summary Context Trail (`QuerySummary.tsx`)**: Eliminated loud, technical "LOOKING FOR: ... Reset" query boxes. Active search constraints are now rendered as a subtle, unobtrusive inline chip trail with quiet removable crosses.
- **Strategic Avatar Grouping (`ConversationMessages.tsx`)**: Grouped consecutive Tara assistant message bubbles under a single left-aligned avatar, creating a refined product chat experience.
- **Premium Option Buttons & Responsive Touch Grid (`RuleOptions.tsx` & `search.css`)**: Upgraded choices into premium card/pill buttons with directional cues (`→`), subtle elevation, smooth hover/active transitions, and minimum $\ge 44\text{px}$ touch targets.
- **Subtle Bottom Utility Controls**: Relocated "← Previous" and "Start over" into a restrained bottom utility row with secondary visual weight.
- **Progressive Interface Compaction**: Applied `.search-assistant-card--active` styling to dynamically minimize headers as conversation progresses, putting full focus on conversation and results.
- **Automated Verification**: Passed all 15 automated regression assertions verifying Tara dialogue, smart stopping, deep-linking, database grounding, and 15/15 backend security tests.

---

## Phase 29: Server-Side SEO Pre-Rendering & Edge Rewrite Layer (Phase 1 & Phase 2)

- **Express SEO HTML Rendering Engine (`seo-renderer.service.ts`)**:
  - Implemented server-side pre-rendered semantic HTML generation with metadata, Open Graph, Twitter Cards, and Schema.org JSON-LD structured data.
  - Phase 1: Homepage (`/` ➔ `/seo/home` with `WebSite` and `Organization`), Developer Hub (`/:developerSlug` ➔ `/seo/developer/:slug` with `Organization` and `BreadcrumbList`), Project Detail (`/:dev/:loc/:proj` ➔ `/seo/project/...` with `ApartmentComplex`, `Offer`, and `BreadcrumbList`).
  - Phase 2: Location Hubs (`/location/:locationSlug` ➔ `/seo/location/:slug` for `kharadi`, `pimpri`, `hinjewadi`, `magarpatta` with `Place`, `ItemList`, and `BreadcrumbList`), and Pune City Hub (`/projects-in-pune` ➔ `/seo/city-hub` with `Place`, `ItemList`, and `BreadcrumbList`).
  - Dynamic XML Sitemap (`/sitemap.xml`) generated on the fly, indexing exactly 16 published URLs with valid ISO `<lastmod>` timestamps and proper priorities.
  - Robots directives (`/robots.txt`) with sitemap declaration and admin/internal path exclusions.
- **Repository-Level Publication Filtering (`project.repository.ts`)**:
  - Implemented `findLocationProjects(locationSlug)` enforcing `publishStatus === "PUBLISHED"` on both Project and Developer, selecting relations (`developer`, `highlights`, `amenities`, `media`, `configurations`).
  - Draft entities return 0 records and render HTTP 404 + `<meta name="robots" content="noindex, nofollow" />`.
- **Vercel Edge Rewrite Proxy (`vercel.json`)**:
  - Configured rewrite rules routing public SEO paths to the Render Express backend while preserving `/search` and `/admin/*` as pure client-side Vite SPAs.
  - Ordered rules with strict precedence (`/projects-in-pune` and `/location/:slug` ahead of `/:developerSlug`) to guarantee zero route collisions.
- **Security & Sanitization Invariants**:
  - All dynamic entity fields passed through `escapeHtml()` to eliminate stored XSS.
  - Structured data passed through `serializeJsonLd()` to prevent `</script>` tag breakout.
  - All existing `/api/*` routes verified intact with zero interference.
- **Comprehensive Quality Gates**:
  - Passed complete automated verification: Backend build (0 errors), Frontend build (0 errors), Phase 1 SEO E2E (8/8), Step 2.5 Integration (33/33), Security Suite (15/15), Tara Lifecycle (8/8), Tara Redesign (15/15), and Local Final Gate (49/49).

---

## Phase 30: Homepage Tara Discovery Presentation & Messaging Refinement
- **Dedicated Tara Avatar & Profile Presentation (`ConversationalSearchEntry.tsx`)**:
  - Replaced generic corporate headline with Tara's signature warm greeting structure (*"Hello, I'm Tara. Let's look for your home."*).
  - Integrated `TaraAvatar` (`size="md"`) alongside name (*Tara*) and role (*Property Discovery Advisor*), establishing immediate, clear companion identity.
- **Polished Conversational Invitation & Option Chips**:
  - Formatted clear message hierarchy with Playfair editorial serif headline, warm subline, and concise discovery invitation (*"What are you looking for? Select a starting preference or begin exploring."*).
  - Preserved option-based discovery interaction model across 4 quick preference buttons with accessible aria labels and smooth hover lift.
- **Responsive Layout & Visual Hierarchy (`home.css`)**:
  - Structured card layout with balanced desktop two-column distribution and fluid mobile stacking.
  - Eliminated awkward line-wrapping, excessive text, and form-like styling, ensuring an elegant invitation into the assistant across all screen sizes (320px–1920px).
- **Intact Engine Guarantee**:
  - Zero modifications to client-side deterministic search engine, catalog projection, stopping thresholds, or assistant overlay lifecycle.

---

## Phase 31: Lenis Smooth Scrolling Infrastructure
- **Lenis Smooth Scrolling Infrastructure**:
  - Integrated `lenis` into the public website layout tree via `SmoothScrollProvider` in `PublicShell.tsx`.
  - Built `scrollTo.ts` utility providing dynamic sticky navigation/header offset calculations for smooth anchor and page scrolling.
  - Added `data-lenis-prevent` to Tara Assistant Overlay, Lead Enquiry Modal, and Mobile Nav Drawer to isolate nested scrolling containers.
  - Enabled native touch scroll physics preservation (`syncTouch: false`) for mobile viewports (320px–430px).
  - Added automatic OS-level `prefers-reduced-motion` detection to disable smooth scrolling when requested.
  - Preserved 100% native scrolling for the Admin portal (`/admin/*`) and `AdminLayout`.

---

## Phase 32: Public Navbar Glass Overlay & Dynamic Scrolled Transition
- **Fixed Overlay Header Architecture (`GlobalHeader.tsx`)**:
  - Changed `GlobalHeader` to a fixed overlay header sitting directly on top of atmospheric heros (`AtmosphericHero`, `ProjectHero`, `DeveloperHero`).
  - Implemented lightweight `isScrolled` scroll detection threshold (24px) via passive scroll listener (zero per-pixel re-renders).
- **Restrained Glass Visual Aesthetic (`layout.css`)**:
  - **Top of Page**: Translucent glass (`rgba(10, 25, 20, 0.22)`, 12px blur, crisp white/ivory text, thin border) showcasing hero imagery underneath.
  - **Scrolled State**: Opaque deep forest architectural glass (`rgba(10, 35, 26, 0.92)`, 16px blur, elevated shadow) with smooth 0.3s CSS cubic-bezier transition.
- **Shared Header Token & Zero Occlusion**:
  - Unified header height and offset across all public pages via shared `:root` design token `--header-height: 4.5rem` (`4rem` on mobile).
  - Positioned non-hero pages (`/search`, `/privacy-policy`) and sticky sub-navigation (`ProjectSubNav`) using the `--header-height` token with zero magic numbers or content occlusion.
  - Preserved high-contrast mobile drawer surface and `prefers-reduced-motion: reduce` compliance.

---

## Phase 33: Warm Architectural Colour System Implementation
- **Centralized Design Token Architecture (`globals.css`)**:
  - Established semantic `:root` tokens for Core Architectural Neutrals: `--color-bg: #F7F4EE` (Warm ivory), `--color-surface: #FCFAF6` (Warm white for cards), `--color-surface-muted: #EDE7DD` (Soft sand/stone for alternating sections).
  - Defined warm borders and typography: `--color-border: #D9D0C3`, `--color-border-strong: #C8BBAA`, `--color-text: #202622` (Warm charcoal), `--color-text-muted: #68706A` (Muted slate/sage).
  - Refined deep brand forest palette: `--color-forest: #18382E` (Deep warm forest), `--color-forest-dark: #112821` (Anchor forest), `--color-forest-surface: #1E463A`, `--color-forest-light: #718276`.
  - Added restrained architectural accents: `--color-clay: #B86F55` (Muted terracotta), `--color-brass: #A99168` (Subtle brass).
- **Public Layout & Navigation Harmonization (`layout.css`)**:
  - Updated public container canvas to `var(--color-bg)`.
  - Harmonized fixed glass navbar and scrolled background to `rgba(24, 56, 46, 0.94)` and mobile drawer to `rgba(17, 40, 33, 0.98)`.
  - Mapped primary header actions to `--color-surface` and `--color-forest`.
- **Domain Stylesheet Synchronization (`home.css`, `project.css`, `developer.css`, `search.css`)**:
  - `home.css`: Mapped all `--home-*` CSS variables to the centralized `--color-*` token system across sections, cards, and footer.
  - `project.css`: Mapped `--c-canvas`, `--c-surface`, `--c-border`, `--c-ink`, and `--c-hero-bg` tokens to warm architectural tokens.
  - `developer.css`: Updated `.developer-page-container`, `.developer-intro-section`, `.developer-lead-card`, and fallback hero gradients to warm forest and ivory palette.
  - `search.css`: Updated `.search-page-container`, `.search-assistant-card`, conversation bubbles, rule options, query chips, property result cards, compact summary cards, and assistant overlay.
- **Accessibility & Contrast Verification**:
  - WCAG AAA compliance verified: `#202622` on `#F7F4EE` (13.5:1 ratio) and `#FCFAF6` on `#18382E` (11.2:1 ratio).
  - Preserved 100% of backend architecture, database schemas, APIs, deterministic search rules, and admin isolation.

---

## Phase 34: True Transparent Hero Navbar & Refined Navigation Grouping
- **Pure Transparent Top-of-Page Navbar (`layout.css`)**:
  - Eliminated frosted glass bar, blur (`backdrop-filter: none`), border, and drop shadows at the top of the page.
  - Enabled hero photography to extend fully underneath the navbar without horizontal bar cutoff.
- **Right-Aligned Navigation Cluster (`GlobalHeader.tsx`, `layout.css`)**:
  - Grouped desktop primary links (`Home`, `About`, `Privacy Policy`) and CTAs (`Contact & Advisory`, `✦ Tara`) in a right-aligned flex cluster (`.global-header-right`).
- **Refined CTA Button Hierarchy**:
  - `Contact & Advisory`: Transparent background, subtle white border (`rgba(255, 255, 255, 0.40)`), white text, no heavy shadow.
  - `✦ Tara`: Warm ivory surface (`--color-surface`), deep forest text (`--color-forest`), subtle elevation.
- **Subtle Readability Scrolled State**:
  - Transitioned scrolled state to a restrained tint (`rgba(17, 40, 33, 0.40)`) with minimal 8px blur, 8% border, and soft shadow for readability over body content.
- **Subtle Hero-Top Gradient Readability Layer (`home.css`, `project.css`, `developer.css`)**:
  - Added ultra-subtle top layer (`rgba(17, 40, 33, 0.22)` fading smoothly to `0.04` at 20%) to hero overlays, ensuring white navbar text legibility without darkening hero photography.

---

## Phase 35: Focused UX Cleanup Pass (Mobile Tara Prompt, Form Focus/Autofill & Developer Attribution)
- **Tara Mobile Prompt Multi-Line Word Wrapping (`layout.css`)**:
  - Fixed character-by-character vertical text collapse bug on mobile viewports (320px–430px) by setting `width: max-content; max-width: min(calc(100vw - 2.5rem), 20rem);` on `.floating-search-prompt-bubble` and `white-space: normal;` on `.floating-search-prompt-text`.
  - Upgraded prompt bubble and button styling to warm dark forest (`var(--color-forest-dark, #112821)`), warm ivory text, and subtle brass sparkle.
- **Public Form Field Styling & Browser Autofill Normalization (`home.css`, `project.css`, `developer.css`)**:
  - Scoped all public form CSS selectors to their respective parent classes (`.advisory-consultation-form`, `.project-lead-form`, `.developer-lead-form`, `.contextual-enquiry-form`) to eliminate cross-stylesheet CSS leakage.
  - Ensured dark forest cards (`LeadSection`, `DeveloperLeadSection`) retain dark forest background (`var(--color-forest-surface, #1E463A)`) on input focus with warm sand borders.
  - Implemented `:-webkit-autofill` inset shadow and text fill color overrides across all light and dark forms to prevent browser autofill from turning inputs bright white.
- **Footer Developer Portfolio Attribution (`AboutFooter.tsx`, `home.css`)**:
  - Added subtle developer credit link ("Platform developed by Sumedh") in the footer bottom bar linking to `https://sumedgaikwad.com` with `target="_blank"`, `rel="noopener noreferrer"`, and accessible focus-visible styling.

---

## Phase 36: Public Hero Height & Image Presentation Refinement
- **Developer Hero Immersive Height Elevation (`developer.css`)**:
  - Replaced restrictive letterbox banner constraints (`aspect-ratio: 21 / 9; max-height: 600px; min-height: clamp(380px, 48vh, 560px);`) with an immersive, viewport-relative desktop height: `min-height: clamp(520px, 75vh, 820px);`.
  - Configured responsive mobile height: `min-height: clamp(420px, 68vh, 560px);` at `@media (max-width: 768px)` to prevent small-screen content overflow while keeping the full brand mark, title, and enquiry CTA prominent.
  - Refined desktop image focal positioning to `object-position: center 30%;` (`center 25%;` on mobile) with `object-fit: cover;` to preserve architectural crowns and composition.
  - Eliminated duplicate media query override in `developer.css`.
- **Project Hero Height Harmonization (`project.css`)**:
  - Harmonized desktop `.project-hero` height to `min-height: clamp(520px, 75vh, 820px);` and mobile height to `min-height: clamp(420px, 68vh, 560px);` at `@media (max-width: 768px)`.
  - Preserved sticky `ProjectSubNav` docking behavior seamlessly below the fixed `GlobalHeader` (`top: var(--header-height, 4.5rem)`) with zero layout shift or whitespace gaps when scrolling past the hero.
  - Maintained transparent navbar overlay and bottom-anchored hero content hierarchy.

---

## Phase 37: Trust & Statistics Strip Responsive Boundary & Layout Fix
- **CSS Grid & Flexbox Boundary Containment (`home.css`)**:
  - Fixed divider/text overlap bug by adding `min-width: 0;` to `.trust-stat-item` and `.trust-stat-meta`, with `flex: 1 1 0%;` and `overflow-wrap: break-word;` to guarantee descriptions wrap strictly inside their allocated columns without bleeding across vertical dividers.
  - Added `flex-shrink: 0;` to `.trust-stat-divider` and `.trust-stat-number` to maintain crisp vertical separator lines and prominent metric numbers.
  - Configured resilient grid gap spacing: `gap: clamp(0.75rem, 1.5vw, 1.5rem);` on desktop.
- **Responsive Breakpoint Strategy (`home.css`)**:
  - **Desktop ($\ge 1100\text{px}$)**: Full 4-item horizontal presentation with 3 vertical dividers (`grid-template-columns: 1fr auto 1fr auto 1fr auto 1fr;`) and zero text intersection.
  - **Tablet ($640\text{px} – 1099\text{px}$)**: Clean 2x2 grid (`grid-template-columns: 1fr 1fr; gap: 1.75rem 2rem;`) with standalone vertical dividers hidden (`display: none;`), giving each stat item ample breathing room.
  - **Mobile ($< 640\text{px}$, 320px–430px)**: Single-column stack (`grid-template-columns: 1fr; gap: 1.35rem;`) ensuring full readability and zero horizontal overflow.

---

## Phase 38: Admin UI Redesign — Phase A: Design Tokens & Login Experience
- **Scoped Admin Semantic Design Tokens (`admin.css`)**:
  - Defined scoped `:root` design token architecture mapped to the platform's warm architectural palette:
    - Surfaces: `--admin-bg: #F7F4EE` (Warm Ivory), `--admin-surface: #FCFAF6` (Warm White), `--admin-surface-subtle: #F4EFE6`, `--admin-surface-muted: #EDE7DD`, `--admin-surface-elevated: #FFFFFF`.
    - Borders: `--admin-border: #D9D0C3` (Warm Stone), `--admin-border-strong: #C8BBAA`, `--admin-border-focus: #24483D` (Friendly Forest).
    - Typography: `--admin-text: #202622` (Charcoal), `--admin-text-muted: #68706A` (Muted Sage), `--admin-text-subtle: #838D85`.
    - Brand Anchors: `--admin-sidebar-bg: #18382E`, `--admin-sidebar-hover: #1E463A`, `--admin-sidebar-active: #24483D`, `--admin-sidebar-text: #E6ECE8`.
    - Actions: `--admin-primary: #18382E`, `--admin-primary-hover: #24483D`, `--admin-primary-focus: rgba(36, 72, 61, 0.16)`.
    - Status: `--admin-success-text: #18382E`, `--admin-success-bg: #E6ECE8`, `--admin-warning-text: #7A5B1E`, `--admin-warning-bg: #F5EEDC`, `--admin-danger-text: #963826`, `--admin-danger-bg: #FBEBE8`.
- **Admin Login Page Redesign (`admin.css`, `AdminLoginPage.tsx`)**:
  - Replaced cold slate background with warm ivory canvas (`--admin-bg`).
  - Replaced stark card with warm white paper card (`--admin-surface`), 1px warm stone border (`--admin-border`), and restrained ambient elevation.
  - Upgraded input fields with warm white background (`--admin-surface-elevated`), stone borders (`--admin-border-strong`), charcoal text, muted sage placeholders, and friendly forest focus borders with subtle green halo (`rgba(36, 72, 61, 0.16)`).
  - Implemented browser `:-webkit-autofill` inset box-shadow to prevent harsh blue/yellow background overrides during password manager auto-completion.
  - Redesigned submit action button with deep forest background (`--admin-primary`), friendly forest hover (`--admin-primary-hover`), and high-contrast text.
  - Redesigned `.admin-alert` and `.admin-alert-error` with warm terracotta background (`--admin-danger-bg`), subtle clay border (`#EAC8C1`), and deep danger text (`--admin-danger-text`).
  - Verified zero modification to authentication/JWT logic, API bindings, routes, or public pages.

---

## Phase 39: Admin UI Redesign — Phase B: Admin Shell, Sidebar & Navigation
- **Desktop Sidebar & Navigation Surfaces (`admin.css`)**:
  - Replaced legacy cold corporate navy background with deep architectural forest (`--admin-sidebar-bg: #18382E`) and subtle stone border separator (`rgba(217, 208, 195, 0.12)`).
  - Configured navigation link typography and hover/active states using semantic tokens:
    - Text: `--admin-sidebar-text: #E6ECE8` (Muted Sage-Ivory).
    - Hover / Focus-Visible: `--admin-sidebar-hover: #1E463A` (Elevated Forest Surface) with `#FFFFFF` text.
    - Active Nav Item (`aria-current="page"`): `--admin-sidebar-active: #24483D` (Friendly Forest) with crisp semi-bold weight.
    - Logout Trigger: Subtle border outline with muted terracotta hover state (`rgba(166, 71, 52, 0.2)`).
- **Admin Layout Canvas & Top-Level Surfaces (`admin.css`)**:
  - Set main admin content backdrop to Warm Ivory (`--admin-bg: #F7F4EE`).
  - Styled shared cards with Warm White paper surface (`--admin-surface: #FCFAF6`) and 1px Warm Stone border (`--admin-border: #D9D0C3`).
  - Styled page headings in Architectural Charcoal (`--admin-text: #202622`) and subtitles in Muted Sage (`--admin-text-muted: #68706A`).
  - Styled offline alert banner with Warm Sand background (`--admin-warning-bg: #F5EEDC`) and Warm Brass text (`--admin-warning-text: #7A5B1E`).
- **Responsive Mobile Navigation Header & Popover Menu (`admin.css`)**:
  - Replaced mobile navy header bar with Deep Forest (`--admin-sidebar-bg: #18382E`), subtle stone bottom border, and soft elevation.
  - Redesigned the "More" dropdown popover menu with Deep Forest backdrop, stone borders, and accessible keyboard focus.
  - Verified zero breaking changes to routes, DOM structure, `AdminLayout.tsx` logic, authentication, or public styling.

---

## Phase 40: Admin UI Redesign — Phase C: Shared Primitives (Forms, Buttons, Tables, Badges & Alerts)
- **Shared Form Controls & Input Primitives (`admin.css`)**:
  - Restyled text inputs, selects, and textareas across all admin panels with Warm White elevated backgrounds (`--admin-surface-elevated: #FFFFFF`), Warm Stone Strong borders (`--admin-border-strong: #C8BBAA`), Architectural Charcoal text (`--admin-text: #202622`), and Muted Sage placeholders.
  - Configured Friendly Forest focus borders (`--admin-border-focus: #24483D`) with soft green glow halos (`box-shadow: 0 0 0 3px rgba(36, 72, 61, 0.16)`), eliminating browser default blue focus rings.
  - Implemented application-wide browser `:-webkit-autofill` inset box-shadow rules across inputs, textareas, and selects.
  - Styled labels in Architectural Charcoal, hints in Muted Sage, and native checkboxes/radios with Forest accent colors (`accent-color: var(--admin-primary)`).
- **Standardized 5-Tier Action Button Hierarchy (`admin.css`)**:
  - Primary (`.admin-action--primary`): Deep Forest solid background (`--admin-primary: #18382E`), `#FFFFFF` text, friendly forest hover (`--admin-primary-hover: #24483D`).
  - Secondary (`.admin-action--secondary`): Warm White paper surface (`--admin-surface: #FCFAF6`), stone strong border, charcoal text.
  - Utility (`.admin-action--utility`, `.admin-action-btn`): Compact stone buttons with crisp typography and responsive tap areas.
  - Communication (`.admin-action--communication`): Restrained forest tint with crisp borders.
  - Destructive (`.admin-action--danger`): Soft clay background (`--admin-danger-bg: #FBEBE8`), terracotta border, deep terracotta text.
  - Success (`.admin-action--success`): Soft sage mist background (`--admin-success-bg: #E6ECE8`), forest border and text.
  - Ghost (`.admin-action--ghost`): Transparent background with warm sand hover.
- **Table & Row Primitives (`admin.css`)**:
  - Styled shared tables (`.admin-table`) with Warm White surface, Warm Stone borders (`--admin-border: #D9D0C3`), and Sand headers (`--admin-surface-muted: #EDE7DD`).
  - Implemented subtle row hover highlighting (`--admin-surface-subtle: #F4EFE6`).
  - Restyled account table wrapper (`.admin-accounts-table-wrapper`) and lead rows (`.admin-lead-row`).
- **Semantic Badges & Status Indicators (`admin.css`)**:
  - Success (`.admin-badge--success`, `.status-new`, `.admin-badge-active`, `.admin-new-badge`): Sage mist background (`#E6ECE8`), deep forest text (`#18382E`).
  - Warning (`.admin-badge--warning`): Sand background (`#F5EEDC`), warm brass text (`#7A5B1E`).
  - Danger (`.admin-badge--danger`): Clay background (`#FBEBE8`), deep terracotta text (`#963826`).
  - Neutral / Inactive (`.admin-badge--neutral`, `.status-done`): Stone sand background (`#EDE7DD`), muted sage text (`#68706A`).
  - In Progress (`.status-in_progress`): Soft forest tint (`#E7EFEA`) with forest accent (`#2A5A4C`).
- **Alert Banners & Feedback Callouts (`admin.css`)**:
  - Restyled `.admin-alert-banner`, `.admin-alert-banner--success`, `.admin-alert-banner--error`, `.admin-warning-callout`, and `.admin-notification-feedback--*` with semantic tokens.
  - Restyled lead toolbar search input and filter select dropdown.

---

## Phase 41: Admin UI Redesign — Phase D: Admin Dashboard Experience
- **Dashboard Heading & Hierarchy (`dashboard.css`)**:
  - Restyled dashboard eyebrow in Muted Sage (`--admin-text-muted: #68706A`) with refined letter-spacing.
  - Set greeting heading (`h1`) in Architectural Charcoal (`--admin-text: #202622`) and supporting description in Muted Sage.
- **KPI Metrics Cards Grid (`dashboard.css`)**:
  - Restyled metric cards (`.admin-kpi-card`) with Warm White surface (`--admin-surface: #FCFAF6`), Warm Stone border (`--admin-border: #D9D0C3`), and subtle elevation (`box-shadow: 0 1px 3px rgba(32, 38, 34, 0.04)`).
  - Configured high-contrast metric values (`strong`) in Architectural Charcoal (`--admin-text: #202622`) with tight tracking.
  - Styled metric labels (`span`) in uppercase Muted Sage with letter-spacing (`0.06em`).
- **Dashboard Sections & Lead Activity Cards (`dashboard.css`)**:
  - Restyled section headings (`.admin-dashboard-section-heading`) with Architectural Charcoal titles and Muted Sage subtitles.
  - Restyled lead triage cards (`.admin-dashboard-lead`) with Warm White background, stone borders, and subtle stone hover highlighting (`--admin-surface-subtle: #F4EFE6`).
  - Restyled lead names, project metadata, and relative timestamps (`.admin-dashboard-lead-time`) using semantic typography tokens.
  - Restyled empty states (`.admin-empty-card`) with dashed stone strong borders and centered muted guidance.
- **Responsive Layout & Visual Integrity (`dashboard.css`)**:
  - Configured fluid KPI grid layout scaling: 4 columns on desktop ($\ge 1024\text{px}$), 2 columns on tablet ($640\text{px}–1024\text{px}$), and single-column stack on mobile ($< 640\text{px}$).
  - Verified full tap target sizes, zero text collisions, and zero horizontal page overflow down to 320px.
  - Preserved 100% of data fetching, API bindings, greeting logic, authentication, and routing without modifications.

---

## Phase 42: Admin UI Redesign — Phase E: Projects Index & Project Workspace
- **Projects List & Index Layout (`projects.css`)**:
  - Restyled `.admin-project-list` and `.admin-project-row` using Warm Architectural design system tokens (`--admin-bg`, `--admin-surface: #FCFAF6`, `--admin-border: #D9D0C3`).
  - Set project names (`h2`) in Architectural Charcoal (`--admin-text: #202622`) with refined tracking and project slug labels in Muted Slate-Sage (`--admin-text-subtle: #838D85`).
  - Styled developer name and location metadata with high legibility and contrast hierarchy.
  - Configured responsive grid for project rows: 5-column grid on desktop, 4-column layout on tablet, and single-column stacked card format on mobile ($\le 640\text{px}$) with full-width primary action buttons.
- **Project Workspace Header & Navigation (`project-workspace.css`)**:
  - Restyled `.admin-project-workspace` container with Warm White surface, Stone borders, and subtle shadow elevation.
  - Formatted workspace eyebrow heading in uppercase Muted Sage with tracked letter-spacing and project title in Architectural Charcoal.
  - Styled `.admin-project-workspace-nav` with Warm Stone bottom border, Muted Sage inactive section links, and Deep Forest (`--admin-primary: #18382E`) active tab indicator with `border-bottom: 2px solid var(--admin-primary)`.
  - Positioned preview utility action with compact secondary styling and proper external link attributes.
  - Ensured smooth horizontal scrolling on mobile viewports with `-webkit-overflow-scrolling: touch` and thin scrollbars.
- **Project Readiness & Metadata Status Cards (`project-workspace.css`)**:
  - Restyled `.admin-project-readiness` grid with Warm Stone Subtle surfaces (`--admin-surface-subtle: #F4EFE6`), Warm Stone borders, and subtle hover highlighting.
  - Formatted status metrics with Charcoal card titles, Muted Sage helper text, and Deep Forest text for ready indicators (`.admin-status-ready`).
  - Restyled `.admin-unsaved-state` badge using warm brass warning tokens (`--admin-warning-text: #7A5B1E`, `--admin-warning-bg: #F5EEDC`).
- **Key Highlights Authoring Section (`project-workspace.css`)**:
  - Restyled `.admin-highlights-section` with clean stone separators and architectural typography.
  - Formatted reorderable highlight items (`ol li`) with Warm White cards, Stone strong borders, elevated white inputs, and compact utility actions.
  - Configured danger tint styling for item removal and disabled states for boundary reorder actions.
- **Project Amenities Management Section (`projects.css`)**:
  - Restyled `.admin-amenities-section` and `.admin-amenity-row` with Warm White surfaces, Stone borders, and hover highlighting.
  - Formatted inline amenity edit forms and add amenity form with Warm Stone Subtle surface, proper field gap spacing, and semantic action buttons.
- **Responsive & Accessibility Integrity**:
  - Verified responsive layouts across 320px, 375px, 430px, 768px, 1024px, and 1440px viewports with zero horizontal overflow.
  - Preserved 100% of CRUD operations, API contracts, validations, state management, routing, and access controls.

---

## Phase 43: Admin UI Redesign — Phase F: Developers Admin Experience
- **Developers List & Row Layout (`developers.css`)**:
  - Restyled `.admin-developer-list` and `.admin-developer-row` using Warm Architectural design system tokens (`--admin-bg`, `--admin-surface: #FCFAF6`, `--admin-border: #D9D0C3`).
  - Set developer title (`h2`) in Architectural Charcoal (`--admin-text: #202622`) with $-0.01\text{em}$ letter-spacing and metadata/status in Muted Slate-Sage (`--admin-text-muted: #68706A`).
  - Restyled developer logo containers and fallback initial avatars (`.admin-developer-logo-fallback`) with Warm Stone borders and Deep Forest (`--admin-primary: #18382E`) monogram text on Warm Stone Subtle surface.
  - Configured responsive stacked layouts on mobile ($\le 640\text{px}$) with full-width secondary action buttons.
- **Developer Creation & Edit Form (`developers.css`)**:
  - Maintained seamless integration with Phase C shared form controls (Warm White elevated inputs, Stone borders, Forest focus glow halos, and webkit autofill styling).
  - Preserved developer form structure (`.admin-developer-form`) with max-width bounding, charcoal labels, and muted helper guidance.
- **Developer Media Management Slots (`developers.css`)**:
  - Restyled `.admin-developer-media-section` and section headings with architectural typography and Stone divider borders.
  - Formatted `.admin-media-slot-card` panels with Warm White surface, Stone borders, and subtle shadow elevation.
  - Styled Brand Banner and Developer Hero image previews (`.preview-image-wrapper`, `.banner-preview`, `.hero-preview`) with dashed stone strong outlines and Warm Stone Subtle backgrounds.
  - Styled slot empty states (`.slot-empty-state`) with dashed borders and centered muted guidance.
  - Restyled slot upload forms with top stone separators and semantic primary action buttons.
- **Feedback & Actions Hierarchy (`developers.css`)**:
  - Restyled alerts (`.admin-alert-error`, `.admin-alert-success`) using semantic status tokens (`--admin-danger-*`, `--admin-success-*`).
  - Updated legacy button fallback rules (`.admin-btn-primary`, `.admin-btn-secondary-danger`) to maintain visual harmony with the 5-tier action system.
- **Responsive & Accessibility Integrity**:
  - Verified responsive layouts across 320px, 375px, 430px, 768px, 1024px, and 1440px viewports with zero horizontal overflow.
  - Preserved 100% of CRUD operations, API contracts, validations, state management, and media uploads.

---

## Phase 44: Public Hero Photography Warm Scrim Realignment & Footer URL Correction
- **Public Hero Image Overlays (`home.css`, `developer.css`, `project.css`)**:
  - Removed heavy green/forest gradient washes (`#18382e`, `#112821`) across all public hero components (`FirmHero`, `DeveloperHero`, `ProjectHero`).
  - Replaced tint overlays with neutral warm charcoal gradients (`rgba(18, 22, 20, ...)`), preserving natural photograph warmth while maintaining high text contrast and legibility.
- **Trust & Statistics Metric Formatting (`home.css`)**:
  - Fixed mobile word-wrapping for multi-word stat labels (`"Partner Developers"`, `"Curated Inventory"`) using `white-space: normal` and responsive typography.
- **Footer Attribution Link Correction (`AboutFooter.tsx`)**:
  - Updated developer portfolio attribution destination URL to `https://sumedhgaikwad.com` with `target="_blank"` and `rel="noopener noreferrer"`.

---

## Phase 45: Public Project Page Mobile Sticky Enquiry Bar & Assistant Stacking Fix
- **Mobile Sticky Action Bar & Floating Assistant Separation (`project.css`, `layout.css`)**:
  - Resolved selector mismatch for `.floating-search-control-container` by utilizing `:has(.mobile-sticky-enquiry-bar)` at $\le 768\text{px}$.
  - Dynamically elevated floating Tara assistant button to `bottom: calc(4.75rem + env(safe-area-inset-bottom, 0px))` when the sticky enquiry bar is present.
  - Added smooth CSS transition (`transition: bottom 0.25s ease`) for floating control vertical repositioning.
  - Aligned z-index stacking hierarchy: `GlobalHeader` ($900$) < `MobileStickyEnquiryBar` ($940$) < `FloatingSearchControl` ($950$) < `FloatingSearchPrompt` ($951$) < `PropertyAssistantOverlay` ($1000$) < `ContextualEnquiryModal` ($9999$).
  - Eliminated UI collision between "Enquire Now →" action button and Tara assistant without modifying component logic or business workflows.

---

## Phase 46: Production Deployment Hardening — Phase 1A: Service Worker Reliability
- **Hardened Fetch Error Handling & Guaranteed Response (`frontend/public/sw.js`)**:
  - Eliminated `Uncaught (in promise) TypeError: Failed to convert value to 'Response'` by ensuring `event.respondWith()` always receives a guaranteed `Response` object.
  - Implemented offline fallback response (`createOfflineResponse()`) with status 503 and clean user-facing HTML when network and cache are unavailable during navigation.
  - Added safe error response (`createAssetErrorResponse()`) with status 504 for failed static asset network fetches, preventing unhandled promise rejections.
- **Resilient Precache Installation (`frontend/public/sw.js`)**:
  - Replaced all-or-nothing `cache.addAll()` with `Promise.allSettled()` and per-asset try/catch handling, preventing individual optional asset fetch hiccups from failing Service Worker installation.
- **Cache Lifecycle Isolation (`frontend/public/sw.js`)**:
  - Scoped cache cleanup during activation to delete only matching `virtual-reality-*` stale versions (`STATIC_CACHE = "virtual-reality-admin-shell-v4"`).
  - Maintained complete `/api/` endpoint bypass, push notification listener, and notification click navigation behaviors.

---

## Phase 47: Admin-Only PWA Hardening & Scope Isolation
- **Web App Manifest Scope Isolation (`frontend/public/manifest.webmanifest`)**:
  - Restricted manifest `scope` from `"/"` to `"/admin"`.
  - Retained `start_url: "/admin"` with explicit admin identity (`"name": "Virtual Reality Admin"`, `"short_name": "VR Admin"`), preventing the PWA from representing or capturing the public website.
- **Service Worker Admin-Only Interception (`frontend/public/sw.js`)**:
  - Added `isAdminPath(pathname)` helper (`/admin`, `/admin/*`).
  - Restricted navigation interception strictly to admin routes; all public navigation requests (`/`, `/search`, `/:developerSlug`, `/:developerSlug/:locationSlug/:projectSlug`, `/privacy-policy`) completely bypass the Service Worker.
  - Removed `"/"` from `PRECACHE_ASSETS` to prevent public HTML from entering the admin cache.
  - Guaranteed the Service Worker never returns the cached admin shell for public routes.
  - Bumped static cache version to `virtual-reality-admin-shell-v5` and purged obsolete `virtual-reality-*` caches during activation.
- **Service Worker Registration Scope (`registerServiceWorker.ts`, `push.ts`)**:
  - Configured Service Worker registration explicitly with `{ scope: "/admin" }`.
  - Maintained complete `/api/*` endpoint bypass, JWT authentication lifecycle in React, and Web Push event listeners.

---

## Phase 48: Production Deep-Link Styling & Hydration Asset Synchronization
- **Production Deep-Link Failure Resolution**:
  - Resolved production issue where direct navigation and hard-refreshes on public SEO routes (`/`, `/:developerSlug`, `/:developerSlug/:locationSlug/:projectSlug`, `/projects-in-pune`, `/location/:locationSlug`) returned unstyled semantic HTML without visual CSS or React hydration.
  - Addressed root cause: decoupled Vercel frontend CDN and Render backend SEO SSR deployments resulted in Render injecting stale, hardcoded Vite asset hashes (`index-DYHmTRZz.css`, `index-BQHX-fUx.js`) that did not exist on Vercel, causing Vercel's SPA fallback rewrite to return HTML for CSS/JS requests and trigger browser MIME-type rejections.
- **Deterministic Entry Asset Names (`frontend/vite.config.mts`)**:
  - Configured Vite `build.rollupOptions.output` to emit stable entrypoint names: `assets/index.js` and `assets/index.css`.
  - Preserved content hashing for all dynamically imported / lazy-loaded chunks (`assets/[name]-[hash].js`), ensuring code-splitting for admin pages (`AdminDashboardPage-[hash].js`, `LeadsPage-[hash].js`, etc.) retains efficient cache busting.
  - Preserved content hashing for non-CSS assets (`assets/[name]-[hash][extname]`).
- **Backend SEO Renderer Asset Resolution (`backend/src/services/seo/seo-renderer.service.ts`)**:
  - Replaced stale hardcoded hash defaults with deterministic paths: `DEFAULT_BUNDLE_SCRIPT = "/assets/index.js"` and `DEFAULT_BUNDLE_STYLE = "/assets/index.css"`.
  - Updated filesystem asset detection regex to support deterministic filenames while maintaining optional environment variable overrides (`VITE_ASSET_SCRIPT`, `VITE_ASSET_STYLE`).
  - Preserved all existing SEO features: Schema.org JSON-LD, Open Graph meta tags, Twitter cards, semantic HTML body, and canonical URLs.
- **Verification & Invariant Preservation**:
  - Verified `npm --prefix frontend run build` outputs `dist/assets/index.css` (175.71 kB), `dist/assets/index.js` (398.73 kB), and 27 hashed dynamic chunks.
  - Verified `dist/index.html` references `/assets/index.js` and `/assets/index.css`.
  - Verified `npm --prefix backend run build` compiles TypeScript cleanly with zero errors.
  - Confirmed Admin PWA scope remains strictly `/admin` without regressing Service Worker behavior, JWT authentication, or API endpoints.

---

## Phase 49: Rental Desk Backend Foundation & Public Portal
- **Rental Domain Backend Architecture**:
  - Implemented isolated Rental domain with Prisma models `RentalEnquiry` and `RentalProperty`.
  - Added RESTful endpoints for public submissions (`POST /api/rentals/enquiries`, `POST /api/rentals/properties`) and authenticated admin operations (`/api/admin/rentals/*`).
  - Implemented comprehensive input validation (`rental.validator.ts`) and database repository layer (`rental.repository.ts`).
- **Public Rental Portal & Separation of Audiences**:
  - Created dedicated seeker Rental Desk page at `/rentals` (`RentalsPage.tsx`).
  - Created dedicated owner Property Desk page at `/rentals/list-property` (`ListPropertyPage.tsx`).
  - Engineered editorial styling and typography in `rentals.css` matching the platform's luxury design system.
  - Resolved transparent header contrast and layout spacing on owner submission page.

---

## Phase 50: Admin Rental Step 4A – Rental Enquiries
- **Multi-Token Backend Search (`backend/src/repositories/rental.repository.ts`)**:
  - Enhanced `findManyEnquiries` to tokenize search queries by whitespace and apply case-insensitive `AND` filters across seeker details, configuration, location, furnishing, and notes.
- **Frontend Admin Rental Foundation**:
  - Created TypeScript types in `frontend/src/types/admin-rental.ts` (`RentalEnquiry`, `RentalEnquiryStatus`, `UpdateRentalEnquiryInput`).
  - Created API client in `frontend/src/api/admin-rentals.ts` for listing, retrieving, updating status/internal notes, and deleting enquiries.
- **Admin Navigation & Routing**:
  - Added "Rentals" navigation in `AdminLayout.tsx` linking to `/admin/rentals/enquiries`.
  - Registered lazy-loaded routes in `AppRouter.tsx` for `/admin/rentals/enquiries` and `/admin/rentals/enquiries/:id`.
- **Enquiry Management Interface**:
  - Created `RentalEnquiriesPage.tsx` with multi-token keyword search, status tabs (`ALL`, `NEW`, `CONTACTED`, `MATCHED`, `CLOSED`, `ARCHIVED`), attention indicator badges, and pagination.
  - Created `RentalEnquiryDetailPage.tsx` with complete seeker profile breakdown, status update dropdown, editable internal notes, and direct communication actions (`RentalEnquiryActions.tsx`).
  - Created `DeleteRentalEnquiryModal.tsx` for safe deletion.
- **Admin CSS Extensions (`frontend/src/styles/admin/admin.css`)**:
  - Added status badge color styling for `status-contacted`, `status-matched`, `status-closed`, and `status-archived`.

---

## Phase 51: Admin Rental Step 4B – Available Rental Properties
- **Multi-Token Backend Property Search (`backend/src/repositories/rental.repository.ts`)**:
  - Enhanced `findManyProperties` to tokenize search queries by whitespace and apply case-insensitive `AND` filters across `ownerName`, `phone`, `flatType`, `approxSizeSqFt` (with integer conversion support), `location`, `areaLocality`, `societyDeveloper`, `additionalDetails`, and `internalNotes`.
- **Frontend Admin Rental Types & API Client**:
  - Extended `frontend/src/types/admin-rental.ts` with `RentalPropertyStatus`, `AdminRentalProperty`, `AdminRentalPropertyQuery`, `AdminRentalPropertyUpdateInput`, and response types.
  - Extended `frontend/src/api/admin-rentals.ts` with `getRentalProperties`, `getRentalProperty`, `updateRentalProperty`, and `deleteRentalProperty`.
- **Nested Admin Navigation & Routing**:
  - Updated `AdminLayout.tsx` and `admin.css` to render nested Rentals navigation (`Enquiries` and `Available`) with desktop vertical sub-group hierarchy and mobile horizontal scrolling support.
  - Registered lazy-loaded routes in `AppRouter.tsx` for `/admin/rentals/available` and `/admin/rentals/available/:id`.
- **Available Properties Management Interface**:
  - Created `RentalAvailablePage.tsx` with debounced keyword search, status tabs (`ALL`, `NEW`, `VERIFIED`, `AVAILABLE`, `RENTED`, `ARCHIVED`), attention indicator badges, and pagination.
  - Created `RentalAvailableDetailPage.tsx` with complete owner contact breakdown, property specifications, status triage dropdown, editable internal notes with dirty-state save handling, and direct communication actions (`RentalPropertyActions.tsx`).
  - Created `DeleteRentalPropertyModal.tsx` for safe deletion.
- **Admin CSS Extensions (`frontend/src/styles/admin/admin.css`)**:
  - Added status badge styling for `.status-verified`, `.status-available`, and `.status-rented`.

---

## Phase 52: Admin Rental Step 4C – Surface Relevant Available Properties in Enquiry Detail
- **Deterministic Server-Side Property Candidate Discovery**:
  - Added `findRelevantAvailableProperties` to `backend/src/repositories/rental.repository.ts` querying `RentalProperty` records with status `AVAILABLE` using the enquiry's `configuration`, `location`, and `areaLocality`.
  - Applied deterministic prioritization (exact configuration + location match > configuration match > location match) returning a bounded list of top candidates.
  - Excluded all non-`AVAILABLE` statuses (`NEW`, `VERIFIED`, `RENTED`, `ARCHIVED`).
- **Admin Endpoint for Enquiry Available Properties**:
  - Added `GET /api/admin/rentals/enquiries/:id/available-properties` route, controller (`getRelevantAvailablePropertiesController`), and service (`getRelevantAvailablePropertiesForEnquiry`).
  - Added client method `getRelevantAvailableProperties(enquiryId)` in `frontend/src/api/admin-rentals.ts`.
- **Enquiry Detail Available Properties Section**:
  - Updated `frontend/src/pages/admin/RentalEnquiryDetailPage.tsx` to surface candidate available properties with flat type, approx size, society/developer, location, status badge, and "View Property" navigation link (`/admin/rentals/available/:id`).
  - Handled loading, error with retry, and empty states ("No relevant available properties found" + "View All Available →" link).
- **Admin CSS Extensions (`frontend/src/styles/admin/admin.css`)**:
  - Added styles for `.admin-relevant-properties-section`, `.admin-relevant-properties-grid`, and `.admin-relevant-property-card`.
- **Strict Invariants Preserved**:
  - No `RentalConnection` model, foreign keys, or database migrations created.
  - No automated matching, scoring, or automated notes mutation.
  - Internal admin notes remain manual and isolated.

---

## Phase 53: Admin Leads Search Bar Audit & Multi-Token Relational Improvement
- **Multi-Token Relational Search (`backend/src/repositories/lead.repository.ts`)**:
  - Upgraded `findMany` search implementation from single-string query matching to whitespace-tokenized `AND` matching across all tokens.
  - Expanded searchable fields to include:
    - Direct fields: `name`, `phone`, `email`, `message`, `notes`.
    - Relational fields: `developer.name`, `project.name`, `project.locationName`, and `configuration.name`.
  - All token matching is case-insensitive (`mode: "insensitive"`) and cleanly ignores duplicate whitespace.
- **Frontend Leads Search Bar UX (`frontend/src/pages/admin/LeadsPage.tsx`, `frontend/src/styles/admin/admin.css`)**:
  - Added dedicated clear button (`✕`) when search terms exist that instantly resets query and pagination without page reload.
  - Refined placeholder copy: *"Search leads by name, phone, project, configuration, notes..."*.
  - Added rich contextual empty state distinguishing between unfiltered empty leads, specific keyword misses (with one-click "Clear search" action), and status filter misses.
- **Invariants Preserved**:
  - No database migration or Prisma schema changes.
  - Zero changes to public lead capture endpoints or rental desks.
  - Strict server-side execution with status filter and pagination integration.

---

## Phase 54: Admin Developer & Project Activation / Deactivation Controls
- **Admin Publication Status Controls**:
  - Reused the existing `publishStatus` enum (`PUBLISHED` vs `DRAFT`) across `Developer` and `Project` models without creating new database tables, `isActive` booleans, or `previousStatus` columns.
  - Exposed `publishStatus` as explicit **Active** (`PUBLISHED`) and **Inactive** (`DRAFT`) administrative controls on Developer and Project list and edit interfaces.
- **Developer Activate / Deactivate Actions & Safety Modal**:
  - Added direct `Activate` / `Deactivate` buttons to `DevelopersPage.tsx` rows and clarified publication options in `DeveloperFormPage.tsx`.
  - Created `DeactivateDeveloperModal.tsx` requiring confirmation before deactivating a developer, stating: *"This will remove the developer and its projects from public visibility. Existing projects and data will be preserved."*
  - Deactivation updates ONLY `Developer.publishStatus` to `DRAFT` via existing `PATCH /api/admin/developers/:id`. No child project, configuration, or lead database records are modified or cascaded.
- **Project Activate / Deactivate Actions & Safety Modal**:
  - Added direct `Activate` / `Deactivate` buttons to `ProjectsPage.tsx` rows and separated construction lifecycle (`status`) from publication status (`publishStatus`) in `ProjectFormPage.tsx`.
  - Created `DeactivateProjectModal.tsx` requiring confirmation before deactivating a project, stating: *"This will remove the project and its configurations from public visibility. Existing data will be preserved."*
  - Deactivation updates ONLY `Project.publishStatus` to `DRAFT` via existing `PATCH /api/admin/projects/:id`. No parent developer, configuration, or lead database records are modified.
- **Parent Deactivation Warning**:
  - Implemented non-blocking warning banners in `ProjectFormPage.tsx` and warning badges (`Active (Developer Inactive)`) in `ProjectsPage.tsx` when a Project is marked `PUBLISHED` (`Active`) but its parent Developer is `DRAFT` (`Inactive`), informing the admin that the project is currently not publicly visible without overwriting the project's stored status.
- **CSS Styling (`frontend/src/styles/admin/admin.css`)**:
  - Added styles for `.admin-badge`, `.admin-badge--active`, `.admin-badge--inactive`, `.admin-badge--warning`, `.admin-badge--featured`, `.admin-status-warning`, and `.admin-status-draft`.
- **Invariants Preserved**:
  - No Prisma schema alterations or database migrations.
  - No cascade mutations on child/parent records.
  - Public visibility queries and Tara/search/SEO behavior remain untouched in this step.

---

## Phase 55: Hierarchical Developer & Project Public Visibility Verification
- **End-to-End Public Visibility Verification**:
  - Verified and confirmed that the hierarchical visibility contract is strictly enforced on read across all 10 public channels:
    1. **Public Developer Detail (`GET /api/developers/:slug`)**: Accessible $\iff$ `developer.publishStatus === "PUBLISHED"`. Returns 404 when `DRAFT`. Only embeds child projects whose `project.publishStatus === "PUBLISHED"`.
    2. **Public Project Detail (`GET /api/projects/:developerSlug/:projectSlug`)**: Accessible $\iff$ `developer.publishStatus === "PUBLISHED" && project.publishStatus === "PUBLISHED"`. Returns 404 if either is `DRAFT`.
    3. **Locality Project Listing (`GET /api/locations/:locationSlug/projects`)**: Filters strictly by `publishStatus: "PUBLISHED"` on both Project and Developer.
    4. **Conversational Search Assistant (`POST /api/search/properties`)**: Search filters strictly require `project: { publishStatus: "PUBLISHED", developer: { publishStatus: "PUBLISHED" } }`.
    5. **Tara Property Catalog (`GET /api/search/catalog`)**: Only includes configurations from projects where both Project and Developer are `PUBLISHED`.
    6. **Public Site Metadata & Featured Projects (`GET /api/site`)**: Featured projects require `featured: true`, `publishStatus: "PUBLISHED"`, and `developer: { publishStatus: "PUBLISHED" }`. Developer list requires `publishStatus: "PUBLISHED"`.
    7. **Server-Side SEO HTML Pre-Rendering (`/location/:locality`, `/projects-in-pune`)**: Only renders active projects under active developers; returns 404 for inactive entities.
    8. **Dynamic XML Sitemap (`/sitemap.xml`)**: Generates URLs strictly for published developers and published projects under published developers.
    9. **Configuration Visibility**: Configurations inherit visibility directly from parent Project and Developer; deactivated parents hide all configurations from search and catalog.
    10. **Admin Operational Independence**: Deactivated entities remain 100% visible, editable, and manageable in Admin workspaces without affecting existing leads or rental desks.
- **Automated Verification Harness**:
  - Executed a 5-stage lifecycle test against the live PostgreSQL database:
    - *Test A*: Baseline Active Hierarchy (Dev: `PUBLISHED`, Proj: `PUBLISHED`) $\rightarrow$ 100% public paths available.
    - *Test B*: Project Deactivated (Dev: `PUBLISHED`, Proj: `DRAFT`) $\rightarrow$ Project hidden from all 10 public channels; developer remains visible.
    - *Test C*: Project Restored $\rightarrow$ Public project availability restored immediately.
    - *Test D*: Developer Deactivated (Dev: `DRAFT`, Proj: `PUBLISHED`) $\rightarrow$ Developer and all child projects hidden from all 10 public channels while project database status remains `PUBLISHED`.
    - *Test E*: Developer Restored $\rightarrow$ Complete hierarchy restored with 100% consistency.
- **Invariants Preserved**:
  - Zero database schema changes or migrations.
  - Zero cascading writes in database tables.
  - No disruption to Leads, Rentals, or admin workflows.

---

## Phase 56: Tara Refactor Phase 1 — Redundant Entry Point Removal
- **Global Header Streamlining (`frontend/src/components/shell/GlobalHeader.tsx`, `layout.css`)**:
  - Removed desktop `✦ Tara` button (`.global-assistant-btn`) and mobile drawer trigger (`.mobile-assistant-trigger-btn`).
  - Removed unused `useAssistant` imports and event handlers while preserving all navigation links, Contact & Advisory CTA, Rentals, and mobile menu behaviors.
- **Homepage Editorial Focus (`frontend/src/components/home/AtmosphericHero.tsx`, `frontend/src/components/home/TrustStatisticsStrip.tsx`, `frontend/src/components/home/ContactAdvisorySection.tsx`, `home.css`)**:
  - Removed `.hero-primary-cta` ("✦ Explore with Tara") and the 4 quick preference discovery chips from `AtmosphericHero.tsx`.
  - Removed dedicated conversational search entry card (`ConversationalSearchEntry.tsx`) from `HomePage.tsx` and removed the orphaned file.
  - Converted `TrustStatisticsStrip.tsx` to a purely static 4-pillar trust and metrics section by removing interactive "Explore with Tara →" action button.
  - Removed `.tara-discovery-callout` and `.advisory-divider` from `ContactAdvisorySection.tsx`, focusing the section on personalized human advisory and direct contact channels.
  - Cleaned up corresponding orphaned CSS classes from `home.css` and `layout.css` without breaking surrounding layouts.
- **Persistent Global Launcher Intact (`frontend/src/components/home/FloatingSearchControl.tsx`)**:
  - Retained `FloatingSearchControl` as the single primary global interactive entry point to launch `PropertyAssistantOverlay.tsx` across all public pages.
  - Canonical full-page property discovery route `/search` (`SearchPage.tsx`, `SearchAssistant.tsx`, `SearchResults.tsx`) and footer link to `/search` remain 100% operational.
## Phase 57: Tara Refactor Phase 2 — Premium Popup / Overlay Redesign
- **Assistant Header Hierarchy Refinement (`frontend/src/components/search/AssistantHeader.tsx`)**:
  - Replaced raw inline title with an editorial architectural header hierarchy:
    - Eyebrow: `PROPERTY DISCOVERY ADVISOR` (brass `#A99168`, uppercase letter-spaced) alongside the small visual identity token (`TaraAvatar`).
    - Title: `Tara` (editorial serif typography `Playfair Display`, Georgia).
    - Subline: `"Find a home that fits what you're looking for."` in muted architectural slate (`#68706A`).
- **Overlay & Mobile Sheet Presentation (`frontend/src/components/search/PropertyAssistantOverlay.tsx`, `search.css`)**:
  - Desktop: Bottom-right card layout with refined dimensions (`max-width: 32rem`, `max-height: min(44rem, calc(100vh - 3rem))`), deep forest shadow (`rgba(17, 40, 33, 0.24)`), crisp border (`#E6E6E2`), and warm ivory/white surfaces (`#FFFFFF`, `#F6F6F3`).
  - Mobile: Bottom-sheet presentation (`max-height: 90vh`), top rounded corners (`1rem 1rem 0 0`), safe-area-inset padding, and touch targets $\ge 44\text{px}$.
  - Quiet, accessible close button `✕` with focus ring and clear aria label (`"Close Tara advisor"`).
  - Preserved backdrop dismiss, Escape key dismiss, body scroll lock, and `data-lenis-prevent`.
- **Architectural UI & Design System Alignment (`frontend/src/styles/search.css`)**:
  - Applied brand color tokens: Deep Forest `#18382E` / `#112821`, Brass `#A99168`, Neutral borders `#E6E6E2` / `#D9D9D4`, Charcoal `#202622`, Muted slate `#68706A`, and Warm ivory `#F6F6F3` / `#FAFAF8`.
  - Upgraded Tara & user conversation bubbles: Assistant messages render in warm neutral cards with subtle border and crisp typography; User selections render in deep forest `#18382E` pills.
  - Refined Query Summary: Clear `"LOOKING FOR"` header with discrete removable constraint chips.
  - Refined Rule Option buttons: Premium minimal cards with subtle hover elevation (`-1px`), brass chevron arrows, and active state feedback.
  - Refined Compact Project Cards: Architectural thumbnail monogram in deep forest gradient, BHK pill badges, starting price, project status, and deep-link navigation.
  - Refined Empty State: Calm, helpful filter-loosening recovery actions with left brass border accent.
- **Invariants Preserved**:
  - Zero modifications to backend APIs, database schema, or search catalog service.
  - Zero modifications to `useSearchChat.ts`, `query-builder.ts`, or `assistant-dialogue.ts`.
  - Full-page `/search` and shared assistant state remain 100% operational.
  - Zero Git commits or pushes.

---

## Phase 58: Tara Refactor Phase 3 — Buy vs Rent Entry Decision
- **Deterministic Intent Entry Step (`frontend/src/services/assistant-dialogue.ts`, `frontend/src/hooks/useSearchChat.ts`)**:
  - Added discrete `DiscoveryIntent = "BUY" | "RENT" | null` state tracking to `useSearchChat.ts`.
  - When Tara opens in a fresh session (`intent === null`), Tara opens with the introductory prompt:
    - `"Hello, I'm Tara. What are you looking to do?"` (`getTaraIntentOpeningMessage()`).
  - Added `selectIntent(intent: "BUY" | "RENT")` action.
- **Intent Options Presentation (`frontend/src/components/search/SearchAssistant.tsx`, `frontend/src/styles/search.css`)**:
  - Implemented initial intent selection screen rendering two discrete choices:
    - `[ Buy a Home ]` — "Find your next home to purchase" (with right arrow indicator).
    - `[ Rent a Home ]` — "Explore verified rental desk listings" (with right arrow indicator).
  - Styled with architectural design system tokens: Warm Ivory surface `#FFFFFF`, Soft sand hover `#F6F6F3`, Deep Forest title `#18382E`, Muted Slate subline `#68706A`, Brass arrow `#A99168`, and Stone borders `#E6E6E2`.
- **Clean Behavioral Branching**:
  - **BUY PATH (`handleSelectBuy`)**: Calls `selectIntent("BUY")`, immediately transitioning into the existing deterministic property search flow (*"What kind of home are you looking for?"* followed by BHK options $\rightarrow$ Location $\rightarrow$ Budget $\rightarrow$ Status $\rightarrow$ Results).
  - **RENT PATH (`handleSelectRent`)**: Executes `closeAssistant({ reset: true })` and triggers React Router `navigate("/rentals")` directly to the public Rental Desk. Tara never searches rental inventory or invokes rental backend services.
- **Session Reset & Rollback Ergonomics**:
  - Clicking "Start over" / `reset()` or closing/re-opening the overlay resets `intent` back to `null`, presenting the fresh intent choice.
  - Clicking "← Previous" at the first question of the property search flow rolls back to the initial `"What are you looking to do?"` intent screen without losing catalog state.
- **Invariants Preserved**:
  - Zero modifications to `query-builder.ts`, `search-catalog.service.ts`, backend APIs, database schema, or rental endpoints.
  - Zero LLMs, AI APIs, or free-text search.
  - Public `/search` page and `/rentals` desk operate cleanly with zero conflicts.
  - Zero Git commits or pushes.

---

## Phase 59: Public Navigation Bar Contextual Brand Name Layout Robustness Fix
- **Root Cause Resolution (`frontend/src/styles/layout.css`)**:
  - Eliminated arbitrary, premature desktop `max-width: 20rem` (320px) and mobile `max-width: 11.5rem` (184px) constraints on `.global-brand-name`.
  - Configured flexible, content-driven layout constraints:
    - `.global-brand-link`: `flex: 0 1 auto; max-width: 100%; min-width: 0;`
    - `.global-brand-name`: `max-width: 100%; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;`
    - `.global-header-right`: `flex-shrink: 0;` (protects navigation links and action buttons from being squeezed).
- **Graceful Multi-Viewport Responsive Behavior**:
  - **Desktop ($\ge 1024\text{px}$)**: Long developer and project names (e.g., *"Mahalaxmi Kohinoor Developers Private Limited"*, *"Godrej Properties Premium Residences"*) now naturally consume all available header space (~550px–750px) without premature clipping.
  - **Mobile ($\le 768\text{px}$)**: Name flexes up to the exact boundary of the hamburger toggle, truncating with clean ellipsis only when required by narrow physical viewport limits (320px–430px).
  - **Zero Layout Collisions**: Guaranteed zero horizontal page overflow, no button overlaps, and full title visibility via native `title={headerTitle}` attribute.
- **Invariants Preserved**:
  - Zero database or data modifications.
  - Transparent hero scrim and scrolled header states remain 100% intact.
  - Zero Git commits or pushes.

---

## Phase 60: Automatic "Let's Connect" Advisory Popup Implementation
- **Centralized Public Shell Lifecycle (`frontend/src/components/shell/PublicShell.tsx`)**:
  - Implemented exactly one 5-second `setTimeout` timer per visitor session attached to the persistent `PublicShell` wrapper.
  - Enforced session-level suppression via `sessionStorage.getItem("vr_advisory_popup_shown")`. Once shown or dismissed, the popup does not repeat across route transitions (`/` $\rightarrow$ `/search` $\rightarrow$ `/rentals` $\rightarrow$ `/:devSlug`).
  - Implemented automatic non-conflict coordination: suppressed if Tara (`isAssistantOpen`) or a contextual enquiry modal is active at the 5-second mark, and auto-dismisses if Tara is subsequently launched.
- **Concierge Invitation Modal (`frontend/src/components/common/AdvisoryPopupModal.tsx`, `advisory-modal.css`)**:
  - **Stage 1 (Invitation)**: Warm, compact card (*"LET'S CONNECT"*, *"A more personal way to find the right home"*, and *"Tell us what you're looking for..."*). Includes primary `[ Let's Connect → ]` action, direct reach links (`Call {phone}`, `WhatsApp`), and a "Maybe later" dismissal.
  - **Stage 2 (Enquiry Form)**: Clicking `[ Let's Connect → ]` transitions within the same modal to the lead inquiry form (Name, Phone, optional Email, optional Message/Preferences).
  - **Stage 3 (Confirmation)**: Submits through the existing lead pipeline (`createLead` $\rightarrow$ `POST /api/leads`) and presents clear *"✓ REQUEST RECEIVED"* confirmation with a `[ Done ]` close button.
- **Accessibility & Responsive Geometry**:
  - `role="dialog"`, `aria-modal="true"`, `aria-labelledby="advisory-popup-title"`, focus trapping, Escape key dismiss, backdrop click dismiss, touch targets $\ge 44\text{px}$, and `data-lenis-prevent`.
  - Max-width 31rem on desktop; bottom-sheet presentation on mobile ($\le 640\text{px}$) with safe-area padding.
- **Invariants Preserved**:
  - Completely separate from Tara (no property search, no catalog query, no LLMs).
  - No network requests on popup trigger; network activity occurs solely upon form submission.
  - Zero database or backend changes.
  - Zero Git commits or pushes.

---

## Phase 61: Advisory Popup CTA Integration & Route Scope Hardening
- **Global Header CTA Unification (`frontend/src/context/AdvisoryContext.tsx`, `frontend/src/components/shell/GlobalHeader.tsx`)**:
  - Created lightweight `AdvisoryProvider` context (`isAdvisoryOpen`, `openAdvisory`, `closeAdvisory`).
  - Wired desktop and mobile "Contact & Advisory" header buttons to `openAdvisory()`, triggering the unified `AdvisoryPopupModal` concierge invitation experience directly from any public page.
- **Route-Scoped Auto-Trigger Exclusions (`frontend/src/components/shell/PublicShell.tsx`)**:
  - Explicitly excluded owner submission page (`/rentals/list-property`) from the 5-second automatic advisory popup timer to prevent misaligned consumer prompts on owner-focused workflows.
  - General consumer routes (`/`, `/firm`, `/search`, `/rentals`, `/:developerSlug`, `/:developerSlug/:locationSlug/:projectSlug`, `/privacy-policy`) remain enabled with session-level suppression.
- **Contextual Inquiries Preserved**:
  - Project and Developer pages continue using `ContextualEnquiryModal` for property-specific lead attribution (`projectId`, `developerId`, `configurationId`, configuration badges).
- **Invariants Preserved**:
  - Zero database or backend modifications.
  - Zero modifications to Tara discovery rules, catalog queries, or rental logic.
  - Zero Git commits or pushes.

---

## Phase 62: Removal of Rentals Link from Public Global Navigation
- **Public Navigation Streamlining (`frontend/src/components/shell/GlobalHeader.tsx`)**:
  - Removed the `Rentals` navigation link from the desktop primary navigation bar (`.desktop-primary-nav`).
  - Removed the `Rental Desk` navigation link from the mobile navigation drawer (`.mobile-nav-links`).
  - Public global navigation now displays a focused 3-item link set: `Home`, `About`, and `Privacy Policy`, alongside the `Contact & Advisory` action button.
- **Rental Functionality & Direct Routes Preserved**:
  - Public Seeker Rental Desk (`/rentals`) and Owner Property Desk (`/rentals/list-property`) remain 100% active, accessible, and operational via direct URL navigation and contextual links.
  - Tara's `RENT A HOME` intent choice continues to navigate directly to `/rentals` seamlessly.
  - Backend rental APIs (`/api/rentals/enquiries`, `/api/rentals/properties`), Prisma schema, and admin rental workspaces remain completely untouched.
- **Invariants Preserved**:
  - Zero modifications to `/rentals`, `/rentals/list-property`, `useSearchChat.ts`, `query-builder.ts`, or backend services.
  - Zero Git commits or pushes.

---

## Phase 63: Contextual Project Enquiry & "Schedule a Visit" Experience
- **Contextual Enquiry Modal Evolution (`frontend/src/components/common/ContextualEnquiryModal.tsx`)**:
  - Evolved existing `ContextualEnquiryModal` with discrete `EnquiryIntent = "SCHEDULE_VISIT" | "REQUEST_CALLBACK"` handling without duplicate components.
  - **Schedule a Visit Flow (2-Step Progressive Disclosure)**:
    - **Step 1 (Visit Details)**: Eyebrow `PROJECT VISIT`, Title `Schedule a Visit`, Project context card with thumbnail, Project Name, Developer attribution, Location, and Configuration badge; collects Full Name, Mobile Number, optional Email, optional Preferred Visit Date (`min={today}`); Step 1 of 2 indicator with privacy reassurance copy and `Continue →` action.
    - **Step 2 (Preferences)**: Eyebrow `ALMOST THERE`, Title `When would you prefer to visit?`, 3 selectable time-slot chips (`Morning 10 AM - 1 PM`, `Afternoon 1 PM - 5 PM`, `Evening 5 PM - 8 PM`), optional notes textarea, Step 2 of 2 indicator, `← Back` navigation, and primary `Request Visit →` submission.
  - **Request a Callback Flow (Streamlined Single-Step)**:
    - Eyebrow `REQUEST A CALLBACK`, Title `Speak with an Advisor`, project context card, Full Name, Mobile Number, optional Email, optional Message, and `Request Callback →` action.
  - **Success State**:
    - Calm confirmation card with `✓ REQUEST RECEIVED` badge, personalized confirmation message, and `[ Continue Exploring ]` dismissal button.
- **Project Page Contextual Actions (`frontend/src/components/project/ProjectHero.tsx`, `ProjectSubNav.tsx`, `ProjectPage.tsx`)**:
  - **Project Hero**: Features primary `Schedule a Visit →` and secondary `Request a Callback` action buttons.
  - **Sticky Sub-Navigation & Explore Nav**: Updated `Enquire` triggers to default to `SCHEDULE_VISIT` intent.
  - **Mobile Sticky Bar**: Updated primary action to `Schedule a Visit →`.
  - **Configuration Section**: Floor-plan enquiries seamlessly preserve active `configurationId`.
- **Architectural Editorial Geometry (`frontend/src/styles/project.css`)**:
  - **Desktop**: Compact right-side drawer panel (~440px wide) with dimmed backdrop preserving visible project imagery behind.
  - **Mobile**: Responsive bottom-sheet with safe-area insets (`env(safe-area-inset-bottom)`), touch targets $\ge 44\text{px}$, and `data-lenis-prevent` scroll containment.
- **Invariants Preserved**:
  - Zero database schema changes or backend endpoint modifications (structured into existing `createLead` / `POST /api/leads` message field).
  - Clear UX separation: Tara (property discovery), Let's Connect (generic firm advisory), Schedule a Visit (specific project visit).
  - Zero Git commits or pushes.

---

## Phase 64: Standalone Public Property Enquiry Page (`/enquiry`)
- **Standalone Customer Brief Route (`frontend/src/router/AppRouter.tsx`)**:
  - Mounted `<Route path="/enquiry" element={<EnquiryPage />} />` outside `PublicShell` so the consultation page renders completely standalone with zero website navigation headers, footers, Tara floating triggers, or advisory modals.
- **Generic & Personal Page Redesign (`frontend/src/pages/EnquiryPage.tsx`)**:
  - Redesigned for customer direct sharing (WhatsApp/SMS/Email) following human calls.
  - Features generic, reassuring headline: `PROPERTY ENQUIRY` and *"Tell us what you're looking for. We'll take care of the rest."*
  - Fast, unnumbered minimum path: Full Name $\rightarrow$ Mobile Number (Indian 10-digit validation) $\rightarrow$ Buy/Rent segmented chips $\rightarrow$ Configuration (`1 BHK`, `2 BHK`, `3 BHK`, `4+ BHK`) $\rightarrow$ Preferred Date (`min={today}`) $\rightarrow$ `Submit Enquiry →`.
  - Preferred Visit Time chips (`Morning`, `Afternoon`, `Evening`) and expandable optional accordion (`+ Add more details (optional)` for Location, Budget, Email, and Notes) remain secondary and progressive.
  - Reuses existing `createLead` / `POST /api/leads` contract, encoding structured requirements into the lead message with zero backend schema changes.
  - Minimal confirmation view: `PROPERTY ENQUIRY RECEIVED` with *"Thank you. We've received your requirements and will take care of the next steps."* and `[ Continue Exploring ]`.
- **Full-Bleed Architectural Backdrop (`frontend/src/styles/enquiry.css`)**:
  - Full-viewport high-end residential architecture backdrop with dark cinematic scrim (`rgba(17, 40, 33, 0.6)`) and solid warm ivory consultation card (`#FDFDFB`).
  - Mobile-first responsive optimization (320px–1440px) with $\ge 44\text{px}$ touch targets and zero horizontal overflow.
- **Invariants Preserved**:
  - Zero database schema or backend migration modifications.
  - Zero modifications to Tara discovery, contextual project modals, or existing project pages.
  - Zero Git commits or pushes.

---

## Phase 65: Structured Visit Scheduling Fields in Lead Model (Visits Foundation Phase 1)
- **Database Schema Evolution (`backend/prisma/schema.prisma` & Migration `20260919123500_add_lead_visit_fields`)**:
  - Added nullable `visitDate String?` and `visitTime String?` columns to the existing `Lead` model.
  - Applied `@@index([visitDate])` index for operational query performance.
  - Used strict plain calendar date string (`YYYY-MM-DD`) rather than `DateTime` to eliminate UTC/local timezone shifts across API, DB, and client runtimes in India Standard Time (`Asia/Kolkata`).
  - Applied migration non-destructively; all existing historical leads are preserved with `visitDate = null, visitTime = null`.
- **Validation Engine Updates (`backend/src/validators/lead.validator.ts`)**:
  - Added strict date validation for optional `visitDate`: enforces `^\d{4}-\d{2}-\d{2}$`, valid calendar dates (accurate leap year & day-of-month checks), and $\ge \text{today in Asia/Kolkata}$.
  - Added strict time validation for optional `visitTime`: enforces `Morning` | `Afternoon` | `Evening`.
  - Updated both public (`createLeadValidation`) and admin (`createAdminLeadValidation`, `updateAdminLeadValidation`) validation schemas.
- **Service & Repository Layer Integration (`backend/src/services/lead.service.ts`, `backend/src/repositories/lead.repository.ts`)**:
  - Updated `LeadRepository.leadSelect`, `create()`, and `update()` to persist and retrieve `visitDate` and `visitTime`.
  - Updated `LeadService.toAdminLead`, `createLead`, `createAdminLead`, and `updateLead` to map `visitDate` and `visitTime` cleanly to/from DTOs and database records.
- **Controller & Frontend API Contracts (`backend/src/controllers/*`, `frontend/src/api/lead.ts`, `frontend/src/types/admin-lead.ts`)**:
  - Public `lead.controller.ts` and Admin `lead.controller.ts` forward structured visit fields.
  - Frontend `CreateLeadPayload` accepts optional `visitDate?: string` and `visitTime?: string`.
  - Frontend `AdminLead`, `AdminLeadCreateInput`, and `AdminLeadUpdateInput` expose `visitDate: string | null` and `visitTime: string | null`.
- **Invariants Preserved**:
  - Zero separate `Visit` database entities created.
  - Zero historical message parsing or data distortion.
  - 100% backwards compatible with existing lead submissions.
  - Zero Git commits or pushes.

---

## Phase 66: Standalone Enquiry Form Connected to Structured Visit Fields (Visits Foundation Phase 2)
- **Standalone Form Simplification & Direct Structured Binding (`frontend/src/pages/EnquiryPage.tsx`)**:
  - Streamlined the standalone `/enquiry` consultation brief to 3 mandatory fields: Full Name, Mobile Number, and Preferred Visit Date (`visitDate`).
  - Removed old mandatory Buy/Rent and Configuration selectors from the submission path, keeping the standalone page generic, personal, and untied to specific projects or developers.
  - Bound the date input directly to structured `visitDate` (`YYYY-MM-DD`), preventing timezone shifts via `getTodayISTDateString()` (`Asia/Kolkata`) and enforcing `min={today}` validation.
  - Bound the optional time slot selector (`Morning`, `Afternoon`, `Evening`) directly to structured `visitTime`.
  - Removed `visitDate` and `visitTime` from the `message` string. The `message` field is now used exclusively for free-form optional client details (`Location`, `Budget`, `Notes`).
  - Form state and values are fully preserved across validation or API submission errors.
- **Invariants Preserved**:
  - Zero modifications to database schema or migrations.
  - Zero modifications to contextual project modals, Tara conversational search, or public shell layouts.
  - Zero Git commits or pushes.

---

## Phase 67: Dedicated Admin Visits Workspace (`/admin/visits`) (Visits Foundation Phase 3)
- **Backend Admin Visits Projection API (`GET /api/admin/visits`)**:
  - Added `findVisits(todayDate: string)` in `LeadRepository` querying all leads where `visitDate >= todayDate`.
  - Added `getVisits()` in `LeadService` projecting leads into two operational sections:
    - **TODAY**: `visitDate === todayDate` in `Asia/Kolkata`, sorted by visit time (`Morning` $\rightarrow$ `Afternoon` $\rightarrow$ `Evening` $\rightarrow$ unspecified), then `createdAt` ascending.
    - **UPCOMING**: `visitDate > todayDate` in `Asia/Kolkata`, sorted chronologically by `visitDate` ascending (nearest first), then `visitTime`, then `createdAt`.
    - Past visits (`visitDate < todayDate`) and leads without `visitDate` are strictly excluded.
  - Mounted authenticated route `GET /api/admin/visits` in `backend/src/routes/admin/visit.routes.ts` protected by `requireAdminAuthentication`.
- **Admin Shell Navigation Evolution (`frontend/src/components/admin/AdminLayout.tsx`)**:
  - Grouped Leads section into `LEADS` dropdown containing `All Leads` (`/admin/leads`) and `Visits` (`/admin/visits`).
- **Dedicated Operational UI (`frontend/src/pages/admin/VisitsPage.tsx`)**:
  - Built real-time operational triage interface with `TODAY` and `UPCOMING` sections, live count pills, and calm empty states.
  - Scannable visit cards displaying time slot badges, large calendar date blocks (for upcoming), client contact details, project context or `"General Enquiry"`, notes preview, and existing lead status badges (`NEW`, `IN_PROGRESS` as "Ongoing", `DONE`).
  - Direct operational action buttons: `[ View Lead ]` (navigating to `/admin/leads/:id`), `[ Call ]` (`tel:`), and `[ WhatsApp ]` (`wa.me` with prefilled context).
  - Responsive optimization across desktop (1024px, 1280px, 1440px) and mobile (768px, 430px) with vertical card stacking and touch-friendly targets.
- **Invariants Preserved**:
  - Zero separate `Visit` database entities or tables created (pure projection of `Lead` data).
  - Zero modifications to customer-facing enquiry flows, Tara assistant, or public pages.
  - Zero historical message parsing or data distortion.
  - Zero Git commits or pushes.

---

## Phase 68: Standalone Property Enquiry UI Redesign (`/enquiry`) (Phase 5)
- **Elevated Editorial Real-Estate Visual Experience (`frontend/src/pages/EnquiryPage.tsx`, `frontend/src/styles/enquiry.css`)**:
  - Redesigned standalone `/enquiry` consultation brief with an Architectural Magazine aesthetic:
    - Background: Full-bleed residential architectural backdrop with a warm, deep forest gradient scrim (`rgba(17, 40, 33, 0.65)` to `rgba(17, 40, 33, 0.85)`).
    - Surface: Solid warm ivory card (`#FDFDFB`) with subtle warm stone border (`#E8E2D8`), gentle depth shadow, and generous padding (`3rem 2.75rem` on desktop, `2rem 1.25rem` on mobile).
    - Typography: Editorial Playfair Display serif headings (`Find Your Next Address`), warm uppercase eyebrow (`PROPERTY ENQUIRY`), and warm charcoal section rules (`YOUR DETAILS`, `WHEN WOULD YOU LIKE TO VISIT?`).
  - **Refined Form Controls & Touch Ergonomics**:
    - Input heights elevated to 52–56px with warm neutral borders (`#D9D0C3`), friendly forest focus halos, and error states.
    - Time slot selectors upgraded to 2-line cards with prominent time-range labels (`Morning` / `10 AM – 1 PM`, `Afternoon` / `1 PM – 5 PM`, `Evening` / `5 PM – 8 PM`).
    - Expandable optional details accordion (`＋ Add more details (optional)` / `Location, budget, email & notes`) for Location, Budget, Email, and Notes.
    - Primary CTA button styled with solid deep forest (`#112821`), hover elevation, and touch target $\ge 54\text{px}$ (`Request a Visit →`).
    - Success state displays refined editorial confirmation card with deep forest badge and home navigation.
  - **Mobile-First Responsiveness**:
    - 1-column input stacking on mobile (<640px), comfortable touch padding, viewport-relative heights (`100dvh`), and zero horizontal overflow across 360px–1440px viewports.
- **Invariants Preserved**:
  - 3 mandatory fields strictly maintained (Full Name, Mobile Number, Preferred Visit Date).
  - Optional fields strictly maintained (Time Slot, Location, Budget, Email, Notes).
  - Zero Buy/Rent or Configuration selectors.
  - Zero project/developer ID requirements (generic enquiry).
  - Standalone route outside `PublicShell`: NO GlobalHeader, NO GlobalFooter, NO Tara assistant, NO automatic advisory popup.
  - Zero modifications to backend schema, Prisma, APIs, or database models.
  - Zero Git commits or pushes.

---

## Phase 69: Standalone Property Enquiry UI Final Visual Refinement (`/enquiry`) (Phase 6)
- **Visual & Architectural Refinements (`frontend/src/pages/EnquiryPage.tsx`, `frontend/src/styles/enquiry.css`)**:
  - Removed the `PROPERTY ENQUIRY` eyebrow above the main heading.
  - Added a restrained, subtle brass architectural accent line (`38px × 2px`, `var(--color-brass, #A99168)`) above the main heading and in the success confirmation view.
  - Refined the introductory typography hierarchy:
    - Primary Heading: `Find Your Next Address` in Playfair Display serif (`2.375rem` desktop, `1.875rem` mobile, line-height 1.18).
    - Subtitle: `"Tell us what you're looking for. We'll take care of the rest."`
    - Supporting line: `"A few details help us prepare the right options for you."`
  - Refined Section Titles (`YOUR DETAILS`, `WHEN WOULD YOU LIKE TO VISIT?`) with uppercase modern sans-serif, letter-spacing `0.12em`, and an extending horizontal divider line (`#E2DCCE`).
  - Refined Form Surface: Warm ivory `#FDFDFB`, crisp warm stone border `#E5DFD5`, refined elevation shadow, and comfortable max-width `580px`.
  - Refined Form Controls: Generous 52–58px input touch heights, warm stone borders (`#D4CCBD`), and focus rings (`1.5px #112821`).
  - Refined Time Slot Selection Cards: 2-line cards with clear time range labels (`Morning` / `10 AM – 1 PM`, `Afternoon` / `1 PM – 5 PM`, `Evening` / `5 PM – 8 PM`), deep forest active state, and responsive side-by-side layout on mobile (`52px` min-height).
  - Refined CTA Button: Solid full-width deep forest (`#112821`), hover elevation, and touch target `54px` (`Request a Visit →`).
  - Mobile responsiveness verified across 360px, 375px, 390px, and 430px viewports with zero horizontal overflow.
- **Invariants Preserved**:
  - Mandatory fields remain strictly: Full Name, Mobile Number, Preferred Visit Date (`visitDate`).
  - Optional fields remain strictly: Time Slot (`visitTime`), Location, Budget, Email, Notes.
  - Standalone route outside `PublicShell` (no header/footer/Tara/advisory popups).
  - Zero modifications to backend, Prisma, database schema, or APIs.
  - Zero Git commits or pushes.

---

## Phase 70: Developer Page Contextual Enquiry Sheet Integration
- **Contextual Enquiry Sheet Reuse (`DeveloperHero.tsx`, `DeveloperPage.tsx`)**:
  - Connected the primary hero CTA on Developer Profile pages (`/:developerSlug`) to open the shared `ContextualEnquiryModal` sheet.
  - Updated hero CTA wording to `"Enquire About {developer.name} →"`.
  - Configured modal invocation with `contextType="developer"`, `entityName={developer.name}`, `developerName={developer.name}`, `developerId={developer.id}`, and `initialIntent="REQUEST_CALLBACK"`.
  - Maintained keyboard focus restoration via `enquiryTriggerRef`, backdrop click dismiss, and Escape key listener.
- **In-Page Lead Form Preserved (`DeveloperLeadSection.tsx`)**:
  - Kept the existing in-page developer enquiry section fully functional at the bottom of the page.
- **Invariants Preserved**:
  - Zero new database models, migrations, or schema changes.
  - Reused existing `createLead()` API client and backend lead controller.
  - Zero modifications to project enquiry flows, Tara assistant, or admin portals.
  - Zero Git commits or pushes.

---

## Phase 71: PWA Admin Launch Hardening & Route Verification
- **PWA Manifest & Launch Architecture Verification (`frontend/public/manifest.webmanifest`, `frontend/public/sw.js`, `frontend/src/pwa/registerServiceWorker.ts`)**:
  - Verified `start_url: "/admin"` in `manifest.webmanifest` ensuring device/app launcher visits open directly at `/admin`.
  - Verified `scope: "/admin"` in `manifest.webmanifest` and `registerServiceWorker.ts` ensuring the PWA scope is appropriately scoped to internal administrative workspaces.
  - Verified `sw.js` intercepts navigation requests exclusively for admin paths (`isAdminPath`), leaving normal browser public website visits (`/`, `/:developerSlug`, `/search`, etc.) completely untouched by service worker navigation handlers.
  - Verified `ProtectedRoute` behavior: unauthenticated PWA launches redirect seamlessly to `/admin/login` preserving the return route, while authenticated sessions land immediately on `/admin` (Admin Dashboard).
- **Invariants Preserved**:
  - Normal browser visits to `/` continue to render the public homepage without redirection.
  - Zero authentication bypasses or weakening introduced.
  - Zero modifications to backend or database.
  - Zero Git commits or pushes.

---

## Phase 72: Admin Login Autofill & Example Account Exposure Hardening
- **Neutral Placeholder & Autocomplete Semantics Hardening (`frontend/src/pages/admin/AdminLoginPage.tsx`)**:
  - Replaced hardcoded example admin email placeholder `placeholder="admin@example.com"` with standard neutral placeholder `placeholder="name@example.com"`.
  - Verified and preserved standard HTML autocomplete semantics (`autoComplete="email"` for email, `autoComplete="current-password"` for password).
  - Maintained clean initial form state (`useState("")` for email and password).
  - Confirmed password manager compatibility is preserved without employing non-standard `autocomplete="off"` or `autocomplete="new-password"` workarounds.
- **Invariants Preserved**:
  - Zero modifications to login styling, layouts, error handling, redirect flows, or auth contexts.
  - Zero modifications to backend authentication controllers, JWT tokens, Prisma schemas, or database models.
  - Zero hardcoded credentials stored in client bundle.
  - Zero Git commits or pushes.

---

## Phase 73: Admin UI Layout Audit & Structural Hardening
- **Projects Row Grid Realignment (`frontend/src/styles/admin/projects.css`, `frontend/src/pages/admin/ProjectsPage.tsx`)**:
  - Fixed severe grid column mismatch where `.admin-project-row` had 5 CSS grid columns for 3 JSX children, eliminating ghost blank columns and restoring generous horizontal room for project identity, developer attribution, and location details.
  - Added responsive breakpoints (`@media (max-width: 900px)` and `@media (max-width: 640px)`) allowing metadata and action groups to wrap cleanly without horizontal overflow.
- **Available Rental Properties Card Architecture (`frontend/src/styles/admin/admin.css`, `frontend/src/pages/admin/RentalAvailablePage.tsx`)**:
  - Introduced dedicated `.admin-property-card` responsive layout with 4 curated content columns (Contact, Property Details, Location, Status/Date) and a distinct actions bar.
  - Replaced legacy 8-column unaligned lead grid with clear visual hierarchy, eliminating disjointed button placement and empty column voids.
- **Admin Headings & Text Wrapping Polish (`frontend/src/pages/admin/VisitsPage.tsx`, `frontend/src/pages/admin/RentalEnquiriesPage.tsx`, `frontend/src/styles/admin/admin.css`)**:
  - Replaced `.admin-page-header` with shared `.admin-page-heading` on Visits page and stripped redundant inline styles.
  - Enforced `min-width: 0` and `overflow-wrap: anywhere` across admin lead and table cells to prevent long names, emails, and slugs from causing layout distortion.
- **Invariants Preserved**:
  - Zero modifications to backend, API clients, database models, or authentication guards.
  - Preserved all CRUD operations, modals, filter triggers, and communication actions.
  - Zero Git commits or pushes.

---

## Phase 74: Admin Projects Layout Overhaul & Full Admin UI Audit
- **Admin Projects Operational Card Architecture (`frontend/src/styles/admin/projects.css`, `frontend/src/pages/admin/ProjectsPage.tsx`)**:
  - Replaced stretched table rows with structured `.admin-project-card` operational containers dividing content into three distinct visual regions:
    - **Area A (Identity & Metadata)**: Project name with prominent typography, inline publication/lifecycle status badges, developer name, location slug, and configurations count summary.
    - **Area B (Operational Status Metrics)**: Dedicated status display showing Lifecycle (`UNDER_CONSTRUCTION`, `READY_TO_MOVE`, etc.) and Publication (`PUBLISHED` vs `DRAFT`) with semantic indicator badges.
    - **Area C (Action Bar)**: Direct inline status toggles (Deactivate/Activate) and the primary "Open Workspace" navigation link.
  - Responsive layout adapts from side-by-side flex split on desktop ($\ge 1024\text{px}$) to stacked operational sections on tablet ($768\text{px}$) and single-column full-width touch cards on mobile ($\le 600\text{px}$).
- **Full Admin UI Audit & Hardening**:
  - Audited all admin pages: Dashboard, Projects, Developers, Leads, Visits, Available Properties, Rental Enquiries, Media, Configurations, Project Workspace, Accounts, Firm Profile, Contact, and Import.
  - Hardened text-wrapping and responsive flex containers across all list items using `min-width: 0`, `overflow-wrap: anywhere`, and semantic design tokens.
  - Standardized `.admin-page-heading` typography, spacing, and action-bar alignment across all views.
  - Guaranteed zero horizontal overflow across 320px, 375px, 430px, 768px, 1024px, 1280px, and 1440px viewports.
- **Invariants Preserved**:
  - Zero modifications to backend routes, controllers, services, repositories, or Prisma schemas.
  - Zero modifications to authentication logic, JWT handling, or route protection.
  - Zero modifications to public pages, Tara discovery assistant, or public enquiry flows.
  - Zero fake data or unsupported media fields introduced.
---

## Phase 75: Admin Property Visit CRUD & Operational Lifecycle
- **Unified Lead-Based Visit Architecture (`Lead.visitDate IS NOT NULL`)**:
  - Implemented complete CRUD capabilities directly on the authenticated Visits workspace (`/admin/visits`) without introducing a separate Visit database table or schema migrations.
  - Sourced all visits from the authoritative `Lead` model where `visitDate` is populated, ensuring client history, triage notes, and communication workflows remain completely unified across `/admin/leads` and `/admin/visits`.
- **Backend Admin Visit Endpoints (`backend/src/routes/admin/visit.routes.ts`, `backend/src/controllers/admin/lead.controller.ts`, `backend/src/services/lead.service.ts`)**:
  - Mounted RESTful admin endpoints under `/api/admin/visits` protected by `requireAdminAuthentication`:
    - `GET /api/admin/visits`: Returns operational triage projection partitioned into `{ today, upcoming, past }` with time-slot ranking (`Morning` $\rightarrow$ `Afternoon` $\rightarrow$ `Evening` $\rightarrow$ unspecified).
    - `POST /api/admin/visits`: Validates and creates a manual property visit (`name`, `phone`, `visitDate`, optional context & notes).
    - `GET /api/admin/visits/:id`: Retrieves single visit by ID.
    - `PATCH /api/admin/visits/:id`: Updates visit schedule, time slot, property context, status, and internal triage notes (setting `visitDate: null` and `visitTime: null` cancels the visit schedule while safely preserving the customer Lead record).
    - `DELETE /api/admin/visits/:id`: Permanently deletes the underlying Lead record with confirmation.
- **Frontend Visit Management Workspace (`frontend/src/pages/admin/VisitsPage.tsx`, `VisitModal.tsx`, `CancelVisitModal.tsx`)**:
  - Added **`+ Add Visit`** action button and operational filter tabs (`All`, `Today`, `Upcoming`, `Past`).
  - Created **`VisitModal`** with full cascading property context resolution (`Developer` $\rightarrow$ `Project` $\rightarrow$ `Configuration`), validated date picker (`YYYY-MM-DD`), time-slot selection, and status assignment.
  - Created **`CancelVisitModal`** offering explicit choice between "Cancel Schedule Only" (preserves Lead record) and "Permanent Delete".
  - Maintained instant Call & WhatsApp actions (`LeadActions`) and deep links to Lead Manager.
- **Invariants Preserved**:
  - Zero database schema migrations or breaking changes.
  - 100% backward compatibility for all public enquiry and schedule-a-visit flows.
  - Zero Git commits or pushes.

---

## Phase 76: Cloudinary Media Delivery Optimization (Phase 1 & Phase 2)
- **Delivery-Time Transformation Engine (`frontend/src/utils/image.ts`)**:
  - Built `getOptimizedImageUrl(url, options?)` to dynamically inject Cloudinary URL parameters at frontend render time.
  - Safely ignores non-Cloudinary URLs, SVG vector assets (preserving lossless scalability), `/video/upload/`, `/raw/upload/` (PDFs/brochures), and already-transformed URLs.
- **Phase 1: Automatic Format & Perceptual Quality (`f_auto,q_auto`)**:
  - Injected `/f_auto,q_auto/` across all public presentation components, enabling modern format negotiation (WebP/AVIF) and quality compression directly from Cloudinary CDN edge.
- **Phase 2: Targeted Width Delivery (`w_...,c_limit`)**:
  - Applied explicit width bounds with `c_limit` (preserving aspect ratios with zero crop or CSS layout distortion) to high-impact, low-risk card and thumbnail contexts:
    - **Project & Developer Cards (`w_800,c_limit`)**: `FeaturedProjectCard.tsx`, `ProjectCard.tsx`, `ExploreDevelopers.tsx` (brand banners), `DeveloperProjects.tsx` (portfolio cards).
    - **Modal Thumbnails (`w_200,c_limit`)**: `TapToExploreGallery.tsx` (bottom strip thumbnail buttons) and `ContextualEnquiryModal.tsx` (compact project context preview).
    - **In-Page Location Map (`w_1200,c_limit`)**: `ProjectLocation.tsx` (in-page map preview, while Lightbox modal retains unconstrained `f_auto,q_auto`).
- **High-Detail Quality Preservation**:
  - Full-bleed heroes (`ProjectHero`, `DeveloperHero`, `AtmosphericHero`), lightboxes (`ProjectImageLightbox`, gallery modal stage, location map modal), full-size gallery views, and configuration floor plans intentionally remain unconstrained on `f_auto,q_auto` to ensure zoom inspection and blueprint clarity are preserved.
- **Invariants Preserved**:
  - Original Cloudinary assets stored in the cloud remain untouched.
  - Database schema and PostgreSQL `Media.url` remain unchanged (raw source URLs preserved).
  - Backend models, routes, services, and repositories are completely unmodified.
  - Zero changes to CSS, layouts, image containers, aspect ratios, or responsive breakpoints.
  - Optimization is purely additive, delivery-only on the client side.
  - Zero Git commits or pushes.

---

## Phase 77: Admin Lead Ownership & Creator Foundation (Step 1)
- **Database Model Extension (`backend/prisma/schema.prisma`)**:
  - Extended `Lead` model with `createdById` (nullable UUID string with foreign key to `Admin.id` on delete set null) and `ownerId` (nullable UUID string with foreign key to `Admin.id` on delete set null).
  - Extended `Admin` model with `createdLeads` (`@relation("LeadCreatedBy")`) and `ownedLeads` (`@relation("LeadOwner")`).
  - Added database indexes: `@@index([createdById])` and `@@index([ownerId])`.
- **Database Migration & Deterministic Backfill (`backend/prisma/migrations/20260919200000_add_lead_ownership_fields/migration.sql`)**:
  - Added `createdById` and `ownerId` columns, foreign key constraints, and performance indexes to PostgreSQL `Lead` table.
  - Executed safe deterministic backfill setting `ownerId` of all pre-existing leads to the active Founder administrator (`role = 'FOUNDER' AND isActive = true`).
- **Domain & Service Layer Foundation (`backend/src/services/lead.service.ts`, `backend/src/repositories/lead.repository.ts`, `backend/src/repositories/admin.repository.ts`)**:
  - Added `findFounder()` query helper in `AdminRepository` to retrieve the primary active Founder admin.
  - Updated `LeadRepository` select projection to include `createdById`, `ownerId`, `createdBy`, and `owner`.
  - Updated `createLead()` (public/organic lead capture): server-side assigns `createdById = null` and `ownerId = founder.id`.
  - Updated `createAdminLead()` (authenticated admin lead creation): server-side extracts `actorAdminId` from authenticated JWT context, setting `createdById = actorAdminId` and `ownerId = actorAdminId`.
  - Prepared `LeadRepository.findMany()` with optional `ownerId` and `createdById` query filters for clean operational boundary queries.
- **Security & Validation Boundaries (`backend/src/validators/lead.validator.ts`)**:
  - Verified `hasOnlyFields` strictly disallows `ownerId` and `createdById` in public submissions, admin creation payloads, and admin updates (rejecting payload tampering with HTTP 400).
- **Invariants Preserved**:
  - Zero UI, dashboard, navigation, or role permission changes (Step 1 foundation only).
  - Visits and Rental domains untouched.
  - All existing leads preserved with Founder ownership backfill.
  - Zero Git commits or pushes.

---

## Phase 78: Server-Side Lead Authorization & Founder Reassignment (Step 2)
- **Role-Based Authorization Enforcement (`backend/src/services/lead.service.ts`)**:
  - **Founder (`role = 'FOUNDER'`)**:
    - Full visibility: lists all leads across all owners (`GET /api/admin/leads`).
    - Filter capability: can filter by `ownerId` or `createdById` through query parameters.
    - Global lead retrieval: can read any lead by ID (`GET /api/admin/leads/:id`).
    - Global lead modification: can update any lead (`PATCH /api/admin/leads/:id`).
    - Global lead deletion: can delete any lead (`DELETE /api/admin/leads/:id`).
    - Exclusive reassignment authority: can reassign lead ownership to any active administrator (`PATCH /api/admin/leads/:id/owner`).
  - **Employee (`role = 'EMPLOYEE'`)**:
    - Scoped visibility: listing leads automatically enforces `ownerId === authenticatedEmployee.id`. Any query attempt to override `ownerId` is strictly ignored/overridden.
    - Scoped retrieval: attempting to read a lead owned by Founder or another employee throws `LeadServiceError("FORBIDDEN", 403, "Access to this lead is forbidden")`.
    - Scoped modification: attempting to update an unowned lead returns HTTP 403 Forbidden.
    - Scoped deletion: attempting to delete an unowned lead returns HTTP 403 Forbidden.
    - Reassignment prohibited: attempting to call `PATCH /api/admin/leads/:id/owner` throws `LeadServiceError("FORBIDDEN", 403, "Only Founder can reassign lead ownership")`.
- **Founder-Only Lead Reassignment Endpoint (`PATCH /api/admin/leads/:id/owner`)**:
  - Mounted route: `PATCH /api/admin/leads/:id/owner` with `requireAdminAuthentication`, `validateLeadId`, `validateReassignLeadOwner`, and `reassignLeadOwnerController`.
  - Validator `validateReassignLeadOwner`: ensures request body strictly contains only `{ "ownerId": "<target-admin-id>" }`.
  - Service `reassignLeadOwner`:
    - Checks actor is `FOUNDER` (rejects with 403 otherwise).
    - Verifies target administrator exists in the database and is active (`isActive === true`) (rejects inactive or non-existent admins with 400 `INVALID_LEAD_REQUEST`).
    - Updates `ownerId` only; `createdById` remains strictly immutable.
- **Controller & Middleware Context Passing (`backend/src/controllers/admin/lead.controller.ts`)**:
  - All admin lead controllers (`listLeadsController`, `getLeadController`, `createAdminLeadController`, `updateLeadController`, `deleteLeadController`, `reassignLeadOwnerController`) pass authenticated `res.locals.admin` to the service layer.
- **Verification & Test Coverage (`backend/src/scripts/lead-authorization-verification.ts`)**:
  - Built comprehensive 22-test automated verification suite verifying all Founder and Employee authorization, boundary enforcement, query protection, and reassignment rules. (22/22 PASSED).
- **Invariants Preserved**:
  - No frontend navigation or dashboard changes yet.
  - Visits and Rentals RBAC untouched.
  - Zero Git commits or pushes.

---

## Phase 79: Visit Authorization & Employee Access (Step 3)
- **Architectural Invariant**:
  - Visits are strictly an operational projection of `Lead` where `visitDate IS NOT NULL` rather than an independent database entity.
  - Zero separate Visit ownership fields or tables were added (`Lead.ownerId` is the single source of truth).
- **Role-Based Visit Authorization Enforcement (`backend/src/services/lead.service.ts`, `backend/src/repositories/lead.repository.ts`, `backend/src/controllers/admin/lead.controller.ts`)**:
  - **Founder (`role = 'FOUNDER'`)**:
    - Complete operational visibility: `GET /api/admin/visits` lists all scheduled visits across all owners and team members.
    - Global visit retrieval: `GET /api/admin/visits/:id` can read any scheduled visit.
    - Global visit modification: `PATCH /api/admin/visits/:id` can update visit details, reschedule, or cancel visit schedules (`visitDate: null, visitTime: null`) across any lead.
    - Global visit deletion: `DELETE /api/admin/visits/:id` can delete any visit/lead.
  - **Employee (`role = 'EMPLOYEE'`)**:
    - Scoped operational visibility: `GET /api/admin/visits` automatically scopes queries to `where: { visitDate: { not: null }, ownerId: authenticatedEmployee.id }`.
    - Scoped retrieval: `GET /api/admin/visits/:id` returns 200 OK for owned visits, and 403 Forbidden (`FORBIDDEN`) when attempting to access a visit owned by the Founder or another Employee.
    - Scoped modification: `PATCH /api/admin/visits/:id` allows updating/rescheduling/cancelling owned visits, and rejects unowned visits with HTTP 403 Forbidden.
    - Scoped deletion: `DELETE /api/admin/visits/:id` allows deleting owned visits, and rejects unowned visits with HTTP 403 Forbidden.
  - **Dynamic Access Delegation via Lead Reassignment**:
    - Reassigning a `Lead` (`PATCH /api/admin/leads/:id/owner`) instantly and automatically reassigns visit operational access without touching any visit fields.
- **Verification & Test Coverage (`backend/src/scripts/visit-authorization-verification.ts`)**:
  - Built comprehensive 20-test automated verification suite verifying Founder and Employee visit listing, scoping, retrieval, scheduling, cancellation, deletion, date filters (today, upcoming, past), general enquiry visits, dynamic reassignment handoff, and schema cleanliness. (20/20 PASSED).
- **Invariants Preserved**:
  - No changes to Rental Enquiries, Rental Available Properties, employee navigation, dashboard redesign, JWT/auth architecture, public website, or Tara.
  - Zero Git commits or pushes.

---

## Phase 80: Employee/Founder Admin Access Boundary (Step 5)
- **Role-Aware Admin Navigation (`frontend/src/components/admin/AdminLayout.tsx`)**:
  - `EMPLOYEE` role visible items strictly scoped to:
    - Dashboard (`/admin`)
    - Leads (`/admin/leads`)
    - Visits (`/admin/visits`)
    - Rentals (`/admin/rentals/enquiries` and `/admin/rentals/available`)
    - Direct Logout button
  - Founder-only navigation sections and menus (Projects, Developers, Configurations, Media, Import, Firm Profile, Contact Info, Accounts) completely hidden from Employee sidebar and mobile drawer.
  - `FOUNDER` role retains full navigation across all administrative workspaces.
- **Frontend Route Protection (`frontend/src/auth/ProtectedRoute.tsx`, `frontend/src/router/AppRouter.tsx`)**:
  - `FounderRoute` updated to redirect non-founder authenticated users directly to `/admin` (`<Navigate to="/admin" replace />`).
  - Wrapped all Founder-only administrative route branches with `<FounderRoute>`:
    - `/admin/developers`, `/admin/developers/new`, `/admin/developers/:id`
    - `/admin/projects`, `/admin/projects/new`, `/admin/projects/:id`
    - `/admin/projects/:projectId/configurations`, `/admin/projects/:projectId/configurations/new`, `/admin/configurations/:id`
    - `/admin/import`
    - `/admin/media`, `/admin/projects/:projectId/media`, `/admin/configurations/:configurationId/media`
    - `/admin/contact`
    - `/admin/firm-profile`
    - `/admin/accounts`, `/admin/accounts/new`
- **Backend Route Authorization (`backend/src/middleware/auth.middleware.ts`, `backend/src/routes/admin/*.ts`)**:
  - Enforced `requireFounderAuthentication` / `requireFounder` across all Founder-only routers:
    - `backend/src/routes/admin/developer.routes.ts`
    - `backend/src/routes/admin/project.routes.ts`
    - `backend/src/routes/admin/configuration.routes.ts` (`projectRouter` and `configurationRouter`)
    - `backend/src/routes/admin/amenity.routes.ts`
    - `backend/src/routes/admin/highlight.routes.ts`
    - `backend/src/routes/admin/media.routes.ts`
    - `backend/src/routes/admin/import.routes.ts`
    - `backend/src/routes/admin/firm-profile.routes.ts`
    - `backend/src/routes/admin/contact.routes.ts`
  - Rejects Employee requests on Founder-only endpoints with HTTP 403 Forbidden (`{ error: { code: "FORBIDDEN", message: "Founder privileges required" } }`).
  - Unauthenticated requests continue to be rejected with HTTP 401 Unauthorized.
- **Operational Workspace & Dashboard Gracefulness**:
  - `AdminDashboardPage`: Conditionally fetches project metrics only for `FOUNDER`; hides the `Active Projects` KPI card for `EMPLOYEE` without throwing 403 errors.
  - `LeadFormPage` & `VisitModal`: Gracefully handle developer/project select dropdown fetching with `.catch(() => ({ data: [] }))`, ensuring employees can create/manage leads and visits seamlessly.
  - Operational permissions preserved:
    - Leads: Founder (all), Employee (own).
    - Visits: Founder (all), Employee (own).
    - Rental Enquiries: Shared operational queue.
    - Rental Available Properties: Shared operational queue.
- **Verification & Test Coverage**:
  - Ran comprehensive automated HTTP endpoint role boundary suite verifying 401 unauthenticated, 403 employee on founder endpoints, 200 founder on all, 200 employee on operational endpoints. All checks passed.
  - Re-verified Lead authorization suite (22/22 PASSED) and Visit authorization suite (20/20 PASSED).
- **Invariants Preserved**:
  - Zero changes to database schema or Lead/Visit ownership logic.
  - Zero changes to public website, SEO routes, or Tara assistant.
  - Zero Git commits or pushes.

---

## Phase 81: Role-Aware Admin Dashboard Implementation
- **Unified Backend Dashboard API (`backend/src/services/dashboard.service.ts`, `backend/src/controllers/admin/dashboard.controller.ts`, `backend/src/routes/admin/dashboard.routes.ts`)**:
  - Mounted endpoint: `GET /api/admin/dashboard` protected with `requireAdminAuthentication`.
  - Authoritative scoping derived purely from `res.locals.admin` (no client override query parameters accepted).
  - **Founder Scope (`role = 'FOUNDER'`)**:
    - Organization-wide metrics: `totalLeads`, `newLeads`, `todayVisits` (all scheduled visits for today), `inProgress`, and `activeProjects` (published projects count).
    - Pipeline summary: organization-wide status count breakdown (`NEW`, `IN_PROGRESS`, `DONE`).
    - Today's visits: all scheduled visits across the entire organization today, sorted by time slot and creation date.
    - Recent leads: latest organization leads across all owners.
    - Shared rental operations: total `enquiryCount` and `availablePropertyCount`.
  - **Employee Scope (`role = 'EMPLOYEE'`)**:
    - Personal workload metrics: `myLeads`, `newLeads` (owned), `todayVisits` (owned visits today), `inProgress` (owned).
    - Pipeline summary: owner-scoped status count breakdown.
    - Today's visits: scheduled visits strictly for leads where `ownerId === authenticatedEmployee.id`.
    - Recent leads: latest leads strictly where `ownerId === authenticatedEmployee.id`.
    - Shared rental operations: identical shared `enquiryCount` and `availablePropertyCount`.
- **Frontend Dashboard Architecture (`frontend/src/api/admin-dashboard.ts`, `frontend/src/types/admin-dashboard.ts`, `frontend/src/pages/admin/AdminDashboardPage.tsx`)**:
  - Replaced multi-request dashboard fetching with single `getAdminDashboard()` call.
  - **Contextual Greeting**: Time-of-day greeting with authenticated user's name (`Good morning, <Name>` / `Good afternoon, <Name>` / `Good evening, <Name>`). Subtitle dynamically reads:
    - Founder: `"Here's what's happening across your workspace."`
    - Employee: `"Here's what needs your attention."`
  - **Operational Sections**:
    - **KPI Row**: Displays role-appropriate cards (Total Leads vs My Leads, New Leads, Today's Visits vs My Visits Today, In Progress, Active Projects for Founder).
    - **Lead Pipeline Summary**: Visual count cards for `New`, `In Progress`, and `Done` with status accents.
    - **Today's Scheduled Visits**: Time pill, Customer Name, Phone, Project context or `General Enquiry`, status badge, authentic creator attribution (`[ Created by <Name> ]` / `[ Created Organically ]`), WhatsApp/Call shortcuts, and Lead view link.
    - **Recent Leads**: Customer Name, Project / `General Enquiry`, status badge, creator tag, relative timestamp, and contact shortcuts.
    - **Shared Rental Operations**: Dual operational cards for Seeker Demand (`Rental Enquiries`) and Landlord Supply (`Available Properties`) with direct navigation links.
    - **Explicit Empty States**: `"No visits scheduled for today."`, `"No leads assigned to you yet."`.
- **CSS Styling (`frontend/src/styles/admin/dashboard.css`)**:
  - Restrained, scannable layout honoring the dark forest / sand architectural design tokens.
  - Mobile, tablet, and desktop responsive flex/grid layouts with zero horizontal overflow.
- **Verification & Test Coverage (`backend/src/scripts/dashboard-role-verification.ts`)**:
  - Verified 401 unauthenticated protection.
  - Verified Founder org-wide metrics, visits, leads, active projects, and shared rentals.
  - Verified Employee personal workload metrics, visits, leads, and shared rentals.
  - Verified critical Creator vs Owner scenario: Lead created by Employee A but owned by Employee B appears strictly in Employee B's dashboard metrics/leads/visits with creator tag `"Created by Employee A"`.
  - Re-verified Lead authorization suite (22/22 PASSED) and Visit authorization suite (20/20 PASSED).
- **Invariants Preserved**:
  - `Lead.ownerId` controls operational visibility; `Lead.createdBy` is historical attribution only.
  - Rental Enquiries and Rental Available Properties remain shared operational queues.
  - No database schema alterations or migrations needed.
  - Zero changes to public website, SEO routes, or Tara assistant.
  - Zero Git commits or pushes.

---

## Phase 82: Founder Lead Reassignment UI (Step 7)
- **Lead Detail Owner Presentation (`frontend/src/pages/admin/LeadDetailPage.tsx`)**:
  - Added dedicated Owner display near the Creator attribution:
    - Creator: `[ Created by <Name> ]` / `[ Created Organically ]`
    - Owner: `<Owner Name>` / `<Owner Email>` / `Founder`
  - **Founder-Only Change Owner Action**: Renders `[ Change Owner ]` button conditionally only when `admin?.role === "FOUNDER"`. Hidden completely for Employees.
- **Change Owner Modal Component (`frontend/src/components/admin/ReassignLeadOwnerModal.tsx`)**:
  - Modal fetching active administrators from `getAdminAccounts()`.
  - Displays current owner preview and a responsive radio selection list of active administrators with name, role badge (`FOUNDER` / `EMPLOYEE`), and email.
  - Submits reassignment to `PATCH /api/admin/leads/:id/owner` via `reassignLeadOwner()` in `frontend/src/api/admin-leads.ts`.
  - Error handling: Graceful error messages on failures (403 forbidden, 400 invalid/inactive admin).
  - State & Lifecycle: Resets submitting state, closes on Escape or backdrop click, updates lead state immediately on success without full-page reloads.
- **Creator vs Owner Invariant Preserved**:
  - `createdById` and `createdBy` remain immutable when ownership changes.
  - Scheduled Visits dynamically inherit new ownership via `Lead.ownerId`.
- **Verification & Test Coverage**:
  - Re-verified Lead authorization suite (`22/22 PASSED`).
  - Re-verified Visit authorization suite (`20/20 PASSED`).
  - Re-verified Role-aware Dashboard verification suite (`5/5 PASSED`).
  - Backend and frontend `npm run build` passed with zero errors.
- **Invariants Preserved**:
  - Zero changes to database schema or Visit data structure.
  - Zero changes to public website, SEO routes, or Tara assistant.
  - Zero Git commits or pushes.

---

## Phase 83: Final RBAC Audit, Verification & Hardening (Step 8)
- **Comprehensive RBAC & Security Audit**:
  - **Ownership Model**: Verified immutable `createdById` (historical creator) and mutable `ownerId` (responsible owner) on PostgreSQL `Lead` model. Clients cannot inject ownership fields during creation/update (rejected with 400).
  - **Lead Authorization**: Verified Founder org-wide visibility and CRUD, Employee own-record isolation (read/update/delete blocked with 403 on unowned leads).
  - **Lead Reassignment**: Verified `PATCH /api/admin/leads/:id/owner` is Founder-only (`requireFounderAuthentication`). Reassignment dynamically updates `ownerId` while preserving `createdById`.
  - **Visit Authorization**: Verified Visits inherit Lead ownership without duplicate `Visit.ownerId` fields. Reassignment dynamically reassigns visit operational visibility.
  - **Creator Attribution**: Verified authentic creator attribution tags (`[ Created Organically ]` / `[ Created by <Name> ]`) across Leads, Visits, and Rental Enquiries.
  - **Dashboard Scoping**: Verified `GET /api/admin/dashboard` derives identity server-side; Founder receives organization metrics, Employee receives personal workload metrics.
  - **Founder-Only Route Boundary**: Verified `requireFounderAuthentication` protection on Developers, Projects, Configurations, Amenities, Highlights, Media, Import, Firm Profile, Contact, and Accounts APIs.
  - **Frontend Role Boundaries**: Verified Employee navigation isolation and `<FounderRoute>` protection on all Founder pages.
  - **Shared Rental Operations**: Verified Rental Enquiries and Rental Available Properties remain shared operational queues without owner filtering or reassignment.
  - **Bypass & IDOR Testing**: Verified URL, query parameter, and payload tampering attempts are rejected with 403/400.
---

## Phase 84: Location V1 — Step 1: Backend Location Snapshot Foundation
- **Database Schema & Migration (`backend/prisma/schema.prisma`)**:
  - Added nullable snapshot fields to `Admin` model:
    - `lastLatitude Float?`
    - `lastLongitude Float?`
    - `lastLocationAt DateTime?`
  - Created and deployed migration `20260920150000_add_admin_location_snapshot_fields` to PostgreSQL via `npx prisma migrate deploy`.
  - Regenerated Prisma Client 7.9.1.
- **Backend Location Snapshot Infrastructure**:
  - **Repository Layer (`backend/src/repositories/admin.repository.ts`)**:
    - `updateLocation(adminId, latitude, longitude, lastLocationAt)`: updates latest coordinates and server timestamp for the authenticated admin.
    - `findAllActiveLocations()`: retrieves all active administrators with `id`, `name`, `email`, `role`, `lastLatitude`, `lastLongitude`, and `lastLocationAt` (omits password hashes and secrets).
  - **Validation Layer (`backend/src/validators/location.validator.ts`)**:
    - `validateLocationUpdate(body)`: verifies `latitude` and `longitude` are valid finite numbers with $-90 \le \text{latitude} \le 90$ and $-180 \le \text{longitude} \le 180$.
    - Rejects any client-supplied identity, ownership, or timestamp parameters (`adminId`, `userId`, `ownerId`, `lastLocationAt`) with 400 Bad Request (`INVALID_LOCATION_REQUEST`).
  - **Controller Layer (`backend/src/controllers/admin/location.controller.ts`)**:
    - `updateLocationController`: updates location for `req.admin.id` and sets server-generated timestamp `new Date()`.
    - `getLocationsController`: returns active administrators with their location snapshot data.
  - **Route & App Mounting (`backend/src/routes/admin/location.routes.ts`, `backend/src/app.ts`)**:
    - Mounted `POST /api/admin/location`: authenticated admin self-update (`requireAdminAuthentication`).
    - Mounted `GET /api/admin/locations`: Founder-only multi-admin view (`requireFounderAuthentication`).
    - Added `INVALID_LOCATION_REQUEST` error mapping to HTTP 400.
- **Verification Suites & Automated Tests**:
  - Location Snapshot verification suite (`location-snapshot-verification.ts`): 14/14 PASSED (100%).
  - Lead authorization suite (`lead-authorization-verification.ts`): 22/22 PASSED.
  - Visit authorization suite (`visit-authorization-verification.ts`): 20/20 PASSED.
  - Dashboard role verification (`dashboard-role-verification.ts`): 5/5 PASSED.
  - Lead ownership verification (`lead-ownership-verification.ts`): 7/7 PASSED.
  - Security test suite (`security-verification.ts`): 15/15 PASSED.
  - Static typechecking & production builds: Backend `npm run build` and Frontend `npm run build` completed with zero errors.
  - Whitespace & format check: `git diff --check` clean.
- **Invariants Preserved**:
  - Zero frontend location modal, geolocation, maps, background tracking, polling, or history tables created.
  - Single latest snapshot model stored directly on `Admin`.
  - Zero Git commits or pushes.

---

## Phase 85: Location V1 — Step 2: Employee Location Permission & First Snapshot
- **Frontend Location API Client (`frontend/src/api/admin-location.ts`)**:
  - Created `updateAdminLocation({ latitude, longitude })` sending coordinates via `adminRequest("/admin/location")`.
  - Uses existing Bearer token authentication from `auth-storage.ts`.
  - Sends only `latitude` and `longitude`; does not send `adminId`, `userId`, or timestamp.
- **Location Permission Modal Component (`frontend/src/components/admin/LocationPermissionModal.tsx`)**:
  - Restrained, non-blocking admin modal dialog adhering to warm architectural design system tokens (`#18382E`, `#68706A`, `#202622`).
  - Clear copy: Eyebrow `"LOCATION ACCESS"`, Heading `"Keep your workspace location updated"`, Body `"Allow location access so your workspace can keep your latest known location updated."`, Subtitle `"Only your latest location and update time are saved."`.
  - Actions: Primary `[ Allow Location Access ]`, Secondary `[ Not Now ]`.
  - Accessible dialog (`role="dialog"`, `aria-modal="true"`, Escape key dismiss, backdrop dismiss).
  - No map, no coordinates, no intrusive styling.
- **Location Lifecycle Hook (`frontend/src/hooks/useAdminLocationInitializer.ts`)**:
  - Coordinates first authenticated location capture on app mount.
  - Protected against React re-renders, route changes, and StrictMode double-invocations using session flag `hasAttemptedLocationThisSession`.
  - Checks `navigator.permissions.query({ name: "geolocation" })` when supported:
    - `granted`: Captures `getCurrentPosition` and uploads snapshot directly without modal.
    - `prompt`: Displays `LocationPermissionModal` before calling browser API.
    - `denied`: Suppresses modal and allows admin workspace to function smoothly.
  - On "Allow" click, calls `navigator.geolocation.getCurrentPosition(...)` and posts coordinates to `POST /api/admin/location`.
  - Graceful error handling for `PERMISSION_DENIED`, `POSITION_UNAVAILABLE`, and `TIMEOUT` with zero UI blocking.
  - Zero coordinates stored in `localStorage` or `sessionStorage`.
- **Admin Layout Integration (`frontend/src/components/admin/AdminLayout.tsx`)**:
  - Integrated `useAdminLocationInitializer` and `LocationPermissionModal` at the authenticated admin shell level.
  - Does not execute for unauthenticated users, public pages, or after logout.
- **Verification Suites & Automated Tests**:
  - Location Snapshot verification suite (`location-snapshot-verification.ts`): 14/14 PASSED.
  - Lead authorization suite (`lead-authorization-verification.ts`): 22/22 PASSED.
  - Visit authorization suite (`visit-authorization-verification.ts`): 20/20 PASSED.
  - Dashboard role verification (`dashboard-role-verification.ts`): 5/5 PASSED.
  - Security test suite (`security-verification.ts`): 15/15 PASSED.
  - Static typechecking & production builds: Backend `npm run build` and Frontend `npm run build` passed with zero errors.
  - Whitespace & format check: `git diff --check` clean.
- **Invariants Preserved**:
  - Zero periodic polling, background tracking, visibility tracking, or location history tables created.
  - Single latest snapshot model stored directly on `Admin`.
  - Zero Git commits or pushes.

---

## Phase 86: Location V1 — Step 3: Founder Employee Locations View
- **Frontend Location API Client (`frontend/src/api/admin-location.ts`)**:
  - Added `getAdminLocations()` returning `AdminLocationsResponse` (`AdminLocationItem[]`) via `adminRequest("/admin/locations")`.
- **Founder-Only Locations Page (`frontend/src/pages/admin/AdminLocationsPage.tsx`)**:
  - Created operational employee locations page mounted at `/admin/locations` under `<FounderRoute>`.
  - Heading: `"Employee Locations"` with supporting subtitle `"View the latest known location reported by each active team member."`.
  - Displays responsive card grid with one card per active administrator:
    - Member name, email, and role badge (`FOUNDER` / `EMPLOYEE`).
    - Location status badge (`Location updated` vs `Location not available`).
    - Human-readable timestamp formatted via `Intl.DateTimeFormat("en-IN")`.
    - Coordinates in 4-decimal precision as secondary technical information.
    - Direct external map action `[ View on Map ↗ ]` linking to `https://www.google.com/maps/search/?api=1&query=<lat>,<lng>` in a new tab (`target="_blank"`, `rel="noopener noreferrer"`).
    - Graceful fallback `[ No location available ]` button when coordinates are absent.
  - Handled loading, empty, and error states gracefully.
- **Admin Navigation Integration (`frontend/src/components/admin/AdminLayout.tsx`)**:
  - Added Founder-only `"Locations"` navigation link to desktop More dropdown and mobile drawer under Management.
  - Completely hidden for Employees.
- **Router Configuration (`frontend/src/router/AppRouter.tsx`)**:
  - Added lazy-loaded route `/admin/locations` wrapped in `<FounderRoute>`.
- **Verification & Test Coverage**:
  - Location Snapshot verification suite (`location-snapshot-verification.ts`): 14/14 PASSED.
  - Lead authorization suite (`lead-authorization-verification.ts`): 22/22 PASSED.
  - Visit authorization suite (`visit-authorization-verification.ts`): 20/20 PASSED.
  - Dashboard role verification (`dashboard-role-verification.ts`): 5/5 PASSED.
  - Security test suite (`security-verification.ts`): 15/15 PASSED.
  - Static typechecking & production builds: Backend `npm run build` and Frontend `npm run build` passed with zero errors.
  - Whitespace & format check: `git diff --check` clean.
- **Invariants Preserved**:
  - Reused existing `GET /api/admin/locations` endpoint without database or backend changes.
  - Zero embedded maps SDK, API keys, reverse geocoding, polling, background tracking, or history tables created.
  - Zero Git commits or pushes.

---

## Phase 87: Homepage Positioning Refinement
- **Clarified Real-Estate Discovery & Property Advisory Positioning**:
  - Replaced architectural studio phrasing with real-estate discovery and consultative property guidance copy across `AtmosphericHero`, `TrustStatisticsStrip`, `FeaturedProjects`, `ExploreDevelopers`, `HomeGallery`, `FirmOverview`, and `ContactAdvisorySection`.
  - Retained verified `20+ Years of Advisory` metric backed by founder profile data.
  - Maintained premium architectural visual identity without structural or layout alterations.
- **SEO & Metadata Updates**:
  - Updated default homepage description and metadata tagline fallbacks in `seo-renderer.service.ts` and `index.html`.
  - Preserved metadata architecture and dynamic site configuration.
- **Invariants Preserved**:
  - Zero CSS, image, layout, route, API, database, authentication, admin, or component structure changes.

---

## Phase 88: Tara Property Discovery Advisor — UX Simplification
- **Removed Buy/Rent Branch from Tara**:
  - Removed Buy vs Rent intent selection screen (`[ Buy a Home ]` / `[ Rent a Home ]`) from Tara's opening state in `SearchAssistant.tsx` and `useSearchChat.ts`.
  - Tara now enters the deterministic property discovery sequence directly upon opening (*"What kind of home are you looking for?"*), operating exclusively as a residential property discovery advisor for homebuyers.
  - Removed unused `getTaraIntentOpeningMessage()`, `DiscoveryIntent`, and `selectIntent` handlers.
- **Invariants Preserved**:
  - Deterministic query builder, adaptive grounding, candidate filtering, project stopping threshold, contextual recovery, undo/reset actions, project cards, configuration deep-links, and `/search` route fully preserved.
  - Public rental routes (`/rentals`, `/rentals/list-property`), rental enquiries, and rental admin workspaces remain 100% functional and isolated.
  - Zero modifications to backend services, databases, CSS styling, or admin portals.

---

## Phase 89: Unified Admin All Leads Read-Layer Projection
- **Read-Layer Aggregation (`backend/src/services/lead.service.ts`)**:
  - Implemented unified read-layer projection combining `Lead` (PROPERTY) and `RentalEnquiry` (RENTAL) records without changing database schema or copying data.
  - Extended `GET /api/admin/leads` to support `type` parameter (`ALL`, `PROPERTY`, `RENTAL`) with fast single-source paths and bounded dual-fetch (`take = skip + limit`) + sort + slice for combined queries.
  - Preserved RBAC boundaries: Founder sees all Property Leads and Rental Enquiries; Employee sees only owned Property Leads (`ownerId === employee.id`) + all shared Rental Enquiries.
  - Single-record endpoints (`GET /:id`, `PATCH /:id`, `DELETE /:id`) continue strictly blocking unowned property leads with HTTP 403.
- **Frontend All Leads Workspace (`frontend/src/pages/admin/LeadsPage.tsx`)**:
  - Added Type Selector control (`All Leads`, `Property Leads`, `Rental Enquiries`) and dynamic status filters.
  - Added restrained `PROPERTY` and `RENTAL` pill badges and contextual requirement columns.
  - Configured contextual View link routing to `/admin/leads/:id` (Property) or `/admin/rentals/enquiries/:id` (Rental).
  - Integrated type-aware deletion dispatching (`deleteLead` vs `deleteRentalEnquiry`) and WhatsApp greeting generators.
- **Invariants Preserved**:
  - Zero Prisma schema changes, zero database migrations, zero data duplication or synchronization between tables.
  - Dedicated `/admin/rentals/enquiries` and `/admin/rentals/available` workspaces remain 100% intact and functional.
