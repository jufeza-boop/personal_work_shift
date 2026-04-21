# Memory - Personal Work Shift

## Project Overview

- **App**: Personal Work Shift — family schedule management PWA
- **Architecture**: Clean Architecture (Domain → Application → Infrastructure → Presentation)
- **Stack**: Next.js 15+, TypeScript, Tailwind CSS, Shadcn/ui, Supabase (Auth + DB + Realtime + Storage), Serwist (PWA), Vercel

## Current State

- **Phase**: Phase 14 Quality Assurance completed + Calendar visual improvements
- **Last Updated**: 2026-04-21
- **Tests**: 373 Vitest unit tests passing + E2E suites for mobile, accessibility, PWA

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

### 2026-04-21 - Calendar Visual Improvements

#### What was done
- Punctual events now display with the creator's palette base color instead of neutral gray `bg-stone-100`
- Work/study recurring events now fill the entire `DayCell` background with the member's shift palette color (e.g. sky/morning = `#E0F2FE`) instead of a horizontal bar inside the cell
- When two work/study events coincide on the same day, a `linear-gradient(135deg, color1 50%, color2 50%)` diagonal split is applied to the cell background
- Shift event labels now show the **event title** instead of member initials, since the color already identifies the owner
- Added `buildShiftBackground()` helper in `DayCell.tsx` for N-color diagonal gradients
- Removed `ShiftBlock` import from `DayCell` (no longer needed for the bar layout)
- 4 new TDD tests added in `DayCell.test.tsx`; total: 373 Vitest tests

#### Patterns
- Use `CSSProperties` inline `style` for dynamic colors on the `<button>` element; Tailwind classes handle structural layout only
- `buildShiftBackground(colors)` returns `null` for 0–1 colors (use `backgroundColor`) and a gradient string for 2+ colors
- For today ring + shift background: keep `ring-1 ring-blue-300` in className, background via inline style

#### Next steps
- Build or run E2E to visually verify the diagonal gradient in a real browser if desired

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

### 2026-04-16 - Phase 12: Push Notifications (US-7.1)

#### What was done

- Added `IPushSubscriptionRepository` domain interface in `src/domain/repositories/IPushSubscriptionRepository.ts`
- Added `IPushNotificationService` application interface in `src/application/services/IPushNotificationService.ts`
- Added three use cases in `src/application/use-cases/push/`: `SubscribeToPush`, `UnsubscribeFromPush`, `SendEventNotification`
- Added `SupabasePushSubscriptionRepository` in `src/infrastructure/push/`
- Added `WebPushService` (wraps `web-push` npm package) in `src/infrastructure/push/`
- Added `createServerPushDependencies()` runtime factory in `src/infrastructure/push/runtime.ts` — returns no-op implementations when VAPID keys are not configured
- Updated `src/app/sw.ts` to handle `push` events (show notification) and `notificationclick` events (open app at relevant calendar date)
- Added API routes: `POST /api/push/subscribe`, `POST /api/push/unsubscribe`, `GET /api/push/vapid-public-key`
- Added `usePushNotifications` hook (client) for managing subscription state and permission flow
- Added `NotificationOptIn` component — shown at top of calendar page; hidden when unsupported or permission denied
- Integrated `notifyFamilyOnEventChange` helper into all three event server actions (create/edit/delete) — notifies family members via push after each successful operation
- Supabase migration `20260416200000_phase_12_push_subscriptions.sql` adds `push_subscriptions` table with user_id, endpoint, keys, and RLS policies

#### Decisions

- VAPID keys stored as env vars: `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`
- No-op service and repository are returned when VAPID keys are absent — app runs normally without push configured
- Push notification failures are caught and logged; they never break event create/edit/delete flows
- `findByUserIds` on push repository uses Supabase `.in()` query for batch lookup of family members' subscriptions

#### Patterns

- Service worker event handlers added after `serwist.addEventListeners()` in `sw.ts`
- `NotificationOptIn` returns `null` when `isSupported=false` or `permission='denied'`
- `urlBase64ToUint8Array` helper converts VAPID public key from base64url to Uint8Array for `pushManager.subscribe`

#### Next steps

- Phase 13: Security Hardening & Deployment

---

### 2026-04-17 - Delegated User Management Refactoring

#### What was done

- Moved delegated user CRUD out of family settings into a dedicated page at `/calendar/delegated-users`
- Added "Usuarios delegados" link in `UserMenu` dropdown (accessible from user icon)
- Created `DelegatedUserCard` component with confirmation dialog and success/error visual feedback for delete operations
- Created `RemoveFamilyMember` use case — owner can remove members from family
- Created `LeaveFamily` use case — non-owner can leave a family voluntarily
- Created `AddDelegatedUserToFamily` use case — add existing delegated user to a family
- Added `removeMember` method to `Family` domain entity with validation (cannot remove owner)
- Created server actions: `removeFamilyMemberAction`, `leaveFamilyAction`, `addDelegatedUserToFamilyAction`
- Updated `removeDelegatedUserAction` to return `FamilyFormState` with visual feedback instead of void
- Created `AddDelegatedUserToFamilyForm` — selector for owners to add existing delegated users to family
- Created `RemoveFamilyMemberButton` — inline confirm/cancel button for removing members from family
- Created `LeaveFamilyForm` — confirmation form for non-owners to leave family
- Updated `FamilyMemberList` to show remove buttons for non-owner members when current user is the owner
- Updated family settings page: removed delegated user CRUD, added member management features
- Updated E2E test for new delegated user navigation flow

#### Decisions

- Delegated users are managed globally (from user menu), not per-family. This is because a delegated user belongs to the parent user, not to a specific family
- Adding a delegated user to a family is done from family settings, separate from creating the delegated user
- `removeDelegatedUserAction` changed from void return to `FamilyFormAction` (breaking change for old callers, but `DelegatedUserList` was replaced)
- Non-owners see a "Leave family" option instead of "Delete family"
- All delete/remove operations use two-step confirmation (click → confirm/cancel)

#### Patterns

- `DelegatedUserCard` and `RemoveFamilyMemberButton` both follow a `showConfirm` state pattern with `useActionState` for form feedback
- Family member list conditionally renders remove buttons based on `isOwner` prop
- Delegated users page fetches user's delegated users globally (not per-family) using `userRepository.findDelegatedUsers(user.id)`
- Available delegated users for family are filtered by checking which ones are not already members of the active family

#### Next steps

- Implement email invitation system for non-registered users (when email doesn't exist)
- Non-delegated member removal could require email consent flow (noted for future)

---

### 2026-04-18 - Delegated User Bug Fixes

#### What was done

- Fixed "Abandonar familia" — added RLS policy `family_members_delete_self` allowing non-owners to delete their own membership row
- Fixed "Eliminar usuario delegado" — added RLS policy `family_members_delete_delegated_parent` allowing parents to delete delegated children's membership rows from any family
- Fixed "Editar usuario delegado" — created `RenameDelegatedUser` use case, `renameDelegatedUserAction` server action, and inline edit UI in `DelegatedUserCard`
- Fixed "Añadir delegado a varias familias" — added missing `redirectTo` hidden input to `AddDelegatedUserToFamilyForm`
- Fixed "Delegados sin paleta" — added optional `colorPalette` to `CreateDelegatedUser` and `AddDelegatedUserToFamily` use cases, palette picker to both forms, and `AssignDelegatedMemberPaletteForm` in the family member list for owner to assign palettes to delegated members

#### Decisions

- RLS policies are additive (new policies alongside existing ones) so existing owner-level operations continue working
- `RenameDelegatedUser` creates a new `User` instance with updated name since `User` entity has readonly properties
- Palette assignment for delegated members uses existing `SelectPalette` use case via a new `assignDelegatedMemberPaletteAction` that verifies the target is a delegated user owned by the requester

#### Patterns

- `DelegatedUserCard` now has both `removeAction` and `renameAction` props, with inline edit form toggled via `isEditing` state
- `FamilyMemberList` accepts optional `assignPaletteAction` and `paletteOptions` to show palette assignment for delegated members
- `CreateDelegatedUserForm` accepts optional `paletteOptions` prop; `AddDelegatedUserToFamilyForm` requires `paletteOptions`

#### Next steps

- Implement email invitation system for non-registered users
- Consider adding palette assignment for non-delegated members

---

### 2026-04-19 - Phase 14: Quality Assurance

#### What was done

- Improved Vitest code coverage from 82.96% → 85.26% statements (70.45% → 73.15% branch) by adding 24 unit tests
- Added tests for `AssignDelegatedMemberPaletteForm` (10% → full), `InviteFamilyMemberForm`, `DayDetailPanel` (delete dialog, delegated users), and edge cases for `AddMember`, `CreateFamily`, `RenameFamily`, `LoginUser`
- Updated `playwright.config.ts` with 6 browser projects: Chromium, Firefox, WebKit (Safari), Edge, Mobile Chrome (Pixel 7), Mobile Safari (iPhone 14)
- Created `e2e/mobile-responsiveness.spec.ts` — tests landing, login, register, and calendar pages on mobile viewports
- Created `e2e/pwa.spec.ts` — validates manifest fields, service worker registration, manifest link tag, and icon accessibility
- Created `e2e/accessibility.spec.ts` — axe-core WCAG 2.1 AA audit on landing, login, register, and calendar pages
- Created `.lighthouserc.json` — Lighthouse CI config targeting >90 for performance, accessibility, best-practices, and SEO
- Created `e2e/websocket-load-test.mjs` — concurrent WebSocket connection load test for Supabase Realtime (configurable via env vars)
- Added npm scripts: `test:e2e:mobile`, `test:e2e:a11y`, `test:ws-load`, `lighthouse`

#### Decisions

- `@axe-core/playwright@4.11.2` used for accessibility auditing within E2E tests (no vulnerabilities)
- Lighthouse CI config uses `temporary-public-storage` upload target for easy review without infrastructure
- WebSocket load test is a standalone Node.js script (not Playwright) for simplicity and direct socket control
- Cross-browser Playwright projects use device presets from `@playwright/test` (`Desktop Chrome`, `Desktop Firefox`, `Desktop Safari`, `Desktop Edge`, `Pixel 7`, `iPhone 14`)

#### Patterns

- Mobile responsiveness tests verify no horizontal overflow and that key UI elements are visible/reachable
- PWA tests validate manifest JSON structure, icon accessibility, and service worker registration
- Accessibility tests use `withTags(["wcag2a", "wcag2aa", "wcag21aa"])` for comprehensive WCAG 2.1 AA coverage

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

- `web-push@3.6.7` (server-side Web Push API)
- `@types/web-push@3.6.4` (dev, TypeScript types)
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
- `@axe-core/playwright@^4.11.2`

---

## Schema Changes

- Added `users`, `families`, `family_members`, `events`, and `event_exceptions` tables in `supabase/migrations/20260410090623_phase_2_infrastructure.sql`
- Added `push_subscriptions` table in `supabase/migrations/20260416200000_phase_12_push_subscriptions.sql`
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

- Phase 11: Delegated Users (US-1.4) ✅ Done

---

## 2026-04-16 - Phase 11: Delegated Users (US-1.4)

### What was done

- Added `findDelegatedUsers(parentId)` and `delete(id)` to `IUserRepository` interface
- Added `MockStoredUser.delegatedByUserId` field to `mockAuthStore`; added `findMockDelegatedUsers` and `deleteMockUser` helpers
- Updated `MockUserRepository` and `SupabaseUserRepository` to implement the two new methods
- Created `CreateDelegatedUser` use case: generates a UUID-based user with a synthetic email (`delegated-{uuid}@pws.local`), saves the user, adds them as a `delegated` member to the chosen family
- Created `RemoveDelegatedUser` use case: verifies parent ownership, removes from all families, deletes the user record
- Added `createDelegatedUserAction` and `removeDelegatedUserAction` server actions
- Updated `createEventAction`, `editEventAction`, `deleteEventAction` to support delegation via `resolveCreatedBy` / `resolveRequestedBy` helpers
- Created `CreateDelegatedUserForm` and `DelegatedUserList` presentation components
- Added delegated user section to the settings page
- Updated `CalendarGrid → DayDetailPanel → DayCreateEventForm` to show a "Crear para" dropdown when delegated users exist; parents can edit/delete children's events
- Added Supabase migration: drops `users.id → auth.users.id` FK (allows non-auth delegated user records), adds cleanup trigger, adds parent RLS policies for `users` table
- Added E2E test for delegated user creation, event creation on behalf of, and removal

### Decisions

- Delegated users use synthetic emails (`delegated-{uuid}@pws.local`) so they don't need Supabase auth accounts; the FK from `users.id → auth.users.id` is dropped in the migration
- A cleanup trigger on `auth.users DELETE` preserves cascade deletion for real auth-backed users
- Event ownership for edit/delete is resolved in server actions (not use cases): `resolveRequestedBy` checks if `event.createdBy` is a delegated user of the authenticated parent
- `createServerEventDependencies()` now also returns `userRepository` (used for delegation checks)

### Next steps

- Phase 12: Push Notifications (US-7.1)

---

## Next Steps

- Apply branch protection rules in GitHub using `.github/branch-protection-rules.md`
- ~~Begin Phase 6: Event Management - Edit & Delete (US-4.4, US-4.5, US-4.6)~~ ✅ Done
- ~~Begin Phase 8: Color Palette System (US-5.1, US-5.2)~~ ✅ Done
- ~~Begin Phase 7: Calendar View (US-3.1, US-3.2, US-3.3) to render events visually on a monthly grid~~ ✅ Done
- ~~Begin Phase 9: Real-Time Synchronization (US-6.1)~~ ✅ Done
- ~~Begin Phase 10: PWA & Offline Support (US-6.2)~~ ✅ Done
- ~~Begin Phase 11: Delegated Users (US-1.4)~~ ✅ Done
- ~~Begin Phase 13: Security Hardening & Deployment~~ ✅ Done
- Add live local Supabase integration coverage once the sandbox DNS issue for `supabase start` is resolved
- Begin Phase 14: Quality Assurance

---

### 2026-04-17 - Phase 13: Security Hardening & Deployment

#### What was done

- Created `src/infrastructure/security/securityHeaders.ts` — centralized security headers module exported for `next.config.ts`
- Configured CSP (Content-Security-Policy), HSTS (Strict-Transport-Security with 2-year max-age, includeSubDomains, preload), X-Frame-Options (DENY), X-Content-Type-Options (nosniff), Referrer-Policy, Permissions-Policy, X-DNS-Prefetch-Control
- CSP allows self, unsafe-inline/eval for Next.js, Supabase domains for connect-src, blob/data for workers/images
- Created `src/infrastructure/security/RateLimiter.ts` — generic in-memory sliding-window rate limiter with cleanup method
- Created `src/infrastructure/security/authRateLimiter.ts` — pre-configured instance (10 attempts per 15-minute window per IP)
- Created `src/infrastructure/security/getClientIp.ts` — extracts client IP from x-forwarded-for / x-real-ip headers
- Integrated rate limiting into `loginAction` and `registerAction` server actions
- Updated `next.config.ts` to import centralized security headers from the infrastructure module
- Added 14 new unit tests (7 for securityHeaders, 5 for RateLimiter, 2 for authRateLimiter)
- All 284 tests pass; lint clean; build succeeds

#### Decisions

- Rate limiter uses in-memory storage — suitable for single-instance Next.js deployments; for horizontal scaling, consider Redis-based rate limiting
- CSP includes `unsafe-inline` and `unsafe-eval` for script-src to support Next.js development and runtime needs
- HSTS max-age set to 2 years (63072000s) with preload flag for HSTS preload list eligibility

#### Patterns

- Security headers centralized in `src/infrastructure/security/securityHeaders.ts` and imported by `next.config.ts` via relative path (config files can't use `@/` alias)
- Rate limiter is a generic reusable class; auth-specific instance is a separate singleton module
