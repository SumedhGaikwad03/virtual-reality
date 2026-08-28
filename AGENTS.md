AGENTS.md
Project Role

This repository contains the Virtual Reality real-estate platform.

The AI coding agent is the implementation engineer and engineering assistant.

The human developer is the project architect and reviewer.

The AI is NOT a substitute for the human developer's reasoning.

The human developer remains responsible for:
- Product decisions
- Architecture decisions
- Business rules
- Feature prioritization
- Technology tradeoffs
- Security decisions
- Final code approval

Do not silently make major architectural or product decisions.

When a decision materially affects architecture, explain the options, tradeoffs, and recommendation before implementing it.

---
1. Project Context

Read:

docs/PROJECT_PLAN.md

before implementing project-level work.

The project plan describes the long-term product and architectural destination.

IMPORTANT:

The project plan is a roadmap, NOT permission to implement every feature immediately.

Only implement the specific feature or file authorized in the current task.

Do not build future functionality simply because it appears in the project plan.

If the project plan conflicts with an explicit instruction from the human developer, stop and ask for clarification.

---
2. Development Philosophy

Prioritize:
- Low coupling
- High cohesion
- Clear boundaries
- Testability
- Maintainability
- Simplicity
- Development speed without architectural shortcuts

Avoid:
- God classes
- God services
- Giant files
- Circular dependencies
- Hidden side effects
- Shared mutable state
- Business logic in controllers
- Database access scattered throughout the application
- Premature abstractions
- Unnecessary design patterns
- Unnecessary dependencies
- Unrelated refactoring

The simplest design that preserves clear boundaries is preferred.

---
3. Architecture

Preferred backend flow:

HTTP Request
    ↓
Route
    ↓
Controller
    ↓
Service / Application Layer
    ↓
Domain / Business Logic
    ↓
Repository
    ↓
Database
Routes

Routes define HTTP endpoints and connect requests to controllers.
Controllers

Controllers handle HTTP concerns.

They may:
- Read request data
- Invoke services
- Return HTTP responses
- Map application errors to HTTP errors

They should NOT contain complex business logic.
Services

Services contain application workflows and business rules.
Repositories

Repositories contain persistence/database logic.

Business logic should not depend directly on database implementation details where a repository abstraction provides meaningful value.
Validation

All externally supplied input must be validated.
Adapters

External integrations should be isolated.

Examples:
- Storage
- Email
- WhatsApp
- External APIs
- Scraping
- LLM providers

---
4. Modularity Rules

Modules should be independently understandable.

Prefer:

Developer
Project
Configuration
Media
Lead
Search
Ingestion
Monitoring
Chatbot

with clear interfaces between them.

Examples of bad coupling:

Chatbot → PostgreSQL implementation
Lead → Scraper implementation
Developer → Scraper
Scraper → Property controller
Controller → direct database queries

Preferred:

Chatbot
    ↓
PropertyQuery
    ↓
Property Search Service
    ↓
Repository
    ↓
Database

and:

Importer
    ↓
Import Service
    ↓
ImportDraft
    ↓
Human Review
    ↓
Property Service

Do not create an abstraction merely because abstraction sounds sophisticated.

Create it when it protects a meaningful boundary or allows a likely implementation to change independently.

---
5. Database Rules

The database is the source of truth for approved property data.

Do not let external sources silently become production truth.

Maintain proper relationships and constraints.

Avoid duplicating business-critical data without a reason.

Use transactions when multiple related writes must succeed or fail together.

Do not allow invalid foreign-key relationships.

---
6. Property Data Rules

Core domain:

Developer
    ↓
Project
    ↓
Configuration
    ↓
Media

A project may have many configurations.

Configuration-specific information such as:
- BHK
- Carpet area
- Price

belongs to the configuration, not the project.

---
7. Media Rules

Media should be structured.

Potential types:

HERO
GALLERY
FLOOR_PLAN
UNIT_PLAN
MASTER_PLAN
AMENITY
BROCHURE
VIDEO

Media may belong to a project and optionally to a configuration.

Imported media must be reviewable.

The importer must never assume an extracted image classification is correct.

---
8. Lead Rules

Leads are a core business feature.

A lead should preserve useful context, such as:
- Project
- Configuration
- Intent
- Source
- Budget
- Location
- Requested asset
- Contact details

Website forms and the chatbot should eventually use the same lead service.

Do not create separate incompatible lead systems for each frontend.

---
9. Search Rules

Property search must be a reusable backend capability.

Use a controlled PropertyQuery.

Example:

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

The chatbot and public website should use the same property search service.

NEVER:

User
 ↓
LLM
 ↓
Generated SQL
 ↓
Database

Preferred:

User
 ↓
Parser
 ↓
Validated PropertyQuery
 ↓
Property Search Service
 ↓
Repository
 ↓
Database

---
10. Importer / Scraper Rules

External websites are data sources, not the source of truth.

The importer pipeline should conceptually be:

External Source
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
Approved Data

The importer must NOT blindly overwrite published properties.

Imported data must retain useful source information where appropriate.

Imported images should be treated as candidates until reviewed.

---
11. Chatbot Rules

The chatbot is a Property Search Assistant.

It is not initially a general-purpose AI agent.

Its job is to:
- Understand property requirements
- Construct a controlled PropertyQuery
- Search real properties
- Present results
- Provide approved assets
- Capture qualified leads

The chatbot must NOT:
- Generate SQL
- Invent properties
- Invent prices
- Invent availability
- Bypass the property database
- Bypass lead validation

The property database remains the source of truth.

---
12. Development Workflow

We are building BACKEND FIRST.

Then we build frontend slices against completed backend capabilities.

For each feature:

Requirements
    ↓
Data Model
    ↓
API Contract
    ↓
Backend
    ↓
Tests
    ↓
Frontend
    ↓
Integration Test

---
13. File-by-File Rule

This is a critical project rule.

Work one meaningful file at a time unless the human developer explicitly authorizes a larger change.

For each file:

1. Explain why the file exists.
2. Explain its responsibility.
3. Explain important dependencies.
4. Implement it.
5. Explain important design decisions.
6. Explain how to test it.
7. Wait for the human developer to verify before moving to the next meaningful file.

Do NOT generate the entire backend or frontend in one response.

Do NOT create large numbers of placeholder files.

Do NOT implement future phases prematurely.

---
14. Repository Inspection

Before creating or modifying files:
- Inspect the relevant existing files.
- Understand existing conventions.
- Check package configuration.
- Check scripts.
- Check dependencies.
- Check tests.
- Check environment configuration.
- Check whether equivalent functionality already exists.

Never assume a file exists.

Never recreate functionality without checking first.

---
15. Existing Production Application

The existing main branch represents the production application.

The current production website is:

https://www.virtual2reality.in/

Development is happening on:

develop

Do not make destructive changes to the production implementation merely because we are rebuilding it.

The new system should eventually replace the production application through a controlled release.

---
16. Git Rules

Keep changes logically scoped.

Prefer commits such as:

feat: add developer domain
feat: add project repository
feat: add configuration API
test: add project API tests
fix: handle invalid developer id

Do not mix unrelated refactoring with feature work.

Do not force push unless explicitly instructed.

Do not rewrite shared history.

Before risky Git operations, explain the impact.

---
17. Testing Rules

A feature is not complete because it compiles.

Meaningful business logic should have tests.

Prioritize:
- Unit tests for business rules
- Integration tests for APIs
- Validation tests
- Database tests where useful
- Important end-to-end workflows

Tests should verify behavior, not merely increase coverage numbers.

---
18. Error Handling

Handle expected failures explicitly.

Examples:
- Invalid input
- Missing resource
- Duplicate resource
- Invalid relationship
- Database failure
- External service failure
- Import failure

Do not swallow errors silently.

Do not expose internal stack traces or sensitive information through public APIs.

---
19. Security

Never commit:
- API keys
- Passwords
- JWT secrets
- Database credentials
- Service-account credentials
- Private tokens

Use environment variables/secrets.

Validate external input.

Apply authorization to admin operations.

Do not trust data simply because it came from an external website.

---
20. Dependencies

Before adding a dependency:

1. Check whether the existing stack already solves the problem.
2. Determine whether the dependency is actually necessary.
3. Prefer mature, focused dependencies.
4. Avoid dependencies that create unnecessary architectural coupling.

Do not add libraries just to avoid writing ten lines of straightforward code.

---
21. Performance

Do not prematurely optimize.

First make the architecture correct and measurable.

When performance matters:
- Identify the bottleneck.
- Measure it.
- Fix the actual bottleneck.
- Avoid speculative complexity.

---
22. AI Usage Philosophy

The AI coding agent is an implementation accelerator.

It is NOT the project architect.

The human developer should remain capable of explaining:
- Why the architecture exists
- Why modules are separated
- Why data is modeled a certain way
- Why APIs are structured a certain way
- Why dependencies exist
- What tradeoffs were made

If an implementation decision is ambiguous and materially affects architecture, stop and explain it instead of silently choosing.

---
23. No Unapproved Scope Expansion

If the current task is:

Implement Developer repository.

Do not also implement:

Project
Media
Leads
Search
Chatbot

unless explicitly requested.

If you discover that another file must change to complete the current task, explain why and identify the minimum required change.

---
24. Communication Style

When reporting work:

Use concise technical explanations.

For implementation tasks, provide:

What changed
Why it changed
Important decisions
Files affected
How to test
Potential concerns

Do not bury important architectural decisions inside large amounts of prose.

---
25. Definition of Done

A feature is done when:
- Responsibility is clear.
- Module boundaries are respected.
- Input is validated.
- Errors are handled.
- Appropriate tests exist.
- Existing behavior is not unnecessarily broken.
- No unrelated changes are included.
- The implementation matches the approved architecture.
- The human developer understands the change.
- The change can be committed cleanly.

---
Execution-Only Mode

The human developer determines:
- Architecture
- Technology choices
- Database design
- Feature scope
- File creation order
- Business rules

The AI coding agent should execute explicit instructions.

Do not independently redesign the architecture.
Do not independently choose technologies.
Do not expand the scope of a task.
Do not implement future roadmap items.
Do not create files that were not requested unless they are strictly necessary to complete the requested task.

When the human provides a file specification, implement that specification.

If the requested implementation is impossible or technically inconsistent, explain the specific blocker before changing the design.
26. Final Rule

When in doubt:

Do not guess silently.

Explain:

1. What is ambiguous.
2. What options exist.
3. Which option you recommend.
4. Why.

Then wait for the human developer's decision if the choice materially affects architecture, product behavior, security, or data integrity.

The goal is not maximum code generation.

The goal is a modular, understandable, production-quality system built quickly while keeping the human developer in control.

---
27. Current Project State: Virtual Reality Platform

This section records the current implementation state. It prevents the coding agent from rebuilding functionality that already exists or assuming that an older architecture is still current.
27.1 Current Stack

Backend:
- Node.js
- TypeScript
- Express
- PostgreSQL
- Prisma 7
- JWT authentication
- bcryptjs
- Multer
- Cloudinary

Frontend:
- React
- TypeScript
- React Router
- Fetch-based API clients

Do not replace these technologies without explicit authorization.
27.2 Current Domain Structure

Developer
    ↓
Project
    ↓
Configuration

Developer ──────┐
Project ────────┼──→ Media
Configuration ──┘

Project ────────┐
Configuration ──┴──→ Lead

Admin
    ↓
PasswordResetToken

---
28. Current Media Architecture

Media is implemented as a reusable domain rather than separate tables for every page.

Frontend
    ↓
Admin API Client
    ↓
Route
    ↓
Controller
    ↓
Media Service
    ↓
Media Repository
    ↓
Prisma
    ↓
PostgreSQL

Uploads use:

Frontend File
    ↓
Multer memory storage
    ↓
Media Service
    ↓
Cloudinary
    ↓
Cloudinary URL
    ↓
Media Repository
    ↓
PostgreSQL

Cloudinary is the external media-storage adapter.

Resource types:

IMAGE     → image
VIDEO     → video
DOCUMENT  → raw

Cloudinary credentials must remain server-side.

---
29. Current Media Model

The current Media model supports:

developerId?
projectId?
configurationId?

context
slot

type
category

title
url
thumbnailUrl
altText

sortOrder
isPrimary
isActive

source
sourceUrl

createdAt
updatedAt

Current contexts:

HOME
DEVELOPER
PROJECT
CONFIGURATION

Current types:

IMAGE
DOCUMENT
VIDEO

Current categories:

HERO
HERO_CAROUSEL
CARD
GALLERY
AMENITY
EXTERIOR
INTERIOR
LOCATION
CONSTRUCTION
FLOOR_PLAN
BROCHURE
PROJECT_VIDEO

Do not create a parallel media model unless explicitly authorized.

---
30. Media Ownership Rules

The Media Service validates ownership by context.
HOME

HOME media is site-level.

It must not belong to a developer, project, or configuration.

context = HOME
developerId = null
projectId = null
configurationId = null
DEVELOPER

DEVELOPER media requires a valid developerId.
PROJECT

PROJECT media requires a valid projectId.

If developerId is supplied, the project must belong to that developer.
CONFIGURATION

CONFIGURATION media requires a valid configurationId.

If projectId is supplied, the configuration must belong to that project.

Do not weaken ownership validation simply to make an upload succeed.

---
31. Current Admin Media API

Admin media is mounted at:

/api/admin/media

It requires admin authentication.

Current endpoints:

POST   /api/admin/media
GET    /api/admin/media/context/:context
GET    /api/admin/media/developer/:developerId
GET    /api/admin/media/project/:projectId
GET    /api/admin/media/configuration/:configurationId
GET    /api/admin/media/:id
PATCH  /api/admin/media/:id

Uploads use:

multipart/form-data

with fields including:

file
context
type
category
developerId?
projectId?
configurationId?
slot?
title?
altText?
sortOrder?
isPrimary?

Do not send JSON to the upload endpoint.

---
32. Current Frontend Media Contract

The frontend media API includes functions equivalent to:

uploadMedia()
getHomeMedia()
getDeveloperMedia()
getProjectMedia()
getConfigurationMedia()
getMedia()
updateMedia()

The upload contract includes:

type MediaUploadInput = {
  file: File;
  context: MediaContext;
  type: MediaType;
  category: MediaCategory;
  developerId?: string;
  projectId?: string;
  configurationId?: string;
  slot?: string;
  title?: string;
  altText?: string;
  sortOrder?: number;
  isPrimary?: boolean;
};

context is required. Do not remove it from the frontend or backend contract.

---
33. HOME Media Contract

The homepage intentionally exposes only four media categories:

HOME
├── HERO
├── HERO_CAROUSEL
├── CARD
└── GALLERY

These four categories are the only categories that should appear in the HOME media administration UI unless the human developer explicitly changes the product design.

Other categories remain available to project, configuration, and developer media.
33.1 HERO

Purpose:

One dominant homepage hero asset.

Expected flow:

HOME + HERO
    ↓
Home hero section
33.2 HERO_CAROUSEL

Purpose:

Multiple prominent assets displayed in one hero/carousel area.

Expected flow:

HOME + HERO_CAROUSEL
    ↓
Rotating or crossfading hero content

The final animation and visual behavior are intentionally not locked yet. Do not add CSS or animation unless explicitly requested.
33.3 CARD

Purpose:

Homepage visual cards.

Expected flow:

HOME + CARD
    ↓
Home card section
33.4 GALLERY

Purpose:

A collection of homepage images shown together or browsed.

Expected flow:

HOME + GALLERY
    ↓
Home gallery section

Important distinction:

HERO_CAROUSEL → rotating prominent content
GALLERY       → collection of browsable images

---
34. Current Homepage Structure

The public site is loaded through:

GET /api/site
    ↓
getSite()
    ↓
HomePage

The site response currently contains site configuration and featured projects, and the homepage media contract is being extended to include HOME media.

The intended structural homepage is:

HomePage
├── FirmHero
├── HomeHeroMedia
├── HomeHeroCarousel
├── HomeCards
├── HomeGallery
├── FirmOverview
├── FeaturedProjects
├── ContactSection
└── Search link

The exact visual ordering remains a product decision.

The current development priority is structure and data flow first, CSS later.

---
35. Current HOME Components

Current structural components include:

HomeHeroCarousel
HomeCards
HomeGallery

These components should:

1. Receive media through props.
2. Filter by the relevant category.
3. Respect sortOrder.
4. Use altText when available.
5. Fall back to title where appropriate.
6. Return null when no relevant media exists.
7. Avoid making API calls directly from presentation components.

Do not move fetching into these components unless explicitly requested.

---
36. Admin HOME Media

The Home Media administration UI manages exactly:

HERO
HERO_CAROUSEL
CARD
GALLERY

The category order is:

[
  "HERO",
  "HERO_CAROUSEL",
  "CARD",
  "GALLERY",
]

Media can be activated/deactivated through:

PATCH /api/admin/media/:id

using:

{
  "isActive": false
}

or:

{
  "isActive": true
}

Activation/deactivation is metadata-only. Do not delete Cloudinary assets when toggling isActive.

---
37. Public Media Rules

The public API should expose only active media unless the human developer explicitly requests otherwise.

Admin:

all relevant media

Public:

isActive = true

This separation is intentional.

---
38. Project Media Roadmap

Project media already exists and should be refined rather than rebuilt.

Target structure:

PROJECT
├── HERO
├── HERO_CAROUSEL
├── GALLERY
├── EXTERIOR
├── INTERIOR
├── LOCATION
├── CONSTRUCTION
└── PROJECT_VIDEO

This is a roadmap, not permission to implement every category immediately.

Only implement the specific requested behavior.

---
39. Configuration Media Roadmap

Target configuration structure:

CONFIGURATION
├── GALLERY
├── FLOOR_PLAN
└── BROCHURE

Refine existing functionality rather than rebuilding it.

---
40. Developer Media Roadmap

Target developer structure:

DEVELOPER
├── HERO
├── GALLERY
└── CARD

Reuse the existing developer media API and media system.

---
41. Public Site API

The public route is:

GET /api/site

Flow:

site route
    ↓
getSiteController
    ↓
getSite()
    ↓
siteRepository

Site configuration currently comes from environment variables:

name
tagline
description
logoUrl
contact.phone
contact.email
contact.address

Featured projects include:

id
name
slug
location
status
developer
heroImage

Do not create a second unrelated homepage endpoint without an architectural reason.

---
42. Authentication

Admin authentication currently uses:

Admin database record
bcryptjs
JWT

Login flow:

POST /api/admin/auth/login
    ↓
controller
    ↓
auth service
    ↓
admin repository
    ↓
bcrypt verification
    ↓
JWT

JWT requires:

JWT_SECRET

and optionally:

JWT_EXPIRES_IN

Never hardcode passwords, JWT secrets, API keys, or credentials.

Use development seed data for local admin records.

---
43. Prisma 7 Rule

This project uses Prisma 7.

The generated Prisma client requires the configured driver adapter.

Do not assume the older pattern:

new PrismaClient()

is valid.

When changing Prisma setup, inspect:

backend/src/lib/prisma.ts
backend/prisma.config.ts
backend/package.json

and follow the existing adapter configuration.

Do not downgrade or replace the Prisma 7 setup without explicit authorization.

---
44. Database Seeding

Development databases may be cleared during development.

When that happens, records such as:

Admin
Developer
Project
Configuration
Media

may disappear.

Use the Prisma seed system to restore development data.

Do not embed production credentials into application source code.

---
45. Frontend and Backend Development Servers

Typical local development origins are:

Frontend:
http://localhost:5173

Backend:
http://localhost:3000

The frontend may proxy /api requests to the backend.

When a browser request returns 404, determine whether the request reached:

frontend development server

or:

backend

before changing routes.

A browser request such as:

http://localhost:5173/api/admin/media

can be correct if the frontend dev server proxies it to the backend.

---
46. Development Workflow

Current workflow:

Requirements
    ↓
Data Model
    ↓
API Contract
    ↓
Backend
    ↓
Validation / Tests
    ↓
Frontend API
    ↓
Frontend Structure
    ↓
Integration Verification
    ↓
CSS / Visual Polish

For media:

Media backend
    ↓
Admin media management
    ↓
Public site media
    ↓
Homepage structure
    ↓
Project refinement
    ↓
Configuration refinement
    ↓
Developer media
    ↓
Admin cleanup
    ↓
Final presentation

Do not jump to visual polish while the data contract is changing unless explicitly instructed.

---
47. MCP / Antigravity Operating Rules

This repository is being modified with MCP-enabled coding agents, including Antigravity.

AGENTS.md is the implementation contract.
Before Editing

The agent must:

1. Inspect relevant existing files.
2. Search for equivalent functionality.
3. Check imports and exports.
4. Check API contracts.
5. Check database types when persistence is involved.
6. Check existing tests.
7. Identify the smallest necessary change set.

Never recreate a file or subsystem without inspecting whether it already exists.
One Logical Change at a Time

Preferred cycle:

Task
 ↓
Inspect
 ↓
Smallest required change
 ↓
Typecheck/build
 ↓
Test/manual verification
 ↓
Human review
 ↓
Next task

Do not perform unrelated refactors during feature work.
Preserve Working Functionality

If something already works:

refine it

rather than:

rewrite it

unless explicitly requested.

This applies especially to:

Project media
Configuration media
Authentication
Public site API
Repositories
Services
Do Not Guess

If a required file, type, route, model, or business rule is missing:

inspect repository
    ↓
identify gap
    ↓
report gap

Do not invent an architecture simply to make the code compile.
No Scope Expansion

If the task is:

Add Home Gallery

do not also:

rewrite media service
change Prisma schema
add a lightbox dependency
redesign the homepage
rewrite CSS
refactor project media

unless explicitly authorized or strictly required.

---
48. MCP Prompting Protocol

When the human developer asks for a prompt for an MCP coding agent, provide a self-contained implementation prompt.

The prompt should include:

TASK
CONTEXT
FILES TO INSPECT
FILES TO MODIFY
REQUIREMENTS
DO NOT CHANGE
VALIDATION
DONE WHEN

The prompt should state:
- Existing architecture.
- Existing working behavior.
- Exact requested change.
- Scope boundaries.
- Expected verification.

If the human asks:

give me a prompt for this

return the prompt instead of implementing the change.

If the human asks for implementation directly, implement the requested change according to this file.

---
49. Current Media Roadmap

HOME
├── HERO              complete
├── HERO_CAROUSEL     structurally complete
├── CARD              structurally complete
└── GALLERY           structural implementation

PROJECT
├── existing media    working
└── refinement        next major block

CONFIGURATION
├── existing media    working
└── refinement

DEVELOPER
└── media refinement

ADMIN MEDIA MANAGER
└── consolidate/refine UX

PUBLIC FRONTEND
└── final media presentation

VISUAL DESIGN
└── CSS / responsive / animation / polish

This roadmap does not authorize implementing future stages automatically.

---
50. Media Engineering Guardrails

When working on media:
- Reuse the existing Media model.
- Reuse the existing media service.
- Reuse the existing repository.
- Reuse Cloudinary integration.
- Reuse admin authentication.
- Reuse validation.
- Preserve context.
- Preserve slot.
- Preserve sortOrder.
- Preserve isPrimary.
- Preserve isActive.
- Preserve source metadata.
- Do not create separate media tables for page types.
- Do not store media binaries in PostgreSQL.
- Do not expose Cloudinary secrets to the frontend.
- Do not delete Cloudinary assets when merely deactivating media.
- Preserve cleanup behavior after Cloudinary succeeds but database persistence fails.

---
51. Definition of Done for Media Features

A media feature is complete when appropriate to its scope:

[ ] Required data exists
[ ] Repository behavior is correct
[ ] Service business rules are correct
[ ] Validation rejects invalid input
[ ] Route is registered
[ ] Authentication is correct
[ ] Errors are mapped
[ ] Frontend API contract is correct
[ ] Frontend types are correct
[ ] Admin UI manages the asset
[ ] Public API exposes active assets
[ ] Public component consumes the API
[ ] TypeScript build passes
[ ] Relevant tests/manual verification pass
[ ] No unrelated files changed

---
52. Human Developer Control

The human developer remains responsible for:

Architecture
Technology choices
Database design
Feature scope
Business rules
File creation order
Product behavior
Security decisions
Final approval

The AI/MCP agent is an implementation accelerator.

Prefer:

predictability
traceability
small changes
clear explanations
easy review
easy rollback

over:

maximum automation
maximum abstraction
maximum file generation

When a simple solution preserves the architecture, prefer it over a clever solution.

---
53. Final MCP Rule

Before a substantial change, the agent should be able to answer:

What am I changing?
Why am I changing it?
Which existing behavior does it depend on?
Which files must change?
What am I explicitly not changing?
How will I verify it?

If any answer is unclear, inspect the repository first.

The goal is:

Human architecture
        +
AI implementation speed
        +
Small verified changes
        =
Maintainable production software


COMMENTING STANDARD

Every source file should begin with a concise documentation header explaining:

PURPOSE:
What this file is responsible for.

FLOW:
Where data/control enters the module, what the module does with it,
and where the result moves next.

RESPONSIBILITY:
The single primary responsibility owned by the module.

Use level-2 comments throughout the implementation where they materially
improve understanding.

Comments should explain:

1. WHAT the code is doing.
2. HOW the code accomplishes it.
3. WHY the code is designed that way.

Explain syntax or language/framework concepts when they are:

- non-obvious,
- project-specific,
- newly introduced in the codebase,
- important to understanding control flow,
- important to understanding data flow,
- or likely to confuse a developer reading the code for the first time.

Do NOT explain universally understood syntax.

Do NOT add comments merely to describe obvious code.

Bad:

// Loop through projects
projects.map(...)

Good:

// The public API returns configurations nested under the project.
// We keep the selected configuration in URL state so the page can be
// deep-linked and refreshed without losing the user's selection.
