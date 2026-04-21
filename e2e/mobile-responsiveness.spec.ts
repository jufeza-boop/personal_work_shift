import { expect, test } from "@playwright/test";

test.describe("Mobile responsiveness", () => {
  test("landing page renders correctly on mobile viewport", async ({
    page,
  }) => {
    await page.goto("/");

    // The landing page should have a visible hero section
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    // No horizontal overflow on mobile
    const body = page.locator("body");
    const bodyBox = await body.boundingBox();
    const viewport = page.viewportSize();
    if (bodyBox && viewport) {
      expect(bodyBox.width).toBeLessThanOrEqual(viewport.width + 1);
    }
  });

  test("login page is usable on mobile viewport", async ({ page }) => {
    await page.goto("/login");

    await expect(
      page.getByRole("heading", { name: "Iniciar sesión" }),
    ).toBeVisible();

    // Form inputs should be visible and reachable
    await expect(page.getByLabel("Correo electrónico")).toBeVisible();
    await expect(page.getByLabel("Contraseña")).toBeVisible();
    await expect(page.getByRole("button", { name: "Entrar" })).toBeVisible();
  });

  test("register page is usable on mobile viewport", async ({ page }) => {
    await page.goto("/register");

    await expect(
      page.getByRole("heading", { name: "Crear cuenta" }),
    ).toBeVisible();

    await expect(page.getByLabel("Nombre")).toBeVisible();
    await expect(page.getByLabel("Correo electrónico")).toBeVisible();
    await expect(page.getByLabel("Contraseña")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Crear cuenta" }),
    ).toBeVisible();
  });

  test("calendar page adapts to mobile viewport after login", async ({
    page,
  }) => {
    const email = `mobile-${Date.now()}@example.com`;

    // Register and login
    await page.goto("/register");
    await page.getByLabel("Nombre").fill("Mobile User");
    await page.getByLabel("Correo electrónico").fill(email);
    await page.getByLabel("Contraseña").fill("Password1");
    await page.getByRole("button", { name: "Crear cuenta" }).click();

    await expect(page).toHaveURL(/\/login/);

    await page.getByLabel("Correo electrónico").fill(email);
    await page.getByLabel("Contraseña").fill("Password1");
    await page.getByRole("button", { name: "Entrar" }).click();

    await expect(page).toHaveURL("/calendar");
    await expect(
      page.getByRole("heading", { name: "Calendario familiar" }),
    ).toBeVisible();

    // Calendar grid should be visible on mobile
    const calendarGrid = page.locator('[class*="grid-cols-7"]');
    await expect(calendarGrid.first()).toBeVisible();

    // Navigation buttons should be reachable
    await expect(
      page.getByRole("button", { name: "Mes anterior" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Mes siguiente" }),
    ).toBeVisible();
  });
});
