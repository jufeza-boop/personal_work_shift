import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type {
  SerializedEvent,
  SerializedMember,
} from "@/application/services/calendarUtils";
import { CalendarGrid } from "@/presentation/components/calendar/CalendarGrid";
import { useOfflineSync } from "@/presentation/hooks/useOfflineSync";

// Prevent real Supabase/realtime connections during unit tests.
// We mock the hook instead of the individual infrastructure modules so the
// CalendarGrid component renders without any network activity.
vi.mock("@/presentation/hooks/useRealtimeSync", () => ({
  useRealtimeSync: vi.fn(),
}));
vi.mock("@/infrastructure/supabase/browser", () => ({
  createBrowserSupabaseClient: vi.fn(() => ({})),
}));
vi.mock("@/infrastructure/realtime/SupabaseRealtimeService", () => ({
  SupabaseRealtimeService: class {
    subscribe() {}
    unsubscribe() {}
  },
}));
vi.mock("@/infrastructure/offline/OfflineQueueStore", () => ({
  OfflineQueueStore: class {
    enqueue = vi.fn(
      async (op: { type: string; formFields: Record<string, string> }) => ({
        id: "mock-id",
        type: op.type,
        formFields: op.formFields,
        timestamp: Date.now(),
        retryCount: 0,
      }),
    );
    getAll = vi.fn(async () => []);
    remove = vi.fn(async () => {});
    count = vi.fn(async () => 0);
    clear = vi.fn(async () => {});
  },
}));
vi.mock("@/presentation/hooks/useOfflineSync", () => ({
  useOfflineSync: vi.fn(() => ({
    isOnline: true,
    pendingCount: 0,
    isSyncing: false,
    enqueueOperation: vi.fn(),
    syncNow: vi.fn(),
  })),
}));
vi.mock("@/presentation/components/ui/OfflineBanner", () => ({
  OfflineBanner: ({
    isOnline,
    isSyncing,
    pendingCount,
  }: {
    isOnline: boolean;
    isSyncing: boolean;
    pendingCount: number;
  }) => {
    if (!isOnline)
      return (
        <div data-testid="offline-banner">
          Sin conexión — los cambios se sincronizarán cuando vuelva la red
        </div>
      );
    if (isSyncing)
      return (
        <div data-testid="offline-banner">
          Sincronizando cambios pendientes...
        </div>
      );
    if (pendingCount > 0)
      return (
        <div data-testid="offline-banner">
          {pendingCount} cambios pendientes de sincronizar
        </div>
      );
    return null;
  },
}));

const MEMBERS: SerializedMember[] = [
  { userId: "u1", displayName: "Alice Smith", colorPaletteName: "sky" },
  { userId: "u2", displayName: "Bob Jones", colorPaletteName: "rose" },
];

const EVENTS: SerializedEvent[] = [
  {
    type: "punctual",
    id: "e1",
    familyId: "f1",
    createdBy: "u1",
    title: "Doctor visit",
    date: "2026-04-10",
    startTime: null,
    endTime: null,
  },
  {
    type: "recurring",
    id: "e2",
    familyId: "f1",
    createdBy: "u2",
    title: "Morning shift",
    category: "work",
    startDate: "2026-04-06",
    endDate: null,
    frequencyUnit: "weekly",
    frequencyInterval: 1,
    shiftType: "morning",
  },
  {
    type: "recurring",
    id: "e3",
    familyId: "f1",
    createdBy: "u1",
    title: "Weekly yoga",
    category: "other",
    startDate: "2026-04-01",
    endDate: null,
    frequencyUnit: "weekly",
    frequencyInterval: 1,
    shiftType: null,
  },
];

const DEFAULT_PROPS = {
  currentUserId: "u1",
  familyId: "f1",
  createAction: vi.fn(),
  deleteAction: vi.fn(),
  initialExceptions: [],
};

describe("CalendarGrid", () => {
  it("renders the month name and year", () => {
    render(
      <CalendarGrid
        initialEvents={[]}
        members={[]}
        initialYear={2026}
        initialMonth={4}
        {...DEFAULT_PROPS}
      />,
    );

    expect(screen.getByText("Abril 2026")).toBeInTheDocument();
  });

  it("renders day-of-week headers in Spanish", () => {
    render(
      <CalendarGrid
        initialEvents={[]}
        members={[]}
        initialYear={2026}
        initialMonth={4}
        {...DEFAULT_PROPS}
      />,
    );

    expect(screen.getByText("Lun")).toBeInTheDocument();
    expect(screen.getByText("Dom")).toBeInTheDocument();
  });

  it("renders the correct number of day cells for the month", () => {
    render(
      <CalendarGrid
        initialEvents={[]}
        members={[]}
        initialYear={2026}
        initialMonth={4}
        {...DEFAULT_PROPS}
      />,
    );

    // April has 30 days; day numbers 1-30 should be present
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("30")).toBeInTheDocument();
    expect(screen.queryByText("31")).not.toBeInTheDocument();
  });

  it("navigates to the next month when clicking the next button", async () => {
    const user = userEvent.setup();
    render(
      <CalendarGrid
        initialEvents={[]}
        members={[]}
        initialYear={2026}
        initialMonth={4}
        {...DEFAULT_PROPS}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Mes siguiente" }));

    expect(screen.getByText("Mayo 2026")).toBeInTheDocument();
  });

  it("navigates to the previous month when clicking the back button", async () => {
    const user = userEvent.setup();
    render(
      <CalendarGrid
        initialEvents={[]}
        members={[]}
        initialYear={2026}
        initialMonth={4}
        {...DEFAULT_PROPS}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Mes anterior" }));

    expect(screen.getByText("Marzo 2026")).toBeInTheDocument();
  });

  it("renders member toggle checkboxes for each member", () => {
    render(
      <CalendarGrid
        initialEvents={[]}
        members={MEMBERS}
        initialYear={2026}
        initialMonth={4}
        {...DEFAULT_PROPS}
      />,
    );

    expect(screen.getByText("Alice Smith")).toBeInTheDocument();
    expect(screen.getByText("Bob Jones")).toBeInTheDocument();
    expect(screen.getAllByRole("checkbox")).toHaveLength(2);
  });

  it("shows punctual event title as a text label in the correct day cell", () => {
    render(
      <CalendarGrid
        initialEvents={EVENTS}
        members={MEMBERS}
        initialYear={2026}
        initialMonth={4}
        {...DEFAULT_PROPS}
      />,
    );

    expect(screen.getByText("Doctor visit")).toBeInTheDocument();
  });

  it("shows recurring other event title as a colored text label", () => {
    render(
      <CalendarGrid
        initialEvents={EVENTS}
        members={MEMBERS}
        initialYear={2026}
        initialMonth={4}
        {...DEFAULT_PROPS}
      />,
    );

    // Weekly yoga starts 2026-04-01, so it appears on Wednesdays in April
    const labels = screen.getAllByText("Weekly yoga");
    expect(labels.length).toBeGreaterThan(0);
    // The label for "other" recurring events has an inline style background color
    // (Alice's sky palette afternoon tone: #7DD3FC)
    expect(labels[0]).toHaveStyle({ backgroundColor: "#7DD3FC" });
  });

  it("hides events for a toggled-off member", async () => {
    const user = userEvent.setup();
    render(
      <CalendarGrid
        initialEvents={EVENTS}
        members={MEMBERS}
        initialYear={2026}
        initialMonth={4}
        {...DEFAULT_PROPS}
      />,
    );

    // Doctor visit belongs to u1 (Alice). Toggle off Alice.
    const checkboxes = screen.getAllByRole("checkbox");
    // First checkbox is Alice
    await user.click(checkboxes[0]!);

    expect(screen.queryByText("Doctor visit")).not.toBeInTheDocument();
  });

  it("disables the checkbox for the last visible member", async () => {
    const user = userEvent.setup();
    render(
      <CalendarGrid
        initialEvents={[]}
        members={MEMBERS}
        initialYear={2026}
        initialMonth={4}
        {...DEFAULT_PROPS}
      />,
    );

    const checkboxes = screen.getAllByRole("checkbox");
    // Hide Bob first (second checkbox)
    await user.click(checkboxes[1]!);

    // Now Alice is the last visible; her checkbox should be disabled
    const aliceCheckbox = screen.getAllByRole("checkbox")[0];
    expect(aliceCheckbox).toBeDisabled();
  });

  it("handles an empty members list without crashing", () => {
    expect(() =>
      render(
        <CalendarGrid
          initialEvents={[]}
          members={[]}
          initialYear={2026}
          initialMonth={4}
          {...DEFAULT_PROPS}
        />,
      ),
    ).not.toThrow();
  });

  it("opens the day detail panel when a day cell is clicked", async () => {
    const user = userEvent.setup();
    render(
      <CalendarGrid
        initialEvents={EVENTS}
        members={MEMBERS}
        initialYear={2026}
        initialMonth={4}
        {...DEFAULT_PROPS}
      />,
    );

    // Click on day 10 (which has the Doctor visit event)
    await user.click(screen.getByRole("button", { name: "10" }));

    // The day detail panel should show the date heading and the event
    expect(screen.getByText(/10 de abril 2026/i)).toBeInTheDocument();
    // And a create event button
    expect(
      screen.getByRole("button", { name: /crear evento/i }),
    ).toBeInTheDocument();
  });

  it("closes the day detail panel when close is clicked", async () => {
    const user = userEvent.setup();
    render(
      <CalendarGrid
        initialEvents={EVENTS}
        members={MEMBERS}
        initialYear={2026}
        initialMonth={4}
        {...DEFAULT_PROPS}
      />,
    );

    await user.click(screen.getByRole("button", { name: "10" }));
    expect(screen.getByText(/10 de abril 2026/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /cerrar/i }));
    expect(screen.queryByText(/10 de abril 2026/i)).not.toBeInTheDocument();
  });

  it("shows OfflineBanner when offline", () => {
    vi.mocked(useOfflineSync).mockReturnValueOnce({
      isOnline: false,
      pendingCount: 0,
      isSyncing: false,
      enqueueOperation: vi.fn(),
      syncNow: vi.fn(),
    });

    render(
      <CalendarGrid
        initialEvents={[]}
        members={[]}
        initialYear={2026}
        initialMonth={4}
        {...DEFAULT_PROPS}
      />,
    );

    expect(screen.getByTestId("offline-banner")).toBeInTheDocument();
    expect(
      screen.getByText(
        /Sin conexión — los cambios se sincronizarán cuando vuelva la red/i,
      ),
    ).toBeInTheDocument();
  });

  it("renders without errors with offline-aware actions", () => {
    expect(() =>
      render(
        <CalendarGrid
          initialEvents={[]}
          members={[]}
          initialYear={2026}
          initialMonth={4}
          {...DEFAULT_PROPS}
        />,
      ),
    ).not.toThrow();
  });
});
