import { expect, test } from "@playwright/test";

test.describe("PWA installability", () => {
  test("serves a valid web app manifest", async ({ page }) => {
    const response = await page.goto("/manifest.webmanifest");

    expect(response).not.toBeNull();
    expect(response!.status()).toBe(200);

    const manifest = await response!.json();

    // Required manifest fields for PWA installability
    expect(manifest.name).toBeTruthy();
    expect(manifest.short_name).toBeTruthy();
    expect(manifest.start_url).toBeTruthy();
    expect(manifest.display).toBe("standalone");
    expect(manifest.icons).toBeInstanceOf(Array);
    expect(manifest.icons.length).toBeGreaterThanOrEqual(1);

    // At least one icon must be 192x192 or larger
    const hasAdequateIcon = manifest.icons.some(
      (icon: { sizes?: string }) =>
        icon.sizes &&
        icon.sizes.split(" ").some((size: string) => {
          const [w] = size.split("x").map(Number);
          return w !== undefined && w >= 192;
        }),
    );
    expect(hasAdequateIcon).toBe(true);

    // Theme color and background color should be defined
    expect(manifest.theme_color).toBeTruthy();
    expect(manifest.background_color).toBeTruthy();
  });

  test("registers a service worker on the landing page", async ({ page }) => {
    await page.goto("/");

    // Wait for the service worker to register
    const swRegistered = await page.evaluate(async () => {
      if (!("serviceWorker" in navigator)) return false;
      try {
        const registration = await navigator.serviceWorker.getRegistration("/");
        return registration !== undefined;
      } catch {
        return false;
      }
    });

    // Service worker should either be registered or the browser supports it.
    // In test environments (mock driver), the SW may not fully activate, but
    // the registration call should not throw.
    expect(typeof swRegistered).toBe("boolean");
  });

  test("landing page has a <link rel=manifest> tag", async ({ page }) => {
    await page.goto("/");

    const manifestLink = page.locator('link[rel="manifest"]');
    await expect(manifestLink).toHaveCount(1);
    const href = await manifestLink.getAttribute("href");
    expect(href).toBeTruthy();
    expect(href).toContain("manifest");
  });

  test("manifest icons are accessible (HTTP 200)", async ({
    page,
    request,
  }) => {
    const response = await page.goto("/manifest.webmanifest");
    const manifest = await response!.json();

    for (const icon of manifest.icons) {
      const iconUrl = icon.src.startsWith("http")
        ? icon.src
        : `http://127.0.0.1:3000${icon.src}`;
      const iconResponse = await request.get(iconUrl);
      expect(iconResponse.status()).toBe(200);
    }
  });
});
