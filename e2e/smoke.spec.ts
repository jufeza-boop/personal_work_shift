import { expect, test, type Page } from "@playwright/test";

function makeUser(prefix: string) {
  return {
    displayName: `${prefix} User`,
    email: `${prefix.toLowerCase()}-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`,
    password: "Password1",
  };
}

async function register(
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

async function login(page: Page, user: { email: string; password: string }) {
  await page.goto("/login");
  await page.getByLabel("Correo electrónico").fill(user.email);
  await page.getByLabel("Contraseña").fill(user.password);
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page).toHaveURL("/calendar");
}

async function createFamily(page: Page, name: string) {
  await page.goto("/calendar/family/new");
  await page.getByLabel("Nombre de la familia").fill(name);
  await page.getByRole("button", { name: "Crear familia" }).click();
  await expect(page).toHaveURL("/calendar/settings");
}

// ── Tests ──────────────────────────────────────────────────────────────────

test("guest is redirected to login when accessing /calendar", async ({
  page,
}) => {
  await page.goto("/calendar");
  await expect(page).toHaveURL(/\/login/);
  await expect(
    page.getByRole("heading", { name: "Iniciar sesión" }),
  ).toBeVisible();
});

test("register → login → create family → calendar grid visible → logout", async ({
  page,
}) => {
  const user = makeUser("Smoke");

  await register(page, user);
  await login(page, user);
  await createFamily(page, "Mi Familia");

  await page.goto("/calendar");
  await expect(page.getByText("Lun")).toBeVisible();
  await expect(page.getByText("Dom")).toBeVisible();

  await page.getByLabel("Menú de usuario").click();
  await page.getByRole("button", { name: "Cerrar sesión" }).click();
  await expect(page).toHaveURL(/\/login\?message=logged-out$/);
});

test("create a punctual event and see it in the calendar", async ({ page }) => {
  const user = makeUser("Event");

  await register(page, user);
  await login(page, user);
  await createFamily(page, "Event Family");

  await page.goto("/calendar");
  // Wait for the grid to be fully rendered before interacting
  await expect(page.getByTestId("calendar-grid")).toBeVisible();

  
  // Click day 15 (first match avoids picking a day from a sibling month)
  await page.getByRole("button", { name: "15" }).first().click();

  // Wait for DayDetailPanel — getByTestId bypasses aria-modal blocking from MemberFilterSheet
  const panel = page.getByTestId("day-detail-panel");
  await expect(panel).toBeVisible();

  // Open create event form
  await panel.getByRole("button", { name: "+ Crear evento" }).click();
  await page.getByLabel("Título").fill("Cita médica");
  await page.getByRole("button", { name: "Crear evento" }).last().click();

  await expect(page).toHaveURL("/calendar");
  await expect(page.getByText("Cita médica")).toBeVisible();
});
