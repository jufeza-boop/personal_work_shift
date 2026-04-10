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

- [ ] Implement `CreateFamily` use case + tests
- [ ] Implement `AddMember` use case + tests
- [ ] Implement `SwitchFamily` use case + tests
- [ ] Implement `RenameFamily` use case + tests
- [ ] Create family selector panel component
- [ ] Create family settings page
- [ ] Create member invitation flow (by email)
- [ ] Create member list component with roles
- [ ] Persist active family selection across sessions
- [ ] Write E2E tests for family management

---

## Phase 5: Event Management - Core (US-4.1, US-4.2, US-4.3)

- [ ] Implement `CreateEvent` use case (punctual) + tests
- [ ] Implement `CreateEvent` use case (recurring work/study) + tests
- [ ] Implement `CreateEvent` use case (recurring other) + tests
- [ ] Create event creation form with type selection
- [ ] Implement recurrence rule builder (every X days/weeks/annual)
- [ ] Implement shift type selector (Day/Night/Morning/Afternoon)
- [ ] Validate event ownership on creation
- [ ] Write unit tests for event creation logic
- [ ] Write E2E tests for event creation flows

---

## Phase 6: Event Management - Edit & Delete (US-4.4, US-4.5, US-4.6)

- [ ] Implement `EditEvent` use case (single + series) + tests
- [ ] Implement `DeleteEvent` use case (single + series) + tests
- [ ] Create edit event form (pre-populated)
- [ ] Create "Edit this or all?" confirmation dialog for recurring events
- [ ] Create "Delete this or all?" confirmation dialog for recurring events
- [ ] Implement event exceptions for single-occurrence edits/deletes
- [ ] Enforce ownership: hide edit/delete for non-creators
- [ ] Enforce ownership: server-side rejection for unauthorized modifications
- [ ] Write E2E tests for edit and delete flows

---

## Phase 7: Calendar View (US-3.1, US-3.2, US-3.3)

- [ ] Create `CalendarGrid` component (monthly view)
- [ ] Create `DayCell` component with event rendering
- [ ] Create `ShiftBlock` component with color tones
- [ ] Implement split-day view for multi-member shifts
- [ ] Create `MemberToggle` checkboxes for show/hide
- [ ] Implement `useCalendarEvents` hook (fetch + filter)
- [ ] Display punctual events as text labels
- [ ] Display recurring work/study events as colored blocks
- [ ] Display recurring other events as text labels
- [ ] Write unit tests for calendar rendering logic
- [ ] Write E2E tests for calendar view

---

## Phase 8: Color Palette System (US-5.1, US-5.2)

- [ ] Define predefined pastel color palettes (8-10 options)
- [ ] Create color palette selector component
- [ ] Implement palette exclusivity validation (within family)
- [ ] Implement shift-type-to-tone mapping per palette
- [ ] Show color preview with all 4 shift tones
- [ ] Gray out / disable already-taken palettes
- [ ] Write unit tests for color rules
- [ ] Write E2E tests for palette selection

---

## Phase 9: Real-Time Synchronization (US-6.1)

- [ ] Configure Supabase Realtime subscriptions for events table
- [ ] Create `RealtimeSubscriptionManager` service
- [ ] Create `useRealtimeSync` hook
- [ ] Handle INSERT events (new event appears)
- [ ] Handle UPDATE events (event updates in place)
- [ ] Handle DELETE events (event disappears)
- [ ] Subscribe/unsubscribe on family switch
- [ ] Write integration tests for realtime sync

---

## Phase 10: PWA & Offline Support (US-6.2)

- [ ] Configure Serwist service worker
- [ ] Implement cache-first strategy for static assets
- [ ] Implement network-first strategy for API calls
- [ ] Implement offline event viewing (cached data)
- [ ] Implement offline event creation/edit queue
- [ ] Implement background sync on reconnection
- [ ] Implement server-wins conflict resolution
- [ ] Add PWA manifest (icons, theme color, display mode)
- [ ] Write tests for offline/online transitions

---

## Phase 11: Delegated Users (US-1.4)

- [ ] Extend `family_members` table with `delegated_by` column
- [ ] Implement `CreateDelegatedUser` use case + tests
- [ ] Update RLS policies for delegated access
- [ ] Create delegated user management UI
- [ ] Allow parent to manage delegated user's events
- [ ] Write E2E tests for delegated user flows

---

## Phase 12: Push Notifications (US-7.1)

- [ ] Configure Web Push API (VAPID keys)
- [ ] Create notification opt-in prompt
- [ ] Implement server-side push notification service
- [ ] Send notifications on event create/edit/delete
- [ ] Handle notification click (open app at relevant date)
- [ ] Write integration tests for push notifications

---

## Phase 13: Security Hardening & Deployment

- [ ] Configure security headers (CSP, HSTS, X-Frame-Options, etc.)
- [ ] Implement rate limiting on auth endpoints
- [ ] Run `npm audit` and fix vulnerabilities
- [ ] Verify all RLS policies in production environment
- [ ] Configure Vercel deployment settings
- [ ] Set up production environment variables in Vercel
- [ ] Configure custom domain + SSL
- [ ] Verify HTTPS enforcement
- [ ] Perform manual security review
- [ ] Deploy to production

---

## Phase 14: Quality Assurance

- [ ] Achieve >80% code coverage
- [ ] Cross-browser testing (Chrome, Firefox, Safari, Edge)
- [ ] Mobile responsiveness testing
- [ ] PWA install testing (Android)
- [ ] Performance audit (Lighthouse >90 all categories)
- [ ] Accessibility audit (WCAG 2.1 AA compliance)
- [ ] Load testing for Realtime WebSocket connections
