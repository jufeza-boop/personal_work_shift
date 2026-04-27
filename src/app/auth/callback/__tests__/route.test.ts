import { NextRequest } from "next/server";
import { GET } from "@/app/auth/callback/route";

const { mockExchangeCodeForSession } = vi.hoisted(() => ({
  mockExchangeCodeForSession: vi.fn(),
}));

vi.mock("@/infrastructure/supabase/server", () => ({
  createServerSupabaseClient: vi.fn().mockResolvedValue({
    auth: {
      exchangeCodeForSession: mockExchangeCodeForSession,
    },
  }),
}));

function makeRequest(code?: string): NextRequest {
  const url = code
    ? `http://localhost/auth/callback?code=${code}`
    : `http://localhost/auth/callback`;
  return new NextRequest(url);
}

describe("GET /auth/callback", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("exchanges code for session and redirects to /calendar on success", async () => {
    mockExchangeCodeForSession.mockResolvedValue({ error: null });

    const response = await GET(makeRequest("valid-code"));

    expect(mockExchangeCodeForSession).toHaveBeenCalledWith("valid-code");
    expect(response.status).toBe(307);
    expect(new URL(response.headers.get("location")!).pathname).toBe(
      "/calendar",
    );
  });

  it("redirects to /login?error=auth when code is missing", async () => {
    const response = await GET(makeRequest());

    expect(mockExchangeCodeForSession).not.toHaveBeenCalled();
    expect(response.status).toBe(307);

    const location = new URL(response.headers.get("location")!);

    expect(location.pathname).toBe("/login");
    expect(location.searchParams.get("error")).toBe("auth");
  });

  it("redirects to /login?error=auth when session exchange fails", async () => {
    mockExchangeCodeForSession.mockResolvedValue({
      error: { message: "Exchange failed" },
    });

    const response = await GET(makeRequest("bad-code"));

    expect(mockExchangeCodeForSession).toHaveBeenCalledWith("bad-code");
    expect(response.status).toBe(307);

    const location = new URL(response.headers.get("location")!);

    expect(location.pathname).toBe("/login");
    expect(location.searchParams.get("error")).toBe("auth");
  });
});
