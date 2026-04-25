import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ShareInvitationButton } from "@/presentation/components/family/ShareInvitationButton";

describe("ShareInvitationButton", () => {
  it("renders WhatsApp link", () => {
    render(
      <ShareInvitationButton
        familyName="Los García"
        url="http://localhost:3000/invite/tok-abc"
      />,
    );

    const whatsappLink = screen.getByRole("link", { name: /whatsapp/i });
    expect(whatsappLink).toBeInTheDocument();
    expect(whatsappLink.getAttribute("href")).toContain("wa.me");
    expect(whatsappLink.getAttribute("href")).toContain("invite");
  });

  it("renders Telegram link", () => {
    render(
      <ShareInvitationButton
        familyName="Los García"
        url="http://localhost:3000/invite/tok-abc"
      />,
    );

    const telegramLink = screen.getByRole("link", { name: /telegram/i });
    expect(telegramLink).toBeInTheDocument();
    expect(telegramLink.getAttribute("href")).toContain("t.me");
  });

  it("renders copy link button", () => {
    render(
      <ShareInvitationButton
        familyName="Los García"
        url="http://localhost:3000/invite/tok-abc"
      />,
    );

    expect(
      screen.getByRole("button", { name: /copiar enlace/i }),
    ).toBeInTheDocument();
  });

  it("calls clipboard.writeText when copy button is clicked", () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: writeTextMock },
      configurable: true,
    });

    render(
      <ShareInvitationButton
        familyName="Los García"
        url="http://localhost:3000/invite/tok-abc"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /copiar enlace/i }));
    expect(writeTextMock).toHaveBeenCalledWith(
      "http://localhost:3000/invite/tok-abc",
    );
  });

  it("includes family name in WhatsApp share text", () => {
    render(
      <ShareInvitationButton
        familyName="Mi Familia Especial"
        url="http://localhost:3000/invite/tok-abc"
      />,
    );

    const whatsappLink = screen.getByRole("link", { name: /whatsapp/i });
    expect(
      decodeURIComponent(whatsappLink.getAttribute("href") ?? ""),
    ).toContain("Mi Familia Especial");
  });
});
