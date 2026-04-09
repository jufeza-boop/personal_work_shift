# Architecture Document - Personal Work Shift

## 1. Overview

Personal Work Shift is a family schedule management PWA that allows family members to share and visualize work shifts, recurring events, and one-time appointments on a unified calendar.

## 2. Architecture Style: Clean Architecture

The project follows **Clean Architecture** principles, separating concerns into well-defined layers with a strict dependency rule: outer layers depend on inner layers, never the reverse.

```
┌─────────────────────────────────────────────────┐
│                  Presentation                    │
│         (Next.js Pages, Components, UI)          │
├─────────────────────────────────────────────────┤
│               Application Layer                  │
│          (Use Cases / Server Actions)            │
├─────────────────────────────────────────────────┤
│                Domain Layer                      │
│     (Entities, Value Objects, Domain Rules)       │
├─────────────────────────────────────────────────┤
│             Infrastructure Layer                 │
│   (Supabase Client, Repositories, External APIs) │
└─────────────────────────────────────────────────┘
```

## 3. Layer Details

### 3.1 Domain Layer (`src/domain/`)

The innermost layer. Contains business logic with zero dependencies on frameworks or external services.

- **Entities**: `User`, `Family`, `Event`, `RecurringEvent`, `PunctualEvent`, `FamilyMember`
- **Value Objects**: `ShiftType` (Day/Night/Morning/Afternoon), `ColorPalette`, `EventFrequency` (daily, weekly, annual)
- **Repository Interfaces**: Abstract contracts (`IEventRepository`, `IFamilyRepository`, `IUserRepository`)
- **Domain Rules**:
  - A user can belong to multiple families
  - Only the event creator (or delegated user) can edit/delete events
  - Color palettes are exclusive per member within a family
  - Shift types map to tones within the member's color palette

### 3.2 Application Layer (`src/application/`)

Orchestrates use cases. Depends only on the Domain layer.

- **Use Cases**: `CreateEvent`, `EditEvent`, `DeleteEvent`, `RegisterUser`, `LoginUser`, `ManageFamily`, `SwitchFamily`, `ToggleMemberVisibility`
- **DTOs**: Data transfer objects for input/output boundaries
- **Application Services**: Coordinate domain entities and repository calls

### 3.3 Infrastructure Layer (`src/infrastructure/`)

Implements interfaces defined in the Domain layer. Contains all external dependencies.

- **Persistence**: Supabase client, PostgreSQL repository implementations
- **Authentication**: Supabase Auth adapter
- **Realtime**: WebSocket subscription manager (Supabase Realtime)
- **Push Notifications**: Web Push API integration
- **Storage**: Supabase Storage for profile images/icons
- **PWA**: Serwist service worker configuration and offline cache strategies

### 3.4 Presentation Layer (`src/presentation/`)

Next.js 15+ App Router with React Server Components.

- **Pages** (`app/`): Route-based pages (login, register, calendar, settings, family management)
- **Components** (`components/`): Reusable UI components built with Shadcn/ui + Tailwind CSS
- **Hooks**: Custom React hooks for state management and real-time subscriptions
- **Server Actions**: Bridge between UI and Application layer use cases

## 4. Project Structure

```
src/
├── domain/
│   ├── entities/
│   │   ├── User.ts
│   │   ├── Family.ts
│   │   ├── Event.ts
│   │   ├── RecurringEvent.ts
│   │   └── PunctualEvent.ts
│   ├── value-objects/
│   │   ├── ShiftType.ts
│   │   ├── ColorPalette.ts
│   │   └── EventFrequency.ts
│   ├── repositories/
│   │   ├── IEventRepository.ts
│   │   ├── IFamilyRepository.ts
│   │   └── IUserRepository.ts
│   └── rules/
│       ├── event-ownership.ts
│       └── color-exclusivity.ts
├── application/
│   ├── use-cases/
│   │   ├── auth/
│   │   │   ├── RegisterUser.ts
│   │   │   ├── LoginUser.ts
│   │   │   └── LogoutUser.ts
│   │   ├── events/
│   │   │   ├── CreateEvent.ts
│   │   │   ├── EditEvent.ts
│   │   │   ├── DeleteEvent.ts
│   │   │   └── GetFamilyEvents.ts
│   │   └── family/
│   │       ├── CreateFamily.ts
│   │       ├── AddMember.ts
│   │       ├── RenameFamily.ts
│   │       └── SwitchFamily.ts
│   └── dto/
│       ├── EventDTO.ts
│       ├── FamilyDTO.ts
│       └── UserDTO.ts
├── infrastructure/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── EventRepository.ts
│   │   ├── FamilyRepository.ts
│   │   └── UserRepository.ts
│   ├── auth/
│   │   └── SupabaseAuthAdapter.ts
│   ├── realtime/
│   │   └── RealtimeSubscriptionManager.ts
│   ├── push/
│   │   └── WebPushService.ts
│   └── storage/
│       └── SupabaseStorageAdapter.ts
├── presentation/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (dashboard)/
│   │   │   ├── calendar/
│   │   │   ├── settings/
│   │   │   └── family/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── calendar/
│   │   │   ├── CalendarGrid.tsx
│   │   │   ├── DayCell.tsx
│   │   │   ├── MemberToggle.tsx
│   │   │   └── ShiftBlock.tsx
│   │   ├── events/
│   │   │   ├── EventForm.tsx
│   │   │   ├── EventCard.tsx
│   │   │   └── DeleteConfirmDialog.tsx
│   │   ├── family/
│   │   │   ├── FamilySelector.tsx
│   │   │   └── MemberList.tsx
│   │   └── ui/                 # Shadcn/ui primitives
│   └── hooks/
│       ├── useCalendarEvents.ts
│       ├── useFamily.ts
│       └── useRealtimeSync.ts
└── shared/
    ├── types/
    └── utils/
```

## 5. Data Model (PostgreSQL via Supabase)

### Core Tables

```
users
├── id (uuid, PK)
├── email (text, unique)
├── display_name (text)
├── avatar_url (text, nullable)
├── created_at (timestamptz)
└── updated_at (timestamptz)

families
├── id (uuid, PK)
├── name (text)
├── created_by (uuid, FK -> users.id)
├── created_at (timestamptz)
└── updated_at (timestamptz)

family_members
├── id (uuid, PK)
├── family_id (uuid, FK -> families.id)
├── user_id (uuid, FK -> users.id)
├── role (enum: owner, member, delegated)
├── color_palette (text)            # Pastel color code assigned to this member
├── joined_at (timestamptz)
└── UNIQUE(family_id, user_id)
└── UNIQUE(family_id, color_palette)

events
├── id (uuid, PK)
├── family_id (uuid, FK -> families.id)
├── created_by (uuid, FK -> users.id)
├── title (text)
├── description (text, nullable)
├── event_type (enum: punctual, recurring)
├── category (enum: work, studies, other)  # Only for recurring
├── shift_type (enum: day, night, morning, afternoon, nullable)
├── start_time (timestamptz, nullable)
├── end_time (timestamptz, nullable)
├── recurrence_rule (jsonb, nullable)      # { frequency, interval, end_date }
├── parent_event_id (uuid, FK -> events.id, nullable)  # For single edits of recurring
├── created_at (timestamptz)
└── updated_at (timestamptz)

event_exceptions
├── id (uuid, PK)
├── event_id (uuid, FK -> events.id)
├── exception_date (date)
├── is_deleted (boolean, default false)
├── override_data (jsonb, nullable)
└── created_at (timestamptz)
```

## 6. Key Technical Decisions

| Decision | Rationale |
|---|---|
| **Next.js App Router** | Server Components reduce client JS, Server Actions simplify data mutations |
| **Supabase** | Provides Auth + DB + Realtime + Storage in one platform, reducing operational overhead |
| **RLS (Row-Level Security)** | Data isolation enforced at the database level, not just application code |
| **Serwist for PWA** | Modern, actively maintained Service Worker toolkit for Next.js |
| **WebSockets (Realtime)** | Instant calendar updates when any family member modifies events |
| **Clean Architecture** | Decouples business logic from frameworks, enabling testability and future migrations |

## 7. Synchronization Flow

```
User A creates event
       │
       ▼
Server Action → Use Case → Repository → Supabase INSERT
       │
       ▼
Supabase Realtime broadcasts change via WebSocket
       │
       ▼
All connected family members receive update
       │
       ▼
Calendar UI re-renders with new event
```

## 8. Offline Strategy (PWA)

1. **Cache-first** for static assets (CSS, JS, images)
2. **Network-first** for API calls with stale fallback
3. **Background sync** for mutations made while offline
4. Service Worker managed by **Serwist** with precaching for App Shell

## 9. Color System for Shifts

Each family member selects a pastel color palette (exclusive within the family). Shift types map to tones:

| Shift | Tone |
|---|---|
| Morning | Lightest |
| Day | Light |
| Afternoon | Medium |
| Night | Darkest |

When multiple members have shifts on the same day, the calendar cell is **split vertically** into equal sections, one per member.
