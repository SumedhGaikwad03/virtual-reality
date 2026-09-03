# Page Architecture Specifications

---

## 1. Homepage (`/`)

### Purpose
Establishes firm identity, dominant visual entrance, featured developer portfolio directory, featured project showcase, rule-based discovery entry, and platform footer.

### Locked Section Ordering
```
HomePage
├── GlobalHeader (Site Brand / Desktop & Mobile Nav)
├── AtmosphericHero (Dominant hero visual & headline narrative)
├── ExploreDevelopers (Developer directory row list)
├── FeaturedProjects (Featured projects carousel with mobile scroll-snap)
├── ConversationalSearchEntry (Rule-based assistant entry card -> openAssistant())
├── FirmOverview (Company vision & ethos)
├── ContactSection (Contact details & inquiry prompt)
└── AboutFooter (Platform footer & identity)
```

---

## 2. Search & Discovery Page (`/search`)

### Purpose
Provides full-screen button-driven conversational query builder interface and matching real estate project results grounded in the published catalog (intelligent project-level stopping at $\le 3$ unique projects, formatted prices, and zero-result recovery).

### Locked Component Breakdown
```
SearchPage
├── GlobalHeader (Site Brand / Desktop & Mobile Nav)
├── SearchAssistant
│   ├── AssistantHeader ("Find a home that fits your life.")
│   ├── ConversationMessages (Message thread log with ✦ avatar badges)
│   ├── QuerySummary (Subtle context chips: [3 BHK ×] [Wakad ×])
│   ├── RuleOptions (Touch-friendly rule option buttons)
│   └── SearchAssistantEmptyState (Zero-result recovery shortcuts & start over)
├── SearchResults (List of matching PropertyResultCard items with formatted prices)
└── AboutFooter (Platform footer)
```

---

## 3. Developer Page (`/:developerSlug`)

### Purpose
Developer portfolio showcase establishing developer identity, active projects, and developer lead capture.

### Locked Section Ordering
```
DeveloperPage
├── GlobalHeader (Displays [Developer Name] directly)
├── DeveloperHero (Full-bleed hero with floating developer logo badge)
├── DeveloperIntro (Developer identity narrative & statistics)
├── DeveloperProjects (Carousel of projects by developer & zero-project fallback)
├── DeveloperLeadSection (Developer inquiry lead capture form)
├── AboutFooter (Platform footer)
└── FloatingSearchControl (Persistent assistant access)
```

---

## 4. Project Page (`/:developerSlug/:locationSlug/:projectSlug`)

### Purpose
The canonical shareable project experience on the platform.

### Locked Information Hierarchy & Visual Narrative

| Step | Section Component | Narrative Intent / Media Category |
| :---: | :--- | :--- |
| **1** | `GlobalHeader` | **IDENTITY** — Displays `[Developer Name]` header attribution. |
| **2** | `ProjectHero` | **STATIC HERO** — Primary cinematic static image (`category: HERO`). |
| **3** | `ProjectSubNav` | **NAVIGATION** — Sticky contextual section navigation bar. |
| **4** | `ProjectOverview` | **WHAT IS THIS PROJECT?** — Narrative description, locality, status, and optional data-backed highlights. |
| **5** | `ProjectVideoSection` | **OPTIONAL VIDEO** — Project-owned YouTube/Vimeo/MP4 player, omitted when unavailable. |
| **6** | `ProjectInteriorExteriorCarousel` | **PROJECT SHOWCASE** — Project-owned interior and exterior visual carousel, omitted when unavailable. |
| **7** | `ProjectAmenities` | **AMENITIES** — Concise project amenities, rendered when amenities exist. |
| **8** | `ProjectHeroCarousel` | **FEATURED SHOWCASE** — Project-owned `HERO_CAROUSEL` media, omitted when unavailable. |
| **9** | `ConfigurationSection` | **WHAT CAN I BUY?** — Clean BHK, carpet area, starting price, availability, and `View Details` selection. |
| **10**| `ConfigurationMediaSection` | **CONFIGURATION DETAILS** — Selected unit floor plans and configuration-owned media. |
| **11**| `ProjectLocation` | **WHERE IS IT?** — Locality address, Google Maps link, and project-owned `LOCATION` media image. |
| **12**| `TapToExploreGallery` | **PROJECT GALLERY** — Lightbox gallery for active project-context `IMAGE` media. |
| **13**| `ProjectDeveloper` | **DEVELOPER** — Developer attribution before the final conversion step. |
| **14**| `LeadSection` | **INQUIRY** — Pre-bound project & configuration lead form; official footer follows. |

`ProjectOverview` renders Key Highlights only when the project has persisted highlight records; it does not create a placeholder section. Configuration media is returned under `project.configurations[].media` and is not included in the top-level `project.media` relation.

The configuration section renders a coming-soon placeholder when a project has no configurations. When configurations exist, cards are ordered by the public repository's deterministic configuration ordering and expose only BHK/name, carpet area, starting price, availability, and the existing `View Details` CTA. Built-up and super-built-up values remain in the API/admin model but are intentionally omitted from the public summary card. Selecting a card writes `?configuration=<id>`; only that selected configuration's media section renders, preserving refresh/deep-link behavior.

Configuration media remains isolated by its persisted configuration relationship. Admin metadata updates must preserve a valid context/ownership combination, so configuration media cannot be converted into top-level project or developer media through the update endpoint.

Key Highlights are authored in the authenticated Project form and stored as `ProjectHighlight` records. They are optional, manually entered, capped at 12 per project, and ordered by their persisted `sortOrder`.

`ProjectSubNav` intentionally omits the former Visual Story item because the page's showcase is already rendered in the main narrative and has no separate navigation destination.

Homepage developer discovery uses the direct `DEVELOPER`-context `DEVELOPER_BANNER` relationship when available, then the developer's existing logo, and never project or configuration media. Developer cards link to the existing `/:developerSlug` page; project cards link to the existing project route.

Project pages include an `Explore this project` anchor navigation area after the overview. It exposes only destinations whose content exists (plus Enquire), uses the existing section IDs, and collapses from a desktop grid to two columns and then one column on narrow screens. Public developer official website links are intentionally omitted; the URL remains available to authenticated admin workflows.

Authenticated configuration administration remains project-scoped: configuration list and edit pages preserve the owning project context, use primary save/create actions, and use secondary Back and Manage Configuration Media actions. The public configuration selection contract is unchanged.

---

## 5. Pune City Hub (`/projects-in-pune`)

### Purpose
High-level city aggregator page presenting all published residential developments in Pune grouped by locality and developer, establishing city-wide search authority with `Place`, `ItemList`, and `BreadcrumbList` Schema.org structured data.

### Pre-Rendered Narrative Structure
```
PuneCityHub (Server Pre-rendered HTML)
├── Header & Narrative (`Residential Projects in Pune`)
├── City Metrics Summary (Total Projects, Localities, Developers)
├── Locality Directory Grid (Links to /location/:locationSlug)
├── Developer Portfolio Directory (Links to /:developerSlug)
├── Comprehensive Project List (Crawlable canonical cards linking to /:dev/:loc/:proj)
└── AboutFooter & Search Assistant Deep Links
```

---

## 6. Locality Hubs (`/location/:locationSlug`)

### Purpose
Micro-market landing pages for active Pune residential corridors (`/location/kharadi`, `/location/pimpri`, `/location/hinjewadi`, `/location/magarpatta`). Pre-renders local project inventory, developer attributions, and structured metadata (`Place`, `ItemList`, `BreadcrumbList`).

### Pre-Rendered Narrative Structure
```
LocationHub (Server Pre-rendered HTML)
├── Breadcrumb Navigation (`Home` > `Pune Projects` > `:locationName`)
├── Header & Narrative (`Residential Projects in :locationName, Pune`)
├── Published Projects Grid (Project status, BHK inventory, starting prices)
├── Featured Developer Attribution Cards
├── Cross-Locality Navigation (Explore other Pune localities)
└── Direct Lead Enquiry & Search Assistant Access
```

---

## 7. Admin Media Workspace (`/admin/media`)

`/admin/media` is the global Home Media workspace. Its root endpoint is explicitly scoped to `context = HOME`; it does not act as a global “list all media” view. Project, configuration, and developer media are managed through their respective entity-scoped workspaces and remain separated by `PROJECT`, `CONFIGURATION`, and `DEVELOPER` context.

### Admin action language

Admin project rows, lead actions, configuration actions, and form CTAs use the shared Admin action hierarchy. Primary actions remain filled, secondary actions are outlined, utility links stay compact, and communication actions are grouped; controls stack or wrap on narrow screens while workspace tabs remain compact.
