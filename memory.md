# Memory - Personal Work Shift

## Project Overview

- **App**: Personal Work Shift — family schedule management PWA
- **Architecture**: Clean Architecture (Domain → Application → Infrastructure → Presentation)
- **Stack**: Next.js 15+, TypeScript, Tailwind CSS, Shadcn/ui, Supabase (Auth + DB + Realtime + Storage), Serwist (PWA), Vercel

## Current State

- **Phase**: 4 — family management completed
- **Last Updated**: 2026-04-10

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

### 2026-04-10 - Phase 2 Infrastructure Layer

- Added the Phase 2 Supabase migration with enums, core tables, foreign keys, partial/composite indexes, audit triggers, auth profile sync, and RLS helper functions
- Implemented `SupabaseUserRepository`, `SupabaseFamilyRepository`, and `SupabaseEventRepository` to map between Supabase rows and domain entities
- Added repository-level tests plus migration assertions covering table creation, key policies, and query-supporting indexes

### 2026-04-10 - Phase 3 Authentication

- Implemented `RegisterUser`, `LoginUser`, and `LogoutUser` use cases with Result-style responses, password policy enforcement, duplicate email checks, and dedicated Vitest coverage
- Added `SupabaseAuthAdapter`, server-side auth actions, protected `/calendar`, `/login`, and `/register` routes, plus Next.js proxy-based route protection with cookie-backed sessions
- Created Zod-validated login/register forms, a dashboard shell with logout, and Playwright auth flow coverage using a mock auth driver for end-to-end execution without Supabase

### 2026-04-10 - Phase 4 Family Management

- Implemented `CreateFamily`, `AddMember`, `SwitchFamily`, and `RenameFamily` use cases with Result-style responses and dedicated Vitest coverage
- Added authenticated family dashboard/settings flows with server actions, Zod validation, family selector, member list, owner-only rename and invitation forms, and active-family persistence via cookie
- Expanded mock-mode support with file-backed auth/family stores in `/tmp/personal-work-shift` so Playwright can exercise multi-request family flows reliably across Next.js workers

### 2026-04-10 - Family Creation RLS Fix

- Fixed `SupabaseFamilyRepository.save` to use an insert-first path for brand new families and an update path for existing families
- The change avoids the Supabase/Postgres RLS failure triggered by `upsert` on `families` during family creation while keeping rename/member updates working
- Added repository coverage for both the create path and the existing-family update path

---

## Active Patterns

- Next.js App Router stays in `src/app`, while reusable UI lives in `src/presentation`
- Public environment variables are validated through `src/shared/config/env.ts`
- Phase 0 smoke coverage includes a landing-page render test and environment validation test
- Domain entities and value objects use constructor/static factory validation and keep framework-free business logic inside `src/domain`
- Supabase infrastructure code lives in `src/infrastructure/supabase`, with explicit row-to-domain mapping and a local `database.types.ts` schema contract
- Family persistence in `SupabaseFamilyRepository` must insert new `families` rows before creating the owner membership, and only use `update` for existing families, to stay compatible with the current RLS policies
- Authentication flows are implemented with server actions in `src/app/actions/auth.ts`, while route guarding lives in `src/proxy.ts`
- Playwright end-to-end auth coverage runs with `AUTH_DRIVER=mock`, which swaps in-memory auth dependencies for the real Supabase integration during browser tests
- Family management uses `src/app/actions/family.ts` server actions plus a shared active-family cookie (`pws-active-family`) to keep the selected family across sessions and pages
- Mock browser flows persist auth and family state through JSON files in `/tmp/personal-work-shift` so Next.js route workers share the same test data

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
- `@playwright/test@^1.55.1`

---

## Schema Changes

- Added `users`, `families`, `family_members`, `events`, and `event_exceptions` tables in `supabase/migrations/20260410090623_phase_2_infrastructure.sql`
- Added enum types for family roles, event types, recurring categories, shift types, and recurrence frequency units
- Added RLS policies, ownership helper functions, auth-to-profile sync trigger, and supporting indexes for family/event lookups

---

## Blockers & Workarounds

- GitHub branch protection was documented in `.github/branch-protection-rules.md` instead of applied automatically because `gh` is not installed and no authenticated repository-admin tool is available in the environment.
- `supabase start` fails in this sandbox with `getaddrinfo EAI_AGAIN supabase_db_personal_work_shift`, so Phase 2 test coverage uses repository mapping tests and migration assertions instead of live local Supabase execution.
- Phase 3 end-to-end auth coverage avoids the sandbox Supabase limitation by switching to an in-memory mock auth driver when `AUTH_DRIVER=mock`.
- Phase 4 mock browser coverage had to move auth/family stores from process memory to `/tmp/personal-work-shift/*.json` because Next.js dev workers do not consistently share `globalThis` state during Playwright runs.

---

## Next Steps

- Apply branch protection rules in GitHub using `.github/branch-protection-rules.md`
- Begin Phase 5 by implementing family-scoped event creation flows on top of the active-family selection
- Add live local Supabase integration coverage once the sandbox DNS issue for `supabase start` is resolved
