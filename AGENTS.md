# AGENTS.md

## Project Role

This repository contains the Virtual Reality real-estate platform.

The AI coding agent is the **implementation engineer and engineering assistant**.

The human developer is the **project architect and reviewer**.

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

# 1. Project Context

Read:

```text
docs/PROJECT_PLAN.md
```

before implementing project-level work.

The project plan describes the long-term product and architectural destination.

IMPORTANT:

The project plan is a roadmap, NOT permission to implement every feature immediately.

Only implement the specific feature or file authorized in the current task.

Do not build future functionality simply because it appears in the project plan.

If the project plan conflicts with an explicit instruction from the human developer, stop and ask for clarification.

---

# 2. Development Philosophy

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

# 3. Architecture

Preferred backend flow:

```text
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
```

## Routes

Routes define HTTP endpoints and connect requests to controllers.

## Controllers

Controllers handle HTTP concerns.

They may:

- Read request data
- Invoke services
- Return HTTP responses
- Map application errors to HTTP errors

They should NOT contain complex business logic.

## Services

Services contain application workflows and business rules.

## Repositories

Repositories contain persistence/database logic.

Business logic should not depend directly on database implementation details where a repository abstraction provides meaningful value.

## Validation

All externally supplied input must be validated.

## Adapters

External integrations should be isolated.

Examples:

- Storage
- Email
- WhatsApp
- External APIs
- Scraping
- LLM providers

---

# 4. Modularity Rules

Modules should be independently understandable.

Prefer:

```text
Developer
Project
Configuration
Media
Lead
Search
Ingestion
Monitoring
Chatbot
```

with clear interfaces between them.

Examples of bad coupling:

```text
Chatbot → PostgreSQL implementation
Lead → Scraper implementation
Developer → Scraper
Scraper → Property controller
Controller → direct database queries
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

and:

```text
Importer
    ↓
Import Service
    ↓
ImportDraft
    ↓
Human Review
    ↓
Property Service
```

Do not create an abstraction merely because abstraction sounds sophisticated.

Create it when it protects a meaningful boundary or allows a likely implementation to change independently.

---

# 5. Database Rules

The database is the source of truth for approved property data.

Do not let external sources silently become production truth.

Maintain proper relationships and constraints.

Avoid duplicating business-critical data without a reason.

Use transactions when multiple related writes must succeed or fail together.

Do not allow invalid foreign-key relationships.

---

# 6. Property Data Rules

Core domain:

```text
Developer
    ↓
Project
    ↓
Configuration
    ↓
Media
```

A project may have many configurations.

Configuration-specific information such as:

- BHK
- Carpet area
- Price

belongs to the configuration, not the project.

---

# 7. Media Rules

Media should be structured.

Potential types:

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

Media may belong to a project and optionally to a configuration.

Imported media must be reviewable.

The importer must never assume an extracted image classification is correct.

---

# 8. Lead Rules

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

# 9. Search Rules

Property search must be a reusable backend capability.

Use a controlled `PropertyQuery`.

Example:

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

The chatbot and public website should use the same property search service.

NEVER:

```text
User
 ↓
LLM
 ↓
Generated SQL
 ↓
Database
```

Preferred:

```text
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
```

---

# 10. Importer / Scraper Rules

External websites are data sources, not the source of truth.

The importer pipeline should conceptually be:

```text
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
```

The importer must NOT blindly overwrite published properties.

Imported data must retain useful source information where appropriate.

Imported images should be treated as candidates until reviewed.

---

# 11. Chatbot Rules

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

# 12. Development Workflow

We are building BACKEND FIRST.

Then we build frontend slices against completed backend capabilities.

For each feature:

```text
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
```

---

# 13. File-by-File Rule

This is a critical project rule.

Work **one meaningful file at a time** unless the human developer explicitly authorizes a larger change.

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

# 14. Repository Inspection

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

# 15. Existing Production Application

The existing `main` branch represents the production application.

The current production website is:

```text
https://www.virtual2reality.in/
```

Development is happening on:

```text
develop
```

Do not make destructive changes to the production implementation merely because we are rebuilding it.

The new system should eventually replace the production application through a controlled release.

---

# 16. Git Rules

Keep changes logically scoped.

Prefer commits such as:

```text
feat: add developer domain
feat: add project repository
feat: add configuration API
test: add project API tests
fix: handle invalid developer id
```

Do not mix unrelated refactoring with feature work.

Do not force push unless explicitly instructed.

Do not rewrite shared history.

Before risky Git operations, explain the impact.

---

# 17. Testing Rules

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

# 18. Error Handling

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

# 19. Security

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

# 20. Dependencies

Before adding a dependency:

1. Check whether the existing stack already solves the problem.
2. Determine whether the dependency is actually necessary.
3. Prefer mature, focused dependencies.
4. Avoid dependencies that create unnecessary architectural coupling.

Do not add libraries just to avoid writing ten lines of straightforward code.

---

# 21. Performance

Do not prematurely optimize.

First make the architecture correct and measurable.

When performance matters:

- Identify the bottleneck.
- Measure it.
- Fix the actual bottleneck.
- Avoid speculative complexity.

---

# 22. AI Usage Philosophy

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

# 23. No Unapproved Scope Expansion

If the current task is:

```text
Implement Developer repository.
```

Do not also implement:

```text
Project
Media
Leads
Search
Chatbot
```

unless explicitly requested.

If you discover that another file must change to complete the current task, explain why and identify the minimum required change.

---

# 24. Communication Style

When reporting work:

Use concise technical explanations.

For implementation tasks, provide:

```text
What changed
Why it changed
Important decisions
Files affected
How to test
Potential concerns
```

Do not bury important architectural decisions inside large amounts of prose.

---

# 25. Definition of Done

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

# 26. Final Rule

When in doubt:

**Do not guess silently.**

Explain:

1. What is ambiguous.
2. What options exist.
3. Which option you recommend.
4. Why.

Then wait for the human developer's decision if the choice materially affects architecture, product behavior, security, or data integrity.

The goal is not maximum code generation.

The goal is a modular, understandable, production-quality system built quickly while keeping the human developer in control.
