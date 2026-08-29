# Product Vision & Experience Guidelines

---

## 1. Core Product Mission

The **Virtual Reality Real-Estate Platform** is designed to transform high-stakes property search into an intuitive, trusted, and guided discovery experience.

Rather than acting as a generic property listing directory with dozens of filter dropdowns, the platform operates as a **Property Search Assistant** that guides visitors through progressive, structured decisions.

---

## 2. Search Philosophy: Pure Rule-Based Conversational Query Building

### Why Rule-Based Conversational Search?
Conventional property search websites present users with overwhelming filter dashboards (BHK, Min Price, Max Price, Possession Date, Locality, Amenities, Floor Level, Facing, etc.).

Our product decision establishes **Rule-Based Conversational Query Building**:
- The user is guided through one clear, structured question at a time.
- Each answer updates the underlying structured query state (`PropertyQuery`).
- The rule engine (`query-builder.ts`) inspects the remaining property catalog and dynamically presents the next unresolved question.

### Why NOT Natural-Language Search / Chatbots?
- Natural-language search (NLP/LLMs) introduces hallucination risks, unparsed edge cases, arbitrary query parsing failures, and slow inference latency.
- Real estate buyers want **precision, speed, and transparency**. They want to know exact BHK availability, verified prices, and real developer portfolios without wrestling with text prompts.

### Guided Interaction Model

```
Assistant: "How many bedrooms are you looking for?"
Options:   [1 BHK] [2 BHK] [3 BHK] [4+ BHK]
              │
User clicks: [3 BHK]
              │
Assistant: "Which location would you prefer?"
Options:   [Wakad] [Baner] [Hinjewadi] [Kharadi]
              │
User clicks: [Wakad]
              │
Assistant: "What budget are you considering?"
Options:   [Under ₹1 Cr] [₹1 Cr - ₹1.5 Cr] [₹1.5 Cr - ₹2 Cr] [₹2 Cr+]
              │
Action:    "View 4 Matching Homes →"
```

---

## 3. Trusted Developer Branding & Identity

### Developer as Primary Context
In real estate marketing, buyers choose projects primarily based on **Developer Reputation** (e.g. Panchshil, Godrej, Kolte-Patil, Mahindra Lifespaces).

- On Developer Pages (`/:developerSlug`) and Project Pages (`/:developerSlug/:locationSlug/:projectSlug`), the header identity displays **`[Developer Name]`** directly.
- Platform branding (`Virtual Reality`) is intentionally placed in the footer as the official operating platform.

---

## 4. Architectural Real-Estate Presentation

- **Cinematic Project Entrances**: Project heroes feature full-bleed imagery with clear developer attribution and immediate call-to-action enquiry anchors.
- **Deep-Linked Unit Configurations**: Every unit configuration (1 BHK, 2 BHK, 3 BHK) maintains an explicit URL state (`?configuration=<id>`), updating unit renders, floor plans, brochure downloads, and pre-binding customer enquiry forms.
- **Zero Hidden Costs / Zero Synthetic Data**: Prices, floor plans, and amenities come directly from verified admin-published database records.
