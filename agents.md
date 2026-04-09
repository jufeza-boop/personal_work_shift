# Agent Instructions - Personal Work Shift

## General Principles

You are an AI development agent working on the **Personal Work Shift** application. Follow these instructions strictly in every task.

---

## 1. Code Language

**All code MUST be written in English.** This includes:

- Variable names, function names, class names
- Comments and documentation strings
- Commit messages
- File and folder names
- Error messages and log messages
- Test descriptions

The only exception is user-facing UI text, which will be in Spanish and managed via i18n files.

---

## 2. Test-Driven Development (TDD) - MANDATORY

**TDD is not optional. It is a hard requirement for every code change.**

### TDD Workflow

1. **RED**: Write a failing test FIRST that describes the expected behavior
2. **GREEN**: Write the minimum code to make the test pass
3. **REFACTOR**: Clean up the code while keeping tests green

### Rules

- **Never write production code without a failing test first**
- **Never skip tests to "save time"** — untested code is not shippable
- Tests must be written BEFORE the implementation, not after
- Each use case, entity, value object, and repository must have corresponding tests
- Cover both happy paths and edge cases
- Tests must be independent and not rely on execution order

### Testing Stack

| Layer | Tool | Type |
|---|---|---|
| Domain | Vitest | Unit tests |
| Application | Vitest | Unit tests (mocked repos) |
| Infrastructure | Vitest + Supabase local | Integration tests |
| Presentation | React Testing Library | Component tests |
| E2E | Playwright | End-to-end tests |

### Test File Convention

```
src/domain/entities/User.ts          → src/domain/entities/__tests__/User.test.ts
src/application/use-cases/CreateEvent.ts → src/application/use-cases/__tests__/CreateEvent.test.ts
src/presentation/components/Calendar.tsx → src/presentation/components/__tests__/Calendar.test.tsx
```

### Minimum Coverage

- Domain layer: **95%+**
- Application layer: **90%+**
- Infrastructure layer: **80%+**
- Presentation layer: **80%+**

---

## 3. Clean Architecture Compliance

### Dependency Rule

Inner layers MUST NOT import from outer layers:

```
Domain → (no imports from Application, Infrastructure, or Presentation)
Application → (imports only from Domain)
Infrastructure → (imports from Domain and Application)
Presentation → (imports from Application, uses Domain types)
```

### Layer Rules

- **Domain**: Pure TypeScript. No framework imports. No Supabase. No React. No Next.js.
- **Application**: Orchestrates use cases. Receives repository interfaces via dependency injection.
- **Infrastructure**: Implements repository interfaces. Contains all Supabase, auth, and external service code.
- **Presentation**: React components, hooks, pages. Calls use cases via Server Actions.

### Validation Before Committing

Before any commit, verify:
- No circular dependencies between layers
- Domain layer has zero external dependencies
- All repository usage is through interfaces, not concrete implementations

---

## 4. Code Quality Standards

### TypeScript

- Strict mode enabled (`strict: true` in tsconfig)
- No `any` types — use `unknown` if truly necessary, with type guards
- Prefer `interface` for object shapes, `type` for unions/intersections
- Use discriminated unions for event types

### Naming Conventions

| Element | Convention | Example |
|---|---|---|
| Files (components) | PascalCase | `CalendarGrid.tsx` |
| Files (utilities) | camelCase | `dateUtils.ts` |
| Files (tests) | match source + `.test` | `User.test.ts` |
| Interfaces | Prefix with `I` | `IEventRepository` |
| Types | PascalCase | `ShiftType` |
| Functions | camelCase | `createEvent()` |
| Constants | UPPER_SNAKE_CASE | `MAX_FAMILY_SIZE` |
| CSS classes | Tailwind utilities | `bg-blue-100 text-sm` |

### Git Practices

- Conventional Commits: `feat:`, `fix:`, `test:`, `refactor:`, `docs:`, `chore:`
- One logical change per commit
- Commit messages in English
- Always include the story reference when applicable: `feat(US-4.1): add punctual event creation`

---

## 5. Memory File Management

### Purpose

The file `memory.md` at project root serves as a **living context document**. It preserves crucial decisions, patterns, and context that help maintain coherence across development sessions.

### What to Record

After completing each task, update `memory.md` with:

1. **Decisions Made**: Architectural or technical decisions and their rationale
2. **Patterns Established**: Coding patterns, component structures, or conventions adopted
3. **Dependencies Added**: New packages installed and why
4. **Schema Changes**: Any database schema modifications
5. **Blockers & Workarounds**: Issues encountered and how they were resolved
6. **Current State**: What was completed and what comes next

### Format

```markdown
## [Date] - [Task/Story Reference]

### What was done
- Brief description of completed work

### Decisions
- Decision X was made because Y

### Patterns
- Pattern description for future reference

### Next steps
- What should be tackled next
```

### Rules

- **Always read `memory.md` at the start of each session** to understand current context
- **Always update `memory.md` at the end of each task** with new context
- Keep entries concise and actionable
- Remove outdated entries that are no longer relevant
- Do not duplicate information already in the code or documentation

---

## 6. Security Practices

- Never hardcode secrets, tokens, or API keys
- Always validate inputs server-side with Zod schemas
- Rely on Supabase RLS policies for data access control
- Use parameterized queries — never interpolate user input into SQL
- Set security headers in Next.js config
- Store auth tokens in httpOnly cookies only
- Run `npm audit` before every deployment

---

## 7. Error Handling

- Use custom error classes for domain errors (e.g., `EventOwnershipError`, `ColorAlreadyTakenError`)
- Never swallow errors silently — log or propagate them
- Present user-friendly error messages in the UI (Spanish)
- Log technical details server-side
- Use Result pattern (`{ success: true, data }` / `{ success: false, error }`) for use case responses

---

## 8. Performance Guidelines

- Use React Server Components by default; client components only when needed (interactivity)
- Lazy load non-critical components
- Optimize images via Next.js `<Image />` component
- Minimize client-side JavaScript bundle
- Use `useMemo` / `useCallback` only when there's a measured performance issue, not preemptively

---

## 9. Workflow Checklist (Per Task)

1. [ ] Read `memory.md` for current context
2. [ ] Read the relevant user story from `doc/user-stories.md`
3. [ ] Write failing tests (RED)
4. [ ] Implement minimum code to pass (GREEN)
5. [ ] Refactor while tests stay green (REFACTOR)
6. [ ] Verify no dependency rule violations
7. [ ] Run full test suite — all tests must pass
8. [ ] Run linter — zero warnings or errors
9. [ ] Commit with conventional commit message
10. [ ] Update `memory.md` with context from this task
11. [ ] Update `TODO.md` — mark completed items
