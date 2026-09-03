# Virtual2Reality Real-Estate Platform

A modern, production-grade architectural real estate discovery and lead-generation platform for premier residential developments in Pune.

**Live Production Domain:** [virtual2reality.in](https://virtual2reality.in)

---

## Overview

Virtual2Reality connects homebuyers with curated luxury residential developments and established developers (Godrej Properties, Panchshil Realty, VTP Realty). The platform features an intelligent conversational discovery assistant (**Tara**), deep-linked unit configuration views, a dedicated administrative CRM and media management console, and a high-performance **Server-Side SEO Pre-rendering & Edge Rewrite Layer**.

---

## Core Capabilities

- **Server-Side SEO & Metadata Pre-rendering:** Edge-proxied dynamic HTML rendering with Schema.org JSON-LD structured data (`WebSite`, `Organization`, `ApartmentComplex`, `Place`, `ItemList`, `BreadcrumbList`), Open Graph, and Twitter Cards across Home, Developer, Project, Locality, and City Hub pages.
- **Dynamic XML Sitemap:** Automatically generated sitemap (`/sitemap.xml`) indexing published developers, projects, locality hubs, and city aggregators with ISO `<lastmod>` timestamps.
- **Tara · Property Discovery Advisor:** 100% database-grounded, zero-hallucination conversational discovery assistant that helps users filter real-time catalog inventory via intuitive preference options.
- **Contextual Lead Capture:** Action-driven enquiry system tying customer interest directly to specific projects and unit configurations with WhatsApp and phone call triggers.
- **Admin Management Portal:** Administrative CRUD for developers, projects, configurations, highlights, amenities, media uploads (via Cloudinary), and lead review with Web Push notifications.

---

## Architecture & Tech Stack

```text
                     Browser / Googlebot
                              │
                              ▼
                     Vercel Edge CDN / Proxy
                      virtual2reality.in
                              │
         ┌────────────────────┼────────────────────┐
         │                    │                    │
    Static Assets         React SPA            SEO Routes
  (/assets/*, /icons/*)  (/search, /admin/*)  (/, /projects-in-pune,
         │                    │                /location/*, /:dev,
         ▼                    ▼                /:dev/:loc/:proj,
       Vercel               Vercel             /sitemap.xml, /robots.txt)
                                                   │
                                                   ▼
                                            Render Web Service
                                             (Express Backend)
                                                   │
                                                   ▼
                                           Prisma 7 Client
                                                   │
                                                   ▼
                                          PostgreSQL Database
```

### Technology Stack
- **Frontend:** React 19, TypeScript, React Router 7, Vite, Native Fetch API clients with AbortSignal cancellation.
- **Backend:** Node.js, Express, TypeScript (ES Modules).
- **Persistence & ORM:** PostgreSQL 17, Prisma 7 with `@prisma/adapter-pg` driver adapter.
- **Media Storage:** Cloudinary (server-side media upload with `IMAGE`, `VIDEO`, `DOCUMENT` resource mapping), Multer (memory storage).
- **Authentication & Security:** Admin database entity, bcrypt password hashing, short-lived JWTs (`HS256`), Helmet security headers, rate limiting, and URL scheme whitelisting.

---

## Project Structure

```text
virtual-reality/
├── backend/                  # Express REST API & SEO pre-rendering service
│   ├── prisma/               # Prisma schema & migrations
│   └── src/
│       ├── controllers/      # HTTP controllers (public & admin)
│       ├── lib/              # Prisma client adapter & Cloudinary setup
│       ├── repositories/     # Data-access layer & publication boundary enforcement
│       ├── routes/           # Express route definitions (public, admin, seo)
│       ├── services/         # Application workflows & SEO renderer service
│       └── validators/       # Input validation middleware
├── frontend/                 # Vite React SPA
│   ├── public/               # Static icons, manifest, service worker
│   └── src/
│       ├── api/              # Typed API clients
│       ├── components/       # Domain-grouped UI components (home, developer, project, search, admin)
│       ├── context/          # Global application state (AssistantContext, HeaderContext)
│       ├── pages/            # Page-level orchestrators
│       ├── router/           # React Router route configuration
│       └── styles/           # Modular CSS architecture
├── docs/                     # Architectural documentation, state records, and changelog
└── vercel.json               # Root edge rewrite rules (proxying SEO routes to Render)
```

---

## Development Setup

### Prerequisites
- Node.js 20+
- PostgreSQL 17+
- npm

### Installation & Running Locally

1. **Clone the repository:**
   ```bash
   git clone https://github.com/SumedhGaikwad03/virtual-reality.git
   cd virtual-reality
   ```

2. **Backend Setup:**
   ```bash
   cd backend
   npm install
   # Configure your .env file with DATABASE_URL, JWT_SECRET, CLOUDINARY credentials
   npx prisma generate
   npm run dev
   ```

3. **Frontend Setup:**
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```

4. **Production Build Verification:**
   ```bash
   # Backend TypeScript build
   cd backend && npm run build
   # Frontend Vite build
   cd ../frontend && npm run build
   ```

---

## License

Private / Proprietary — All Rights Reserved. Built by [Sumedh Gaikwad](https://github.com/SumedhGaikwad03).
