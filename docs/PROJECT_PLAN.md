# Virtual Reality Real-Estate Platform

## 1. Project Overview

This project is the planned evolution of the existing Virtual Reality real-estate website into a modular Pune-focused property discovery and lead-generation platform.

Current production website:

https://www.virtual2reality.in/

Repository:

https://github.com/SumedhGaikwad03/virtual-reality

The existing website is simple. The new system will preserve the business purpose while introducing structured property data, an admin CMS, media management, lead generation, property search, assisted data ingestion, monitoring, and eventually a property-search chatbot.

The goal is to build the platform quickly without sacrificing maintainability.

---

# 2. Product Goals

## Primary goal

Create a polished Pune-focused real-estate website that helps visitors discover projects and generates qualified leads for the client.

## Secondary goals

- Make property data easy for a basic-skilled admin to manage.
- Minimize manual data entry where possible.
- Use scraping/importing as an assistant rather than an uncontrolled source of truth.
- Automatically detect useful changes such as price changes.
- Make floor plans, brochures, images, and other project assets easy to manage.
- Provide sales staff with useful lead context.
- Eventually provide a property-search assistant/chatbot.
- Keep the entire system modular so future integrations do not require rewriting core business logic.

---

# 3. Core Engineering Philosophy

The project should prioritize:

- Low coupling
- High cohesion
- Clear domain boundaries
- Explicit interfaces
- Testability
- Maintainability
- Fast incremental development

Avoid:

- God classes
- God services
- Giant controllers
- Circular dependencies
- Shared mutable state
- Business logic inside controllers
- Database logic scattered throughout the application
- Direct coupling to external APIs or websites
- Premature abstractions
- Building future features before their dependencies are stable

The architecture should be simple enough to understand while remaining extensible.

---

# 4. Development Strategy

The backend is built first.

Frontend development happens slice-by-slice after backend capabilities are proven.

The preferred development loop is:

```text
Requirements
    ↓
Data model
    ↓
API contract
    ↓
Backend implementation
    ↓
Backend tests
    ↓
Frontend slice
    ↓
Integration testing
    ↓
Deployment
```

Implementation should proceed one meaningful file at a time when working with Codex.

The long-term roadmap does NOT mean all features should be implemented immediately.

---

# 5. Git Strategy

The existing `main` branch represents the current production application.

The new platform is developed on `develop`.

```text
main
 └── Current production application

develop
 └── New platform
```

Feature branches may be created from `develop`:

```text
feature/backend-foundation
feature/developer-project
feature/media
feature/leads
feature/search
feature/importer
feature/monitoring
feature/chatbot
```

The current production site must remain functional until the replacement platform is fully tested and approved.

The new platform should eventually be merged into `main` through a controlled release.

---

# 6. Target System

The eventual platform contains:

```text
                    PUBLIC WEBSITE
                          │
              ┌───────────┴───────────┐
              │                       │
        Normal Browsing          Property Chatbot
              │                       │
              └───────────┬───────────┘
                          │
                   Property Search
                          │
                          ▼
                  PROPERTY DATABASE
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
     Properties         Media             Leads
        │                 │                 │
        └─────────────────┼─────────────────┘
                          │
                     ADMIN CMS
                          │
            ┌─────────────┼─────────────┐
            │             │             │
        Properties     Developers      Leads
            │
        Import Assistant
            │
        Change Monitoring
```

---

# 7. Domain Boundaries

The major domains are:

1. Developers
2. Projects / Properties
3. Configurations
4. Media
5. Leads
6. Search
7. Ingestion
8. Monitoring
9. Chatbot

The domains should interact through clear interfaces rather than tightly coupling implementations.

Example:

```text
Developer
    ↓ owns
Project
    ↓ contains
Configuration
    ↓ has
Media
```

A project can generate leads.

Search can query projects.

The chatbot can use search.

But unrelated domains should not know each other's implementation details.

For example:

```text
BAD:
Chatbot → PostgreSQL

BAD:
Lead → Scraper

BAD:
Developer → Scraper implementation

BAD:
Scraper → Property controller
```

Preferred:

```text
Chatbot
    ↓
PropertyQuery
    ↓
Property Search Service
    ↓
Repository
    ↓
Database
```

---

# 8. Backend Architecture

Preferred backend flow:

```text
HTTP Request
    ↓
Route
    ↓
Controller
    ↓
Application / Service Layer
    ↓
Domain / Business Logic
    ↓
Repository
    ↓
Database
```

Responsibilities:

### Routes

Define HTTP endpoints and connect them to controllers.

### Controllers

Handle HTTP concerns:

- Request parameters
- Request body
- Authentication context
- Calling services
- Returning HTTP responses

Controllers should not contain complex business logic.

### Services

Handle application workflows and business rules.

### Repositories

Handle persistence and database operations.

### Validation

Validate external input before business logic is executed.

### Adapters

Isolate external systems such as:

- File storage
- Email
- WhatsApp
- External APIs
- Web scraping
- LLM providers

---

# 9. Core V1 Entities

Start with:

```text
Developer
Project
Configuration
Media
Lead
```

Future entities:

```text
ImportSource
ImportDraft
PriceHistory
ChangeEvent
ChatSession
ChatMessage
```

Do not create future entities until their corresponding feature is being implemented.

---

# 10. Developer

A developer represents a real-estate development company.

Example:

```text
Mahindra Lifespaces
Godrej Properties
Kolte-Patil
```

Potential fields:

```text
id
name
slug
description
logo
website
createdAt
updatedAt
```

Projects belong to developers.

---

# 11. Project / Property

A project represents the real-estate development.

Example:

```text
Mahindra Citadel
Pimpri
Mahindra Lifespaces
```

Potential fields:

```text
id
developerId
name
slug
description
location
status
possessionDate
latitude
longitude
createdAt
updatedAt
```

A project can have multiple configurations.

---

# 12. Configuration

A configuration represents a specific property type inside a project.

Example:

```text
3 BHK
1094 sq ft
₹1.57 Cr
```

Potential fields:

```text
id
projectId
type
bhk
carpetArea
priceMin
priceMax
availability
createdAt
updatedAt
```

Do not put BHK, area, or price directly on the project because a project can have multiple configurations.

---

# 13. Media

Media is structured project content.

Types may include:

```text
HERO
GALLERY
FLOOR_PLAN
UNIT_PLAN
MASTER_PLAN
AMENITY
BROCHURE
VIDEO
```

Media should have a clear relationship to its project and optionally to a configuration.

Example:

```text
Project
 └── 3 BHK Configuration
        └── Floor Plan
```

Media should support:

- Upload
- Preview
- Ordering
- Type
- Alt text
- Association with project/configuration
- Approval/publishing state where needed

---

# 14. Lead Generation

Lead generation is a core business feature.

A lead may contain:

```text
id
name
phone
email
projectId
configurationId
intent
source
status
budget
location
createdAt
updatedAt
```

Potential lead sources:

```text
CONTACT_FORM
PROPERTY_PAGE
CHATBOT
BROCHURE
FLOOR_PLAN
SITE_VISIT
```

Potential statuses:

```text
NEW
CONTACTED
QUALIFIED
SITE_VISIT
CONVERTED
LOST
```

The exact status model can be refined during implementation.

The lead system should preserve useful context about what the visitor was interested in.

---

# 15. Property Search

Property search should be a reusable backend capability.

The website and chatbot should eventually use the same search service.

Controlled query structure:

```ts
type PropertyQuery = {
    locations?: string[];
    bhk?: number[];
    minPrice?: number;
    maxPrice?: number;
    minArea?: number;
    maxArea?: number;
    areaTarget?: number;
    developerId?: string;
    projectId?: string;
};
```

Architecture:

```text
Website
   ↓
PropertyQuery
   ↓
Property Search Service
   ↓
Repository
   ↓
Database
```

The chatbot should use this same service.

Do not generate SQL directly from chatbot input.

---

# 16. Property Matching

Search should support imperfect matches.

If a visitor asks for:

```text
999 sq ft
```

a property with:

```text
950 sq ft
```

or:

```text
1040 sq ft
```

may still be relevant.

The search system should be able to rank results based on:

- BHK match
- Location match
- Price proximity
- Area proximity
- Developer preference
- Project status
- Availability

Exact filtering and ranking rules can be refined during implementation.

---

# 17. Data Ingestion / Scraping Assistant

The scraper is an assistant.

It is NOT the source of truth.

Preferred pipeline:

```text
External Website
       ↓
Fetcher
       ↓
Extractor
       ↓
Normalizer
       ↓
Validator
       ↓
Import Draft
       ↓
Human Review
       ↓
Approved Property Data
```

The scraper should help the admin avoid repetitive data entry.

The admin should be able to:

1. Paste a source URL.
2. Run the importer.
3. Review extracted fields.
4. Review images.
5. Correct data.
6. Upload missing assets.
7. Approve the draft.
8. Publish it.

The scraper must never blindly overwrite published property information.

---

# 18. Scraped Images

The importer should attempt to identify image roles where practical.

Potential classifications:

```text
HERO
GALLERY
FLOOR_PLAN
UNIT_PLAN
MASTER_PLAN
AMENITY
BROCHURE
UNKNOWN
```

Image classification does not need to be perfect.

The admin remains in the loop.

The importer should present extracted images for review and allow the admin to:

- Accept
- Reject
- Reclassify
- Reorder
- Replace
- Upload manually

---

# 19. Change Monitoring

After ingestion works, the system can monitor external sources.

Initial monitoring priorities:

```text
Price
Configuration
Area
Availability
Possession/status
```

Pipeline:

```text
Scheduled Check
       ↓
Fetch Source
       ↓
Extract
       ↓
Normalize
       ↓
Compare
       ↓
Change Detected?
       ↓
Create Change Event / Alert
       ↓
Admin Review
```

The system should initially alert the admin rather than automatically changing production data.

---

# 20. Property Search Chatbot

The website should eventually include a lightweight Property Search Assistant.

The chatbot is not initially a general-purpose AI chatbot.

Its job is:

> Convert a user's property requirements into a structured `PropertyQuery`, search the property database, show suitable properties, and capture contact details when the visitor requests additional information.

Example:

```text
User:
"I want a 3 BHK in Pimpri around ₹1.5 Cr and around 999 sq ft."

        ↓

PropertyQuery:

{
    "bhk": [3],
    "locations": ["Pimpri"],
    "maxPrice": 15000000,
    "areaTarget": 999
}

        ↓

Property Search Service
        ↓
Database
        ↓
Ranked Results
```

The chatbot must never directly generate SQL.

---

# 21. Progressive Query Building

The chatbot does not need to understand everything in one message.

Example:

```text
User:
"I want a 3 BHK in Pimpri around 1.5 crore."

        ↓

{
    "bhk": [3],
    "locations": ["Pimpri"],
    "maxPrice": 15000000
}

        ↓

Bot:
"Do you have a preferred carpet area?"
```

User:

```text
"Around 1000 sq ft."
```

The query becomes:

```json
{
    "bhk": [3],
    "locations": ["Pimpri"],
    "maxPrice": 15000000,
    "areaTarget": 1000
}
```

The conversation acts as a progressive query builder.

---

# 22. Guided Chatbot Input

V1 should support structured choices.

Example:

```text
Configuration:
[1 BHK] [2 BHK] [3 BHK] [4 BHK+]

Budget:
[Under ₹1 Cr]
[₹1-1.5 Cr]
[₹1.5-2 Cr]
[₹2 Cr+]

Location:
[Baner]
[Wakad]
[Hinjewadi]
[Kharadi]
[Pimpri]
[Hadapsar]
```

Basic natural-language extraction may also be supported.

Example:

```text
"I need a 3bhk in Wakad under 2 crore."
```

becomes:

```json
{
    "bhk": [3],
    "locations": ["Wakad"],
    "maxPrice": 20000000
}
```

A complex intent-classification system is not required for V1.

---

# 23. Chatbot Query State

The chatbot can maintain state such as:

```ts
type PropertySearchState = {
    query: PropertyQuery;
    intent?: "search" | "floor_plan" | "brochure" | "site_visit" | "latest_price";
    selectedProjectId?: string;
    selectedConfigurationId?: string;
};
```

The exact implementation can evolve later.

---

# 24. Automated Asset Delivery

The chatbot should eventually provide approved assets.

Examples:

```text
"Show me the 3 BHK floor plan."
        ↓
Find project
        ↓
Find 3 BHK configuration
        ↓
Find floor plan
        ↓
Display/send floor plan
```

Brochure:

```text
"Send me the brochure."
        ↓
Find project
        ↓
Find brochure
        ↓
Provide brochure
```

Images:

```text
"Show me project photos."
        ↓
Find gallery
        ↓
Display selected images
```

---

# 25. Chatbot Lead Conversion

The chatbot should not immediately demand a phone number.

The visitor should receive useful information first.

Example:

```text
User:
"Show me the 3 BHK floor plan."

        ↓

Bot:
[Floor Plan Preview]

"Would you like the high-resolution floor plan
and latest brochure?"

        ↓

User:
"Yes."

        ↓

Bot:
"Where should we send it?"

        ↓

Mobile Number

        ↓

Lead Created

        ↓

Asset Delivered
```

Lead context should include:

```json
{
    "projectId": "project_123",
    "configurationId": "config_456",
    "bhk": 3,
    "budgetMax": 15000000,
    "location": "Pimpri",
    "areaTarget": 1000,
    "intent": "floor_plan",
    "requestedAsset": "floor_plan",
    "source": "chatbot"
}
```

---

# 26. AI Strategy

The LLM, if introduced, is an extraction/interpretation tool, not the source of property truth.

Preferred:

```text
User
 ↓
Parser / Entity Extraction
 ↓
Validated PropertyQuery
 ↓
Property Search Service
 ↓
Database
 ↓
Results
```

Never:

```text
User
 ↓
LLM
 ↓
Generated SQL
 ↓
Database
```

V1 can use deterministic rules, structured options, and conversation state.

A lightweight LLM can be introduced later to convert natural-language requirements into the controlled PropertyQuery schema.

---

# 27. Admin CMS

The admin interface should be usable by a basic-skilled administrator.

Primary sections:

```text
Dashboard
Properties
Developers
Leads
Media
Settings
```

## Dashboard

High-level operational information:

- Total properties
- Active projects
- New leads
- Recent enquiries
- Pending imports
- Recent price changes

## Properties

Admin can:

- Create
- Edit
- Publish
- Unpublish
- Search
- Filter
- Manage configurations
- Manage project media

## Developers

Admin can manage developer profiles and their projects.

## Leads

Admin can:

- View
- Filter
- Change status
- See source
- See project/configuration
- See enquiry intent
- Review requested assets

## Media

Media management should support project assets and structured media types.

## Settings

Future system settings and integrations.

---

# 28. Public Website

The public website should eventually include:

- Home
- Developers
- Developer detail
- Projects
- Project detail
- Configurations
- Search
- Contact
- Lead forms
- Media galleries
- Floor plans
- Brochures
- Chatbot

The website should prioritize:

- Mobile responsiveness
- Fast loading
- SEO
- Clear calls to action
- Easy property discovery
- Lead conversion

---

# 29. Frontend Strategy

Frontend development happens after backend capabilities are stable, but it should be built in vertical slices.

Example:

```text
Developer API
    ↓
Developer frontend

Project API
    ↓
Project frontend

Media API
    ↓
Media frontend

Lead API
    ↓
Lead frontend
```

Avoid building the entire frontend separately from the backend.

---

# 30. Development Phases

## Phase 0 — Backend Foundation

- Repository structure
- Backend runtime
- Configuration
- Database connection
- Error handling
- Validation
- Logging
- Testing setup

## Phase 1 — Core Property Domain

- Developer
- Project
- Configuration
- CRUD APIs
- Relationships
- Tests

## Phase 2 — Media

- Media model
- Upload/storage abstraction
- Project media
- Configuration-specific floor plans
- Admin media management

## Phase 3 — Leads

- Lead model
- Lead creation
- Lead retrieval
- Lead status
- Source tracking
- Admin lead management

## Phase 4 — Search

- PropertyQuery
- Search service
- Filtering
- Ranking
- Public property discovery

## Phase 5 — Import Assistant

- URL ingestion
- Fetcher
- Extractor
- Normalizer
- Draft creation
- Admin review
- Image extraction

## Phase 6 — Change Monitoring

- Scheduled checks
- Price comparison
- Change events
- Admin alerts

## Phase 7 — Chatbot

- Conversation state
- PropertyQuery extraction
- Property search
- Asset retrieval
- Lead capture
- Automated asset delivery

---

# 31. What Should NOT Be Built Early

Do not prematurely implement:

- Full AI chatbot
- Complex recommendation engine
- Advanced scraping infrastructure
- WhatsApp automation
- CRM integration
- Multi-tenant architecture
- Microservices
- Event-driven infrastructure
- Advanced analytics
- Complex search engine infrastructure

Start with a modular monolith unless the requirements prove that another architecture is necessary.

---

# 32. Definition of Done

A feature is not complete merely because it compiles.

A meaningful feature should have:

- Clear responsibility
- Validation
- Error handling
- Appropriate tests
- Working API
- Clear data relationships
- No unnecessary coupling
- Documentation where useful
- Git commit
- Integration verification where applicable

---

# 33. Core Architectural Principle

The project should remain a modular system where the same backend capabilities can serve multiple interfaces.

For example:

```text
                 Property Search Service
                    /      |                          /       |                      Website   Admin    Chatbot
```

Likewise:

```text
                    Lead Service
                   /     |                        /      |                    Website  Chatbot   Admin
```

This is the central architectural idea of the project.

Build the business capabilities once.

Expose them through multiple interfaces.

---

# 34. Human-in-the-Loop Principle

The system should automate repetitive work while keeping important business decisions under human control.

Examples:

```text
Scraper
  → suggests data
  → admin approves

Price monitor
  → detects change
  → admin reviews

Chatbot
  → qualifies visitor
  → creates lead

Admin
  → controls publishing
  → controls production data
```

Automation should reduce work, not remove accountability.

---

# 35. Long-Term Vision

The finished system should allow the client to operate a real-estate discovery and lead-generation business with minimal repetitive data entry.

The long-term workflow:

```text
External Developer Websites
          ↓
     Import Assistant
          ↓
      Admin Review
          ↓
    Property Database
          ↓
   ┌──────┼────────┐
   ↓      ↓        ↓
 Website Search Chatbot
   │      │        │
   └──────┼────────┘
          ↓
       Qualified
          Leads
          ↓
     Sales Follow-up
```

The key objective is not to build the most technically complicated system.

It is to build a reliable, modular system that makes the client's real-estate business easier to operate and produces more qualified leads.
