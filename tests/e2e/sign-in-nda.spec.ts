import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";

function codeFor(email: string) {
  const lines = readFileSync(".dev-outbox/outbox.jsonl", "utf8").trim().split("\n").map((l) => JSON.parse(l));
  return lines.filter((l) => l.to === email).at(-1).code as string;
}

// The dev server's hot reload can restart pages mid-test; it plays no part in these journeys.
test.beforeEach(async ({ page }) => {
  await page.routeWebSocket(/webpack-hmr/, () => {});
});

test("a new user must accept the NDA once before reaching the product", async ({ page }) => {
  const email = `nda-${Date.now()}@example.org`;
  await page.goto("/sign-in");
  await page.locator('input[name="email"]').fill(email);
  // The toggle only responds once the page has hydrated, so retry until the form switches.
  await expect(async () => {
    await page.getByRole("button", { name: "Sign in with Email OTP instead" }).click({ timeout: 2_000 });
    await expect(page.getByRole("button", { name: "Send Email Code" })).toBeVisible({ timeout: 1_000 });
  }).toPass({ timeout: 45_000 });
  await page.getByRole("button", { name: "Send Email Code" }).click();
  await expect(page).toHaveURL(/\/sign-in\/verify/);
  await expect(async () => {
    await page.getByLabel("Digit 1").fill("");
    await page.getByLabel("Digit 1").pressSequentially(codeFor(email));
    await expect(page).not.toHaveURL(/\/sign-in\/verify/, { timeout: 3_000 });
  }).toPass({ timeout: 45_000 });

  await expect(page).toHaveURL(/\/language/);
  await page.getByRole("button", { name: /^Continue/ }).click();

  await expect(page).toHaveURL(/\/nda/);
  await expect(page.getByRole("heading", { name: "Confidentiality & Non-Disclosure Agreement" })).toBeVisible();

  // The product and its APIs stay closed until the agreement is accepted.
  await page.goto("/explore");
  await expect(page).toHaveURL(/\/nda\?next=%2Fexplore/);
  expect((await page.request.post("/api/ask", { data: { question: "test question" } })).status()).toBe(403);

  await page.getByRole("button", { name: "I Agree and Continue" }).click();
  await expect(page).toHaveURL(/\/explore/);

  await page.goto("/nda");
  await expect(page).not.toHaveURL(/\/nda/);
});
