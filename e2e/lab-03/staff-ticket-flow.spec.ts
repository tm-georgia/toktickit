import { test, expect } from "@playwright/test";

test("IT staff can log in, view the ticket queue, and open a ticket", async ({
  page,
}) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: /sign in/i }),
  ).toBeVisible();

  await page.getByLabel("Email").fill("rosie.it@example.com");

  await page
    .getByPlaceholder("Enter your password")
    .fill("TokTickit2026!");

  await page.getByRole("button", { name: /sign in/i }).click();

  await expect(
    page.getByRole("heading", { name: /Welcome, Roise IT/i }),
  ).toBeVisible();

  const queueButton = page.getByRole("button", {
    name: "View My Queue",
  });

  await expect(queueButton).toBeVisible();
  await queueButton.click();

  await expect(
    page.getByText(/IT Staff Ticket Queue/i),
  ).toBeVisible();

  const firstTicket = page
    .locator("button")
    .filter({ hasText: /TCK-\d{8}-\d{4}/ })
    .first();

  await expect(firstTicket).toBeVisible();

  await firstTicket.click();

  await expect(
    page.getByText(/Ticket Owner/i),
  ).toBeVisible();
});