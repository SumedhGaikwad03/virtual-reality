# Project Architecture

## 1. Project Overview

The Virtual Reality Real-Estate Platform is a modern, modular web application designed for property marketing, development portfolio presentation, unit configuration discovery, asset delivery, and qualified lead capture.

### Major Product Areas
- **Public Showcase & Discovery:** Firm home branding, featured projects, developer portfolios, deep-linked unit configuration views, and rich categorized media galleries.
- **Guided & NLP Property Search:** Multi-turn conversational preference finder (guided search) and natural language text search with denomination parsing (paise-accurate).
- **Lead Capture Engine:** Context-aware enquiry capture binding customer inquiries to projects and unit configurations.
- **Admin Management Portal:** Administrative CRUD for developers, projects, configurations, media assets, scraped listing URL imports, and lead review.

### Technology Stack
- **Frontend:** React 19, TypeScript, React Router 7, Vite, Native Fetch API clients with AbortSignal cancellation.
- **Backend:** Node.js, Express, TypeScript (ES Modules).
- **Persistence & ORM:** PostgreSQL, Prisma 7 with `@prisma/adapter-pg` driver adapter.
- **External Storage / Adapters:** Cloudinary (server-side media storage with resource-type mapping: `IMAGE`, `VIDEO`, `DOCUMENT`), Multer (in-memory buffer parsing).
- **Authentication:** Admin database entity, bcrypt password hashing, JSON Web Tokens (JWT).

---

## 2. Architectural Philosophy

The application is built on principles of **moderate modularization** and **strict responsibility boundaries**:

- **Moderate Modularization:** Avoid both giant monolithic files ("god objects") and excessive micro-fragmentation. A module should represent a single cohesive responsibility, but can contain multiple closely related functions when they share that responsibility.
- **Domain-Based Separation:** Modules are grouped by functional domains (`home`, `developer`, `project`, `configuration`, `media`, `search`, `admin`, `lead`).
- **Thin Pages & Pure Presentation:** Page modules orchestrate lifecycle, state, and child sections. Section components receive data via props and render UI without executing direct API calls or business logic.
- **Domain-Local Logic:** Hooks and helper utilities live adjacent to the domain components that consume them (e.g., `components/project/hooks/useProject.ts`).
- **Genuinely Shared Reusability:** Code is shared across domains only when there is true architectural reusability (e.g., `AdminLayout`, `.project-image-fallback`).
- **Limited Barrel Exports & Compatibility Preservation:** Direct explicit imports are preferred over broad wildcard barrels. Where refactoring reorganizes internal files, backward-compatible re-exports are maintained to prevent routing breakage.
- **Behavioral Invariance During Refactoring:** Structural refactoring must never alter observable product behavior, API contracts, URL schemas, or publication boundaries.
- **Standardized Documentation:** Every significant file begins with structured header documentation defining `PURPOSE`, `FLOW`, and `RESPONSIBILITY`. Inline comments explain non-obvious business rules and architectural rationale.

---

## 3. Frontend Architecture

The frontend directory structure is organized into domain-driven layers:

```
frontend/src/
├── api/          # Typed HTTP API client functions (Fetch + AbortSignal)
├── auth/         # Admin AuthContext and ProtectedRoute guard
├── components/   # Domain-grouped presentation components and domain-local hooks
│   ├── admin/    # Shared AdminLayout and navigation components
│   ├── developer/# Public Developer header, overview, media, and project card components
│   ├── home/     # Public Home hero, showcase, cards, and featured project components
│   ├── project/  # Public Project header, hero carousel, overview, media, and lead components
│   ├── search/   # Pure rule-based conversational discovery assistant, result cards, and overlay
│   └── shell/    # PublicShell layout route and GlobalHeader site-wide navigation
├── context/      # Application-wide global contexts (AssistantContext)
├── hooks/        # Cross-domain / root custom hooks (e.g., useSearchChat, useAssistant)
├── pages/        # Thin route-level orchestrators
│   └── admin/    # Admin view pages and create/edit form pages
├── router/       # AppRouter defining public shell layout route and isolated admin routes
├── services/     # Client-side domain engines (e.g., query-builder, search-catalog)
├── styles/       # Modular CSS architecture (foundations, public domains, admin domains)
└── types/        # TypeScript DTOs, domain interfaces, and form payload definitions
```

### Preferred Frontend Data Flow
$$\text{App} \longrightarrow \text{AssistantProvider} \longrightarrow \text{AppRouter} \longrightarrow \text{PublicShell} \longrightarrow \text{GlobalHeader} \mathbin{\&} \text{Page Orchestrator} \longrightarrow \text{Domain Hook} \longrightarrow \text{API Client} \longrightarrow \text{Backend}$$
$$\text{GlobalHeader / Triggers} \longrightarrow \text{openAssistant()} \longrightarrow \text{PropertyAssistantOverlay} \longrightarrow \text{SearchAssistant (Rule-Based)}$$

---

## 4. Backend Architecture

The backend implements a strict layered architecture with zero database leakage into controllers:

```
HTTP Request
    ↓
Route (/api/...)
    ↓
Validator (Request body, params, query parameter bounds)
    ↓
Controller (HTTP status codes, parameter mapping, error forwarding)
    ↓
Service / Application Layer (Business workflows, DTO mapping, error translations)
    ↓
Repository (Prisma ORM queries, sorting, multi-relation publication boundaries)
    ↓
Database (PostgreSQL) / External Adapter (Cloudinary)
```

### Layer Responsibilities
- **Routes (`routes/`):** Define HTTP verbs and paths, mounting middleware and connecting endpoints to validators and controllers. Public and admin routes are separated into `routes/public/` and `routes/admin/`.
- **Validators (`validators/`):** Validate input types, string lengths, and enum values. Return standard validation errors with status `400`.
- **Controllers (`controllers/`):** Handle HTTP concerns (extracting parameters, invoking services, formatting JSON responses). Controllers never execute Prisma queries or contain business logic.
- **Services (`services/`):** Encapsulate domain rules, verify entity relationships (e.g., developer existence), translate database constraint violations (e.g., Prisma `P2002` to `409 Conflict`), and map internal BigInt representations (paise) to client-safe strings.
- **Repositories (`repositories/`):** Sole persistence boundary. Construct and execute Prisma database operations, enforce publication filters, and structure nested relation graphs.
- **Adapters (`lib/`):** Isolate third-party services (e.g., Cloudinary API, Prisma adapter client).

---

## 5. Domain Architecture

### Home Domain
- **Purpose:** Public brand landing page presenting firm identity, dominant visual hero, showcase carousel, featured projects, card highlights, firm gallery, and contact information.
- **Components:** `HomePage.tsx`, `FirmHero.tsx`, `FirmOverview.tsx`, `HomeHeroMedia.tsx`, `HomeHeroCarousel.tsx`, `HomeCards.tsx`, `HomeGallery.tsx`, `FeaturedProjects.tsx`, `FeaturedProjectCard.tsx`, `ContactSection.tsx`.
- **Flow:** `useSite.ts` $\rightarrow$ `getSite()` $\rightarrow$ `GET /api/site` $\rightarrow$ `site.service.ts` $\rightarrow$ `site.repository.ts`.
- **CSS Ownership:** `styles/home.css`.

### Developer Domain
- **Purpose:** Developer portfolio showcase and developer administration.
- **Public Flow:** `DeveloperPage.tsx` $\rightarrow$ `useDeveloper.ts` $\rightarrow$ `getDeveloper()` $\rightarrow$ `GET /api/developers/:slug` $\rightarrow$ `developerRepository.findPublicBySlug()`.
- **Admin Flow:** `DevelopersPage.tsx` (list view), `DeveloperFormPage.tsx` (create/edit form) $\rightarrow$ `/api/admin/developers`.
- **Publication Behavior:** Only developers with `publishStatus === "PUBLISHED"` are visible on the public route.
- **CSS Ownership:** `styles/developer.css` (public), `styles/admin/developers.css` (admin).

### Project Domain
- **Purpose:** Comprehensive property presentation, hero selection, media showcases, overview, unit configurations, and lead capture.
- **Public Flow:** `ProjectPage.tsx` $\rightarrow$ `useProject.ts` $\rightarrow$ `getProject()` $\rightarrow$ `GET /api/projects/:developerSlug/:locationSlug/:projectSlug`.
- **Admin Flow:** `ProjectsPage.tsx` (list view), `ProjectFormPage.tsx` (create/edit form) $\rightarrow$ `/api/admin/projects`.
- **Publication Rule:** Project is public only if `Project.publishStatus === "PUBLISHED"` AND `Developer.publishStatus === "PUBLISHED"`.
- **CSS Ownership:** `styles/project.css` (public), `styles/admin/projects.css` (admin).

### Configuration Domain
- **Purpose:** Unit-level real estate configurations (BHK, carpet area, built-up area, starting price in paise, availability status) and configuration-specific media (floor plans, brochures).
- **Ownership:** Every configuration belongs to exactly one Project.
- **Public Flow:** `ConfigurationSection.tsx` updates `?configuration=<id>` URL state on `ProjectPage`, dynamically revealing `ConfigurationMediaSection.tsx` and synchronizing the `LeadSection` enquiry dropdown.
- **Admin Flow:** `ProjectConfigurationsPage.tsx`, `ConfigurationFormPage.tsx`, `ConfigurationMediaPage.tsx` $\rightarrow$ `/api/admin/projects/:projectId/configurations`.
- **CSS Ownership:** `styles/configuration.css` (public), `styles/admin/configurations.css` (admin).

### Media Domain
- **Purpose:** Centralized media storage, category classification, sorting, and activation.
- **Contexts:** `HOME`, `DEVELOPER`, `PROJECT`, `CONFIGURATION`.
- **Categories:** `HERO`, `HERO_CAROUSEL`, `CARD`, `GALLERY`, `AMENITY`, `EXTERIOR`, `INTERIOR`, `LOCATION`, `CONSTRUCTION`, `FLOOR_PLAN`, `BROCHURE`, `PROJECT_VIDEO`.
- **Types:** `IMAGE`, `VIDEO`, `DOCUMENT`.
- **Public Presentation:** Controlled by `styles/media.css` (`.media-list`, `.media-item`). Only `isActive === true` items are exposed to public APIs.
- **Admin Flow:** `api/admin-media.ts` $\rightarrow$ Multer in-memory upload $\rightarrow$ Cloudinary upload $\rightarrow$ PostgreSQL Media record creation.
- **CSS Ownership:** `styles/media.css` (public), `styles/admin/media.css` (admin).

### Search Domain
- **Purpose:** Discovery across all published projects and configurations.
- **Guided Search:** Client-side rule engine (`query-builder.ts`) evaluating sequential filters against an in-flight cached catalog (`GET /api/search/catalog`).
- **Natural Language Search:** Server-side regex and alias parsing (`query-generator.service.ts`), Indian denomination paise conversion (`BigInt`), and dynamic Prisma filtering (`GET /api/search?q=...`).
- **Deep Linking:** Results navigate directly to `/:developerSlug/:locationSlug/:projectSlug?configuration=:configurationId`.
- **CSS Ownership:** `styles/search.css`.

### Admin Domain
- **Purpose:** Secure management console for all platform entities.
- **Authentication:** `POST /api/admin/auth/login` and `POST /api/admin/auth/forgot-password` protected by endpoint rate-limiting (5 requests/15m per IP), issuing signed JWTs verified by `requireAdminAuthentication` middleware.
- **Layout & Routing:** `AdminLayout.tsx` providing persistent sidebar navigation and mobile responsive layout.
- **CSS Ownership:** `styles/admin/admin.css`.

---

## 6. Important Product Flows

### 1. Home Content Flow
```
User navigates to /
  ↓
HomePage.tsx (invokes useSite hook)
  ↓
api/site.ts:getSite()
  ↓
GET /api/site
  ↓
site.controller.ts:getSiteController()
  ↓
site.service.ts:getSite()
  ↓
site.repository.ts:siteRepository.findSiteData()
  ├── Prisma: Query featured projects (where publishStatus = "PUBLISHED" & developer.publishStatus = "PUBLISHED")
  └── Prisma: Query active HOME media (where context = "HOME" & isActive = true, ordered by sortOrder)
  ↓
Returns { data: { siteConfig, featuredProjects, homeMedia } }
  ↓
HomePage renders FirmHero, HomeHeroMedia, HomeHeroCarousel, FirmOverview, FeaturedProjects, HomeCards, HomeGallery, ContactSection
```

### 2. Public Project Discovery Flow
```
User navigates to /:developerSlug/:locationSlug/:projectSlug?configuration=:configId
  ↓
ProjectPage.tsx (reads URL params and ?configuration query string, invokes useProject hook)
  ↓
api/project.ts:getProject(devSlug, locSlug, projSlug, signal)
  ↓
GET /api/projects/:developerSlug/:locationSlug/:projectSlug
  ↓
validateProjectParams (validates non-empty string slugs)
  ↓
getPublicProjectController -> project.service.ts:getPublicProject()
  ↓
project.repository.ts:findPublicProject()
  └── Prisma Query [slug = projSlug, locationSlug = locSlug, publishStatus = "PUBLISHED", developer.slug = devSlug, developer.publishStatus = "PUBLISHED"]
      └── Includes: developer, highlights, amenities, active project media, active configurations with configuration media
  ↓
Returns serialized DTO (BigInt priceFrom converted to string)
  ↓
ProjectPage renders:
  ├── ProjectHeader
  ├── HeroSection (4-tier priority selection: HERO+Primary -> HERO -> Primary -> First Image)
  ├── ProjectHeroCarousel (HERO_CAROUSEL items)
  ├── ProjectOverview (description & Google Maps link)
  ├── ConfigurationSection (unit cards; updates ?configuration=<id> on selection)
  ├── ConfigurationMediaSection (renders floor plans & unit renders if configuration is selected)
  ├── MediaSection (categorized project gallery)
  └── LeadSection (enquiry form pre-bound to selectedConfigurationId)
```

### 3. Guided Conversational Search Flow
```
User navigates to /search
  ↓
PropertySearchBuilder.tsx (invokes useSearchChat hook)
  ↓
loadSearchCatalog() (deduplicates in-flight request to GET /api/search/catalog)
  ↓
search-catalog.repository.ts:findCatalog()
  └── Prisma Query: All PUBLISHED projects of PUBLISHED developers with active configurations
  ↓
Client-side Rule Engine (query-builder.ts):
  Sequential question progression: BHK -> Location -> Developer -> Price -> Availability -> Project Status
  Filters catalog in-memory; updates conversation message history
  ↓
When criteria narrow to <= 3 matches:
  Renders PropertyResultCard items with deep links:
  /:developerSlug/:locationSlug/:projectSlug?configuration=:configurationId
```

### 4. Natural Language Text Search Flow
```
User enters search text (e.g., "3 bhk under 2 crore in pimpri")
  ↓
api/search.ts:searchProperties(query, signal)
  ↓
GET /api/search?q=...
  ↓
validateSearchQuery (checks non-empty, <= 200 chars)
  ↓
search.controller.ts -> query-generator.service.ts:generatePropertySearchQuery()
  ├── Regex extraction of BHK, location aliases, developer names, status enums
  └── Price parsing converting Crore / Lakh strings into exact BigInt paise
  ↓
search.repository.ts:findProperties()
  └── Prisma Query on Configuration with dynamic where clauses and publication filter on parent project & developer
  ↓
Returns matching configurations with developer & project summary DTOs
  ↓
SearchResults.tsx renders SearchResultCard list
```

### 5. Lead / Enquiry Capture Flow
```
User submits enquiry form on public project page or general form
  ↓
LeadSection.tsx (collects name, phone, email, optional projectId, optional configurationId, message)
  ↓
api/lead.ts:createLead(payload)
  ↓
POST /api/leads
  ↓
validatePublicLead (validates required fields, phone regex, optional email format)
  ↓
lead.controller.ts:createLeadController()
  ↓
lead.service.ts:createLead()
  ├── resolveLeadContext():
  │   ├── If configurationId is provided: verifies configuration exists, verifies matching projectId (if supplied), and authoritatively derives parent projectId = configuration.projectId
  │   └── If only projectId is provided: verifies project exists
  ↓
lead.repository.ts:create() -> Prisma: prisma.lead.create()
  ↓
Returns 201 Created; form resets and displays confirmation status
```

### 6. Media Upload Flow
```
Admin uploads media file in Admin Portal
  ↓
admin-media.ts:uploadMedia(input)
  ↓
POST /api/admin/media (multipart/form-data with file buffer and metadata)
  ↓
Multer middleware parses file into memory buffer
  ↓
validateMediaUpload middleware validates context, type, category, and foreign keys
  ↓
media.controller.ts:createMediaController()
  ↓
media.service.ts:uploadMedia()
  ├── Validates context ownership (HOME: no FKs; DEVELOPER: valid developerId; PROJECT: valid projectId; CONFIGURATION: valid configurationId)
  ├── Uploads buffer to Cloudinary with folder and resource_type mapping (IMAGE -> image, VIDEO -> video, DOCUMENT -> raw)
  └── Invokes mediaRepository.create() with returned secure URL and metadata
  ↓
Database persistence in PostgreSQL Media table
  ↓
Returns 201 Created with AdminMedia DTO
```

---

## 7. Publication Model

The platform enforces a strict, multi-entity **Publication Boundary**:

$$\text{Publicly Visible} \iff \text{Project.publishStatus} = \text{"PUBLISHED"} \land \text{Developer.publishStatus} = \text{"PUBLISHED"}$$

```
                          ┌───────────────────────────┐
                          │ Developer.publishStatus   │
                          └─────────────┬─────────────┘
                                        │
                       ┌────────────────┴────────────────┐
                       │                                 │
                   PUBLISHED                           DRAFT
                       │                                 │
         ┌─────────────┴─────────────┐                   ▼
         │  Project.publishStatus    │           Entire Developer &
         └─────────────┬─────────────┘          All Projects HIDDEN
                       │
          ┌────────────┴────────────┐
          │                         │
      PUBLISHED                   DRAFT
          │                         │
          ▼                         ▼
   PUBLICLY VISIBLE             HIDDEN
```

### Database-Level Enforcement
Publication rules are enforced directly in repository database queries rather than in frontend filters:
- **`ProjectRepository.findPublicProject`**: Queries `where: { publishStatus: "PUBLISHED", developer: { publishStatus: "PUBLISHED" } }`.
- **`DeveloperRepository.findPublicBySlug`**: Queries `where: { publishStatus: "PUBLISHED" }` and filters projects to `publishStatus: "PUBLISHED"`.
- **`SearchRepository.findProperties`**: Enforces `project: { publishStatus: "PUBLISHED", developer: { publishStatus: "PUBLISHED" } }`.
- **`SearchCatalogRepository.findCatalog`**: Enforces `publishStatus: "PUBLISHED", developer: { publishStatus: "PUBLISHED" }`.
- **`SiteRepository.findSiteData`**: Filters featured projects by `publishStatus: "PUBLISHED"` on both project and developer.
- **Admin APIs**: Admin endpoints query all records regardless of publication status, allowing full preview and editing of `DRAFT` content.

---

## 8. Media Architecture

Media is modeled as a unified, reusable platform entity linked conditionally by context:

```prisma
model Media {
  id              String         @id @default(cuid())
  context         MediaContext   // HOME | DEVELOPER | PROJECT | CONFIGURATION
  type            MediaType      // IMAGE | VIDEO | DOCUMENT
  category        MediaCategory  // HERO, GALLERY, FLOOR_PLAN, BROCHURE, etc.
  slot            String?
  title           String?
  altText         String?
  url             String
  thumbnailUrl    String?
  sortOrder       Int            @default(0)
  isPrimary       Boolean        @default(false)
  isActive        Boolean        @default(true)
  developerId     String?
  projectId       String?
  configurationId String?
  ...
}
```

### Ownership Rules by Context
- **`HOME`**: Site-level media. Must have `developerId = null`, `projectId = null`, `configurationId = null`. Permitted categories: `HERO`, `HERO_CAROUSEL`, `CARD`, `GALLERY`.
- **`DEVELOPER`**: Requires valid `developerId`. Permitted categories: `HERO`, `GALLERY`, `CARD`.
- **`PROJECT`**: Requires valid `projectId`. If `developerId` is supplied, the project must belong to that developer. Permitted categories: `HERO`, `HERO_CAROUSEL`, `GALLERY`, `EXTERIOR`, `INTERIOR`, `LOCATION`, `CONSTRUCTION`, `PROJECT_VIDEO`.
- **`CONFIGURATION`**: Requires valid `configurationId`. If `projectId` is supplied, the configuration must belong to that project. Permitted categories: `FLOOR_PLAN`, `GALLERY`, `INTERIOR`, `AMENITY`, `BROCHURE`.

### Cloudinary Adapter Mapping
- `IMAGE` $\rightarrow$ Cloudinary resource type `image`
- `VIDEO` $\rightarrow$ Cloudinary resource type `video`
- `DOCUMENT` $\rightarrow$ Cloudinary resource type `raw`

---

## 9. Configuration Architecture

Unit configurations belong strictly to a single Project.

```
Developer
    ↓ (1 : N)
Project
    ↓ (1 : N)
Configuration
    ↓ (1 : N)
Configuration Media (FLOOR_PLAN, GALLERY, BROCHURE)
```

### URL Selection & State Isolation
- On the public Project page, selecting a unit configuration sets the URL parameter `?configuration=<configurationId>`.
- The page orchestrator derives the selected configuration object and passes it to:
  1. `<ConfigurationMediaSection />`: Renders unit-specific floor plans and brochure downloads.
  2. `<LeadSection />`: Pre-selects the configuration in the enquiry dropdown.
- Configuration media cannot leak or be queried across unrelated projects due to foreign-key constraints and parent ownership verification in `ConfigurationService`.

---

## 10. Search Architecture

The platform supports two distinct, decoupled search mechanisms that both enforce the publication boundary:

```
                      SEARCH MECHANISMS
                             │
            ┌────────────────┴────────────────┐
            │                                 │
     GUIDED SEARCH                    TEXT SEARCH (NLP)
            │                                 │
   loadSearchCatalog()                searchProperties(q)
            │                                 │
  GET /api/search/catalog             GET /api/search?q=...
            │                                 │
  In-Flight Deduplicated Cache        Regex + Indian Denomination Parser
            │                                 │
  Client State Machine (Rules):       BigInt Paise Conversion
  BHK -> Location -> Dev ->           (1 Cr = 10^7, 1 Lakh = 10^5)
  Price -> Availability -> Status             │
            │                         Dynamic Prisma Filter Query
  Narrowed to <= 3 matches                    │
            │                                 │
            └────────────────┬────────────────┘
                             │
                             ▼
               Deep Link to Project Page:
  /:developerSlug/:locationSlug/:projectSlug?configuration=:configId
```

---

## 11. CSS Architecture

The stylesheet architecture is modular, domain-aligned, and orchestrated through a central entry file:

```
frontend/src/
├── styles.css                 # Pure entry point: imports all foundational and domain stylesheets
└── styles/
    ├── globals.css            # Base element defaults, reset, typography, and form primitives
    ├── layout.css             # Site-wide navigation bar and structural wrappers
    ├── components.css         # Cross-domain reusable UI primitives (e.g. .project-image-fallback)
    ├── home.css               # Public homepage layout, firm hero, cards, and showcase
    ├── developer.css          # Public developer page layout, logo avatar, and project grid
    ├── project.css            # Public project page layout, header card, and hero image
    ├── configuration.css      # Public unit configuration list and card items
    ├── media.css              # Public media galleries, media cards, and item previews
    ├── search.css             # Public guided search builder, chat UI, and text search cards
    └── admin/
        ├── admin.css          # Shared admin layout, sidebar, cards, leads, and importer
        ├── developers.css     # Developer administration list, row grid, and form
        ├── projects.css       # Project administration list, row grid, and form
        ├── configurations.css # Configuration administration list, row grid, and form
        └── media.css          # Media administration upload forms, card grid, and previews
```

### Import Order in `frontend/src/styles.css`
```css
/* Foundational Layers */
@import "./styles/globals.css";
@import "./styles/layout.css";
@import "./styles/components.css";

/* Public Domain Stylesheets */
@import "./styles/home.css";
@import "./styles/developer.css";
@import "./styles/project.css";
@import "./styles/configuration.css";
@import "./styles/media.css";
@import "./styles/search.css";

/* Admin Domain Stylesheets */
@import "./styles/admin/admin.css";
@import "./styles/admin/developers.css";
@import "./styles/admin/projects.css";
@import "./styles/admin/configurations.css";
@import "./styles/admin/media.css";
```

---

## 12. Naming Conventions

Filenames directly declare architectural responsibility:

| Purpose | Pattern | Example |
| :--- | :--- | :--- |
| **Page Component** | `*Page.tsx` | `ProjectPage.tsx`, `DevelopersPage.tsx` |
| **UI Component** | `PascalCase.tsx` | `FirmHero.tsx`, `PropertyResultCard.tsx` |
| **Custom Hook** | `use*.ts` | `useProject.ts`, `useSearchChat.ts` |
| **API Client** | `[domain].ts` | `project.ts`, `admin-developers.ts` |
| **Domain Service (Client)** | `[domain].service.ts` | `search-catalog.service.ts`, `query-builder.ts` |
| **Domain Service (Backend)**| `[domain].service.ts` | `project.service.ts`, `media.service.ts` |
| **Repository (Backend)** | `[domain].repository.ts`| `project.repository.ts`, `search.repository.ts` |
| **Validator (Backend)** | `[domain].validator.ts` | `project.validator.ts`, `search.validator.ts` |
| **Controller (Backend)** | `[domain].controller.ts`| `project.controller.ts`, `media.controller.ts` |
| **Route Definition** | `[domain].routes.ts` | `project.routes.ts`, `media.routes.ts` |
| **Type Definitions** | `[domain].ts` | `project.ts`, `admin-project.ts` |
| **Stylesheets** | `[domain].css` | `home.css`, `project.css`, `admin/media.css` |

---

## 13. Code Documentation Conventions

Every significant source file contains a standardized top-level documentation block:

```typescript
/*
 * PURPOSE:
 * Concise statement of why this file exists.
 *
 * FLOW:
 * Name of the product or architectural flow this file participates in.
 *
 * RESPONSIBILITY:
 * Exact boundaries of what this file does (and what it delegates).
 */
```

### Inline Comments Rule
- **Do not comment obvious syntax** (e.g., `const x = 5; // set x to 5`).
- **Do comment non-obvious business rules and architectural decisions**:
  - Priority selection cascades (e.g., hero selection fallback order in `HeroSection.tsx`).
  - Monetary conversions (e.g., Crore/Lakh string parsing to `BigInt` paise in `query-generator.service.ts`).
  - Publication boundary conditions in database queries.
  - Asynchronous deduplication mechanisms (e.g., Promise caching in `search-catalog.service.ts`).

---

## 14. Import / Export Philosophy

- **Explicit Named Imports:** Import specific symbols directly rather than using namespace wildcards (`import * as ...`).
- **No Indiscriminate Barrel Files:** Avoid global index barrels that re-export the entire application; keep imports clear and traceable.
- **Compatibility Re-exports:** When extracting form sub-pages from list pages (e.g., `ProjectFormPage` extracted from `ProjectsPage`), maintain a named re-export (`export { ProjectFormPage } from "./ProjectFormPage"`) to ensure zero broken references in existing routing modules.

---

## 15. Refactoring Rules

1. **Behavioral Invariance:** Never alter observable product behavior, URL schemes, HTTP response structures, or database constraints during structural refactoring.
2. **One File at a Time:** Focus on single, coherent module boundaries.
3. **No Speculative Abstractions:** Do not create generic wrapper utilities or components (`GenericCard`, `UniversalSearchService`) without verified, repeated necessity across multiple domains.
4. **Preserve Contracts:** Maintain strict schema compliance with Prisma types and API contracts.
5. **Enforce Hard Security & Publication Boundaries:** Never remove or weaken `publishStatus === "PUBLISHED"` filters.

---

## 16. Current Architectural State

- ✅ **Home Domain:** Structurally refactored into thin orchestrator, modular presentation components, and dedicated `useSite` lifecycle hook.
- ✅ **Developer Domain:** Refactored with `useDeveloper` hook, clean `DeveloperPage`, separated `DeveloperFormPage`, and compatibility re-exports.
- ✅ **Project Domain:** Clean page orchestrator managing `?configuration=<id>` URL search state, `useProject` hook, and separate `ProjectFormPage`.
- ✅ **Configuration Domain:** Audited and verified modular; clean isolation of configuration-specific media from project galleries.
- ✅ **Media Domain:** Reusable unified architecture with context ownership rules, Cloudinary adapter isolation, and clean admin management sub-pages.
- ✅ **Search Domain:** Clean dual-engine implementation (client-side guided search builder + server-side regex NLP text search with paise accuracy).
- ✅ **CSS Architecture:** Fully modularized into foundational, layout, components, 6 public domain stylesheets, and 5 admin domain stylesheets with a pure import hub in `styles.css`.
- ✅ **Database Performance & Indexing:** Explicit PostgreSQL indexes on all relational foreign keys (`developerId`, `projectId`, `configurationId`, `adminId`), publication queries (`[publishStatus, featured]`), and active media lookups (`[context, isActive]`).
- ✅ **URL Protocol Security Validation:** Strict server-side validation enforcing `http:` and `https:` schemes on user/admin-supplied URLs (`websiteUrl`, `mapsUrl`, `logoUrl`, import URLs), eliminating Stored XSS vectors from executable schemes (`javascript:`, `data:`, `vbscript:`).
- ✅ **HTTP Security Headers & CORS Policy:** Baseline Helmet security headers (nosniff, referrer-policy, frameguard) with environment-aware HSTS, paired with explicit origin-whitelisted CORS middleware.
- ✅ **Resource Safety & Query Boundaries:** Explicit upper bounds (`take`) enforced across all collection queries (search results: 50, catalog items: 200, admin lists: 100, media galleries: 100) to prevent memory exhaustion without altering API contracts.
- ✅ **Developer-Scoped Project Uniqueness:** Corrected the Project entity domain identity to enforce developer-scoped composite uniqueness (`@@unique([developerId, slug])`), permitting independent developers to use identical project marketing names while strictly enforcing unique project URLs within a developer portfolio.
- ✅ **Lead Context & Ownership Integrity:** Backend authoritatively auto-populates parent `projectId` from `configurationId` in `lead.service.ts`, preventing orphaned/unattributed leads and enforcing cross-project relationship validation.
- ✅ **Standardized Documentation:** All source files documented with `PURPOSE`, `FLOW`, and `RESPONSIBILITY` headers.

---

## 17. Known Architectural Debt

| Location | Issue | Impact | Recommended Direction |
| :--- | :--- | :--- | :--- |
| `backend/src/services/scraper/` | Scraper and import draft pipeline is a preliminary skeleton | External property ingestion requires manual validation | Complete normalizer and validator pipeline per project roadmap |
| `frontend/src/api/` | Direct `fetch` wrappers without automatic JWT token refresh on expiration | Admin session expiration requires re-login | Implement centralized interceptor or token refresh lifecycle in `admin-client.ts` |
| `frontend/src/pages/admin/` | Admin forms manage state with local `useState` objects | Repetitive input binding boilerplate | Maintain domain-local form state; introduce lightweight shared validation helpers if needed |

---

## 18. Future Work

- **UI / UX Polish:** Advanced responsive layout refinement, transitions, and typography polishing against the modular CSS architecture.
- **Accessibility (a11y) Audits:** ARIA label refinement, keyboard navigation focus rings, and high-contrast color verification.
- **Lead Notification Integrations:** WhatsApp / Email webhook notifications on lead submission via external service adapters.
- **Scraper Importer Expansion:** Enhanced URL scrapers for automated draft generation with mandatory human review workflows.

---

## 19. How a New AI Agent Should Work on This Project

1. **Read This Document First:** Review `PROJECT_ARCHITECTURE.md` to understand existing boundaries and completed work.
2. **Inspect Before Changing:** Always inspect existing components, routes, and services before proposing changes.
3. **Execute One Step at a Time:** Perform changes in logical, single-file or single-domain increments.
4. **Follow Layering Rules:** Do not put database logic in controllers, and do not put API calls directly inside presentation components.
5. **Preserve Publication Safety:** Always verify that public query endpoints check both `Project.publishStatus === "PUBLISHED"` and `Developer.publishStatus === "PUBLISHED"`.
6. **Preserve Naming & Documentation:** Add `PURPOSE`, `FLOW`, and `RESPONSIBILITY` headers to new or refactored files.
7. **Do Not Modify Testing / Tooling Without Permission:** Do not independently run test suites or add build dependencies unless explicitly instructed by the user.

---

## 20. Architectural Map

```
========================================================================================
                                FULL SYSTEM DATA FLOW
========================================================================================

 Browser URL / Request
         │
         ▼
 [ React Router / AppRouter ]
         │
         ├──────────────────────────────────────────────────────┐
         ▼                                                      ▼
 [ Public Page Orchestrator ]                          [ Admin Page / Form ]
   (e.g., ProjectPage, HomePage)                         (e.g., ProjectFormPage)
         │                                                      │
         ▼                                                      ▼
 [ Domain Custom Hook ]                                [ Admin API Client ]
   (e.g., useProject, useSite)                           (e.g., admin-projects.ts)
         │                                                      │
         ▼                                                      │
 [ Public API Client ] ─────────────────────────────────────────┤
   (e.g., api/project.ts)                                       │
         │                                                      │
         └──────────────────────────┬───────────────────────────┘
                                    │ HTTP Request
                                    ▼
                      [ Express Route Handler ]
                        (/api/projects, /api/admin/...)
                                    │
                                    ▼
                      [ Parameter / Body Validator ]
                        (e.g., project.validator.ts)
                                    │
                                    ▼
                      [ HTTP Controller Layer ]
                        (e.g., project.controller.ts)
                                    │
                                    ▼
                      [ Domain Application Service ]
                        (e.g., project.service.ts)
                                    │
                         ┌──────────┴──────────┐
                         ▼                     ▼
                [ Repository Layer ]   [ External Adapter ]
                (project.repository)   (Cloudinary Service)
                         │
                         ▼
                [ Prisma 7 ORM ]
                         │
                         ▼
             [ PostgreSQL Database ]

========================================================================================
                                DOMAIN ENTITY HIERARCHY
========================================================================================

                  ┌───────────────────────────────┐
                  │           Developer           │
                  └───────────────┬───────────────┘
                                  │ (1 : N)
                                  ▼
                  ┌───────────────────────────────┐
                  │            Project            │
                  └───────────────┬───────────────┘
                                  │ (1 : N)
                                  ▼
                  ┌───────────────────────────────┐
                  │         Configuration         │
                  └───────────────┬───────────────┘
                                  │ (1 : N)
                                  ▼
                  ┌───────────────────────────────┐
                  │      Configuration Media      │
                  │ (FLOOR_PLAN, GALLERY, BROCHURE│
                  └───────────────────────────────┘

========================================================================================
                              CROSS-DOMAIN MEDIA CONTEXTS
========================================================================================

   ┌───────────────┐  ┌────────────────┐  ┌───────────────┐  ┌─────────────────────┐
   │  HOME MEDIA   │  │ DEVELOPER MEDIA│  │ PROJECT MEDIA │  │ CONFIGURATION MEDIA │
   │ (HERO, CARD,  │  │ (HERO, GALLERY,│  │ (HERO, CAROUSEL│  │ (FLOOR_PLAN,         │
   │  CAROUSEL,    │  │  CARD)         │  │  GALLERY,     │  │  GALLERY,           │
   │  GALLERY)     │  │                │  │  EXTERIOR...) │  │  BROCHURE...)       │
   └───────┬───────┘  └────────┬───────┘  └───────┬───────┘  └──────────┬──────────┘
           │                   │                  │                     │
           └───────────────────┴─────────┬────────┴─────────────────────┘
                                         ▼
                             [ Central Media Entity ]
                                  (Cloudinary)
