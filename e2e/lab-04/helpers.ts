import { expect, Page } from "@playwright/test";

export async function loginAs(
  page: Page,
  email: string,
): Promise<void> {
  const initialPassword = process.env.TOKTICKIT_INITIAL_PASSWORD;
  const newPassword = process.env.TOKTICKIT_E2E_PASSWORD;

  if (!initialPassword || !newPassword) {
    throw new Error(
      "Set TOKTICKIT_INITIAL_PASSWORD and TOKTICKIT_E2E_PASSWORD before running E2E tests.",
    );
  }

  await page.goto("/");

  const signInHeading = page.getByRole("heading", {
    name: /sign in/i,
  });

  await expect(signInHeading).toBeVisible();

  async function attemptLogin(password: string): Promise<boolean> {
    await page.getByLabel("Email").fill(email);
    await page.getByPlaceholder("Enter your password").fill(password);
    await page.getByRole("button", { name: /sign in/i }).click();

    try {
      await expect(signInHeading).not.toBeVisible({
        timeout: 4000,
      });
      return true;
    } catch {
      return false;
    }
  }

  let passwordUsed = initialPassword;

  // Try the initial seeded password first.
  let loggedIn = await attemptLogin(initialPassword);

  // If it fails, try the E2E password from an earlier test run.
  if (!loggedIn) {
    passwordUsed = newPassword;
    loggedIn = await attemptLogin(newPassword);
  }

  if (!loggedIn) {
    const pageText = await page.locator("body").innerText();

    throw new Error(
      `Login failed for ${email}. Page message: ${pageText}`,
    );
  }

  const changePasswordHeading = page.getByRole("heading", {
    name: /change your password/i,
  });

  if (await changePasswordHeading.isVisible().catch(() => false)) {
    await page.getByLabel("Current password").fill(passwordUsed);
    await page.getByRole("textbox", { name: /^New password/ }).fill(newPassword);
    await page.getByRole("textbox", { name: /^Confirm new password/ }).fill(newPassword);

    await page
      .getByRole("button", { name: /^change password$/i })
      .click();

    await expect(changePasswordHeading).not.toBeVisible({
      timeout: 15000,
    });
  }

  await expect(signInHeading).not.toBeVisible();
}

export async function openStaffQueue(page: Page): Promise<void> {
  const queueButton = page.getByRole("button", {
    name: /view my queue/i,
  });

  if (await queueButton.isVisible().catch(() => false)) {
    await queueButton.click();
  }

  await expect(
    page.getByText(/IT Staff Ticket Queue/i),
  ).toBeVisible();
}

export async function openTicketBySummary(
  page: Page,
  summary: string,
): Promise<void> {
  const ticket = page
    .getByRole("button")
    .filter({ hasText: summary })
    .first();

  await expect(ticket).toBeVisible();
  await ticket.click();
}

export async function saveScreenshot(
  page: Page,
  path: string,
): Promise<void> {
  await page.screenshot({
    path,
    fullPage: true,
  });
}

export async function openStaffDashboard(page: Page): Promise<void> {
  const dashboardButton = page.getByRole("button", {
    name: /^my dashboard$/i,
  });

  await expect(dashboardButton).toBeVisible();
  await dashboardButton.click();

  await expect(
    page.getByRole("heading", {
      name: /welcome back, ning it/i,
    }),
  ).toBeVisible();
}
