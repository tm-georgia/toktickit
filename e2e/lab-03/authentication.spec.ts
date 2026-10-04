import { test, expect } from "@playwright/test";

test("user can log in successfully", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: /sign in/i }),
  ).toBeVisible();

  await page.getByLabel("Email").fill("lisam@gmail.com");

  await page
    .getByPlaceholder("Enter your password")
    .fill("TokTickit2026!");

  await page.getByRole("button", { name: /sign in/i }).click();

  await expect(
    page.getByText(/invalid email or password/i),
  ).not.toBeVisible();
});