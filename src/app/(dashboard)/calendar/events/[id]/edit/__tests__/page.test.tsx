import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { PunctualEvent } from "@/domain/entities/PunctualEvent";
import { RecurringEvent } from "@/domain/entities/RecurringEvent";
import { EventFrequency } from "@/domain/value-objects/EventFrequency";
import EditEventPage from "@/app/(dashboard)/calendar/events/[id]/edit/page";

// vi.hoisted ensures mocks are available before vi.mock factories run,
// avoiding Temporal Dead Zone issues with the const declarations.
const mocks = vi.hoisted(() => ({
  redirect: vi.fn(),
  findById: vi.fn(),
  findExceptionsByEventIds: vi.fn(),
  getFamilyPageData: vi.fn(),
  editEventAction: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: mocks.redirect,
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
  }),
}));

vi.mock("@/app/(dashboard)/familyPageData", () => ({
  getFamilyPageData: mocks.getFamilyPageData,
}));

vi.mock("@/infrastructure/events/runtime", () => ({
  createServerEventDependencies: async () => ({
    eventRepository: {
      findById: mocks.findById,
      findExceptionsByEventIds: mocks.findExceptionsByEventIds,
    },
  }),
}));

vi.mock("@/app/actions/events", () => ({
  editEventAction: mocks.editEventAction,
}));

function makePunctualEvent(createdBy = "user-1"): PunctualEvent {
  return new PunctualEvent({
    id: "event-1",
    familyId: "family-1",
    createdBy,
    title: "My event",
    date: new Date("2025-07-01T00:00:00.000Z"),
    startTime: null,
    endTime: null,
  });
}

function makeRecurringEvent(createdBy = "user-1"): RecurringEvent {
  return new RecurringEvent({
    id: "event-2",
    familyId: "family-1",
    createdBy,
    title: "Weekly health event",
    category: "health",
    startDate: new Date("2025-06-01T00:00:00.000Z"),
    frequency: EventFrequency.create("weekly", 1),
    shiftType: null,
    endDate: null,
    startTime: "08:00",
    endTime: "09:00",
  });
}

const defaultParams = Promise.resolve({ id: "event-1" });

describe("EditEventPage", () => {
  beforeEach(() => {
    // Reset all mocks and re-apply redirect throwing behaviour each test.
    mocks.redirect.mockReset();
    mocks.redirect.mockImplementation((path: string) => {
      // Mimic Next.js redirect(): it throws to abort rendering.
      throw Object.assign(new Error(`NEXT_REDIRECT:${path}`), {
        digest: "NEXT_REDIRECT",
      });
    });
    mocks.findById.mockReset();
    mocks.findExceptionsByEventIds.mockReset();
    mocks.findExceptionsByEventIds.mockResolvedValue([]);
    mocks.getFamilyPageData.mockReset();
  });

  it("renders the edit form when the authenticated user owns the event", async () => {
    mocks.getFamilyPageData.mockResolvedValue({
      user: { id: "user-1" },
      delegatedUsers: [],
    });
    mocks.findById.mockResolvedValue(makePunctualEvent("user-1"));

    render(await EditEventPage({ params: defaultParams }));

    expect(mocks.redirect).not.toHaveBeenCalled();
    expect(
      screen.getByRole("form", { name: /editar evento/i }),
    ).toBeInTheDocument();
  });

  it("redirects to /calendar when event is not found", async () => {
    mocks.getFamilyPageData.mockResolvedValue({
      user: { id: "user-1" },
      delegatedUsers: [],
    });
    mocks.findById.mockResolvedValue(null);

    await expect(
      EditEventPage({ params: defaultParams }),
    ).rejects.toThrow("NEXT_REDIRECT:/calendar");
    expect(mocks.redirect).toHaveBeenCalledWith("/calendar");
  });

  it("redirects to /calendar when event belongs to an unrelated user", async () => {
    mocks.getFamilyPageData.mockResolvedValue({
      user: { id: "user-1" },
      delegatedUsers: [],
    });
    mocks.findById.mockResolvedValue(makePunctualEvent("other-user"));

    await expect(
      EditEventPage({ params: defaultParams }),
    ).rejects.toThrow("NEXT_REDIRECT:/calendar");
    expect(mocks.redirect).toHaveBeenCalledWith("/calendar");
  });

  it("renders the edit form when event belongs to a delegated user of the authenticated user", async () => {
    // REGRESSION TEST: this was the bug — delegated-user events were
    // incorrectly rejected and redirected to /calendar.
    mocks.getFamilyPageData.mockResolvedValue({
      user: { id: "user-1" },
      delegatedUsers: [{ id: "delegated-user-1" }],
    });
    mocks.findById.mockResolvedValue(makePunctualEvent("delegated-user-1"));

    render(await EditEventPage({ params: defaultParams }));

    expect(mocks.redirect).not.toHaveBeenCalled();
    expect(
      screen.getByRole("form", { name: /editar evento/i }),
    ).toBeInTheDocument();
  });

  it("redirects to /calendar when event belongs to a delegated user of someone else", async () => {
    mocks.getFamilyPageData.mockResolvedValue({
      user: { id: "user-1" },
      delegatedUsers: [{ id: "delegated-user-1" }],
    });
    // Event created by someone who is NOT a delegated user of user-1
    mocks.findById.mockResolvedValue(makePunctualEvent("foreign-delegated-user"));

    await expect(
      EditEventPage({ params: defaultParams }),
    ).rejects.toThrow("NEXT_REDIRECT:/calendar");
    expect(mocks.redirect).toHaveBeenCalledWith("/calendar");
  });

  it("renders the edit form for a recurring event owned by a delegated user", async () => {
    mocks.getFamilyPageData.mockResolvedValue({
      user: { id: "user-1" },
      delegatedUsers: [{ id: "delegated-user-1" }],
    });
    mocks.findById.mockResolvedValue(makeRecurringEvent("delegated-user-1"));

    render(
      await EditEventPage({
        params: Promise.resolve({ id: "event-2" }),
      }),
    );

    expect(mocks.redirect).not.toHaveBeenCalled();
    expect(
      screen.getByRole("form", { name: /editar evento/i }),
    ).toBeInTheDocument();
  });
});
