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

### Locked Information Hierarchy & Section Narrative

| Step | Section Component | Narrative Intent / User Question Answered |
| :---: | :--- | :--- |
| **1** | `ProjectHero` | **IMAGE & EMOTION** — Establish cinematic project identity & primary CTA anchor. |
| **2** | `ProjectSubNav` | **NAVIGATION** — Sticky contextual section navigation bar (`Overview \| Configurations \| Visual Story \| Amenities \| Location \| Developer \| Enquire`). |
| **3** | `ProjectOverview` | **WHAT IS THIS PROJECT?** — Narrative description, locality, status, and highlights. |
| **4** | `ConfigurationSection` & `ConfigurationMediaSection` | **WHAT CAN I BUY?** — Unit configuration cards (`?configuration=<id>`), carpet area, prices, and floor plans. |
| **5** | `ProjectVisualStory` | **SHOW ME THE PROJECT** — Featured hero carousel & categorized project galleries. |
| **6** | `ProjectAmenities` | **WHAT DOES IT OFFER?** — Project amenities & features grid. |
| **7** | `ProjectLocation` | **WHERE IS IT?** — Address, locality context, and Google Maps direction link. |
| **8** | `ProjectDeveloper` | **WHO BUILT IT?** — Developer attribution card with bidirectional link to Developer Page. |
| **9** | `LeadSection` | **I WANT TO KNOW MORE** — Pre-bound project & configuration enquiry form. |
| **10**| `AboutFooter` | **PLATFORM FOOTER** — Official platform branding & legal footer. |
