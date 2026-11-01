
import { test, expect } from "@playwright/test";
import {
  loginAs,
  openStaffDashboard,
  openTicketBySummary,
  saveScreenshot,
} from "./helpers";

test("IT Staff creates and updates an Action Taken", async ({ page }) => {
  await loginAs(page, "ning.it@example.com");

  await openStaffDashboard(page);
  await openTicketBySummary(page, "Cannot access university email");

  await page.getByRole("button", { name: /actions taken/i }).click();

  await expect(
    page.getByRole("heading", { name: /actions taken history/i }),
  ).toBeVisible();

  const originalDescription =
    "E2E test: checked the university email configuration.";

  const updatedDescription =
    "E2E test: updated the university email configuration.";

  const actionCard = page.locator("article").filter({
    has: page.getByRole("heading", {
      name: originalDescription,
    }),
  }).first();

  const existingAction = await actionCard.count();

  if (existingAction === 0) {
    await page
      .getByPlaceholder("Describe the work performed...")
      .fill(originalDescription);

    await page
      .getByPlaceholder("Describe the outcome...")
      .fill("E2E test: email configuration was checked successfully.");

    await page
      .getByLabel("Action Date and Time")
      .fill("2026-11-01T10:00");

    await page
      .getByRole("checkbox", { name: /follow-up required/i })
      .check();

    await page
      .getByPlaceholder("Explain what follow-up is needed...")
      .fill("E2E test: verify the email connection tomorrow.");

    await page.getByRole("button", { name: /record action/i }).click();

    await expect(
      page.getByText("Action Taken recorded successfully."),
    ).toBeVisible();

    await expect(
      page.getByRole("heading", { name: originalDescription }),
    ).toBeVisible();
  }

  const savedAction = page.locator("article").filter({
    has: page.getByRole("heading", {
      name: originalDescription,
    }),
  }).first();

  await expect(savedAction).toBeVisible();

  await saveScreenshot(
    page,
    "artifacts/lab-04/screenshots/actions-taken/action-created.png",
  );

  await savedAction.getByRole("button", { name: /^edit$/i }).click();

  await page
    .getByPlaceholder("Describe the work performed...")
    .fill(updatedDescription);

  await page
    .getByRole("button", { name: /save action changes/i })
    .click();

  await expect(
    page.getByText("Action Taken updated successfully."),
  ).toBeVisible();

  await expect(
  page.getByRole("heading", { name: updatedDescription }).first(),
).toBeVisible();

  await saveScreenshot(
    page,
    "artifacts/lab-04/screenshots/actions-taken/action-updated.png",
  );
});

test("Requester can view Actions Taken but cannot edit them", async ({
  page,
}) => {
  await loginAs(page, "mina@gmail.com");

  const myTicketsButton = page.getByRole("button", {
    name: /my tickets/i,
  });

  await expect(myTicketsButton).toBeVisible();
  await myTicketsButton.click();

  await openTicketBySummary(page, "TCK-20261003-0010");

  await expect(
    page.getByText(/Actions Taken/i).first(),
  ).toBeVisible();

  await expect(
    page.getByRole("button", { name: /^edit$/i }),
  ).toHaveCount(0);

  await expect(
    page.getByRole("button", { name: /record action/i }),
  ).toHaveCount(0);

  await saveScreenshot(
    page,
    "artifacts/lab-04/screenshots/actions-taken/requester-read-only.png",
  );
});
