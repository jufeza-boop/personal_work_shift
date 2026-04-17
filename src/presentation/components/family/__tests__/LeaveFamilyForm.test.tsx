import { render, screen } from "@testing-library/react";
import { LeaveFamilyForm } from "@/presentation/components/family/LeaveFamilyForm";

const mockAction = vi.fn().mockResolvedValue({ success: false });

describe("LeaveFamilyForm", () => {
  it("renders the leave family section with the family name", () => {
    render(
      <LeaveFamilyForm
        action={mockAction}
        familyId="family-1"
        familyName="Home Team"
      />,
    );

    expect(
      screen.getByRole("heading", { name: /abandonar familia/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Home Team/)).toBeInTheDocument();
  });

  it("shows the initial leave button", () => {
    render(
      <LeaveFamilyForm
        action={mockAction}
        familyId="family-1"
        familyName="Home Team"
      />,
    );

    expect(
      screen.getByRole("button", { name: /abandonar familia/i }),
    ).toBeInTheDocument();
  });
});
