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
Provides full-screen conversational query builder interface and matching real estate project results.

### Locked Component Breakdown
```
SearchPage
├── GlobalHeader (Site Brand / Desktop & Mobile Nav)
├── SearchAssistant
│   ├── AssistantHeader ("Find a home that fits your life.")
│   ├── ConversationMessages (Message thread log with ✦ avatar badges)
│   ├── QuerySummary (Subtle context chips: [3 BHK ×] [Wakad ×])
│   └── RuleOptions (Touch-friendly rule option buttons)
├── SearchResults (List of matching PropertyResultCard items)
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
| **5** | `ProjectHeroCarousel` + `ProjectInteriorExteriorCarousel` | **PROJECT SHOWCASE** — Primary hero, interior, and exterior visual carousels. |
| **6** | `ConfigurationSection` | **WHAT CAN I BUY?** — Unit configuration cards (`?configuration=<id>`), carpet area, prices. |
| **7** | `ConfigurationMediaSection` | **CONFIGURATION DETAILS** — Selected unit floor plans and configuration-owned media. |
| **8** | `ProjectLocation` | **WHERE IS IT?** — Locality address, Google Maps link, and `LOCATION` media image. |
| **9** | `ProjectAmenities` | **AMENITIES** — Project amenities grid, rendered when amenities exist. |
| **10**| `TapToExploreGallery` | **PROJECT GALLERY** — Lightbox gallery for active project-context `IMAGE` media; `GALLERY` and `CONSTRUCTION` categories remain supported. |
| **11**| `ProjectVideoSection` | **OPTIONAL VIDEO** — YouTube/Vimeo/MP4 responsive video embed player. |
| **12**| `ProjectDeveloper` | **DEVELOPER** — Developer attribution card. |
| **13**| `LeadSection` | **INQUIRY** — Pre-bound project & configuration lead form. |
| **14**| `AboutFooter` | **FOOTER** — Official site footer. |

`ProjectOverview` renders Key Highlights only when the project has persisted highlight records; it does not create a placeholder section. Configuration media is returned under `project.configurations[].media` and is not included in the top-level `project.media` relation.

The configuration section renders a coming-soon placeholder when a project has no configurations. When configurations exist, cards are ordered by the public repository's deterministic configuration ordering and expose BHK, available area fields, starting price, and availability. Selecting a card writes `?configuration=<id>`; only that selected configuration's media section renders. Inactive configuration media is excluded by the public query, while configuration availability status is displayed as data rather than used to hide the configuration card.

Configuration media remains isolated by its persisted configuration relationship. Admin metadata updates must preserve a valid context/ownership combination, so configuration media cannot be converted into top-level project or developer media through the update endpoint.

Key Highlights are authored in the authenticated Project form and stored as `ProjectHighlight` records. They are optional, manually entered, capped at 12 per project, and ordered by their persisted `sortOrder`.

`ProjectSubNav` intentionally omits the former Visual Story item because the page's showcase is already rendered in the main narrative and has no separate navigation destination.
