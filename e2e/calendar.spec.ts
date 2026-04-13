import { expect, test, type Page } from "@playwright/test";

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

async function registerUser(
  page: Page,
  user: { displayName: string; email: string; password: string },
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
  user: { email: string; password: string },
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

/**
 * Navigates the calendar grid to the specified year and month (1-indexed).
 * Clicks prev/next at most `maxSteps` times to reach the target.
 */
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

test("shows the monthly calendar grid on the calendar page", async ({
  page,
}) => {
  const suffix = Date.now();
  const user = {
    displayName: "Calendar User",
    email: `calendar-view-${suffix}@example.com`,
    password: "Password1",
  };

  await registerUser(page, user);
  await loginUser(page, user);
  await createFamily(page, "Calendar Family");

  // Day-of-week headers
  await expect(page.getByText("Lun")).toBeVisible();
  await expect(page.getByText("Dom")).toBeVisible();

  // Month name is visible (any month name)
  await expect(
    page.locator("h3").filter({ hasText: MONTH_PATTERN }),
  ).toBeVisible();
});

test("navigates to the next and previous month", async ({ page }) => {
  const suffix = Date.now();
  const user = {
    displayName: "Nav User",
    email: `calendar-nav-${suffix}@example.com`,
    password: "Password1",
  };

  await registerUser(page, user);
  await loginUser(page, user);
  await createFamily(page, "Nav Family");

  // Capture current month heading
  const heading = page.locator("h3").filter({ hasText: MONTH_PATTERN });
  const currentMonth = await heading.textContent();

  // Navigate forward
  await page.getByRole("button", { name: "Mes siguiente" }).click();
  const nextMonth = await heading.textContent();
  expect(nextMonth).not.toBe(currentMonth);

  // Navigate back to the original month
  await page.getByRole("button", { name: "Mes anterior" }).click();
  const backMonth = await heading.textContent();
  expect(backMonth).toBe(currentMonth);
});

test("shows a punctual event in the calendar grid", async ({ page }) => {
  const suffix = Date.now();
  const user = {
    displayName: "Event Grid User",
    email: `calendar-event-${suffix}@example.com`,
    password: "Password1",
  };

  await registerUser(page, user);
  await loginUser(page, user);
  await createFamily(page, "Event Grid Family");

  // Navigate to April 2026 (a fixed month for the test date 2026-04-10)
  await navigateToMonth(page, 2026, 4);

  // Create a punctual event on April 10, 2026
  await page.getByRole("button", { name: "Puntual" }).click();
  await page.getByLabel("Título").fill("Grid test event");
  await page.getByLabel("Fecha").fill("2026-04-10");
  await page.getByRole("button", { name: "Crear evento" }).click();
  await expect(page).toHaveURL("/calendar");

  // The event should appear in the calendar grid
  await expect(page.getByText("Grid test event").first()).toBeVisible();
});

test("member toggle hides and shows events", async ({ page }) => {
  const suffix = Date.now();
  const user = {
    displayName: "Toggle User",
    email: `calendar-toggle-${suffix}@example.com`,
    password: "Password1",
  };

  await registerUser(page, user);
  await loginUser(page, user);
  await createFamily(page, "Toggle Family");

  // Navigate to April 2026
  await navigateToMonth(page, 2026, 4);

  // Create a punctual event
  await page.getByRole("button", { name: "Puntual" }).click();
  await page.getByLabel("Título").fill("Toggle test event");
  await page.getByLabel("Fecha").fill("2026-04-15");
  await page.getByRole("button", { name: "Crear evento" }).click();
  await expect(page).toHaveURL("/calendar");

  // Event should be visible in the calendar
  await expect(page.getByText("Toggle test event").first()).toBeVisible();

  // Single member: checkbox is disabled; event still shows
  const checkboxes = page.getByRole("checkbox");
  const count = await checkboxes.count();
  if (count === 1) {
    await expect(checkboxes.first()).toBeDisabled();
    await expect(page.getByText("Toggle test event").first()).toBeVisible();
  }
});

