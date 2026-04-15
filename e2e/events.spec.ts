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

const MONTH_NAMES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
] as const;

const MONTH_PATTERN =
  /Enero|Febrero|Marzo|Abril|Mayo|Junio|Julio|Agosto|Septiembre|Octubre|Noviembre|Diciembre/;

async function navigateToMonth(
  page: Page,
  targetYear: number,
  targetMonth: number,
  maxSteps = 24,
) {
  const heading = page.locator("h3").filter({ hasText: MONTH_PATTERN });

  for (let step = 0; step < maxSteps; step++) {
    const text = await heading.textContent();
    if (text === `${MONTH_NAMES[targetMonth - 1]} ${targetYear}`) break;

    const [monthName, yearStr] = (text ?? "").split(" ");
    const year = Number(yearStr);
    const monthIndex = MONTH_NAMES.indexOf(
      monthName as (typeof MONTH_NAMES)[number],
    );
    const current = new Date(year, monthIndex, 1);
    const target = new Date(targetYear, targetMonth - 1, 1);

    if (current < target) {
      await page.getByRole("button", { name: "Mes siguiente" }).click();
    } else {
      await page.getByRole("button", { name: "Mes anterior" }).click();
    }
  }
}

test("creates a punctual event from a day cell", async ({ page }) => {
  const suffix = Date.now();
  const user = {
    displayName: "Event User",
    email: `event-punctual-${suffix}@example.com`,
    password: "Password1",
  };

  await registerUser(page, user);
  await loginUser(page, user);
  await createFamily(page, "Punctual Family");

  // Navigate to June 2025 and click on day 15
  await navigateToMonth(page, 2025, 6);
  await page.getByRole("button", { name: "15" }).click();

  // Click "Crear evento" in the day detail panel
  await page.getByRole("button", { name: /crear evento/i }).click();

  // Fill the form (date is pre-filled via the day cell click)
  await page.getByLabel("Título").fill("Doctor appointment");
  await page.getByRole("button", { name: "Crear evento" }).last().click();

  await expect(page).toHaveURL("/calendar");
  await expect(page.getByText("Doctor appointment")).toBeVisible();
});

test("creates a recurring work event from a day cell", async ({ page }) => {
  const suffix = Date.now();
  const user = {
    displayName: "Work Event User",
    email: `event-work-${suffix}@example.com`,
    password: "Password1",
  };

  await registerUser(page, user);
  await loginUser(page, user);
  await createFamily(page, "Work Family");

  // Navigate to June 2025 and click on day 1
  await navigateToMonth(page, 2025, 6);
  await page.getByRole("button", { name: "1" }).click();

  // Click "Crear evento" in the day detail panel
  await page.getByRole("button", { name: /crear evento/i }).click();

  // Switch to work tab
  await page.getByRole("button", { name: "Trabajo/Estudio" }).click();

  await page.getByLabel("Título").fill("Morning shift");
  await page.getByLabel("Frecuencia").selectOption("weekly");
  await page.getByLabel("Tipo de turno").selectOption("morning");
  await page.getByRole("button", { name: "Crear evento" }).last().click();

  await expect(page).toHaveURL("/calendar");
  await expect(page.getByText("Morning shift")).toBeVisible();
});

test("creates a recurring other event from a day cell", async ({ page }) => {
  const suffix = Date.now();
  const user = {
    displayName: "Other Event User",
    email: `event-other-${suffix}@example.com`,
    password: "Password1",
  };

  await registerUser(page, user);
  await loginUser(page, user);
  await createFamily(page, "Other Family");

  // Navigate to June 2025 and click on day 1
  await navigateToMonth(page, 2025, 6);
  await page.getByRole("button", { name: "1" }).click();

  // Click "Crear evento" in the day detail panel
  await page.getByRole("button", { name: /crear evento/i }).click();

  // Switch to other recurring tab
  await page.getByRole("button", { name: "Otro recurrente" }).click();

  await page.getByLabel("Título").fill("Weekly yoga");
  await page.getByLabel("Frecuencia").selectOption("weekly");
  await page.getByRole("button", { name: "Crear evento" }).last().click();

  await expect(page).toHaveURL("/calendar");
  await expect(page.getByText("Weekly yoga")).toBeVisible();
});

test("edits a punctual event from the day detail panel", async ({ page }) => {
  const suffix = Date.now();
  const user = {
    displayName: "Edit User",
    email: `event-edit-${suffix}@example.com`,
    password: "Password1",
  };

  await registerUser(page, user);
  await loginUser(page, user);
  await createFamily(page, "Edit Family");

  // Navigate to July 2025 and create a punctual event on day 1
  await navigateToMonth(page, 2025, 7);
  await page.getByRole("button", { name: "1" }).click();
  await page.getByRole("button", { name: /crear evento/i }).click();
  await page.getByLabel("Título").fill("Original title");
  await page.getByRole("button", { name: "Crear evento" }).last().click();
  await expect(page).toHaveURL("/calendar");
  await expect(page.getByText("Original title")).toBeVisible();

  // Click on day 1 again to open the day detail panel with the event
  await navigateToMonth(page, 2025, 7);
  await page.getByRole("button", { name: "1" }).click();

  // Click edit on the event
  await page.getByRole("link", { name: "Editar" }).first().click();
  await expect(page).toHaveURL(/\/calendar\/events\/.+\/edit/);

  await page.getByLabel("Título").fill("Updated title");
  await page.getByRole("button", { name: "Guardar cambios" }).click();

  await expect(page).toHaveURL("/calendar");
  await expect(page.getByText("Updated title")).toBeVisible();
});

test("deletes an event from the day detail panel", async ({ page }) => {
  const suffix = Date.now();
  const user = {
    displayName: "Delete User",
    email: `event-delete-${suffix}@example.com`,
    password: "Password1",
  };

  await registerUser(page, user);
  await loginUser(page, user);
  await createFamily(page, "Delete Family");

  // Navigate to July 2025 and create a punctual event on day 15
  await navigateToMonth(page, 2025, 7);
  await page.getByRole("button", { name: "15" }).click();
  await page.getByRole("button", { name: /crear evento/i }).click();
  await page.getByLabel("Título").fill("Event to delete");
  await page.getByRole("button", { name: "Crear evento" }).last().click();
  await expect(page).toHaveURL("/calendar");
  await expect(page.getByText("Event to delete")).toBeVisible();

  // Click on day 15 again to open the day detail panel
  await navigateToMonth(page, 2025, 7);
  await page.getByRole("button", { name: "15" }).click();

  // Click delete on the event in the day detail panel
  await page.getByRole("button", { name: "Eliminar" }).first().click();

  // Confirm deletion in the dialog
  await page
    .getByRole("form", { name: "Eliminar evento" })
    .getByRole("button", { name: "Eliminar" })
    .click();

  await expect(page).toHaveURL("/calendar");
  await expect(page.getByText("Event to delete")).not.toBeVisible();
});
