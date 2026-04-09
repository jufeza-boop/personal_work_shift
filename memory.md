# Memory - Personal Work Shift

## Project Overview

- **App**: Personal Work Shift — family schedule management PWA
- **Architecture**: Clean Architecture (Domain → Application → Infrastructure → Presentation)
- **Stack**: Next.js 15+, TypeScript, Tailwind CSS, Shadcn/ui, Supabase (Auth + DB + Realtime + Storage), Serwist (PWA), Vercel

## Current State

- **Phase**: 1 — domain layer completed
- **Last Updated**: 2026-04-09

---

## Decisions Log

### 2026-04-09 - Project Kickoff

- Documentation created: architecture, security, user stories
- TODO.md created with 14 development phases
- agents.md established with mandatory TDD, English code, Clean Architecture rules
- Prioritized user stories: Auth → Family → Events → Calendar → Colors → Realtime → Offline → Notifications

### 2026-04-09 - Next.js Bootstrap

- Initialized the repository as a Next.js App Router project using TypeScript with `strict: true`
- Kept the scaffold minimal on purpose: no Tailwind-specific code or custom ESLint setup carried into the root yet
- Adopted a `src/app` structure with the `@/*` path alias to align with the planned clean architecture layout

### 2026-04-09 - Phase 0 Completion

- Added Tailwind CSS v4, a shadcn/ui-compatible component base, ESLint, Prettier, Vitest, React Testing Library, and Serwist
- Created the Clean Architecture folder scaffold under `src/` while keeping Next.js routing in `src/app`
- Initialized Supabase CLI locally and aligned its security-sensitive local defaults with the security document
- Added a GitHub Actions workflow for format, lint, test, build, and optional Vercel deployment
- Remote branch protection could not be applied automatically because no authenticated GitHub admin CLI/API path is available in the environment

### 2026-04-09 - CI Workflow Fix

- Fixed `.github/workflows/ci.yml` by removing `secrets.*` checks from the job-level `if` condition in `deploy`
- GitHub Actions accepted the workflow after moving the Vercel-secret presence check into a dedicated step that sets an output flag

### 2026-04-09 - Phase 1 Domain Layer

- Implemented `User`, `Family`, `Event`, `PunctualEvent`, and `RecurringEvent` domain entities with validation-focused business rules
- Added `ShiftType`, `ColorPalette`, and `EventFrequency` value objects plus repository interfaces and explicit domain rules for event ownership and color exclusivity
- Completed Phase 1 using TDD with dedicated Vitest coverage for entities, value objects, rules, and repository contracts

---

## Active Patterns

- Next.js App Router stays in `src/app`, while reusable UI lives in `src/presentation`
- Public environment variables are validated through `src/shared/config/env.ts`
- Phase 0 smoke coverage includes a landing-page render test and environment validation test
- Domain entities and value objects use constructor/static factory validation and keep framework-free business logic inside `src/domain`

---

## Dependencies

- `next@16.2.3`
- `react@19.2.4`
- `react-dom@19.2.4`
- `typescript@^5`
- `@types/node@^20`
- `@types/react@^19`
- `@types/react-dom@^19`
- `tailwindcss@^4.2.2`
- `@tailwindcss/postcss@^4.2.2`
- `eslint@^9.39.4`
- `eslint-config-next@^16.2.3`
- `eslint-config-prettier@^10.1.8`
- `prettier@^3.8.1`
- `prettier-plugin-tailwindcss@^0.7.2`
- `vitest@^4.1.4`
- `@testing-library/react@^16.3.2`
- `@testing-library/jest-dom@^6.9.1`
- `@testing-library/user-event@^14.6.1`
- `@supabase/ssr@^0.10.2`
- `@supabase/supabase-js@^2.103.0`
- `@serwist/turbopack@^9.5.7`
- `serwist@^9.5.7`
- `class-variance-authority@^0.7.1`
- `clsx@^2.1.1`
- `tailwind-merge@^3.5.0`
- `lucide-react@^1.8.0`
- `zod@^4.3.6`

---

## Schema Changes

_(None yet — tables defined in architecture doc, pending implementation)_

---

## Blockers & Workarounds

- GitHub branch protection was documented in `.github/branch-protection-rules.md` instead of applied automatically because `gh` is not installed and no authenticated repository-admin tool is available in the environment.

---

## Next Steps

- Apply branch protection rules in GitHub using `.github/branch-protection-rules.md`
- Begin Phase 1 by defining domain entities, value objects, and repository interfaces with TDD
- Begin Phase 1: Domain Layer entities
- Begin Phase 2 with Supabase schema design and repository implementations for the new domain contracts
