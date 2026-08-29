# UX Architecture Decision Log

---

## Decision 1: Pure Rule-Based Conversational Search (No AI / No Free Text Input)

- **Decision**: Replace free-text search inputs and NLP parsers with a deterministic rule engine (`query-builder.ts`) that presents pre-calculated option buttons.
- **Rationale**: Real estate buyers require fast, accurate, and predictable results. NLP parsers introduce input ambiguity and latency.
- **Current Status**: **LOCKED & IMPLEMENTED**.
- **Justification for Revisiting**: Only if an explicit product decision mandates conversational LLM integration backed by verified database tooling.

---

## Decision 2: Application-Wide Reusable Assistant Overlay & Sheet

- **Decision**: "Ask Assistant" opens a floating conversational panel on desktop and a bottom sheet on mobile (`PropertyAssistantOverlay.tsx`), controlled by a global context (`AssistantContext.tsx`), without forcing full-page navigation.
- **Rationale**: Visitors should be able to query properties from anywhere (Homepage, Developer Page, Project Page) without losing their current page context.
- **Current Status**: **LOCKED & IMPLEMENTED**.
- **Justification for Revisiting**: None.

---

## Decision 3: Developer Name as Primary Header Branding Context

- **Decision**: On Developer (`/:developerSlug`) and Project (`/:developerSlug/:locationSlug/:projectSlug`) pages, `GlobalHeader.tsx` renders `[Developer Name]` directly in the branding area instead of `"Virtual Reality · [Developer Name]"`.
- **Rationale**: Real estate buyers trust known developer brands. Developer identity creates immediate contextual authority.
- **Current Status**: **LOCKED & IMPLEMENTED**.
- **Justification for Revisiting**: None.

---

## Decision 4: Unit Configuration Deep-Linking (`?configuration=<id>`)

- **Decision**: Unit configurations manage URL state (`?configuration=<id>`), updating floor plans, unit media, and pre-selecting the enquiry form.
- **Rationale**: Enables shareable, refresh-safe links to specific unit floor plans and pricing options.
- **Current Status**: **LOCKED & IMPLEMENTED**.
- **Justification for Revisiting**: None.

---

## Decision 5: Explicit Separation of Architecture and Visual Refinement

- **Decision**: Information architecture, section ordering, data flows, and component boundaries are locked first before performing micro-level visual/CSS refinement passes.
- **Rationale**: Prevents structural churn during visual polish.
- **Current Status**: **LOCKED & ACTIVE METHODOLOGY**.
- **Justification for Revisiting**: None.

---

## Decision 6: Deferred Features

- **Carousel Autoplay**: Intentionally deferred to a dedicated motion/interaction pass.
- **Advanced Animations & Transitions**: Intentionally deferred to a site-wide visual pass.
