# Memory - Personal Work Shift

## Project Overview

- **App**: Personal Work Shift — family schedule management PWA
- **Architecture**: Clean Architecture (Domain → Application → Infrastructure → Presentation)
- **Stack**: Next.js 15+, TypeScript, Tailwind CSS, Shadcn/ui, Supabase (Auth + DB + Realtime + Storage), Serwist (PWA), Vercel

## Current State

- **Phase**: Phase 10 PWA & Offline Support (US-6.2) completed
- **Last Updated**: 2026-04-15
- **Tests**: 236 passing

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

### 2026-04-13 - Navigation Bar and Landing Page

- Created `UserMenu` client component using native `<details>/<summary>` with controlled React state; Escape key support via `onKeyDown` on the `<details>` element; `onClick` on `<summary>` with `e.preventDefault()` toggles state since `onToggle`'s `e.currentTarget.open` is also blocked by TS 5.9 DOM issue
- Created `AppNavBar` server component: sticky top bar with logo, Calendario + Ajustes de familia nav links, and `UserMenu`
- Updated `(dashboard)/layout.tsx` to use `AppNavBar`; removed old email header + logout button; changed `<main>` wrapper to `<div>` with inner `<main>`
- Redesigned `src/app/page.tsx` as a public landing page with sticky public header (login/register), hero section, and feature cards
- `document` global is not available in TypeScript client components due to the TS 5.9 + `@types/react/global.d.ts` empty interfaces issue — use React synthetic events instead
- `HTMLDivElement`, `HTMLDetailsElement`, and other DOM types lose their inherited methods (e.g., `contains`, `open`) in this TypeScript environment — always cast through `unknown` when needed

- Added `src/application/services/calendarUtils.ts` with `serializeEvent`, `getOccurrencesForMonth`, and `getShiftColor` utilities
- `serializeEvent` converts domain Event entities to plain JSON-safe objects for server→client prop passing
- `getOccurrencesForMonth` expands recurring events (daily/weekly/annual, with interval and optional endDate) into concrete dated occurrences for a given month using UTC date math and a fast-skip optimization
- `getShiftColor` resolves the hex color for a (paletteName, shiftType) pair via the domain ColorPalette/ShiftType value objects
- Added `src/presentation/hooks/useCalendarEvents.ts` — client hook that wraps occurrence expansion with month navigation state and per-member visibility toggle (enforces at least one member visible)
- Added `CalendarGrid`, `DayCell`, `ShiftBlock`, `MemberToggle` presentation components under `src/presentation/components/calendar/`
- `CalendarGrid` is a client component; renders a Monday-first 7-column monthly grid with prev/next navigation
- `DayCell` separates shift blocks (recurring work/studies → colored ShiftBlock) from text labels (punctual + recurring other)
- `ShiftBlock` renders a proportionally equal-width colored bar with member initials; multiple shifts in a day cell appear side-by-side (split-day view)
- `MemberToggle` disables the last visible member's checkbox to enforce at least one always-visible rule
- Updated `calendar/page.tsx` to serialize events + members and render `CalendarGrid` replacing the placeholder section
- All 133 Vitest tests pass; lint clean; build succeeds

---

### 2026-04-15 - Phase 10 PWA & Offline Support (US-6.2)

#### What was done
- Added `IOfflineQueue` interface and `PendingOperation` type in `src/application/services/IOfflineQueue.ts`
- Added `OfflineQueueStore` IndexedDB implementation in `src/infrastructure/offline/OfflineQueueStore.ts` with injected `DbBackend` for testability (default uses IndexedDB `pws-offline-queue` DB)
- Added `useOfflineSync` hook in `src/presentation/hooks/useOfflineSync.ts` — tracks `navigator.onLine`, polls queue count, auto-syncs on reconnect, exposes `enqueueOperation`/`syncNow`
- Added `OfflineBanner` component in `src/presentation/components/ui/OfflineBanner.tsx` — shows offline / syncing / pending-count status
- Updated `CalendarGrid` to integrate offline queue: create/delete actions wrapped to enqueue when offline, `OfflineBanner` rendered at top, `OfflineQueueStore` initialized with `useState` for stable reference

#### Decisions
- `IOfflineQueue.enqueue` accepts optional `retryCount` to allow re-enqueuing with incremented count on failure
- `OfflineQueueStore` uses injectable `DbBackend` factory to enable pure in-memory testing without mocking IndexedDB
- `CalendarGrid` uses `useState(() => new OfflineQueueStore())` instead of `useMemo` to guarantee a single stable instance

#### Patterns
- IndexedDB operations wrapped with `idbReq<T>()` Promise helper
- `useOfflineSync` uses `useRef` to guard against parallel sync runs (`isSyncingRef`)
- Test isolation: `afterEach` must call `cleanup()` + `await act(async () => {})` when hook tests dispatch window events or run async sync logic across tests

#### Next steps
- Phase 11: Notifications (US-7.x) — push notification subscription and dispatch

- Added `EventException` domain entity with validation; used for recording overrides or soft-deletes of individual recurring event occurrences
- Added `IEventRepository.saveException()` method; updated `MockEventRepository`, `SupabaseEventRepository`, and `mockEventStore` accordingly
- Added `EditEvent` and `DeleteEvent` application use cases with discriminated `scope: "all" | "single"` input; scope "all" mutates the event directly, scope "single" creates an `EventException` record
- Added edit schemas (`editPunctualEventSchema`, `editRecurringWorkEventSchema`, `editRecurringOtherEventSchema`) to `eventSchemas.ts`
- Added `editEventAction` and `deleteEventAction` server actions
- Added `EditEventForm` client component and `EventList` client component (with delete dialog and edit links)
- Added edit page at `/calendar/events/[id]/edit` (Next.js 15 dynamic route, params as Promise)
- Updated calendar page to use `EventList` with edit/delete support and to include `user` from `getFamilyPageData`
- Added E2E tests for edit and delete flows
- TypeScript 5.9 in this project has a known issue where `EventTarget & HTMLInputElement` intersection does not expose `.value` when `@types/react/global.d.ts` empty interfaces are in scope — worked around by using uncontrolled date input inside the form and avoiding any `.value` reads on HTMLInputElement refs in EventList component

- Implemented `CreateEvent` use case with discriminated union input (`eventType: "punctual" | "recurring"`), Result-style responses, family membership check, and domain entity creation
- Added `mockEventStore.ts` (file-backed JSON at `/tmp/personal-work-shift/mock-event-store.json`), `MockEventRepository`, and `createServerEventDependencies()` runtime factory following the established family mock pattern
- Added Zod schemas for punctual, recurring-work, and recurring-other event forms in `eventSchemas.ts`
- Added `CreateEventForm` client component with tab switcher (Puntual / Trabajo/Estudio / Otro recurrente) using `useActionState`
- Added `createEventAction` server action dispatching to three schema/use-case branches based on `eventType` hidden input
- Updated calendar page to render `CreateEventForm` and an event list fetched via `eventRepository.findByFamilyId`
- Added Playwright E2E tests for all three event creation flows
- All 82 Vitest tests pass, lint clean, build succeeds

---

### 2026-04-10 - Family Creation RLS Fix

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
- Event management uses `src/app/actions/events.ts` server actions; the `CreateEventForm` component sends a hidden `eventType` field ("punctual" | "recurring-work" | "recurring-other") to route validation and use-case dispatch in the server action
- Event mock infrastructure (`MockEventRepository`, `mockEventStore`) follows the same file-backed JSON pattern as the family mock infrastructure
- All form submit buttons use `SubmitButton` (`src/presentation/components/ui/SubmitButton.tsx`), which reads `useFormStatus().pending` to disable itself and swap its label while the server action is in flight — this gives users immediate visual feedback on every form action

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

## 2026-04-14 - Phase 8: Color Palette System (US-5.1, US-5.2)

### What was done

- Added `Family.updateMemberPalette(userId, colorPalette)` method (validates exclusivity against other members, not self)
- Added `SelectPalette` application use case: allows any family member to pick/change their own palette
- Added `selectPaletteSchema` Zod schema and `selectPaletteAction` server action
- Created `ColorPalettePicker` visual component: 4-column grid of palette cards with shift tone swatches
- Updated `InviteFamilyMemberForm` to use `ColorPalettePicker` instead of plain `<select>`
- Created `SelectPaletteForm` for current member to pick/change their own palette
- Updated `FamilyMemberList` to show colored swatch strip instead of plain text
- Added `src/presentation/utils/paletteUtils.ts` – single source of truth for palette display colors, derived from domain `ColorPalette` value object
- Updated FamilySettingsPage with `buildPaletteOptions()` helper

### Decisions

- `updateMemberPalette` excludes self from exclusivity check so a member can re-select their own palette
- `buildPaletteOptions(family, null)` disables all taken palettes (invite form); `buildPaletteOptions(family, userId)` allows the user's own palette to remain enabled
- Palette hex colors derived from domain `ColorPalette.getToneFor()` via shared utility — no duplicated constants

### Next steps

- Phase 9: Real-Time Synchronization (US-6.1)

---

### 2026-04-14 - UX Change: Day-Level Event Management

### What was done

- Moved event creation, editing, and deletion into the calendar day cells
- `DayCell` is now a `<button>` that opens a `DayDetailPanel` when clicked
- `DayDetailPanel` shows events for the selected day with edit/delete actions and an inline create form
- `DayCreateEventForm` pre-fills the date from the selected day cell (no manual date entry needed)
- Removed standalone `CreateEventForm` and `EventList` sections from the calendar page
- `CalendarGrid` now manages `selectedDate` state and resets it on month navigation
- Updated E2E tests to use the new day-cell-based event management flow

### Decisions

- Pre-fill date automatically: punctual events use the clicked day as `date`, recurring events use it as `startDate`
- For recurring event deletion with scope "single", the occurrence date is automatically set to the selected day
- `DayDetailPanel` is rendered inline below the calendar grid (not as a modal) for better UX
- `selectedDate` resets to null when navigating between months to avoid stale selections
- Old `CreateEventForm` and `EventList` components retained in codebase but no longer used on the calendar page

### Patterns

- Day cells emit `onSelect(dateStr)` to parent; parent manages which panel is open
- `DayCreateEventForm` is a compact version of `CreateEventForm` designed for inline use within the day panel

---

### 2026-04-15 - UX Change: Family Selector Moved to Top Navigation Bar

### What was done

- Moved the family selector from the calendar sidebar to the top navigation bar
- Created `FamilySelectorDropdown` — compact `<select>` dropdown that renders only when 2+ families exist
- Updated `AppNavBar` to accept `families` and `activeFamilyId` props, rendering the dropdown between nav links and user menu
- Updated `DashboardLayout` to fetch family data (via `createServerFamilyDependencies` + `resolveActiveItem`) and pass to `AppNavBar`
- Removed `FamilySelectorPanel` and two-column `lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)]` layout from calendar page — calendar now uses full page width
- Removed `FamilySelectorPanel` from settings page sidebar — settings page uses flat `space-y-6` layout
- Updated E2E family switching test to use dropdown `selectOption` instead of sidebar buttons
- Added 4 unit tests for `FamilySelectorDropdown`

### Decisions

- Family selector is a `<select>` element with `onChange` auto-submit (via `requestSubmit`) — compact enough for the 14px-height nav bar
- The `<select>` uses a screen-reader-only label "Familia" for accessibility
- `FamilySelectorPanel` component is retained in codebase but no longer used on any page (available for future use if needed)
- `requestSubmit()` on HTMLFormElement requires `as unknown` cast due to known TS 5.9 DOM types issue

### Patterns

- Family data (families list + active family) is now fetched in `DashboardLayout` and passed to `AppNavBar`, making the selector available on all dashboard pages
- `FamilySelectorDropdown` follows the same render-nothing-if-fewer-than-2 pattern as the old `FamilySelectorPanel`

---

## 2026-04-15 - Phase 9: Real-Time Synchronization (US-6.1)

### What was done

- Added `IRealtimeService` interface in `src/application/services/IRealtimeService.ts` defining `subscribe(familyId, handlers)` and `unsubscribe()` contract
- Created `src/infrastructure/supabase/browser.ts` with `createBrowserSupabaseClient()` factory (uses `createBrowserClient` from `@supabase/ssr` with `NEXT_PUBLIC_*` env vars)
- Implemented `SupabaseRealtimeService` in `src/infrastructure/realtime/SupabaseRealtimeService.ts`:
  - Subscribes to `events` table Postgres Changes for INSERT/UPDATE/DELETE filtered by `family_id`
  - Maps `EventRow` to `SerializedEvent` directly (avoiding domain entity overhead in the browser)
  - `unsubscribe()` calls `client.removeChannel()` and nulls the ref (safe to call multiple times)
- Created `useRealtimeSync` hook in `src/presentation/hooks/useRealtimeSync.ts`:
  - Uses `useRef` for handler callbacks to avoid stale closures without causing re-subscription
  - Re-subscribes only when `service` or `familyId` changes
  - Calls `service.unsubscribe()` on cleanup
- Updated `CalendarGrid` to manage `events` in `useState` (initialized from `initialEvents` prop) and call `useRealtimeSync` — INSERT appends, UPDATE replaces by id, DELETE filters out
- Renamed `CalendarGrid.events` prop to `initialEvents` to clarify that server-supplied events are the starting state; live events are managed in state
- Added 14 unit tests for `SupabaseRealtimeService` and 7 unit tests for `useRealtimeSync`
- CalendarGrid tests mock `useRealtimeSync`, `SupabaseRealtimeService`, and `createBrowserSupabaseClient` to prevent real WebSocket connections

### Decisions

- `CalendarGrid` creates the `SupabaseRealtimeService` internally via `useMemo` so each calendar instance owns its own subscription lifetime
- Handler callbacks are kept in a `useRef` (updated every render) so the subscription effect only has `[service, familyId]` as deps — avoids re-subscribe on every parent re-render
- `browser.ts` reads `NEXT_PUBLIC_*` env vars directly (Next.js inlines them at build time) rather than going through `getAppEnv()` to avoid `NEXT_PUBLIC_VAPID_PUBLIC_KEY` requiring validation on the browser client

### Patterns

- `SupabaseRealtimeService` follows the same constructor-injection pattern as `SupabaseEventRepository` (accepts a `SupabaseClient` param) — easy to unit test with a mock client
- `useRealtimeSync` uses the `handlersRef` + two `useEffect` pattern for stable subscriptions with fresh callback references
- CalendarGrid tests mock the realtime service using a plain class (`class { subscribe() {} unsubscribe() {} }`) to avoid Vitest ESM hoisting issues with `vi.fn()` inside `vi.mock` factories

### Next steps

- Phase 11: Delegated Users (US-1.4)

---

## 2026-04-15 - Phase 10: PWA & Offline Support (US-6.2)

### What was done

- Service worker (`src/app/sw.ts`) was already correctly configured with Serwist `defaultCache`: cache-first for static assets, network-first for API GET routes, network-first for HTML navigation with `/~offline` fallback
- PWA manifest (`src/app/manifest.ts`) was already complete from Phase 0
- Added `IOfflineQueue` interface in `src/application/services/IOfflineQueue.ts` defining `PendingOperation` type and queue contract
- Implemented `OfflineQueueStore` in `src/infrastructure/offline/OfflineQueueStore.ts`: IndexedDB-backed queue using `pws-offline-queue` DB, `operations` object store; uses injectable `DbBackend` for testability
- Implemented `useOfflineSync` hook: tracks `navigator.onLine` via window `online`/`offline` events, auto-syncs queue on reconnect, exposes `enqueueOperation`/`syncNow`/`isSyncing`/`pendingCount`
- Created `OfflineBanner` component: amber when offline, indigo when syncing, yellow when there are pending operations
- Updated `CalendarGrid` to use `useOfflineSync` with an `OfflineQueueStore`, wrapping create/delete actions with offline-aware wrappers that enqueue operations when offline, and displaying `OfflineBanner`
- Added 26 new tests (236 total, was 210)

### Decisions

- `defaultCache` from `@serwist/turbopack/worker` already provides comprehensive caching (cache-first static, network-first API/HTML) — no need to extend the service worker
- `OfflineQueueStore` uses constructor-injected `DbBackend` factory so tests pass an in-memory backend instead of real IndexedDB
- Server actions (Next.js POST requests) are intercepted at the CalendarGrid level: offline-aware wrappers check `navigator.onLine` before calling the real server action
- Conflict resolution strategy: server-wins — when a queued operation fails on replay, it is removed from the queue (no infinite retry loops)
- `crypto.randomUUID()` used for operation IDs (122-bit entropy, collision risk negligible)
- `isSyncingRef` prevents parallel sync runs if multiple `online` events fire rapidly

### Patterns

- `useOfflineSync` follows the same `useRef`-for-callbacks pattern as `useRealtimeSync` to avoid stale closures
- `OfflineQueueStore` mirrors the constructor-injection pattern used by `SupabaseEventRepository`
- `CalendarGrid` creates its `OfflineQueueStore` via `useState(() => new OfflineQueueStore())` so the queue survives re-renders but is fresh per component mount

### Next steps

- Phase 11: Delegated Users (US-1.4)

---

## Next Steps

- Apply branch protection rules in GitHub using `.github/branch-protection-rules.md`
- ~~Begin Phase 6: Event Management - Edit & Delete (US-4.4, US-4.5, US-4.6)~~ ✅ Done
- ~~Begin Phase 8: Color Palette System (US-5.1, US-5.2)~~ ✅ Done
- ~~Begin Phase 7: Calendar View (US-3.1, US-3.2, US-3.3) to render events visually on a monthly grid~~ ✅ Done
- ~~Begin Phase 9: Real-Time Synchronization (US-6.1)~~ ✅ Done
- ~~Begin Phase 10: PWA & Offline Support (US-6.2)~~ ✅ Done
- Begin Phase 11: Delegated Users (US-1.4)
- Add live local Supabase integration coverage once the sandbox DNS issue for `supabase start` is resolved
