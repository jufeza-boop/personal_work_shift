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
  await page.getByRole("radio", { name: /cielo/i }).click();
  await page.getByRole("button", { name: "Añadir miembro" }).click();

  await expect(page.getByText("Member Example")).toBeVisible();
  await expect(page.getByLabel("Paleta sky")).toBeVisible();
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
  const createFamilyInput = page.getByLabel("Nombre de la familia");

  await expect(createFamilyInput).toBeVisible();
  await createFamilyInput.fill("Work Team");
  await expect(createFamilyInput).toHaveValue("Work Team");
  await createFamilyInput.press("Enter");

  // The family selector dropdown in the nav bar should show both families
  const familyDropdown = page.getByLabel("Familia");
  await expect(familyDropdown).toBeVisible();
  await expect(familyDropdown).toHaveValue(/./);

  // Switch to Home Team via the top bar dropdown
  await familyDropdown.selectOption({ label: "Home Team" });
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

test("creates a delegated user and creates an event on their behalf", async ({
  page,
}) => {
  const suffix = Date.now();
  const owner = {
    displayName: "Delegator",
    email: `delegator-${suffix}@example.com`,
    password: "Password1",
  };

  await registerUser(page, owner);
  await loginUser(page, owner);

  // Create a family first
  await page.getByLabel("Nombre de la familia").fill("Delegate Team");
  await page.getByRole("button", { name: "Crear familia" }).click();
  await expect(page.getByText("Familia activa:")).toContainText(
    "Delegate Team",
  );

  // Go to the dedicated delegated users page and create a delegated user
  await page.goto("/calendar/delegated-users");
  await page.getByLabel("Nombre").fill("Junior");
  await page.getByRole("button", { name: "Crear usuario delegado" }).click();

  // The delegated user should now appear in the list
  await expect(page.getByText("Junior")).toBeVisible();

  // Go to the calendar and create an event on behalf of Junior
  await page.goto("/calendar");
  const today = new Date();
  const dayNumber = today.getUTCDate();
  // Click on today's day cell
  await page.getByText(String(dayNumber), { exact: true }).first().click();
  await page.getByRole("button", { name: "Crear evento" }).click();

  // Select Junior in the "Crear para" dropdown
  await page.getByLabel("Crear para").selectOption({ label: "Junior" });
  await page.getByRole("textbox", { name: "Título" }).fill("Junior event");
  await page.getByRole("button", { name: "Crear evento" }).click();

  // The event should appear in the calendar
  await expect(page.getByText("Junior event")).toBeVisible();

  // Navigate to the delegated users page to remove the delegated user
  await page.goto("/calendar/delegated-users");
  await page.getByRole("button", { name: /eliminar/i }).first().click();
  // Confirm deletion
  await page.getByRole("button", { name: /confirmar/i }).click();

  // Junior should no longer be listed
  await expect(page.getByText("Junior")).not.toBeVisible();
});

test("member can select and change their own color palette", async ({
  page,
}) => {
  const suffix = Date.now();
  const owner = {
    displayName: "Palette Owner",
    email: `palette-owner-${suffix}@example.com`,
    password: "Password1",
  };

  await registerUser(page, owner);
  await loginUser(page, owner);

  await page.getByLabel("Nombre de la familia").fill("Color Team");
  await page.getByRole("button", { name: "Crear familia" }).click();

  await page.goto("/calendar/settings");

  // Select a palette using the visual picker
  await page.getByRole("radio", { name: /esmeralda/i }).click();
  await page.getByRole("button", { name: "Guardar paleta" }).click();

  // After saving, the member list should show the palette swatch
  await expect(page.getByLabelText("Paleta emerald")).toBeVisible();

  // Now change the palette to a different one
  await page.getByRole("radio", { name: /turquesa/i }).click();
  await page.getByRole("button", { name: "Guardar paleta" }).click();

  await expect(page.getByLabelText("Paleta teal")).toBeVisible();
});
