import { test, expect } from "@playwright/test";

test("administrator can manage users", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: /sign in/i }),
  ).toBeVisible();

  await page.getByLabel("Email").fill("thinnmyat@gmail.com");

  await page
    .getByPlaceholder("Enter your password")
    .fill("TokTickit2026new!");

  await page.getByRole("button", { name: /sign in/i }).click();

  await expect(
    page.getByRole("heading", { name: /Welcome/i }),
  ).toBeVisible();

  const usersButton = page.getByRole("button", {
    name: /user management|manage users|users/i,
  });

  await expect(usersButton).toBeVisible();
  await usersButton.click();

  await expect(
    page.getByRole("heading", { name: /^Users$/i }),
  ).toBeVisible();

  await expect(
    page.getByRole("button", { name: /create user/i }),
  ).toBeVisible();

  await expect(
    page.getByPlaceholder("Search users..."),
  ).toBeVisible();

  await page.getByPlaceholder("Search users...").fill("Ning");

await page.waitForTimeout(500);

console.log("SEARCH RESULT PAGE:");
console.log(await page.locator("body").innerText());
});