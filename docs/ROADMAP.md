# Product & Architecture Roadmap

---

## 1. Phase Status Overview

```
┌─────────────────────────────────────────────────────────┐
│ PHASE 1: Core Backend & Data Models                     │  [COMPLETED]
├─────────────────────────────────────────────────────────┤
│ PHASE 2: Page Information Architecture & Shell          │  [COMPLETED & LOCKED]
├─────────────────────────────────────────────────────────┤
│ PHASE 3: Rule-Based Conversational Search Overlay       │  [COMPLETED & LOCKED]
├─────────────────────────────────────────────────────────┤
│ PHASE 4: Visual Polish & Micro-Interactions             │  [NEXT]
├─────────────────────────────────────────────────────────┤
│ PHASE 5: Advanced Admin Ingestion & Lead Integrations   │  [LATER]
└─────────────────────────────────────────────────────────┘
```

---

## 2. Phase Breakdown

### COMPLETED
- ✅ PostgreSQL database schema & Prisma 7 driver adapter setup.
- ✅ Admin management CRUD (Developers, Projects, Configurations, Media, Leads).
- ✅ Cloudinary external media adapter mapping (`IMAGE`, `VIDEO`, `DOCUMENT`).
- ✅ Public Developer Page architecture (`/:developerSlug`).
- ✅ Public Project Page architecture (`/:developerSlug/:locationSlug/:projectSlug?configuration=:configId`).
- ✅ Sticky Project Sub-Navigation (`ProjectSubNav.tsx`).
- ✅ Pure Rule-Based Conversational Discovery engine (`query-builder.ts`, `useSearchChat.ts`).
- ✅ Application-Wide Assistant Overlay & Sheet (`PropertyAssistantOverlay.tsx`, `AssistantContext.tsx`).
- ✅ Global Shell Layout & Header (`PublicShell.tsx`, `GlobalHeader.tsx`).
- ✅ Contextual Developer Header Branding (`HeaderContext.tsx`).
- ✅ Installable admin PWA foundation with static-shell-only service-worker caching.
- ✅ Multi-device authenticated Web Push subscriptions and best-effort new-lead notifications.
- ✅ Operational Lead Manager actions for WhatsApp, phone calls, and NEW-lead attention state.
- ✅ Project Amenities Admin Management Workflow (`/api/admin/projects/:projectId/amenities`).
- ✅ Project Key Highlights authoring workflow (`/api/admin/projects/:projectId/highlights`) with optional ordered content in the Project form.
- ✅ Public Project Page information architecture (static hero, overview with optional highlights, project showcase, configurations and configuration media, location, amenities, project gallery, optional video, developer attribution, enquiry, and footer).
- ✅ Admin External Video URL Creation (`POST /api/admin/media/url`).
- ✅ Visual Media Refinement Pass (soft crossfade 800ms transitions, wide cinematic carousel framing, slide preloading, visibility change pause).
- ✅ Contextual Enquiry Modal & Mobile Sticky Action Bar (`ContextualEnquiryModal.tsx`, mobile sticky bar `<768px`).
- ✅ Server-Side SEO Pre-Rendering & Edge Rewrites (Phase 1 & Phase 2: Home, City Hub, Location Hubs, Developer Hubs, Project Details, dynamic 16-URL XML Sitemap, Robots directives, Schema.org JSON-LD).

### CURRENTLY LOCKED
- 🔒 Section ordering on Homepage, Developer Page, Project Page, Search Page, City Hub, and Location Hubs.
- 🔒 Pure Rule-Based Search strategy (No NLP / No LLM dependency).
- 🔒 Multi-Entity Publication Model (`Project.publishStatus === "PUBLISHED" && Developer.publishStatus === "PUBLISHED"`).
- 🔒 Isolated Admin Routes (`/admin/*`).

### NEXT
- ⏳ Site-wide visual refinement pass (typography hierarchy, card spacing, color tokens).
- ⏳ Dedicated mobile responsive visual pass (hero image cropping, touch target polish).
- ⏳ Hero carousel autoplay pass.

### LATER
- 🔮 Lead webhook notifications (WhatsApp / Email alerts).
- 🔮 Scraper import pipeline expansion (normalizer and validator pipeline).

### EXPERIMENTAL / FUTURE
- 🧪 Multi-city catalog expansion beyond Pune.
- 🧪 Interactive 3D floor plan viewer integration.
