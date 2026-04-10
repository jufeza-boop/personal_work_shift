import { expect, test } from "@playwright/test";

test("redirects guests from calendar to login", async ({ page }) => {
  await page.goto("/calendar");

  await expect(page).toHaveURL(/\/login\?redirectTo=%2Fcalendar$/);
  await expect(
    page.getByRole("heading", { name: "Iniciar sesión" }),
  ).toBeVisible();
});

test("registers, logs in, and logs out with the mock auth driver", async ({
  page,
}) => {
  const email = `alice-${Date.now()}@example.com`;

  await page.goto("/register");

  await page.getByLabel("Nombre").fill("Alice Example");
  await page.getByLabel("Correo electrónico").fill(email);
  await page.getByLabel("Contraseña").fill("Password1");
  await page.getByRole("button", { name: "Crear cuenta" }).click();

  await expect(page).toHaveURL(/\/login\?message=registered$/);
  await expect(
    page.getByText(
      "Cuenta creada. Revisa tu correo para verificarla antes de iniciar sesión.",
    ),
  ).toBeVisible();

  await page.getByLabel("Correo electrónico").fill(email);
  await page.getByLabel("Contraseña").fill("Password1");
  await page.getByRole("button", { name: "Entrar" }).click();

  await expect(page).toHaveURL("/calendar");
  await expect(
    page.getByRole("heading", { name: "Calendario familiar" }),
  ).toBeVisible();

  await page.getByRole("button", { name: "Cerrar sesión" }).click();

  await expect(page).toHaveURL(/\/login\?message=logged-out$/);
  await expect(
    page.getByText("Tu sesión se cerró correctamente."),
  ).toBeVisible();
});
