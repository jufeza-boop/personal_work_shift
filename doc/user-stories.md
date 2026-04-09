# User Stories - Personal Work Shift

## Epic 1: Authentication & User Management

### US-1.1: User Registration
**As** a new user  
**I want to** register with email and password  
**So that** I can create my account and start managing my schedule  

**Acceptance Criteria:**
- Form with email, password, display name fields
- Email validation and uniqueness check
- Password must meet minimum security requirements (8 chars, upper, lower, digit)
- Email verification sent after registration
- Redirect to login after successful verification
- Error messages displayed for invalid inputs

### US-1.2: User Login
**As** a registered user  
**I want to** log in with my credentials  
**So that** I can access my family calendars  

**Acceptance Criteria:**
- Form with email and password
- Error message on invalid credentials (generic, no user enumeration)
- Session persists across browser refreshes (cookie-based)
- Redirect to calendar view after successful login

### US-1.3: User Logout
**As** a logged-in user  
**I want to** log out  
**So that** I can secure my session  

**Acceptance Criteria:**
- Logout button accessible from any page
- Session invalidated on both client and server
- Redirect to login page after logout

### US-1.4: Delegated Users (Children)
**As** a family member  
**I want to** create delegated user accounts for my children  
**So that** I can manage their schedules on their behalf  

**Acceptance Criteria:**
- Parent can create a delegated user linked to their account
- Delegated user inherits the parent's family memberships
- Parent can create/edit/delete events on behalf of the delegated user
- Delegated user can optionally have their own login credentials

---

## Epic 2: Family Management

### US-2.1: Create Family
**As** a user  
**I want to** create a new family group  
**So that** I can share my calendar with specific people  

**Acceptance Criteria:**
- User provides a family name
- Creator becomes the family owner
- Family is visible immediately in the family selector

### US-2.2: Add Members to Family
**As** a family owner  
**I want to** invite other users to my family  
**So that** they can see and share the calendar  

**Acceptance Criteria:**
- Invite by email address
- Invited user must have a registered account
- New member must choose a color palette not already taken in this family
- Member appears in the family member list after accepting

### US-2.3: Switch Between Families
**As** a user belonging to multiple families  
**I want to** switch between family contexts  
**So that** I can view different group calendars  

**Acceptance Criteria:**
- Family selector panel visible when user belongs to 2+ families
- Switching family loads that family's calendar and events
- Current family is persisted across sessions

### US-2.4: Rename Family
**As** a family owner  
**I want to** rename my family group  
**So that** the name reflects the group's purpose (e.g., "Work Team", "Roommates")  

**Acceptance Criteria:**
- Editable family name in settings
- Name change reflected immediately for all members
- Maximum 100 characters

---

## Epic 3: Calendar View

### US-3.1: View Family Calendar
**As** a family member  
**I want to** see a calendar with all family members' events  
**So that** I can know everyone's schedule  

**Acceptance Criteria:**
- Monthly calendar view by default
- All family members' events visible
- Work/study events show as colored blocks (pastel tones)
- Punctual and "other" events show as text labels
- Days with multiple members' shifts split the cell vertically with each member's color

### US-3.2: Toggle Member Visibility
**As** a family member  
**I want to** show/hide specific members' events on the calendar  
**So that** I can focus on relevant schedules  

**Acceptance Criteria:**
- Checkbox per family member in the calendar sidebar
- Toggling a member hides/shows their events immediately
- Toggle state persists during the session
- At least one member must remain visible

### US-3.3: Shift Color Display
**As** a family member  
**I want to** see shift types (Morning/Day/Afternoon/Night) in different tones of my color  
**So that** I can quickly identify the shift type at a glance  

**Acceptance Criteria:**
- Morning: lightest tone of the member's color
- Day: light tone
- Afternoon: medium tone
- Night: darkest tone
- Color block fills the day cell proportionally when multiple members have shifts

---

## Epic 4: Event Management

### US-4.1: Create Punctual Event
**As** a family member  
**I want to** create a one-time event  
**So that** everyone in my family can see it  

**Acceptance Criteria:**
- Form with: title, date, optional start/end time, optional description
- No color assigned (displayed as text only)
- Event visible on the calendar for all family members
- Event linked to the creator

### US-4.2: Create Recurring Work/Study Event
**As** a family member  
**I want to** create a recurring work or study shift  
**So that** my schedule repeats automatically  

**Acceptance Criteria:**
- Form with: title, start date, recurrence rule (every X days/weeks/annual), shift type (Day/Night/Morning/Afternoon)
- Displayed with the member's pastel color and shift tone
- Recurrence continues until manually ended or an end date is set
- Event visible as colored blocks on matching calendar days

### US-4.3: Create Recurring Other Event
**As** a family member  
**I want to** create a recurring non-work event  
**So that** repeating personal events appear on the calendar  

**Acceptance Criteria:**
- Form with: title, start date, recurrence rule, optional start/end time
- No color, displayed as text only
- Recurrence continues until manually ended or an end date is set

### US-4.4: Edit Event
**As** the event creator  
**I want to** edit my events  
**So that** I can update information when my schedule changes  

**Acceptance Criteria:**
- Only the creator (or delegated user) can edit
- For recurring events: prompt to edit "this occurrence only" or "all occurrences"
- Changes reflected in real-time for all family members
- All original fields are editable

### US-4.5: Delete Event
**As** the event creator  
**I want to** delete my events  
**So that** outdated events don't clutter the calendar  

**Acceptance Criteria:**
- Only the creator (or delegated user) can delete
- For recurring events: prompt to delete "this occurrence only" or "all occurrences"
- Confirmation dialog before deletion
- Deletion reflected in real-time for all family members

### US-4.6: Event Ownership Protection
**As** a family member  
**I want to** be sure only I can modify my events  
**So that** my schedule is protected from unauthorized changes  

**Acceptance Criteria:**
- Edit/delete buttons hidden for events created by other members
- Server-side enforcement: API rejects unauthorized modifications
- RLS policies prevent direct database tampering

---

## Epic 5: Color Palette Management

### US-5.1: Select Color Palette
**As** a family member  
**I want to** choose my pastel color palette  
**So that** my shifts are visually distinct from others  

**Acceptance Criteria:**
- Selection from predefined pastel color palettes
- Already-taken palettes in the current family are disabled/grayed out
- Color choice is per-family (different color in different families is allowed)
- Preview of shift tones (Morning/Day/Afternoon/Night) before confirming

### US-5.2: Split Day View
**As** a family member  
**I want to** see the calendar day cell split when multiple members have shifts  
**So that** I can see everyone's shift on the same day  

**Acceptance Criteria:**
- Day cell divided into equal vertical sections per member with a shift
- Each section displays the member's color with the appropriate tone
- Supports 2+ members on the same day gracefully
- Member name or initials visible within each section

---

## Epic 6: Real-Time Synchronization

### US-6.1: Live Calendar Updates
**As** a family member  
**I want to** see changes made by other members in real time  
**So that** I always have the latest schedule  

**Acceptance Criteria:**
- New events appear without page refresh
- Edited events update without page refresh
- Deleted events disappear without page refresh
- WebSocket connection established on calendar load

### US-6.2: Offline Support
**As** a user with unreliable internet  
**I want to** view the calendar and make changes offline  
**So that** connectivity doesn't block my workflow  

**Acceptance Criteria:**
- Calendar viewable when offline (cached data)
- Events can be created/edited while offline
- Changes sync automatically when connection is restored
- Conflict resolution handles overlapping edits (server-wins)

---

## Epic 7: Push Notifications

### US-7.1: Event Notifications
**As** a family member  
**I want to** receive push notifications for schedule changes  
**So that** I'm aware of updates without opening the app  

**Acceptance Criteria:**
- Notification opt-in prompt on first calendar visit
- Notifications for: new events, edited events, deleted events
- Notifications only for the families the user belongs to
- Clickable notification opens the app at the relevant calendar day
- Works on Android via Web Push API

---

## Story Map Summary

| Priority | Epic | Stories |
|---|---|---|
| P0 - Critical | Authentication | US-1.1, US-1.2, US-1.3 |
| P0 - Critical | Family Management | US-2.1, US-2.2, US-2.3 |
| P0 - Critical | Calendar View | US-3.1, US-3.2, US-3.3 |
| P0 - Critical | Event CRUD | US-4.1, US-4.2, US-4.3, US-4.4, US-4.5, US-4.6 |
| P1 - High | Color Palette | US-5.1, US-5.2 |
| P1 - High | Real-Time | US-6.1 |
| P2 - Medium | Offline | US-6.2 |
| P2 - Medium | Delegated Users | US-1.4 |
| P2 - Medium | Family Rename | US-2.4 |
| P3 - Low | Notifications | US-7.1 |
