import { test, expect } from "@playwright/test";
import { loginAs, saveScreenshot } from "./helpers";

test("IT Staff can view the operational dashboard and open My Assigned", async ({
  page,
}) => {
  await loginAs(page, "ning.it@example.com");

  const dashboardButton = page.getByRole("button", {
    name: /dashboard/i,
  }).first();

  await expect(dashboardButton).toBeVisible();
  await dashboardButton.click();

  await expect(
    page.getByRole("heading", {
      name: /welcome back, ning it|IT Staff Dashboard/i,
    }),
  ).toBeVisible();

  await expect(page.getByText(/My Recent Tickets/i)).toBeVisible();
  await expect(page.getByText(/my assigned/i)).toBeVisible();

  await saveScreenshot(
    page,
    "artifacts/lab-04/screenshots/staff-dashboard/dashboard.png",
  );

  await page.getByRole("button", { name: /my assigned/i }).click();

  await expect(
    page.getByText(/IT Staff Ticket Queue/i),
  ).toBeVisible();
});

test("Requester can view their personal dashboard", async ({ page }) => {
  await loginAs(page, "mina@gmail.com");

  const dashboardButton = page.getByRole("button", {
    name: /dashboard/i,
  }).first();

  await expect(dashboardButton).toBeVisible();
  await dashboardButton.click();

  await expect(
    page.getByRole("heading", { name: /welcome, mina/i }),
  ).toBeVisible();

  await expect(page.getByText(/My Open Tickets/i)).toBeVisible();

  await saveScreenshot(
    page,
    "artifacts/lab-04/screenshots/requester-dashboard/dashboard.png",
  );
});
