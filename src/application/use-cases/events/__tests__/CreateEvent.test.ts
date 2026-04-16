import { describe, expect, it, vi } from "vitest";
import { CreateEvent } from "@/application/use-cases/events/CreateEvent";
import { Family } from "@/domain/entities/Family";
import type { IEventRepository } from "@/domain/repositories/IEventRepository";
import type { IFamilyRepository } from "@/domain/repositories/IFamilyRepository";

function createEventRepository(): IEventRepository {
  return {
    delete: vi.fn(),
    findByFamilyId: vi.fn(),
    findById: vi.fn(),
    findExceptionsByEventIds: vi.fn(),
    save: vi.fn(),
    saveException: vi.fn(),
  };
}

function createFamilyRepository(): IFamilyRepository {
  return {
    delete: vi.fn(),
    findById: vi.fn(),
    findByUserId: vi.fn(),
    save: vi.fn(),
  };
}

function makeFamilyWithMember(memberId: string): Family {
  return new Family({
    createdBy: memberId,
    id: "family-1",
    name: "Test Family",
  });
}

describe("CreateEvent", () => {
  describe("punctual event", () => {
    it("creates and saves a punctual event for a family member", async () => {
      const eventRepository = createEventRepository();
      const familyRepository = createFamilyRepository();

      vi.mocked(familyRepository.findById).mockResolvedValue(
        makeFamilyWithMember("user-1"),
      );

      const useCase = new CreateEvent(eventRepository, familyRepository);
      const result = await useCase.execute({
        createdBy: "user-1",
        date: new Date("2025-06-01T00:00:00.000Z"),
        eventType: "punctual",
        familyId: "family-1",
        title: "Doctor appointment",
      });

      expect(result.success).toBe(true);
      if (!result.success) return;
      expect(result.data.event.type).toBe("punctual");
      expect(result.data.event.title).toBe("Doctor appointment");
      expect(result.data.event.familyId).toBe("family-1");
      expect(result.data.event.createdBy).toBe("user-1");
      expect(eventRepository.save).toHaveBeenCalledTimes(1);
    });

    it("stores optional fields on punctual event", async () => {
      const eventRepository = createEventRepository();
      const familyRepository = createFamilyRepository();

      vi.mocked(familyRepository.findById).mockResolvedValue(
        makeFamilyWithMember("user-1"),
      );

      const useCase = new CreateEvent(eventRepository, familyRepository);
      const result = await useCase.execute({
        createdBy: "user-1",
        date: new Date("2025-06-01T00:00:00.000Z"),
        description: "Annual check-up",
        endTime: "11:30",
        eventType: "punctual",
        familyId: "family-1",
        startTime: "10:00",
        title: "Doctor appointment",
      });

      expect(result.success).toBe(true);
      if (!result.success) return;
      const event = result.data.event;
      expect(event.type).toBe("punctual");
      expect(event.description).toBe("Annual check-up");
      if (event.type === "punctual") {
        expect(event.startTime).toBe("10:00");
        expect(event.endTime).toBe("11:30");
      }
    });
  });

  describe("recurring work/studies event", () => {
    it("creates and saves a recurring work event", async () => {
      const eventRepository = createEventRepository();
      const familyRepository = createFamilyRepository();

      vi.mocked(familyRepository.findById).mockResolvedValue(
        makeFamilyWithMember("user-1"),
      );

      const useCase = new CreateEvent(eventRepository, familyRepository);
      const result = await useCase.execute({
        category: "work",
        createdBy: "user-1",
        eventType: "recurring",
        familyId: "family-1",
        frequencyInterval: 7,
        frequencyUnit: "weekly",
        shiftType: "morning",
        startDate: new Date("2025-06-01T00:00:00.000Z"),
        title: "Morning shift",
      });

      expect(result.success).toBe(true);
      if (!result.success) return;
      const event = result.data.event;
      expect(event.type).toBe("recurring");
      expect(event.title).toBe("Morning shift");
      if (event.type === "recurring") {
        expect(event.category).toBe("work");
        expect(event.shiftType?.value).toBe("morning");
        expect(event.frequency.unit).toBe("weekly");
        expect(event.frequency.interval).toBe(7);
      }
      expect(eventRepository.save).toHaveBeenCalledTimes(1);
    });

    it("creates a recurring studies event", async () => {
      const eventRepository = createEventRepository();
      const familyRepository = createFamilyRepository();

      vi.mocked(familyRepository.findById).mockResolvedValue(
        makeFamilyWithMember("user-1"),
      );

      const useCase = new CreateEvent(eventRepository, familyRepository);
      const result = await useCase.execute({
        category: "studies",
        createdBy: "user-1",
        eventType: "recurring",
        familyId: "family-1",
        frequencyInterval: 1,
        frequencyUnit: "daily",
        shiftType: "afternoon",
        startDate: new Date("2025-09-01T00:00:00.000Z"),
        title: "University",
      });

      expect(result.success).toBe(true);
      if (!result.success) return;
      const event = result.data.event;
      if (event.type === "recurring") {
        expect(event.category).toBe("studies");
        expect(event.shiftType?.value).toBe("afternoon");
      }
    });

    it("creates a recurring work event with optional endDate", async () => {
      const eventRepository = createEventRepository();
      const familyRepository = createFamilyRepository();

      vi.mocked(familyRepository.findById).mockResolvedValue(
        makeFamilyWithMember("user-1"),
      );

      const useCase = new CreateEvent(eventRepository, familyRepository);
      const result = await useCase.execute({
        category: "work",
        createdBy: "user-1",
        endDate: new Date("2025-12-31T00:00:00.000Z"),
        eventType: "recurring",
        familyId: "family-1",
        frequencyInterval: 1,
        frequencyUnit: "weekly",
        shiftType: "night",
        startDate: new Date("2025-06-01T00:00:00.000Z"),
        title: "Night shift",
      });

      expect(result.success).toBe(true);
      if (!result.success) return;
      const event = result.data.event;
      if (event.type === "recurring") {
        expect(event.endDate).toEqual(new Date("2025-12-31T00:00:00.000Z"));
      }
    });
  });

  describe("recurring other event", () => {
    it("creates a recurring other event", async () => {
      const eventRepository = createEventRepository();
      const familyRepository = createFamilyRepository();

      vi.mocked(familyRepository.findById).mockResolvedValue(
        makeFamilyWithMember("user-1"),
      );

      const useCase = new CreateEvent(eventRepository, familyRepository);
      const result = await useCase.execute({
        category: "other",
        createdBy: "user-1",
        eventType: "recurring",
        familyId: "family-1",
        frequencyInterval: 1,
        frequencyUnit: "annual",
        startDate: new Date("2025-01-01T00:00:00.000Z"),
        title: "New Year Party",
      });

      expect(result.success).toBe(true);
      if (!result.success) return;
      const event = result.data.event;
      expect(event.type).toBe("recurring");
      if (event.type === "recurring") {
        expect(event.category).toBe("other");
        expect(event.shiftType).toBeNull();
        expect(event.frequency.unit).toBe("annual");
      }
    });

    it("creates a recurring other event with start/end times", async () => {
      const eventRepository = createEventRepository();
      const familyRepository = createFamilyRepository();

      vi.mocked(familyRepository.findById).mockResolvedValue(
        makeFamilyWithMember("user-1"),
      );

      const useCase = new CreateEvent(eventRepository, familyRepository);
      const result = await useCase.execute({
        category: "other",
        createdBy: "user-1",
        endTime: "20:00",
        eventType: "recurring",
        familyId: "family-1",
        frequencyInterval: 1,
        frequencyUnit: "weekly",
        startDate: new Date("2025-06-01T00:00:00.000Z"),
        startTime: "18:00",
        title: "Weekly yoga",
      });

      expect(result.success).toBe(true);
      if (!result.success) return;
      const event = result.data.event;
      if (event.type === "recurring") {
        expect(event.startTime).toBe("18:00");
        expect(event.endTime).toBe("20:00");
      }
    });
  });

  describe("error cases", () => {
    it("returns FAMILY_NOT_FOUND when the family does not exist", async () => {
      const eventRepository = createEventRepository();
      const familyRepository = createFamilyRepository();

      vi.mocked(familyRepository.findById).mockResolvedValue(null);

      const useCase = new CreateEvent(eventRepository, familyRepository);
      const result = await useCase.execute({
        createdBy: "user-1",
        date: new Date("2025-06-01T00:00:00.000Z"),
        eventType: "punctual",
        familyId: "missing-family",
        title: "Some event",
      });

      expect(result.success).toBe(false);
      if (result.success) return;
      expect(result.error.code).toBe("FAMILY_NOT_FOUND");
      expect(eventRepository.save).not.toHaveBeenCalled();
    });

    it("returns NOT_A_FAMILY_MEMBER when the creator is not in the family", async () => {
      const eventRepository = createEventRepository();
      const familyRepository = createFamilyRepository();

      vi.mocked(familyRepository.findById).mockResolvedValue(
        makeFamilyWithMember("owner-1"),
      );

      const useCase = new CreateEvent(eventRepository, familyRepository);
      const result = await useCase.execute({
        createdBy: "outsider-1",
        date: new Date("2025-06-01T00:00:00.000Z"),
        eventType: "punctual",
        familyId: "family-1",
        title: "Sneaky event",
      });

      expect(result.success).toBe(false);
      if (result.success) return;
      expect(result.error.code).toBe("NOT_A_FAMILY_MEMBER");
      expect(eventRepository.save).not.toHaveBeenCalled();
    });

    it("returns INVALID_EVENT when domain validation fails", async () => {
      const eventRepository = createEventRepository();
      const familyRepository = createFamilyRepository();

      vi.mocked(familyRepository.findById).mockResolvedValue(
        makeFamilyWithMember("user-1"),
      );

      const useCase = new CreateEvent(eventRepository, familyRepository);
      // Empty title triggers domain validation error
      const result = await useCase.execute({
        createdBy: "user-1",
        date: new Date("2025-06-01T00:00:00.000Z"),
        eventType: "punctual",
        familyId: "family-1",
        title: "   ",
      });

      expect(result.success).toBe(false);
      if (result.success) return;
      expect(result.error.code).toBe("INVALID_EVENT");
      expect(eventRepository.save).not.toHaveBeenCalled();
    });

    it("returns INVALID_EVENT when recurring work event lacks a shiftType", async () => {
      const eventRepository = createEventRepository();
      const familyRepository = createFamilyRepository();

      vi.mocked(familyRepository.findById).mockResolvedValue(
        makeFamilyWithMember("user-1"),
      );

      const useCase = new CreateEvent(eventRepository, familyRepository);
      const result = await useCase.execute({
        category: "work",
        createdBy: "user-1",
        eventType: "recurring",
        familyId: "family-1",
        frequencyInterval: 1,
        frequencyUnit: "daily",
        startDate: new Date("2025-06-01T00:00:00.000Z"),
        title: "Work shift",
      });

      expect(result.success).toBe(false);
      if (result.success) return;
      expect(result.error.code).toBe("INVALID_EVENT");
    });
  });
});
