import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { GoogleLoginButton } from "@/presentation/components/auth/GoogleLoginButton";

const mockSignInWithOAuth = vi.fn();

vi.mock("@/infrastructure/supabase/browser", () => ({
  createBrowserSupabaseClient: () => ({
    auth: {
      signInWithOAuth: mockSignInWithOAuth,
    },
  }),
}));

describe("GoogleLoginButton", () => {
  beforeEach(() => {
    mockSignInWithOAuth.mockResolvedValue({ data: {}, error: null });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders the Google login button", () => {
    render(<GoogleLoginButton />);

    expect(
      screen.getByRole("button", { name: /continuar con google/i }),
    ).toBeInTheDocument();
  });

  it("renders a Google SVG icon", () => {
    render(<GoogleLoginButton />);

    const svg = document.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("calls signInWithOAuth with google provider on click", async () => {
    render(<GoogleLoginButton />);

    const button = screen.getByRole("button", {
      name: /continuar con google/i,
    });
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockSignInWithOAuth).toHaveBeenCalledWith(
        expect.objectContaining({
          provider: "google",
          options: expect.objectContaining({
            redirectTo: expect.stringContaining("/auth/callback"),
          }),
        }),
      );
    });
  });

  it("shows loading state while redirecting", async () => {
    // Never resolves to keep the loading state active
    mockSignInWithOAuth.mockReturnValue(new Promise(() => {}));

    render(<GoogleLoginButton />);

    const button = screen.getByRole("button", {
      name: /continuar con google/i,
    });
    fireEvent.click(button);

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /cargando/i }),
      ).toBeInTheDocument();
    });
  });

  it("disables button while loading", async () => {
    mockSignInWithOAuth.mockReturnValue(new Promise(() => {}));

    render(<GoogleLoginButton />);

    const button = screen.getByRole("button", {
      name: /continuar con google/i,
    });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /cargando/i })).toBeDisabled();
    });
  });
});
