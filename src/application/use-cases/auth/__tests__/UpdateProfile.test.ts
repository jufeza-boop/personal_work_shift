import { describe, expect, it, vi } from "vitest";
import { UpdateProfile } from "@/application/use-cases/auth/UpdateProfile";
import { User } from "@/domain/entities/User";
import type { IUserRepository } from "@/domain/repositories/IUserRepository";

function createUserRepository(): IUserRepository {
  return {
    delete: vi.fn(),
    findByEmail: vi.fn(),
    findById: vi.fn(),
    findDelegatedUsers: vi.fn(),
    save: vi.fn(),
  };
}

const EXISTING_USER = new User({
  displayName: "Alice Example",
  email: "alice@example.com",
  id: "user-1",
});

describe("UpdateProfile", () => {
  it("updates the display name and saves the user", async () => {
    const userRepository = createUserRepository();

    vi.mocked(userRepository.findById).mockResolvedValue(EXISTING_USER);
    vi.mocked(userRepository.save).mockResolvedValue(undefined);

    const useCase = new UpdateProfile(userRepository);
    const result = await useCase.execute({
      displayName: "Alice Updated",
      userId: "user-1",
    });

    expect(userRepository.findById).toHaveBeenCalledWith("user-1");
    expect(userRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({ displayName: "Alice Updated" }),
    );
    expect(result).toEqual({ data: undefined, success: true });
  });

  it("preserves other user fields when updating display name", async () => {
    const userWithExtras = new User({
      avatarUrl: "https://example.com/avatar.jpg",
      delegatedByUserId: "parent-id",
      displayName: "Old Name",
      email: "alice@example.com",
      id: "user-1",
    });
    const userRepository = createUserRepository();

    vi.mocked(userRepository.findById).mockResolvedValue(userWithExtras);
    vi.mocked(userRepository.save).mockResolvedValue(undefined);

    const useCase = new UpdateProfile(userRepository);
    await useCase.execute({ displayName: "New Name", userId: "user-1" });

    expect(userRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        avatarUrl: "https://example.com/avatar.jpg",
        delegatedByUserId: "parent-id",
        displayName: "New Name",
        email: "alice@example.com",
        id: "user-1",
      }),
    );
  });

  it("returns USER_NOT_FOUND when the user does not exist", async () => {
    const userRepository = createUserRepository();

    vi.mocked(userRepository.findById).mockResolvedValue(null);

    const useCase = new UpdateProfile(userRepository);
    const result = await useCase.execute({
      displayName: "Alice",
      userId: "unknown-id",
    });

    expect(userRepository.save).not.toHaveBeenCalled();
    expect(result).toEqual({
      error: { code: "USER_NOT_FOUND", message: "User not found" },
      success: false,
    });
  });

  it("returns INVALID_DISPLAY_NAME when the display name is empty", async () => {
    const userRepository = createUserRepository();

    vi.mocked(userRepository.findById).mockResolvedValue(EXISTING_USER);

    const useCase = new UpdateProfile(userRepository);
    const result = await useCase.execute({
      displayName: "   ",
      userId: "user-1",
    });

    expect(userRepository.save).not.toHaveBeenCalled();
    expect(result).toEqual({
      error: {
        code: "INVALID_DISPLAY_NAME",
        message: expect.stringContaining("cannot be empty"),
      },
      success: false,
    });
  });
});
