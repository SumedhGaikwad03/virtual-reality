# Project Context: Virtual Reality Real-Estate Platform

---

## 1. Product Purpose & Identity

The **Virtual Reality Real-Estate Platform** is a modern, modular web application designed for prime residential real estate discovery, developer portfolio marketing, deep-linked unit configuration views, structured media management, and context-aware lead capture.

### Core Mission
- **For Visitors**: Provide an intuitive, rule-based conversational property discovery experience where answering structured questions narrows down candidate homes across Pune's top architectural developments.
- **For Real-Estate Developers**: Showcase developer portfolios, project visual stories, unit configurations (BHK, carpet area, starting prices), and amenities under a trusted developer brand context.
- **For Platform Administrators**: Manage developers, projects, configurations, categorized media assets (Cloudinary), scraped URL imports, and customer lead inquiries through a secure management console.

---

## 2. Product Philosophy & Design Principles

1. **Rule-Based Conversational Discovery (Not AI Chatbot & Not Conventional Filter Bar)**:
   - Property search is powered by a deterministic, catalog-driven rule engine (`query-builder.ts`).
   - The user answers one structured question at a time by clicking touch-friendly option buttons (`[1 BHK]`, `[2 BHK]`, `[Wakad]`, etc.).
   - No free-text search bars, no client-side NLP parsing, and no external LLM dependencies.
2. **Contextual Developer Identity & Trust**:
   - On Developer Pages (`/:developerSlug`) and Project Pages (`/:developerSlug/:locationSlug/:projectSlug`), the header branding displays **`[Developer Name]`** directly to establish immediate user trust.
   - Platform branding (`Virtual Reality`) resides on the Homepage, Search Page, and in the official site footer.
3. **Thin Page Orchestrators & Modular Presentation**:
   - Page components (`HomePage.tsx`, `ProjectPage.tsx`, `DeveloperPage.tsx`, `SearchPage.tsx`) strictly handle route orchestration, hook binding, and lifecycle.
   - Section components are pure presentation blocks driven by typed props.
4. **Single Source of Truth Persistence**:
   - PostgreSQL database is the single source of truth for approved properties.
   - Importer/scraper data acts as unapproved draft candidates requiring human admin review before publication.
5. **Strict Multi-Entity Publication Boundary**:
   - Projects and unit configurations are publicly accessible if and only if `Project.publishStatus === "PUBLISHED"` AND `Developer.publishStatus === "PUBLISHED"`.

---

## 3. Current Product Architecture Overview

```
PUBLIC APPLICATION

PublicShell (Layout Route)
│
├── GlobalHeader (Contextual Developer Branding / Platform Branding)
│   ├── Brand Identity ("Virtual Reality" or "[Developer Name]")
│   ├── Desktop Primary Navigation ("Home", "Discover")
│   ├── Ask Assistant Action ("✦ Ask Assistant" -> openAssistant())
│   └── Mobile Navigation Drawer (Hamburger toggle ☰ / ✕)
│
├── Outlet (Public Route Content)
│   ├── Homepage (/)
│   ├── Search Page (/search)
│   ├── Developer Page (/:developerSlug)
│   └── Project Page (/:developerSlug/:locationSlug/:projectSlug)
│       └── ProjectSubNav (Contextual page sub-navigation)
│
├── PropertyAssistantOverlay (Application-Wide Floating Panel / Mobile Bottom Sheet)
│   └── useAssistant() / searchChat (query-builder.ts rule engine)
│
└── AboutFooter (Site-Wide Footer)

ISOLATED ADMIN MANAGEMENT CONSOLE

AdminRoutes (/admin/*)
└── ProtectedRoute (JWT Guard)
    └── AdminLayout
        └── Admin Management Pages (Dashboard, Developers, Projects, Configurations, Leads, Import, Media)
```

---

## 4. Major Public Pages & Journeys

### 1. Homepage (`/`)
- **Purpose**: Establishes firm identity, dominant visual entrance, featured developer portfolio list, featured project showcase with mobile scroll-snap, rule-based assistant invitation card (`ConversationalSearchEntry.tsx`), and platform footer.

### 2. Search / Discovery Page (`/search`)
- **Purpose**: Full property discovery results page presenting the interactive `SearchAssistant` conversation thread alongside matching `SearchResults` property cards (`PropertyResultCard.tsx`). Deep-links directly to canonical project URLs: `/:developerSlug/:locationSlug/:projectSlug?configuration=:configId`.

### 3. Developer Page (`/:developerSlug`)
- **Purpose**: Developer portfolio showcase featuring a full-bleed hero with floating developer logo badge, identity overview narrative, developer projects carousel, and developer enquiry lead capture form.

### 4. Project Page (`/:developerSlug/:locationSlug/:projectSlug`)
- **Purpose**: The core shareable destination of the platform. Features edge-to-edge cinematic project hero, sticky section anchor sub-navigation (`ProjectSubNav.tsx`), identity overview, unit configuration selector (`?configuration=<id>`), configuration media (floor plans & brochures), visual story galleries, amenities grid, Google Maps location, developer attribution card, and project lead enquiry form.

---

## 5. Technical Stack

| Domain | Technology |
| :--- | :--- |
| **Frontend Framework** | React 19, TypeScript, React Router 7, Vite |
| **Styling** | Modular CSS Architecture (`styles.css` importing `globals.css`, `layout.css`, `components.css`, public domain CSS files, and `admin/*.css`) |
| **Backend Runtime** | Node.js, Express, TypeScript (ES Modules) |
| **Database & ORM** | PostgreSQL, Prisma 7 with `@prisma/adapter-pg` driver adapter |
| **External Media Storage** | Cloudinary API (with server-side resource-type mapping: `IMAGE` $\rightarrow$ image, `VIDEO` $\rightarrow$ video, `DOCUMENT` $\rightarrow$ raw) |
| **Auth & Security** | JWT (JSON Web Tokens), bcryptjs password hashing, Helmet HTTP security headers |

---

## 6. Known Constraints & Non-Negotiable Rules

1. **DO NOT introduce AI/LLM models or natural-language search parsers** to the search discovery engine. The property assistant must remain a deterministic rule-based query builder.
2. **DO NOT break the Public Shell / Admin Shell separation**. Admin routes (`/admin/*`) must remain completely isolated from public header/footer components.
3. **DO NOT duplicate header components**. `GlobalHeader.tsx` is the sole header component across all public routes.
4. **DO NOT weaken the publication boundary**. Database queries for public endpoints must enforce `publishStatus === "PUBLISHED"` on both Project and Developer.
5. **DO NOT perform unrequested visual redesigns**. Architectural, structural, and behavioral tasks must preserve existing design tokens and CSS patterns.
