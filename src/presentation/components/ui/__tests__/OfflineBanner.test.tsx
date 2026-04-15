import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { OfflineBanner } from "@/presentation/components/ui/OfflineBanner";

describe("OfflineBanner", () => {
  it("shows offline message when isOnline=false", () => {
    render(
      <OfflineBanner isOnline={false} isSyncing={false} pendingCount={0} />,
    );
    expect(
      screen.getByText(
        /Sin conexión — los cambios se sincronizarán cuando vuelva la red/i,
      ),
    ).toBeInTheDocument();
  });

  it("shows syncing message when isSyncing=true", () => {
    render(
      <OfflineBanner isOnline={true} isSyncing={true} pendingCount={0} />,
    );
    expect(
      screen.getByText(/Sincronizando cambios pendientes/i),
    ).toBeInTheDocument();
  });

  it("shows pending count when online with pending operations", () => {
    render(
      <OfflineBanner isOnline={true} isSyncing={false} pendingCount={3} />,
    );
    expect(
      screen.getByText(/3 cambios pendientes de sincronizar/i),
    ).toBeInTheDocument();
  });

  it("renders nothing when online, not syncing, and no pending", () => {
    const { container } = render(
      <OfflineBanner isOnline={true} isSyncing={false} pendingCount={0} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("shows correct count when pendingCount > 1", () => {
    render(
      <OfflineBanner isOnline={true} isSyncing={false} pendingCount={5} />,
    );
    expect(
      screen.getByText(/5 cambios pendientes de sincronizar/i),
    ).toBeInTheDocument();
  });

  it("shows offline banner even when pendingCount > 0", () => {
    render(
      <OfflineBanner isOnline={false} isSyncing={false} pendingCount={2} />,
    );
    expect(
      screen.getByText(
        /Sin conexión — los cambios se sincronizarán cuando vuelva la red/i,
      ),
    ).toBeInTheDocument();
  });
});
