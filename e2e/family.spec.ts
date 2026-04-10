import { expect, test, type Page } from "@playwright/test";

async function registerUser(page: Page, user: {
  displayName: string;
  email: string;
  password: string;
}) {
  await page.goto("/register");
  await page.getByLabel("Nombre").fill(user.displayName);
  await page.getByLabel("Correo electrónico").fill(user.email);
  await page.getByLabel("Contraseña").fill(user.password);
  await page.getByRole("button", { name: "Crear cuenta" }).click();
  await expect(page).toHaveURL(/\/login\?message=registered$/);
}

async function loginUser(page: Page, user: {
  email: string;
  password: string;
}) {
  await page.goto("/login");
  await page.getByLabel("Correo electrónico").fill(user.email);
  await page.getByLabel("Contraseña").fill(user.password);
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page).toHaveURL("/calendar");
}

test("creates a family and adds a registered member", async ({ page }) => {
  const suffix = Date.now();
  const owner = {
    displayName: "Owner Example",
    email: `owner-${suffix}@example.com`,
    password: "Password1",
  };
  const member = {
    displayName: "Member Example",
    email: `member-${suffix}@example.com`,
    password: "Password1",
  };

  await registerUser(page, owner);
  await registerUser(page, member);
  await loginUser(page, owner);

  await page.getByLabel("Nombre de la familia").fill("Home Team");
  await page.getByRole("button", { name: "Crear familia" }).click();

  await expect(page.getByText("Familia activa:")).toContainText("Home Team");

  await page.goto("/calendar/settings");
  await page.getByLabel("Correo electrónico").fill(member.email);
  await page.getByLabel("Paleta de color").selectOption("sky");
  await page.getByRole("button", { name: "Añadir miembro" }).click();

  await expect(page.getByText("Member Example")).toBeVisible();
  await expect(page.getByText("Paleta sky")).toBeVisible();
});

test("switches between families, persists the active family, and renames it", async ({
  page,
}) => {
  const suffix = Date.now();
  const owner = {
    displayName: "Owner Two",
    email: `owner-two-${suffix}@example.com`,
    password: "Password1",
  };

  await registerUser(page, owner);
  await loginUser(page, owner);

  await page.getByLabel("Nombre de la familia").fill("Home Team");
  await page.getByRole("button", { name: "Crear familia" }).click();

  await page.getByRole("link", { name: "Ajustes de familia" }).click();
  const createFamilyInput = page.locator("aside").getByLabel(
    "Nombre de la familia",
  );

  await expect(createFamilyInput).toBeVisible();
  await createFamilyInput.fill("Work Team");
  await expect(createFamilyInput).toHaveValue("Work Team");
  await createFamilyInput.press("Enter");

  await expect(page.getByText("Familias")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Work Team (actual)" }),
  ).toBeVisible();

  await page.getByRole("button", { name: "Home Team" }).click();
  await expect(page.getByText("Gestiona quién forma parte de")).toContainText(
    "Home Team",
  );

  await page.reload();
  await expect(page.getByText("Gestiona quién forma parte de")).toContainText(
    "Home Team",
  );

  await page.getByRole("link", { name: "Ajustes de familia" }).click();
  await page.locator('input[value="Home Team"]').fill("Roommates");
  await page.getByRole("button", { name: "Guardar nombre" }).click();

  await expect(page.locator('input[value="Roommates"]')).toBeVisible();
  await page.goto("/calendar");
  await expect(page.getByText("Familia activa:")).toContainText("Roommates");
});
