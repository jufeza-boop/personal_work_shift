# TODO - Personal Work Shift

## Phase 0: Project Bootstrap

- [x] Initialize Next.js 15+ project with TypeScript strict mode
- [x] Configure Tailwind CSS + Shadcn/ui
- [x] Set up ESLint + Prettier with project rules
- [x] Configure Vitest + React Testing Library for testing
- [x] Set up project folder structure (Clean Architecture layers)
- [x] Initialize Supabase project (local development with Supabase CLI)
- [x] Configure environment variables (.env.local, .env.example)
- [x] Set up Serwist for PWA support
- [ ] Configure GitHub repository + branch protection rules
- [x] Set up GitHub Actions CI/CD pipeline (lint, test, build, deploy)
- [x] Create `.gitignore` with all necessary exclusions

---

## Phase 1: Domain Layer

- [x] Define `User` entity with business rules
- [x] Define `Family` entity with business rules
- [x] Define `Event` base entity (abstract)
- [x] Define `PunctualEvent` entity extending Event
- [x] Define `RecurringEvent` entity extending Event
- [x] Define `ShiftType` value object (Day/Night/Morning/Afternoon)
- [x] Define `ColorPalette` value object with pastel palettes
- [x] Define `EventFrequency` value object (daily, weekly, annual)
- [x] Define `IUserRepository` interface
- [x] Define `IFamilyRepository` interface
- [x] Define `IEventRepository` interface
- [x] Implement domain rule: event ownership validation
- [x] Implement domain rule: color palette exclusivity within family
- [x] Write unit tests for all entities and value objects
- [x] Write unit tests for all domain rules

---

## Phase 2: Infrastructure - Database

- [x] Design and create `users` table + RLS policies
- [x] Design and create `families` table + RLS policies
- [x] Design and create `family_members` table + RLS policies
- [x] Design and create `events` table + RLS policies
- [x] Design and create `event_exceptions` table + RLS policies
- [x] Write Supabase migrations for all tables
- [x] Implement `SupabaseUserRepository`
- [x] Implement `SupabaseFamilyRepository`
- [x] Implement `SupabaseEventRepository`
- [x] Write integration tests for all repositories
- [x] Write tests for all RLS policies

---

## Phase 3: Authentication (US-1.1, US-1.2, US-1.3)

- [x] Implement `RegisterUser` use case + tests
- [x] Implement `LoginUser` use case + tests
- [x] Implement `LogoutUser` use case + tests
- [x] Create Supabase Auth adapter
- [x] Create registration page (form + validation with Zod)
- [x] Create login page (form + validation)
- [x] Implement auth middleware (protected routes)
- [x] Configure httpOnly cookie session management
- [x] Write E2E tests for auth flows

---

## Phase 4: Family Management (US-2.1, US-2.2, US-2.3, US-2.4)

- [x] Implement `CreateFamily` use case + tests
- [x] Implement `AddMember` use case + tests
- [x] Implement `SwitchFamily` use case + tests
- [x] Implement `RenameFamily` use case + tests
- [x] Create family selector panel component
- [x] Create family settings page
- [x] Create member invitation flow (by email)
- [x] Create member list component with roles
- [x] Persist active family selection across sessions
- [x] Write E2E tests for family management

---

## Phase 5: Event Management - Core (US-4.1, US-4.2, US-4.3)

- [x] Implement `CreateEvent` use case (punctual) + tests
- [x] Implement `CreateEvent` use case (recurring work/study) + tests
- [x] Implement `CreateEvent` use case (recurring other) + tests
- [x] Create event creation form with type selection
- [x] Implement recurrence rule builder (every X days/weeks/annual)
- [x] Implement shift type selector (Day/Night/Morning/Afternoon)
- [x] Validate event ownership on creation
- [x] Write unit tests for event creation logic
- [x] Write E2E tests for event creation flows

---

## Phase 6: Event Management - Edit & Delete (US-4.4, US-4.5, US-4.6)

- [x] Implement `EditEvent` use case (single + series) + tests
- [x] Implement `DeleteEvent` use case (single + series) + tests
- [x] Create edit event form (pre-populated)
- [x] Create "Edit this or all?" confirmation dialog for recurring events
- [x] Create "Delete this or all?" confirmation dialog for recurring events
- [x] Implement event exceptions for single-occurrence edits/deletes
- [x] Enforce ownership: hide edit/delete for non-creators
- [x] Enforce ownership: server-side rejection for unauthorized modifications
- [x] Write E2E tests for edit and delete flows

---

## Phase 7: Calendar View (US-3.1, US-3.2, US-3.3)

- [x] Create `CalendarGrid` component (monthly view)
- [x] Create `DayCell` component with event rendering
- [x] Create `ShiftBlock` component with color tones
- [x] Implement split-day view for multi-member shifts
- [x] Create `MemberToggle` checkboxes for show/hide
- [x] Implement `useCalendarEvents` hook (fetch + filter)
- [x] Display punctual events as text labels
- [x] Display recurring work/study events as colored blocks
- [x] Display recurring other events as text labels
- [x] Write unit tests for calendar rendering logic
- [x] Write E2E tests for calendar view

---

## Phase 8: Color Palette System (US-5.1, US-5.2)

- [x] Define predefined pastel color palettes (8-10 options)
- [x] Create color palette selector component
- [x] Implement palette exclusivity validation (within family)
- [x] Implement shift-type-to-tone mapping per palette
- [x] Show color preview with all 4 shift tones
- [x] Gray out / disable already-taken palettes
- [x] Write unit tests for color rules
- [x] Write E2E tests for palette selection

---

## Phase 9: Real-Time Synchronization (US-6.1)

- [x] Configure Supabase Realtime subscriptions for events table
- [x] Create `RealtimeSubscriptionManager` service
- [x] Create `useRealtimeSync` hook
- [x] Handle INSERT events (new event appears)
- [x] Handle UPDATE events (event updates in place)
- [x] Handle DELETE events (event disappears)
- [x] Subscribe/unsubscribe on family switch
- [x] Write integration tests for realtime sync

---

## Phase 10: PWA & Offline Support (US-6.2)

- [x] Configure Serwist service worker
- [x] Implement cache-first strategy for static assets
- [x] Implement network-first strategy for API calls
- [x] Implement offline event viewing (cached data)
- [x] Implement offline event creation/edit queue
- [x] Implement background sync on reconnection
- [x] Implement server-wins conflict resolution
- [x] Add PWA manifest (icons, theme color, display mode)
- [x] Write tests for offline/online transitions

---

## Phase 11: Delegated Users (US-1.4)

- [x] Extend `family_members` table with `delegated_by` column (already present from Phase 2)
- [x] Implement `CreateDelegatedUser` use case + tests
- [x] Implement `RemoveDelegatedUser` use case + tests
- [x] Update RLS policies for delegated access (migration 20260416120000)
- [x] Create delegated user management UI (CreateDelegatedUserForm, DelegatedUserList)
- [x] Allow parent to manage delegated user's events (createEventAction, editEventAction, deleteEventAction)
- [x] Write E2E tests for delegated user flows

---

## Phase 12: Push Notifications (US-7.1)

- [x] Configure Web Push API (VAPID keys)
- [x] Create notification opt-in prompt
- [x] Implement server-side push notification service
- [x] Send notifications on event create/edit/delete
- [x] Handle notification click (open app at relevant date)
- [x] Write integration tests for push notifications

---

## Phase 13: Security Hardening & Deployment

- [x] Configure security headers (CSP, HSTS, X-Frame-Options, etc.)
- [x] Implement rate limiting on auth endpoints
- [x] Run `npm audit` and fix vulnerabilities
- [x] Verify all RLS policies in production environment
- [x] Configure Vercel deployment settings
- [x] Set up production environment variables in Vercel
- [x] Configure custom domain + SSL
- [x] Verify HTTPS enforcement
- [x] Perform manual security review
- [x] Deploy to production

---

## Phase 14: Quality Assurance

- [x] Achieve >80% code coverage
- [x] Cross-browser testing (Chrome, Firefox, Safari, Edge)
- [x] Mobile responsiveness testing
- [x] PWA install testing (Android)
- [x] Performance audit (Lighthouse >90 all categories)
- [x] Accessibility audit (WCAG 2.1 AA compliance)
- [x] Load testing for Realtime WebSocket connections
