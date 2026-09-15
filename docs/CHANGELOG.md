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
