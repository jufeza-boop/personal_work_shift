import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test.describe("Accessibility audit (WCAG 2.1 AA)", () => {
  test("landing page has no critical accessibility violations", async ({
    page,
  }) => {
    await page.goto("/");

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();

    expect(results.violations).toEqual([]);
  });

  test("login page has no critical accessibility violations", async ({
    page,
  }) => {
    await page.goto("/login");

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();

    expect(results.violations).toEqual([]);
  });

  test("register page has no critical accessibility violations", async ({
    page,
  }) => {
    await page.goto("/register");

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();

    expect(results.violations).toEqual([]);
  });

  test("calendar page has no critical accessibility violations", async ({
    page,
  }) => {
    const email = `a11y-${Date.now()}@example.com`;

    // Register and login
    await page.goto("/register");
    await page.getByLabel("Nombre").fill("A11y User");
    await page.getByLabel("Correo electrónico").fill(email);
    await page.getByLabel("Contraseña").fill("Password1");
    await page.getByRole("button", { name: "Crear cuenta" }).click();
    await expect(page).toHaveURL(/\/login/);

    await page.getByLabel("Correo electrónico").fill(email);
    await page.getByLabel("Contraseña").fill("Password1");
    await page.getByRole("button", { name: "Entrar" }).click();
    await expect(page).toHaveURL("/calendar");

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();

    expect(results.violations).toEqual([]);
  });
});
