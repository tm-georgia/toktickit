
import { test, expect, type Page } from "@playwright/test";
import {
  loginAs,
  openStaffDashboard,
  openTicketBySummary,
  saveScreenshot,
} from "./helpers";

async function getStatusSelect(page: Page) {
  await page.getByRole("button", {
    name: /service actions/i,
  }).click();

  const statusSelect = page
    .locator(".detail-field")
    .filter({
      has: page.locator("label", { hasText: /^Status$/ }),
    })
    .locator("select");

  await expect(statusSelect).toBeVisible();

  return statusSelect;
}

async function moveTicketToInProgress(page: Page) {
  const statusSelect = await getStatusSelect(page);
  const currentStatus = await statusSelect.inputValue();

  if (currentStatus === "OPEN") {
    await statusSelect.selectOption("IN_PROGRESS");

    page.once("dialog", (dialog) => dialog.accept());

    await page.getByRole("button", {
      name: /^save changes$/i,
    }).click();

    await expect(statusSelect).toHaveValue("IN_PROGRESS");
  } else {
    expect(currentStatus).toBe("IN_PROGRESS");
  }

  return statusSelect;
}

test("IT Staff can perform an allowed status transition", async ({
  page,
}) => {
  await loginAs(page, "ning.it@example.com");

  await openStaffDashboard(page);
  await openTicketBySummary(page, "Cannot access university email");

  const statusSelect = await getStatusSelect(page);
  const currentStatus = await statusSelect.inputValue();

  if (currentStatus === "OPEN") {
    await statusSelect.selectOption("IN_PROGRESS");

    page.once("dialog", (dialog) => dialog.accept());

    await page.getByRole("button", {
      name: /^save changes$/i,
    }).click();
  } else {
    expect(currentStatus).toBe("IN_PROGRESS");
  }

  await expect(statusSelect).toHaveValue("IN_PROGRESS");

  await saveScreenshot(
    page,
    "artifacts/lab-04/screenshots/staff-dashboard/ticket-in-progress.png",
  );
});


test("IT Staff cannot perform an invalid status transition", async ({
  page,
}) => {
  await loginAs(page, "ning.it@example.com");

  await openStaffDashboard(page);
  await openTicketBySummary(page, "Cannot access university email");

  const statusSelect = await moveTicketToInProgress(page);

  await statusSelect.selectOption("CLOSED");

  const statusResponsePromise = page.waitForResponse((response) => {
    return (
      response.url().includes("/api/it-staff/tickets/") &&
      response.url().endsWith("/status") &&
      response.request().method() === "PATCH"
    );
  });

  page.once("dialog", (dialog) => dialog.accept());

  await page.getByRole("button", {
    name: /^save changes$/i,
  }).click();

  const statusResponse = await statusResponsePromise;

  expect(statusResponse.status()).toBe(400);

  const responseBody = await statusResponse.json();

  expect(responseBody.error.code).toBe(
    "INVALID_STATUS_TRANSITION",
  );

  expect(responseBody.error.message).toBe(
    "Cannot change ticket status from IN_PROGRESS to CLOSED.",
  );

// Reload the application and reopen the ticket.
await page.reload();

await openStaffDashboard(page);

await openTicketBySummary(
  page,
  "Cannot access university email",
);

const refreshedStatusSelect = await getStatusSelect(page);

await expect(refreshedStatusSelect).toHaveValue("IN_PROGRESS");
});
