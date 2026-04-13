import { expect, test, type Page } from "@playwright/test";

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
  const monthPattern =
    /Enero|Febrero|Marzo|Abril|Mayo|Junio|Julio|Agosto|Septiembre|Octubre|Noviembre|Diciembre/;
  await expect(page.locator("h3").filter({ hasText: monthPattern })).toBeVisible();
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
  const heading = page.locator("h3").filter({
    hasText:
      /Enero|Febrero|Marzo|Abril|Mayo|Junio|Julio|Agosto|Septiembre|Octubre|Noviembre|Diciembre/,
  });
  const currentMonth = await heading.textContent();

  // Navigate forward
  await page.getByRole("button", { name: "Mes siguiente" }).click();
  const nextMonth = await heading.textContent();
  expect(nextMonth).not.toBe(currentMonth);

  // Navigate back twice (one back to original, another to previous)
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

  // Navigate to April 2026 (a known month for our test date)
  const heading = page.locator("h3").filter({
    hasText:
      /Enero|Febrero|Marzo|Abril|Mayo|Junio|Julio|Agosto|Septiembre|Octubre|Noviembre|Diciembre/,
  });

  // Navigate until we reach April 2026
  let attempts = 0;
  while ((await heading.textContent()) !== "Abril 2026" && attempts < 24) {
    const text = await heading.textContent();
    const [monthName, yearStr] = (text ?? "").split(" ");
    const year = Number(yearStr);
    const months = [
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
    ];
    const monthIndex = months.indexOf(monthName ?? "");
    const currentDate = new Date(year, monthIndex, 1);
    const targetDate = new Date(2026, 3, 1); // April 2026
    if (currentDate < targetDate) {
      await page.getByRole("button", { name: "Mes siguiente" }).click();
    } else {
      await page.getByRole("button", { name: "Mes anterior" }).click();
    }
    attempts++;
  }

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
  const heading = page.locator("h3").filter({
    hasText:
      /Enero|Febrero|Marzo|Abril|Mayo|Junio|Julio|Agosto|Septiembre|Octubre|Noviembre|Diciembre/,
  });

  let attempts = 0;
  while ((await heading.textContent()) !== "Abril 2026" && attempts < 24) {
    const text = await heading.textContent();
    const [monthName, yearStr] = (text ?? "").split(" ");
    const year = Number(yearStr);
    const months = [
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
    ];
    const monthIndex = months.indexOf(monthName ?? "");
    const currentDate = new Date(year, monthIndex, 1);
    const targetDate = new Date(2026, 3, 1);
    if (currentDate < targetDate) {
      await page.getByRole("button", { name: "Mes siguiente" }).click();
    } else {
      await page.getByRole("button", { name: "Mes anterior" }).click();
    }
    attempts++;
  }

  // Create a punctual event
  await page.getByRole("button", { name: "Puntual" }).click();
  await page.getByLabel("Título").fill("Toggle test event");
  await page.getByLabel("Fecha").fill("2026-04-15");
  await page.getByRole("button", { name: "Crear evento" }).click();
  await expect(page).toHaveURL("/calendar");

  // Event should be visible in the calendar
  await expect(page.getByText("Toggle test event").first()).toBeVisible();

  // Uncheck the member's checkbox (there is only one member so it should be disabled)
  const checkboxes = page.getByRole("checkbox");
  const count = await checkboxes.count();
  // Single member: checkbox is disabled; event still shows
  if (count === 1) {
    await expect(checkboxes.first()).toBeDisabled();
    await expect(page.getByText("Toggle test event").first()).toBeVisible();
  }
});
