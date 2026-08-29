# AI Agent Guidelines & Operating Rules

---

## 1. Operating Philosophy

You are an implementation engineer pair-programming with the human developer (architect & reviewer).

Always obey the rules defined in `AGENTS.md` and `PROJECT_ARCHITECTURE.md`.

---

## 2. Before Editing Code

1. **Inspect Existing Files**: Search the codebase first using search and file viewing tools. Never assume a component, helper, or backend endpoint is missing without inspecting the codebase.
2. **Determine Task Scope**:
   - Is it an **Architectural task** (changing layout, boundaries, or routing)?
   - Is it a **UX/Behavioral task** (changing open/close state or option selection)?
   - Is it a **Visual/CSS task** (changing padding, colors, fonts)?
   - Is it a **Backend task** (modifying Prisma queries or services)?
3. **One File at a Time**: Make precise, scoped modifications. Do not perform unrelated refactoring.

---

## 3. Strict "DO NOT" Rules

- **DO NOT** replace rule-based conversational discovery with an AI chatbot, LLM API, or free-text search bar unless explicitly instructed.
- **DO NOT** weaken publication filters (`publishStatus === "PUBLISHED"` on both Project and Developer).
- **DO NOT** break the isolation between the Public Shell (`PublicShell.tsx`) and Admin routes (`/admin/*`).
- **DO NOT** duplicate header logic. `GlobalHeader.tsx` is the sole header component.
- **DO NOT** alter locked section ordering on ProjectPage, DeveloperPage, or HomePage during a visual pass.
- **DO NOT** commit raw secrets or credentials.

---

## 4. Verification Standards

Always run build verification commands before declaring a task complete:

```bash
# Frontend Build Check
cd frontend && npm run build

# Backend Build Check
cd backend && npm run build
```

Never claim a task is resolved until build output reports exit code `0`.
