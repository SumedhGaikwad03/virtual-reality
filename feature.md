# Feature and Capability Audit: Virtual2Reality Platform

A comprehensive audit of implemented user-facing features, administrative workflows, backend services, domain models, performance optimizations, and security controls across the Virtual2Reality real-estate platform.

---

## 1. Product Overview

### What Virtual2Reality Is
**Virtual2Reality** (`virtual2reality.in`) is a full-stack, production-grade real-estate discovery, content management, and advisory platform focused on luxury and prime residential developments across Pune, India. It combines a client-facing discovery experience with an integrated administrative suite (CMS, Lead Management, Scheduled Property Visits Workspace, and Rental Desk).

### Target Users & Personas
1. **Homebuyers & Real Estate Seekers**: Prospective luxury property buyers exploring developers, projects, unit configurations, floor plans, and amenities, seeking structured consultations or booking property visits.
2. **Tenants & Rental Seekers**: Individuals looking for verified rental homes in specific localities with specific furnishing/budget constraints.
3. **Property Owners / Landlords**: Homeowners looking to list properties with the firm’s rental desk.
4. **Internal Real Estate Advisors & Admins (`EMPLOYEE` / `FOUNDER`)**: Sales and operations personnel triaging leads, managing visit schedules, publishing developers/projects, reviewing media assets, matching rental requirements, and administering user permissions.

### Problems Solved
- **Information Asymmetry**: Aggregates verified developer profiles, project specifications, exact carpet areas, unit pricing, and curated media in one place.
- **Frictionless Inbound Lead Capture**: Replaces generic contact forms with contextual, two-step visit scheduling and callback requests tied directly to specific projects and configurations.
- **Operational Triage**: Streamlines lead tracking, scheduled site visits (categorized by Today, Upcoming, and Past), and rental matching through an administrative dashboard with real-time Web Push notifications.
- **Predictable Discovery**: Eliminates search dead-ends through a deterministic, rule-based conversational discovery advisor (**Tara**).

### Major Product Surfaces
- **Public Discovery & Editorial Shell**: Homepage, Developer Showcases, Project Detail Portals, Pune City Hub, Privacy Policy, and Standalone `/enquiry`.
- **Tara Discovery Advisor**: Multi-step interactive advisor with Buy vs. Rent branching, dynamic option narrowing, and zero-match recovery.
- **Public Rental Desk**: Dedicated rental discovery (`/rentals`) and owner property listing portal (`/rentals/list-property`).
- **Admin Management Suite (`/admin`)**: Operations dashboard, Developer & Project CMS, Configuration Editor, Multi-Context Media Manager, Lead CRM, Property Visits Workspace, Rental Desk Admin, Site Content/Firm Profile Manager, Admin User Management, and Web Scraper Import Preview.

---

## 2. Public Features

### Property & Developer Discovery
- **Project Discovery (`/:developerSlug/:locationSlug/:projectSlug`)**:
  - Full-bleed hero imagery, verified RERA/project status badges (`READY_TO_MOVE`, `ONGOING`, `UPCOMING`, `COMPLETED`, `SOLD_OUT`).
  - Key project highlights (`ProjectHighlight`), structured amenities list (`ProjectAmenity`), Google Maps location integration, and developer association.
  - Multi-category media gallery (Exterior, Interior, Amenities, Location, Construction updates, and Project Videos).
  - Published/Draft gatekeeping: Projects are discoverable publicly only when both the Project and its parent Developer have `publishStatus = "PUBLISHED"`.
- **Configuration-Level Data**:
  - Detailed unit breakdowns: BHK count, exact carpet area, built-up area, super built-up area, starting price in Indian denominations (`₹ Cr+` / `₹ Lakhs+`), and real-time availability (`AVAILABLE`, `LIMITED`, `SOLD_OUT`).
  - Configuration-specific media: Interactive floor plans and downloadable project brochures.
- **Developer Showcase (`/:developerSlug`)**:
  - Developer identity banner, logo, brand overview, website link, and active project catalog filtered by status and location.
  - Direct contextual developer enquiry CTA.
- **Search & Filtering (`/search`)**:
  - Freeform query input with natural language regex parsing (extracting BHK, location, developer, price limits, carpet area, availability, and project status).
  - Search catalog evaluation returning matched project configurations.

---

## 3. Tara Capabilities (Property Discovery Advisor)

### Architectural Fact Check
> **Tara is 100% deterministic and rule-based.**
> - **AI / LLMs**: **NONE**. There are no OpenAI, Gemini, Anthropic, or external AI API calls in the codebase.
> - **Embeddings / Vectors / RAG / Semantic Search**: **NONE**.
> - **Mechanism**: Tara executes a deterministic client-side rule evaluation engine against an in-memory `SearchCatalog` retrieved via `GET /api/search/catalog`.

```
                  ┌──────────────────────────────┐
                  │ GET /api/search/catalog      │
                  └──────────────┬───────────────┘
                                 │
                                 ▼
                    ┌──────────────────────────┐
                    │ Client In-Memory Catalog │
                    └────────────┬─────────────┘
                                 │
           ┌─────────────────────┴─────────────────────┐
           ▼                                           ▼
┌──────────────────────┐                    ┌──────────────────────┐
│  Intent Selection    │                    │ Adaptive Rule Engine │
│  (Buy vs. Rent)      │                    │ (BHK, Location, ...) │
└──────────┬───────────┘                    └──────────┬───────────┘
           │                                           │
           ├─► Rent ──► Navigate to /rentals           │
           │                                           ▼
           └─► Buy  ──► Interactive Rule Flow ──► Matches <= 3?
                                                       │
                                 ┌─────────────────────┴─────────────────────┐
                                 ▼                                           ▼
                     [Show Compact Cards & CTA]                  [Show Next Viable Question]
```

### Implemented Tara Capabilities
1. **Intent Branching (Buy vs. Rent)**: Greets the user with intent choices. Choosing "Rent a Home" hands off directly to the `/rentals` desk; choosing "Buy a Home" initiates the interactive discovery flow.
2. **Adaptive Rule Engine**: Evaluates 6 sequential discovery rules:
   - `bhk`: Derived strictly from remaining matching configurations.
   - `location`: Derives available location slugs; skips if only 1 location remains.
   - `project-status`: Filters by Ready to Move, Under Construction, New Launch.
   - `price`: Computes viable Indian budget bands (`< ₹1 Cr`, `< ₹1.5 Cr`, `< ₹2 Cr`, `< ₹3 Cr`, `< ₹5 Cr`, `₹5 Cr+`) based on candidate inventory.
   - `developer`: Filters by specific developer or provides an "Any developer" bypass option.
   - `availability`: Filters by unit availability status.
3. **Smart Question Skipping**: Automatically skips questions that provide no narrowing power (e.g., if all candidate projects are in the same location or share the same BHK).
4. **Early Stopping Threshold (`PROJECT_STOPPING_THRESHOLD = 3`)**: As soon as query filters narrow the viable inventory to $\le 3$ unique projects, Tara stops asking questions and renders the matching results.
5. **Direct Inline Results Rendering**:
   - For 1–2 matching projects: Displays rich, compact project summary cards (`TaraCompactProjectCard`) directly inside the conversation stream alongside matching unit configurations.
   - For 3+ matching projects: Displays a persistent "View All X Matching Homes across Y Projects" CTA.
6. **Dynamic Query Summary & Removal**: Shows active search criteria as interactive chips. Removing an individual chip re-evaluates the catalog in real time.
7. **Zero-Match Recovery**: Detects empty match intersections, halts questioning, and presents a recovery state with quick options to loosen specific constraints or reset.
8. **Session & History Navigation**: Supports multi-step backtrack (`← Previous`) and full search reset (`Start over`).

---

## 4. Enquiry & Lead Features

### Advisory & Consultation Flow
- **Proactive 5-Second Consultation Modal (`AdvisoryPopupModal`)**:
  - Automatically triggers 5 seconds into a user session (controlled by `sessionStorage` guard).
  - 3-stage flow: Invitation stage ("Let's Connect") $\rightarrow$ Intake Form $\rightarrow$ Success Confirmation.
  - Direct communication actions: Pre-filled `tel:` click-to-call and WhatsApp deep-link with encoded inquiry text.
- **Contextual Property Enquiries (`ContextualEnquiryModal`)**:
  - Triggered from project/developer headers, cards, and configuration rows.
  - **Two-Step Schedule a Visit**:
    - Step 1: Full Name, Mobile Number, Email (optional), Preferred Date (with minimum date validation set to current Indian Standard Time).
    - Step 2: Preferred Time Slot (`Morning: 10 AM – 1 PM`, `Afternoon: 1 PM – 5 PM`, `Evening: 5 PM – 8 PM`) and optional notes.
  - **Streamlined Request a Callback**: Instant 1-step contact submission with contextual discussion notes.
  - **Auto-Inherited Context**: Automatically links `projectId`, `developerId`, and `configurationId` without manual user entry.
- **Standalone Enquiry Route (`/enquiry`)**:
  - Distraction-free standalone page outside the public shell.
  - 3 mandatory fields: Full Name, 10-digit Indian Mobile Number, Preferred Visit Date.
  - Progressive disclosure accordion for optional details (Time Slot, Preferred Location, Budget, Email, Notes).

### Lead Context Resolution & Relational Integrity
- **Backend Context Resolver (`resolveLeadContext`)**:
  - When a lead is submitted with only a `configurationId`, the backend validates its existence, retrieves the parent `projectId`, and extracts the owning `developerId`.
  - Enforces relational validation: throws `CONFIGURATION_PROJECT_MISMATCH` or `DEVELOPER_PROJECT_MISMATCH` if cross-entity IDs are mismatched.
- **Real-Time Push Notifications**: Upon lead creation, `notification.service.ts` fires Web Push notifications via VAPID (`web-push`) to all active admin subscriptions. (Notification dispatch is non-blocking to protect lead persistence).

---

## 5. Rental Features

### Public Rental Capabilities
- **Rental Desk Discovery (`/rentals`)**:
  - Public portal outlining the rental advisory process, verified listing standards, and tenant consultation pathways.
- **Renter Enquiry Intake (`RentalEnquiryForm`)**:
  - Structured fields: Name, Phone, Desired Flat Configuration (1/2/3/4+ BHK), Location/Locality, Budget Band, Furnishing Preference (`UNFURNISHED`, `SEMI_FURNISHED`, `FULLY_FURNISHED`), Move-in Timeframe, Tenant Profile/Family Type, and Notes.
  - Generates a `RentalEnquiry` record (`status = "NEW"`).
- **Owner Property Intake (`/rentals/list-property` & `RentalPropertyForm`)**:
  - Structured fields: Owner Name, Phone, Flat Type, Approximate Size (sq.ft.), Locality/Address, Society/Developer Name, and Additional Property Details.
  - Generates a `RentalProperty` record (`status = "NEW"`).

### Admin Rental Capabilities
- **Rental Enquiries Management (`/admin/rentals/enquiries`)**: List, search, filter, view details, update internal notes, and manage lifecycle status (`NEW`, `CONTACTED`, `MATCHED`, `CLOSED`, `ARCHIVED`).
- **Available Rental Properties Management (`/admin/rentals/available`)**: List, filter, inspect details, update status (`NEW`, `VERIFIED`, `AVAILABLE`, `RENTED`, `ARCHIVED`), and log internal notes.
- **Automated Rental Matching Engine (`findRelevantAvailableProperties`)**: In the admin enquiry view, the system automatically runs candidate matching queries against `RentalProperty` inventory based on flat configuration, location, and locality.

---

## 6. Admin / CMS Features

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Admin Layout (/admin)                           │
├───────────────┬────────────────────────────────────────────────────────┤
│ Navigation    │ Workspaces & Features                                  │
│ ───────────── │ ────────────────────────────────────────────────────── │
│ Dashboard     │ • KPIs (New Today, Unattended, Ongoing, Active Projects)│
│ Leads CRM     │ • Multi-field Search, Status Triage, Lead Detail View  │
│ Visits Desk   │ • Today, Upcoming, Past Tabs; Cascading Form; Actions  │
│ Developers    │ • CRUD, Slug Management, Branding, Publishing Control  │
│ Projects      │ • CRUD, Status, Highlights, Amenities, Configurations   │
│ Media Manager │ • Multi-Context Uploads (Home/Dev/Project/Config)      │
│ Rental Desk   │ • Tenant Enquiries, Available Properties, Matching     │
│ Import Tool   │ • SSRF-Guarded URL Scraper, Draft Review & Approval    │
│ Site Profile  │ • Contact Details, Founder Bio, Firm Overview          │
│ Accounts*     │ • Admin Provisioning, Roles (Founder vs. Employee)     │
└───────────────┴────────────────────────────────────────────────────────┘
* Restricted to FOUNDER role
```

### Dashboard
- Real-time KPI summary cards: **New Leads Today**, **Unattended Leads**, **Ongoing Leads**, and **Active Projects**.
- Operational triage queues: "Needs Attention" (unattended `NEW` leads sorted by creation time) and "Ongoing Leads" (leads in `IN_PROGRESS` sorted by last update).
- Dynamic time-of-day greeting (`Good morning`, `Good afternoon`, `Good evening`) personalized to the authenticated admin's first name.

### Scheduled Visits Workspace (`/admin/visits`)
- **Operational Grouping**:
  - **Today**: Scheduled visits matching the current IST date, ordered by time slot (`Morning` $\rightarrow$ `Afternoon` $\rightarrow$ `Evening` $\rightarrow$ `Unspecified`) then creation time.
  - **Upcoming**: Scheduled visits after today, ordered chronologically by visit date ascending.
  - **Past**: Historical visits before today, ordered by visit date descending.
- **Cascading Visit Creation/Edit (`VisitModal`)**: Dynamic cascading dropdowns: Developer selection dynamically filters Projects; Project selection dynamically filters Configurations.
- **Operational Actions (`LeadActions`)**: Direct `tel:` phone call trigger, pre-formatted WhatsApp chat trigger with lead context, deep link to complete Lead profile, edit visit modal, and cancel/delete dialog.

### Developer, Project & Configuration CMS
- **Developer Management (`/admin/developers`)**: Create, edit, slug generation, logo URL, website, description, and draft/published state toggling.
- **Project Management (`/admin/projects`)**: Create, edit, location name/slug, status (`UPCOMING`, `ONGOING`, `READY_TO_MOVE`, `COMPLETED`, `SOLD_OUT`), featured flag, Google Maps URL, nested Highlights (`ProjectHighlight`), and Amenities (`ProjectAmenity`).
- **Configuration Management (`/admin/configurations`)**: Exact BHK, carpet area, built-up area, super built-up area, starting price in paise/rupees, and availability status (`AVAILABLE`, `LIMITED`, `SOLD_OUT`).

### Multi-Context Media Manager (`/admin/media`)
- Contextual media administration segmented by:
  - `HOME`: HERO, HERO_CAROUSEL, CARD, GALLERY.
  - `DEVELOPER`: HERO, GALLERY, CARD, DEVELOPER_BANNER.
  - `PROJECT`: HERO, HERO_CAROUSEL, GALLERY, EXTERIOR, INTERIOR, LOCATION, CONSTRUCTION, FLOOR_PLAN, BROCHURE, PROJECT_VIDEO.
  - `CONFIGURATION`: GALLERY, FLOOR_PLAN, BROCHURE.
- Direct Cloudinary upload via Multer memory storage with file size validation, mime-type checking, metadata assignment (title, alt text, slot, sort order, primary flag), and active/inactive visibility toggles.

### Web Scraper Import Preview (`/admin/import`)
- **SSRF-Protected URL Scraper**: Accepts a developer/project webpage URL, verifies DNS safety (blocking loopback, link-local, and private IP ranges RFC 1918), and fetches up to 2MB within a 10s timeout.
- **Data Extractor**: Parses OpenGraph tags, JSON-LD Schema.org objects (`Organization`, `Product`, `Residence`, `ApartmentComplex`), title/meta descriptions, configuration patterns (BHK regex, carpet area regex, price patterns normalized to paise), and candidate image/document links.
- **Human Review & Approval**: Renders extracted data as an editable `ImportDraft`. On approval, dispatches sequential API calls to create the Developer, Project, and Configurations through validated admin endpoints.

### Authentication & Account Administration
- **Authentication**: JWT authentication (`HS256`, Bearer token storage, configurable expiry), `bcryptjs` password hashing (salt rounds = 10).
- **Role-Based Access Control (RBAC)**:
  - `FOUNDER`: Full administrative access, including `/admin/accounts` for provisioning new admins, editing roles, changing passwords, and deactivating accounts.
  - `EMPLOYEE`: Access to daily operational workflows (Leads, Visits, CMS, Rentals, Media, Import), with `/admin/accounts` blocked at both the route guard and backend middleware levels (`requireFounderAuthentication`).
- **Self-Protection Invariants**: Admins cannot deactivate their own account; the system blocks deactivating the last remaining active admin account.

---

## 7. Backend Capabilities

### Architectural Pattern
- **Layered Clean Architecture**:
  $$\text{HTTP Request} \longrightarrow \text{Route} \longrightarrow \text{Controller} \longrightarrow \text{Service} \longrightarrow \text{Repository} \longrightarrow \text{Prisma / PostgreSQL}$$
- **Centralized Error Handling**: Global error middleware mapping application error codes (`DEVELOPER_NOT_FOUND`, `PROJECT_SLUG_EXISTS`, `AUTHENTICATION_REQUIRED`, `FORBIDDEN`, `PUSH_SUBSCRIPTION_OWNERSHIP_CONFLICT`, etc.) to structured HTTP responses.
- **Input Validation**: Dedicated validator layer (`express-validator` / custom sanitizers) validating phone numbers (Indian mobile regex), email formats, date constraints, and mandatory fields.
- **Web Push Engine**: Modular `notification.service.ts` using `web-push` with VAPID keys, tracking push endpoints and pruning dead subscriptions on 404/410 GCM responses.

---

## 8. Database / Domain Model

```
 ┌──────────────┐       ┌──────────────┐       ┌────────────────┐
 │  Developer   │──1:N─►│   Project    │──1:N─►│ Configuration  │
 └──────┬───────┘       └──────┬───────┘       └───────┬────────┘
        │                      │                       │
        │ 1:N                  │ 1:N                   │ 1:N
        ▼                      ▼                       ▼
 ┌──────────────┐       ┌──────────────┐       ┌────────────────┐
 │    Media     │       │     Lead     │◄──────┤ RentalEnquiry  │
 │ (Contextual) │       │   / Visits   │       │(Matching Logic)│
 └──────────────┘       └──────────────┘       └────────────────┘
```

### Core Entities & Domain Roles
1. **`Developer`**: Brand/developer entity with unique slug, logo, description, and `PublishStatus` (`DRAFT`/`PUBLISHED`).
2. **`Project`**: Residential development linked to a `Developer`. Unique constraint on `[developerId, slug]`. Holds status, location, featured flag, highlights (`ProjectHighlight`), and amenities (`ProjectAmenity`).
3. **`Configuration`**: Specific unit variant within a `Project`. Holds BHK count, carpet area, built-up area, super built-up area, starting price (`BigInt` in paise to eliminate floating-point errors), and availability status.
4. **`Media`**: Unified media entity supporting multi-tenancy across `HOME`, `DEVELOPER`, `PROJECT`, and `CONFIGURATION` contexts. Holds URL, thumbnail URL, type (`IMAGE`, `DOCUMENT`, `VIDEO`), category, alt text, sort order, and active toggle.
5. **`Lead`**: Customer enquiry entity. Stores contact information, optional relationship ties (`developerId`, `projectId`, `configurationId`), message, `visitDate` (ISO string), `visitTime` (`Morning`/`Afternoon`/`Evening`), operational status (`NEW`, `IN_PROGRESS`, `DONE`), and staff notes.
6. **`RentalEnquiry`**: Tenant demand record storing desired BHK configuration, location, budget, furnishing, timeframe, and status (`NEW`, `CONTACTED`, `MATCHED`, `CLOSED`, `ARCHIVED`).
7. **`RentalProperty`**: Landlord supply record storing owner contact, flat type, size, society, and status (`NEW`, `VERIFIED`, `AVAILABLE`, `RENTED`, `ARCHIVED`).
8. **`Admin`**: Platform user with email, bcrypt password hash, active flag, and role (`FOUNDER` vs. `EMPLOYEE`).
9. **`PushSubscription`**: Web push subscription record storing browser endpoint, `p256dh` key, and `auth` secret linked to an Admin.
10. **`FirmContact` & `FirmProfile`**: Global singleton records storing verified corporate contact information, founder credentials, experience bio, and profile imagery.

---

## 9. Media & Cloudinary Capabilities

### Stored vs. Delivered Assets
- **Stored Assets**: Original assets are stored in Cloudinary in their full resolution and fidelity. The PostgreSQL `Media` table stores canonical Cloudinary URLs.
- **Delivered Assets (Frontend Dynamic Transformations)**:
  - **Automatic Format & Quality**: Dynamic injection of `/f_auto,q_auto/` into Cloudinary delivery URLs.
  - **Width Caps & Mode**: Card previews and listing thumbnails apply `w_800,c_limit` or `w_200,c_limit` to prevent downloading multi-megabyte source images while preserving original aspect ratios without cropping.
  - **Preserved Assets**: Hero images, architectural lightboxes, and detailed floor plans maintain unconstrained width delivery (`f_auto,q_auto` only) to preserve visual clarity.
  - **SVG & Video Safety**: Vector graphics (`.svg`) and non-Cloudinary URLs are preserved without transformation.

---

## 10. SEO Capabilities

### Server-Side SEO Generation (`backend/src/routes/public/seo.routes.ts`)
- **Dynamic Crawler Documents**:
  - `GET /seo/home`: Fully formed HTML document with firm description and featured project catalog.
  - `GET /seo/developer/:developerSlug`: Developer portfolio document with active project listings.
  - `GET /seo/project/:developerSlug/:locationSlug/:projectSlug`: Property specification document with pricing, carpet area, configuration inventory, highlights, and amenities.
  - `GET /seo/location/:locationSlug` & `GET /seo/city-hub`: Curated location hub pages for Pune micro-markets (e.g., Pimpri, Baner).
- **Structured Data (JSON-LD)**: Injects Schema.org schemas for `RealEstateAgent`, `SingleFamilyResidence`, `ApartmentComplex`, and `BreadcrumbList`.
- **Dynamic XML Sitemap (`GET /sitemap.xml`)**: Queries published projects, developers, and locations from PostgreSQL in real time and generates compliant XML with `changefreq` and `priority` metadata.
- **Crawler Directives (`GET /robots.txt`)**: Allows standard web crawlers and explicitly points to the dynamic `/sitemap.xml`.

---

## 11. Performance & UX Capabilities

- **Vite Dynamic Chunk Code Splitting**: All 25+ administrative pages are lazy-loaded via `React.lazy()` and dynamic imports, keeping the public initial JavaScript bundle lightweight.
- **Deployment Skew Recovery (`vite:preloadError`)**: Listens to Vite chunk load failures caused by new production deployments, executing a single automatic reload guarded by `sessionStorage` to fetch the fresh bundle.
- **Service Worker Cache Guard (`sw.js`)**: Service worker intercepts static asset requests, specifically blocking SPA fallback HTML (`text/html`) from poisoning JavaScript chunk cache entries (`.js`).
- **Edge Cache-Control Headers (`vercel.json`)**: Configured immutable 1-year caching for content-hashed assets (`/assets/*`) and strict `max-age=0, must-revalidate` for `index.html`, `sw.js`, and `manifest.webmanifest`.
- **Smooth Inertial Scrolling**: Integrates `lenis` smooth scrolling provider with programmatic scroll-to-element and scroll-to-top helpers.
- **Accessibility & Focus Management**: Modals implement keyboard focus trapping, `Escape` key listeners, `aria-modal="true"`, and automatic focus restoration upon dismissal.

---

## 12. Security Capabilities

| Security Area | Concrete Implementation |
| :--- | :--- |
| **Authentication** | JWT authentication (`HS256`), Bearer token verification, payload UUID validation, database user active status check. |
| **Password Security** | Passwords hashed using `bcryptjs` (salt rounds = 10); hashes never exposed in API responses. |
| **Role Authorization** | Hard enforcement of `FOUNDER` vs. `EMPLOYEE` roles via `requireFounderAuthentication` on sensitive routes. |
| **SSRF Defense** | Web Scraper validates input URLs, performs DNS lookup, and blocks loopback/private/link-local IPv4/IPv6 ranges before fetching. |
| **HTTP Headers** | `helmet` configured with `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `X-Frame-Options: SAMEORIGIN`. |
| **CORS Policy** | Strict origin validation trusting official domains (`virtual2reality.in`), project Vercel subdomains, and localhost during development. |
| **Precision Financial Math**| Real-estate prices stored as `BigInt` (paise) to prevent IEEE-754 floating-point inaccuracies. |
| **Self-Account Protection** | Prevents admins from deactivating themselves or disabling the last remaining active administrator. |

---

## 13. End-to-End Workflows

### 1. Guided Property Discovery (Tara Advisor)
```
User clicks "✦ Tara" in header
  → Frontend mounts SearchAssistant and fetches GET /api/search/catalog
  → User selects "Buy a Home"
  → query-builder evaluates candidate inventory and displays BHK options
  → User selects "3 BHK"
  → query-builder narrows candidate projects to Pune locations with 3 BHK units
  → Matches reach <= 3 unique projects (PROJECT_STOPPING_THRESHOLD)
  → Tara renders TaraCompactProjectCard directly in conversation with matching configurations
  → User clicks "View Details" → Navigates to /:developerSlug/:locationSlug/:projectSlug
```

### 2. Contextual Visit Scheduling Flow
```
User clicks "Schedule a Visit" on Project Detail Page
  → ContextualEnquiryModal opens with entity context (Project ID & Developer ID)
  → Step 1: User enters Name, 10-digit Indian Mobile, and selects Preferred Visit Date
  → Step 2: User selects Time Slot ("Morning: 10 AM – 1 PM") and enters notes
  → User submits → Frontend calls POST /api/leads with structured visitDate and visitTime
  → Backend resolveLeadContext validates project ownership
  → Prisma creates Lead record (status: "NEW", visitDate: "2026-09-25", visitTime: "Morning")
  → NotificationService sends VAPID Web Push notification to all active admin devices
  → Modal displays "✓ Request Received" confirmation
```

### 3. Administrative Visit Triage Flow
```
Admin navigates to /admin/visits
  → VisitsPage calls GET /api/admin/visits with JWT Bearer token
  → Backend LeadService queries all leads where visitDate IS NOT NULL
  → Backend partitions leads into today, upcoming, and past against IST date
  → Admin views "Today" tab, clicks "WhatsApp" button on lead card
  → System opens WhatsApp Web/App pre-populated with lead name and project context
  → Admin clicks "Edit", changes status to "IN_PROGRESS", and updates notes
  → Frontend calls PATCH /api/admin/visits/:id → Lead updated in database
```

### 4. Web Scraper Import & Publishing Flow
```
Admin enters developer project URL on /admin/import
  → Frontend calls POST /api/admin/import/analyze
  → Backend scraper.ts runs assertSafeUrl (SSRF check) and fetches page HTML
  → Scraper extracts OpenGraph tags, JSON-LD schemas, BHK counts, carpet areas, and prices
  → Frontend displays editable ImportDraft preview
  → Admin modifies project details and clicks "Approve & Import"
  → Frontend sequentially calls POST /api/admin/developers, POST /api/admin/projects, and POST /api/admin/configurations
  → Entities are persisted as DRAFT in PostgreSQL for human review
```

---

## 14. Resume-Worthy Product Capabilities

### A. Product Features
1. **Tara Conversational Property Advisor**: Deterministic client-side discovery engine providing guided exploration without AI latency or hallucinations. *(Confidence: HIGH)*
2. **Contextual 2-Step Visit Booking**: Progressive disclosure scheduling system linked directly to project/unit context. *(Confidence: HIGH)*
3. **Dedicated Scheduled Visits Workspace**: Operational triage interface categorizing property visits into Today, Upcoming, and Past queues. *(Confidence: HIGH)*
4. **Full-Lifecycle Rental Desk**: Dual-sided demand/supply intake portal with automated candidate property matching. *(Confidence: HIGH)*
5. **Standalone Editorial Enquiry Interface**: Dedicated conversion-optimized `/enquiry` route with Indian mobile validation and date guards. *(Confidence: HIGH)*

### B. Engineering & Architecture
6. **Layered Express / TypeScript / Prisma 7 Architecture**: Clean separation between Routes, Controllers, Services, Repositories, and Adapters. *(Confidence: HIGH)*
7. **Relational Context Resolution**: Automatic derivation and validation of developer/project/configuration hierarchies. *(Confidence: HIGH)*
8. **Deterministic Catalog Evaluator**: Client-side filtering engine deriving dynamic options strictly from viable inventory. *(Confidence: HIGH)*
9. **Role-Based Access Control (Founder vs. Employee)**: Dual-level access control enforced in React route guards and Express middleware. *(Confidence: HIGH)*

### C. Performance & Media Infrastructure
10. **Delivery-Time Cloudinary Image Optimization**: Client-side URL transformation pipeline injecting `f_auto,q_auto` and targeted width caps without modifying origin assets. *(Confidence: HIGH)*
11. **Vite Preload Skew Recovery**: Zero-downtime client-side recovery from chunk hash mismatch during deployments. *(Confidence: HIGH)*
12. **Service Worker Cache Guarding**: PWA caching layer that prevents SPA HTML fallback responses from poisoning JavaScript chunk storage. *(Confidence: HIGH)*

### D. Security & Growth
13. **SSRF-Guarded Web Ingestion Pipeline**: Scraper engine with pre-fetch DNS verification blocking private IPv4/IPv6 ranges. *(Confidence: HIGH)*
14. **Server-Rendered SEO Engine**: Dynamic HTML/XML generator producing OpenGraph tags, Schema.org JSON-LD, sitemaps, and robots directives. *(Confidence: HIGH)*
15. **Real-Time VAPID Web Push Notifications**: Multi-device admin notification service with automatic dead-subscription pruning. *(Confidence: HIGH)*

---

## 15. Top 10 Strongest Capabilities

1. **Tara Deterministic Discovery Engine**: High engineering and product depth; evaluates complex multi-attribute real-estate queries client-side with zero hallucination risk.
2. **Dedicated Administrative Property Visits Workspace**: Complete operational tool managing scheduling, cascading selection, and one-click WhatsApp/Call triage.
3. **Contextual Lead Capture & Resolution Pipeline**: End-to-end flow from contextual UI triggers to relational hierarchy validation and admin push notifications.
4. **SSRF-Protected Scraper & Import Review Workflow**: Secure web ingestion engine parsing unstructured web data into validated draft entities.
5. **Role-Based Admin Authentication & Provisioning**: Multi-role security model (`FOUNDER` vs `EMPLOYEE`) with token verification and self-deactivation protection.
6. **Multi-Context Media Management Architecture**: Centralized asset management supporting HOME, DEVELOPER, PROJECT, and CONFIGURATION scopes.
7. **Dynamic Delivery-Time Cloudinary Optimization**: Client-side URL transformation layer reducing payload sizes while protecting high-resolution architectural assets.
8. **Automated Rental Matching Engine**: Algorithmic matching between incoming tenant requirements and available landlord inventory.
9. **Full-Stack SEO & Dynamic Schema Generation**: Server-rendered crawler documents, Schema.org JSON-LD, and dynamic XML sitemap generation.
10. **Deployment Skew & Service Worker Cache Recovery**: Resilient frontend infrastructure preventing stale-chunk crashes across rolling deployments.

### Product Thinking Highlights
- Intent branching in Tara (Buy vs. Rent) directing users to the appropriate product surface.
- Two-step progressive disclosure for scheduling visits to reduce form fatigue.
- Time-of-day personalized admin greeting and unattended lead triage queues.
- Immediate click-to-call and WhatsApp deep linking pre-populated with lead context.
- Informational configuration pills highlighting exact BHK and carpet area in modal flows.

### Engineering Depth Highlights
- SSRF prevention using DNS resolution and RFC 1918 private address filtering.
- Exact Indian currency math using `BigInt` paise to eliminate floating-point errors.
- Automatic pruning of dead Web Push subscriptions on GCM 404/410 status codes.
- Relational integrity verification enforcing that configurations belong to their declared project and developer.
- Safe chunk recovery using `vite:preloadError` and `sessionStorage` execution guards.

### Full-Stack Ownership Highlights
- Designed complete database schema across 10+ models in Prisma 7 and PostgreSQL.
- Implemented responsive, accessible React components with keyboard focus trapping.
- Built end-to-end REST APIs with centralized error mapping and standard ProblemDetails responses.
- Configured edge caching headers and deployment configurations in `vercel.json`.
- Integrated external services (Cloudinary, Web Push VAPID) behind isolated server-side adapters.

---

## 16. Evidence Matrix

| Capability | Evidence Files | User-Facing? | Backend Support? | Resume-Worthy? | Confidence |
| :--- | :--- | :---: | :---: | :---: | :---: |
| **Tara Discovery Advisor** | `query-builder.ts`, `SearchAssistant.tsx`, `assistant-dialogue.ts` | Yes | Yes (`search-catalog.repository.ts`) | **Yes** | **HIGH** |
| **Contextual Visit Scheduling** | `ContextualEnquiryModal.tsx`, `lead.validator.ts` | Yes | Yes (`lead.service.ts`) | **Yes** | **HIGH** |
| **Visits Workspace** | `VisitsPage.tsx`, `VisitModal.tsx`, `visit.routes.ts` | Yes (Admin) | Yes (`lead.repository.ts`) | **Yes** | **HIGH** |
| **SSRF Web Scraper** | `scraper.ts`, `ImportPage.tsx`, `import.routes.ts` | Yes (Admin) | Yes (`import.service.ts`) | **Yes** | **HIGH** |
| **Multi-Context Media CMS** | `MediaManagerPage.tsx`, `media.repository.ts`, `cloudinary.ts` | Yes (Admin) | Yes (`media.service.ts`) | **Yes** | **HIGH** |
| **Cloudinary Delivery Optimization**| `image.ts`, `FeaturedProjectCard.tsx`, `ProjectCard.tsx` | Yes | N/A (Client Utility) | **Yes** | **HIGH** |
| **VAPID Web Push Engine** | `notification.service.ts`, `push.ts`, `sw.js` | Yes (Admin) | Yes (`push-subscription.repository.ts`) | **Yes** | **HIGH** |
| **Role-Based Access Control** | `ProtectedRoute.tsx`, `auth.middleware.ts`, `AdminAccountsPage.tsx` | Yes (Admin) | Yes (`admin.repository.ts`) | **Yes** | **HIGH** |
| **Rental Demand/Supply Desk** | `RentalsPage.tsx`, `ListPropertyPage.tsx`, `rental.service.ts` | Yes | Yes (`rental.repository.ts`) | **Yes** | **HIGH** |
| **Automated Rental Matching** | `RentalEnquiryDetailPage.tsx`, `rental.repository.ts` | Yes (Admin) | Yes (`rental.service.ts`) | **Yes** | **HIGH** |
| **Server-Side SEO Engine** | `seo.routes.ts`, `seo-renderer.service.ts` | Yes (Crawlers) | Yes (`seo.routes.ts`) | **Yes** | **HIGH** |
| **Vite Skew / SW Recovery** | `main.tsx`, `sw.js`, `vercel.json` | Yes | N/A (Infra/Frontend) | **Yes** | **HIGH** |
| **Standalone Enquiry Route** | `EnquiryPage.tsx`, `lead.service.ts` | Yes | Yes (`lead.repository.ts`) | **Yes** | **HIGH** |
| **Proactive Advisory Modal** | `AdvisoryPopupModal.tsx`, `AdvisoryContext.tsx` | Yes | Yes (`lead.service.ts`) | **Yes** | **HIGH** |
| **BigInt Currency Precision** | `schema.prisma`, `price-normalizer.ts`, `query-generator.service.ts`| Indirect | Yes (PostgreSQL/Prisma) | **Yes** | **HIGH** |
