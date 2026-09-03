# Technical Architecture Specification

---

## 1. Routing Architecture

### Public Routes (`frontend/src/router/AppRouter.tsx`)
All public routes are wrapped in `<PublicShell />` layout route:

| Route Path | Component | Description |
| :--- | :--- | :--- |
| `/` | `HomePage.tsx` | Platform landing, featured projects & developers |
| `/search` | `SearchPage.tsx` | Rule-based conversational search & matching property cards |
| `/:developerSlug` | `DeveloperPage.tsx` | Developer portfolio showcase & lead capture |
| `/:developerSlug/:locationSlug/:projectSlug` | `ProjectPage.tsx` | Edge-to-edge project experience with unit configuration selector |

### Admin Routes (`/admin/*`)
All admin routes are wrapped in `<ProtectedRoute>` (JWT guard) and `<AdminLayout>`:

`AuthProvider` restores the locally stored access token synchronously, clears locally expired JWTs, and publishes an explicit readiness state before `ProtectedRoute` or the login redirect decision is made. Admin API 401 responses clear the token and dispatch the existing unauthorized event; there is no refresh-token flow or cross-device session invalidation.

Admin access tokens default to a 15-minute JWT lifetime, overridable by `JWT_EXPIRES_IN`. The browser stores the token and admin identity in separate local-storage keys; logout clears both, malformed/expired tokens are discarded locally, and backend JWT verification remains the authorization authority. Each browser/device maintains an independent session.

| Route Path | Component | Description |
| :--- | :--- | :--- |
| `/admin/login` | `AdminLoginPage.tsx` | Admin authentication login form |
| `/admin` | `AdminDashboardPage.tsx` | Operational lead/project metrics and work queues |
| `/admin/developers` | `DevelopersPage.tsx` | List of developer entities |
| `/admin/developers/new`, `/:id` | `DeveloperFormPage.tsx` | Create/edit developer form |
| `/admin/projects` | `ProjectsPage.tsx` | List of project entities |
| `/admin/projects/new`, `/:id` | `ProjectFormPage.tsx` | Create/edit project form |
| `/admin/projects/:projectId/configurations` | `ProjectConfigurationsPage.tsx` | Unit configurations for a project |
| `/admin/configurations/:id` | `ConfigurationFormPage.tsx` | Create/edit unit configuration |
| `/admin/leads`, `/:id` | `LeadsPage.tsx`, `LeadDetailPage.tsx` | Inbound customer lead inquiries |
| `/admin/import` | `ImportPage.tsx` | Scraped URL property importer review pipeline |
| `/admin/media` | `HomeMediaPage.tsx` | Site-level media asset management |
| `/admin/projects/:projectId/media` | `ProjectMediaPage.tsx` | Project media asset management |
| `/admin/configurations/:configurationId/media` | `ConfigurationMediaPage.tsx` | Unit configuration media management |

---

## 2. Frontend Component & Layer Hierarchy

```
frontend/src/
├── api/                   # HTTP Fetch API clients (Fetch + AbortSignal)
│   ├── site.ts            # GET /api/site
│   ├── project.ts         # GET /api/projects/:devSlug/:locSlug/:projSlug
│   ├── developer.ts       # GET /api/developers/:slug
│   ├── search-catalog.ts  # GET /api/search/catalog
│   ├── search.ts          # GET /api/search
│   └── lead.ts            # POST /api/leads
├── auth/                  # Admin auth state and ProtectedRoute
├── components/            # Domain-grouped components & hooks
│   ├── admin/             # Shared AdminLayout and navigation
│   ├── developer/         # DeveloperHero, DeveloperIntro, DeveloperProjects, DeveloperLeadSection
│   ├── home/              # AtmosphericHero, ExploreDevelopers, FeaturedProjects, ConversationalSearchEntry, AboutFooter, FloatingSearchControl
│   ├── project/           # ProjectHero, ProjectSubNav, ProjectOverview, showcase carousels, ConfigurationSection, ConfigurationMediaSection, ProjectAmenities, ProjectLocation, ProjectDeveloper, LeadSection
│   ├── search/            # SearchAssistant, AssistantHeader, ConversationMessages, QuerySummary, RuleOptions, SearchAssistantEmptyState, SearchResults, PropertyResultCard, PropertyAssistantOverlay
│   └── shell/             # PublicShell, GlobalHeader
├── context/               # Global Context Providers
│   ├── AssistantContext.tsx# Assistant open/closed state, body scroll lock, Escape key, useSearchChat
│   └── HeaderContext.tsx   # developerName state for header branding attribution
├── hooks/                 # Custom domain hooks (useSearchChat, useAssistant, useHeader)
├── pages/                 # Thin route-level orchestrators
├── services/              # Client-side domain engines (query-builder.ts, search-catalog.service.ts)
├── styles/                # Modular CSS architecture
└── types/                 # TypeScript DTO interfaces & payload types
```

---

## 3. Backend Layer Hierarchy

```
HTTP Request
    ↓
Express Route (/api/...)
    ↓
Validator Middleware (validators/*.validator.ts - parameter bounds & string validation)
    ↓
Controller (controllers/*.controller.ts - HTTP status codes & service invocation)
    ↓
Service Layer (services/*.service.ts - business workflows & DTO mapping)
    ↓
Repository Layer (repositories/*.repository.ts - Prisma ORM database operations)
    ↓
PostgreSQL Database / Cloudinary Storage
```

---

## 4. Database Schema (Prisma 7 Models)

```prisma
model Developer {
  id            String         @id @default(cuid())
  name          String
  slug          String         @unique
  description   String?
  logoUrl       String?
  websiteUrl    String?
  publishStatus PublishStatus  @default(DRAFT)
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt
  projects      Project[]
  media         Media[]
}

model Project {
  id             String          @id @default(cuid())
  developerId    String
  developer      Developer       @relation(fields: [developerId], references: [id])
  name           String
  slug           String
  location       String
  locationSlug   String
  description    String?
  status         ProjectStatus   @default(UPCOMING)
  possessionDate DateTime?
  latitude       Float?
  longitude      Float?
  mapsUrl        String?
  publishStatus  PublishStatus   @default(DRAFT)
  createdAt      DateTime        @default(now())
  updatedAt      DateTime        @updatedAt
  configurations Configuration[]
  media          Media[]
  leads          Lead[]

  @@unique([developerId, slug])
}

model Configuration {
  id                 String             @id @default(uuid())
  name               String
  bhk                Int
  carpetArea         Int
  builtUpArea        Int?
  superBuiltUpArea   Int?
  priceFrom          BigInt
  availabilityStatus AvailabilityStatus
  projectId          String
  project            Project            @relation(fields: [projectId], references: [id])
  createdAt          DateTime           @default(now())
  updatedAt          DateTime           @updatedAt
  media              Media[]
  leads              Lead[]
}

model Media {
  id              String         @id @default(cuid())
  context         MediaContext   // HOME | DEVELOPER | PROJECT | CONFIGURATION
  type            MediaType      // IMAGE | VIDEO | DOCUMENT
  category        MediaCategory  // HERO, GALLERY, FLOOR_PLAN, AMENITY, BROCHURE, etc.
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
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt

  developer     Developer?     @relation(fields: [developerId], references: [id])
  project       Project?       @relation(fields: [projectId], references: [id])
  configuration Configuration? @relation(fields: [configurationId], references: [id])
}

model Lead {
  id              String       @id @default(cuid())
  name            String
  phone           String
  email           String?
  projectId       String?
  configurationId String?
  intent          String?
  source          String?      @default("WEBSITE")
  status          LeadStatus   @default(NEW)
  budget          String?
  location        String?
  message         String?
  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt

  project       Project?       @relation(fields: [projectId], references: [id])
  configuration Configuration? @relation(fields: [configurationId], references: [id])
}
```

### Public media relation boundaries

The public project query exposes top-level `project.media` only for active media with `context = PROJECT`. Configuration-owned media remains available through each `project.configurations[].media` relation and is not included in the top-level project media collection.

The homepage site query and developer portfolio query also scope project-card imagery to `context = PROJECT`. Homepage developer discovery includes at most one active direct `DEVELOPER_BANNER` asset per published developer; it falls back only to the developer's stored logo, never to descendant project or configuration media.

Public project navigation is implemented as anchor scrolling to existing sections rather than duplicate routes. Developer official website metadata remains stored and editable for admin use but is not rendered as a public outbound link; the project location's map link is retained as an essential discovery action.

The Project Gallery consumes `IMAGE` records from this already project-scoped collection. Consequently, project-owned photos are gallery-eligible regardless of specialized category, while `VIDEO` and `DOCUMENT` records remain excluded from the photo gallery. Configuration media cannot enter the gallery through the top-level relation.

Configuration authoring is exposed through authenticated admin routes: configurations are created and listed under a project, and retrieved or updated by configuration ID. The current configuration entity supports name, BHK, carpet area, optional built-up and super-built-up areas, price-from, and availability status. It has no independent active flag, delete operation, description, bathroom count, or persisted configuration ordering field. Configuration media is managed separately through the configuration media route and remains related through `configurationId`.

Admin media metadata updates reuse the same ownership validation as media creation. The persisted developer/project/configuration relationships are combined with the requested context before a `Media` update is written, so category, title, ordering, primary status, and activation edits remain available while invalid context transitions are rejected.

### Admin PWA and lead notifications

The admin application is installable through `manifest.webmanifest` and registers `sw.js`. The service worker caches only the static application shell and same-origin static assets; `/api/` requests, including authenticated leads, subscriptions, and notification data, are network-only and are never cached.

Authenticated admins can explicitly register multiple browser/device PushSubscriptions. Each subscription is owned by the admin identity in the JWT, and endpoints are unique. After a lead is persisted with status `NEW`, the notification service performs best-effort Web Push delivery to subscriptions belonging to active admins. Push failure does not affect lead persistence, and permanent subscription failures are removed.

The Leads page can request permission only after an explicit user action and can send an authenticated real test push to the current admin's registered devices. A successful browser permission without a backend registration is not treated as enabled.

Web Push delivery requires backend-only `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, and `VAPID_SUBJECT` environment variables; the frontend receives only the public key through `VITE_VAPID_PUBLIC_KEY`.

The public lead controller forwards the validated direct `developerId` to the lead service. Project and configuration enquiries continue to derive authoritative parent ownership from their verified relationships.

Project highlights use the existing `ProjectHighlight` child model. The authenticated project editor manages them as a project-owned repeatable field through `/api/admin/projects/:projectId/highlights`; the public project query returns them ordered by `sortOrder` for `ProjectOverview`.

The supported backend runtime is `backend/src/server.ts` compiled to `backend/dist/src/server.js`, with the development `PORT` configured as `3000`. `backend/server.js` is retained legacy code and is not the current API server; it does not register the layered admin routes. The frontend's relative `/api` calls are proxied by Vite to the configured backend port.

The admin sidebar links to Developers, Projects, Media, Leads, and Import. Configurations are intentionally reached from a project because they are project-owned. Opening a project enters a contextual workspace that links to the existing overview (`ProjectFormPage`), project media, configurations, in-page highlights and amenities authoring, and the existing public project URL as Preview. Configuration media remains reached through the selected configuration's existing route. Project and configuration forms show local unsaved/saved feedback without merging their independent APIs; new records continue into their contextual edit workflow. At phone widths the shared admin shell becomes a compact header with an independently scrollable section navigation strip, while content children are constrained with `min-width: 0`/`max-width: 100%` so lists, cards, and forms cannot widen the document. Push notification controls are presented in the Leads workspace, while the authenticated multi-device subscription architecture remains unchanged.

Configuration editing keeps project context visible and uses a shared action hierarchy: the save/create submit button is primary, while Back to Configurations and Manage Configuration Media are secondary actions. Configuration media remains reached through its existing configuration-scoped route; on narrow screens the action group stacks vertically.

`AdminDashboardPage` is an operational landing page backed by the existing authenticated lead and project list APIs. Its four KPIs are calculated client-side from those bounded admin responses: today’s created leads, `NEW` leads, `IN_PROGRESS` leads, and `PUBLISHED` projects. The attention list reuses `LeadActions`; there is intentionally no recent-activity feed because no existing activity API is available.

Admin media listings preserve context boundaries at the repository/controller layer: the `/admin/media` root is explicitly HOME-scoped, while the separate context path accepts an explicit context parameter and developer, project, and configuration owner queries require their matching DEVELOPER, PROJECT, or CONFIGURATION context. HOME uploads continue to omit all entity owner IDs, and the existing media update ownership validation remains authoritative.

---

## 5. End-to-End Data Flow Examples

### 1. Public Project Discovery Flow
$$\text{User navigates to } /:developerSlug/:locationSlug/:projectSlug?configuration=:configId$$
$$\downarrow$$
$$\text{ProjectPage.tsx } \longrightarrow \text{useProject hook } \longrightarrow \text{getProject() } \longrightarrow \text{GET /api/projects/:devSlug/:locSlug/:projSlug}$$
$$\downarrow$$
$$\text{project.controller.ts } \longrightarrow \text{project.service.ts } \longrightarrow \text{project.repository.ts}$$
$$\downarrow$$
$$\text{Prisma Query: where } [slug, locationSlug, publishStatus: \text{"PUBLISHED"}, developer.slug, developer.publishStatus: \text{"PUBLISHED"}]$$
$$\downarrow$$
$$\text{Returns Serialized Project DTO (BigInt priceFrom converted to string)}$$
$$\downarrow$$
$$\text{ProjectPage sets } \text{developerName} \text{ in HeaderContext } \longrightarrow \text{GlobalHeader renders } [Developer Name]$$
$$\downarrow$$
$$\text{Renders ProjectHero, ProjectSubNav, Overview, Showcase, Configurations, Configuration Media, Location, Amenities, Gallery, Video, Developer, LeadSection}$$

### 2. Rule-Based Search Flow
$$\text{User clicks "Ask Assistant" or navigates to } /search$$
$$\downarrow$$
$$\text{openAssistant() opens PropertyAssistantOverlay } \longrightarrow \text{useSearchChat hook loads catalog } (\text{GET /api/search/catalog})$$
$$\downarrow$$
$$\text{query-builder.ts derives options strictly from candidate matches; skips no-op questions}$$
$$\downarrow$$
$$\text{User selects option button } [3\text{ BHK}] \longrightarrow \text{query state updates } \longrightarrow \text{options dynamically recalculated}$$
$$\downarrow$$
$$\text{When distinct projects } \le 3 \text{ (or 1 project) } \longrightarrow \text{questioning stops immediately } \longrightarrow \text{displays matching property cards}$$
$$\downarrow$$
$$\text{Click "View Project" } \longrightarrow \text{Navigates directly to } /:devSlug/:locSlug/:projSlug?configuration=:configId$$
### Admin action language

Admin actions use shared semantic classes in `styles/admin/admin.css`: primary actions are filled, secondary actions are outlined, utility navigation remains compact, and WhatsApp/Call controls use a grouped communication treatment. Responsive layouts stack or wrap these controls at narrow widths without changing routes or handlers.
