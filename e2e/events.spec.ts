import { expect, test, type Page } from "@playwright/test";

async function registerUser(
  page: Page,
  user: {
    displayName: string;
    email: string;
    password: string;
  },
) {
  await page.goto("/register");
  await page.getByLabel("Nombre").fill(user.displayName);
  await page.getByLabel("Correo electrónico").fill(user.email);
  await page.getByLabel("Contraseña").fill(user.password);
  await page.getByRole("button", { name: "Crear cuenta" }).click();
  await expect(page).toHaveURL(/\/login\?message=registered$/);
}

async function loginUser(
  page: Page,
  user: {
    email: string;
    password: string;
  },
) {
  await page.goto("/login");
  await page.getByLabel("Correo electrónico").fill(user.email);
  await page.getByLabel("Contraseña").fill(user.password);
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page).toHaveURL("/calendar");
}

async function createFamily(page: Page, familyName: string) {
  await page.getByLabel("Nombre de la familia").fill(familyName);
  await page.getByRole("button", { name: "Crear familia" }).click();
  await expect(page.getByText("Familia activa:")).toContainText(familyName);
}

test("creates a punctual event and sees it in the list", async ({ page }) => {
  const suffix = Date.now();
  const user = {
    displayName: "Event User",
    email: `event-punctual-${suffix}@example.com`,
    password: "Password1",
  };

  await registerUser(page, user);
  await loginUser(page, user);
  await createFamily(page, "Punctual Family");

  await page.getByRole("button", { name: "Puntual" }).click();
  await page.getByLabel("Título").fill("Doctor appointment");
  await page.getByLabel("Fecha").fill("2025-06-15");
  await page.getByRole("button", { name: "Crear evento" }).click();

  await expect(page).toHaveURL("/calendar");
  await expect(page.getByText("Doctor appointment")).toBeVisible();
  await expect(page.getByText("Puntual")).toBeVisible();
});

test("creates a recurring work event with shift type", async ({ page }) => {
  const suffix = Date.now();
  const user = {
    displayName: "Work Event User",
    email: `event-work-${suffix}@example.com`,
    password: "Password1",
  };

  await registerUser(page, user);
  await loginUser(page, user);
  await createFamily(page, "Work Family");

  await page.getByRole("button", { name: "Trabajo/Estudio" }).click();
  await page.getByLabel("Título").fill("Morning shift");
  await page.getByLabel("Fecha de inicio").fill("2025-06-01");
  await page.getByLabel("Frecuencia").selectOption("weekly");
  await page.getByLabel("Tipo de turno").selectOption("morning");
  await page.getByRole("button", { name: "Crear evento" }).click();

  await expect(page).toHaveURL("/calendar");
  await expect(page.getByText("Morning shift")).toBeVisible();
  await expect(page.getByText("Recurrente")).toBeVisible();
});

test("creates a recurring other event", async ({ page }) => {
  const suffix = Date.now();
  const user = {
    displayName: "Other Event User",
    email: `event-other-${suffix}@example.com`,
    password: "Password1",
  };

  await registerUser(page, user);
  await loginUser(page, user);
  await createFamily(page, "Other Family");

  await page.getByRole("button", { name: "Otro recurrente" }).click();
  await page.getByLabel("Título").fill("Weekly yoga");
  await page.getByLabel("Fecha de inicio").fill("2025-06-01");
  await page.getByLabel("Frecuencia").selectOption("weekly");
  await page.getByRole("button", { name: "Crear evento" }).click();

  await expect(page).toHaveURL("/calendar");
  await expect(page.getByText("Weekly yoga")).toBeVisible();
  await expect(page.getByText("Recurrente")).toBeVisible();
});
