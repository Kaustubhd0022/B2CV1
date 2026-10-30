import { expect, test, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";

async function continueInLanguage(page: Page) {
  await page.getByRole("button", { name: /^Continue/ }).click();
  await page.waitForURL((url) => !url.pathname.startsWith("/language"));
  if (new URL(page.url()).pathname === "/nda") {
    await page.getByRole("button", { name: "I Agree and Continue" }).click();
    await page.waitForURL((url) => url.pathname !== "/nda");
  }
}

function codeFor(email: string) {
  const lines = readFileSync(".dev-outbox/outbox.jsonl", "utf8").trim().split("\n").map((l) => JSON.parse(l));
  return lines.filter((l) => l.to === email).at(-1).code as string;
}

// The dev server's hot reload can restart pages mid-test; it plays no part in these journeys.
test.beforeEach(async ({ page }) => {
  await page.routeWebSocket(/webpack-hmr/, () => {});
});

let n = 0;
async function signIn(page: Page, startPath = "/") {
  const email = `e2e-${Date.now()}-${n++}@example.org`;
  await page.goto(startPath);
  await expect(page).toHaveURL(/\/sign-in/);
  // Dev server compiles on first hit and may reload once; wait until the page has settled.
  await page.locator('input[name="email"]').fill(email);
  // The toggle only responds once the page has hydrated, so retry until the form switches.
  await expect(async () => {
    await page.getByRole("button", { name: "Sign in with Email OTP instead" }).click({ timeout: 2_000 });
    await expect(page.getByRole("button", { name: "Send Email Code" })).toBeVisible({ timeout: 1_000 });
  }).toPass({ timeout: 45_000 });
  await page.getByRole("button", { name: "Send Email Code" }).click();
  await expect(page).toHaveURL(/\/sign-in\/verify/);
  // Typing the sixth digit submits the form.
  await expect(async () => {
    await page.getByLabel("Digit 1").fill("");
    await page.getByLabel("Digit 1").pressSequentially(codeFor(email));
    await expect(page).not.toHaveURL(/\/sign-in\/verify/, { timeout: 3_000 });
  }).toPass({ timeout: 45_000 });
  await expect(page).toHaveURL(/\/language/);
  return email;
}

test("core journey: sign in → language → city → story → source → connection → ask → share → report → settings", async ({ page }) => {
  // 1–2. Protected route redirects to sign-in; email code sign-in works.
  await signIn(page);

  // 3. Language selection (all 11 listed, with honest readiness labels).
  await expect(page.getByRole("radio")).toHaveCount(11);
  await expect(page.getByText("Preview — not yet quality-validated").first()).toBeVisible();
  await continueInLanguage(page);
  await expect(page.getByRole("heading", { name: "There is more to every story." })).toBeVisible();

  // Browse and Ask are both present on Home.
  await expect(page.getByRole("textbox", { name: "What are you curious about?" })).toBeVisible();

  // 4. Discover a city.
  await page.getByRole("link", { name: /Jaipur/ }).first().click();
  await expect(page).toHaveURL(/\/cities\/jaipur/);
  await expect(page.getByRole("heading", { name: "Jaipur", level: 1 })).toBeVisible();

  // 5. Open a story: fixture is labelled, epistemic labels and sources are present.
  await page.getByRole("link", { name: /Jantar Mantar: astronomy built in stone/ }).click();
  await expect(page.getByRole("heading", { name: "Jantar Mantar: astronomy built in stone" })).toBeVisible();
  await expect(page.getByText("Development sample — not editorially reviewed").first()).toBeVisible();
  await expect(page.locator("summary").getByText("Interpretation").first()).toBeVisible();

  // 8 (source). Inspect claim-level evidence, then the source detail page.
  await page.getByText(/Sources for this statement/).first().click();
  await expect(page.getByText(/collection of 19 astronomical instruments/).first()).toBeVisible();
  await page.getByRole("link", { name: /Sources and evidence/ }).first().click();
  await expect(page).toHaveURL(/\/sources\/wp-/);
  await expect(page.getByRole("link", { name: /Open original source/ })).toHaveAttribute("href", /wikipedia\.org\/w\/index\.php\?oldid=/);
  await expect(page.getByText("Claim supported")).toBeVisible();
  await page.goBack();

  // 8 (connection). Verified connection explains itself and states its limits.
  await page.getByRole("link", { name: /One patron, two cities/ }).click();
  await expect(page).toHaveURL(/\/connections\/jai-singh-observatories/);
  await expect(page.getByText("What this connection does not establish")).toBeVisible();

  // 9. Share: canonical published-item URL, no private data.
  await page.getByRole("button", { name: "Share connection" }).click();
  const url = await page.getByLabel("Shareable URL").inputValue();
  expect(url).toMatch(/\/s\/connection\/jai-singh-observatories-jaipur-varanasi$/);
  expect(url).not.toMatch(/@|session|token|q=/);
  await page.getByRole("button", { name: "Close" }).click();

  // 6–7. Ask: without a configured model, the product shows sources only — never a simulated answer.
  await page.goto("/ask?q=" + encodeURIComponent("Jantar Mantar Jaipur instruments"));
  await expect(page.getByText("Sources only — no AI answer")).toBeVisible({ timeout: 30_000 });
  await expect(page.getByText("Relevant passage").first()).toBeVisible();

  // 10a. Report a problem on a story.
  await page.goto("/report?type=story&ref=jaipur-jantar-mantar");
  await expect(page.getByText(/Reporting about: Jantar Mantar/)).toBeVisible();
  await page.getByRole("button", { name: "Submit report" }).click();
  await expect(page.getByText("Choose a category.")).toBeVisible();
  await page.getByLabel("Unsupported or inaccurate claim").check();
  await page.getByRole("button", { name: "Submit report" }).click();
  await expect(page.getByText("Thank you — your report has been received")).toBeVisible();

  // 10b. Settings and sign-out ends the session.
  await page.goto("/settings");
  await expect(page.getByRole("link", { name: /Privacy and data/ })).toBeVisible();
  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page).toHaveURL(/\/sign-in/);
  await page.goto("/explore");
  await expect(page).toHaveURL(/\/sign-in\?next=%2Fexplore/);
});

test("shared link preserves the destination through sign-in", async ({ page }) => {
  await signIn(page, "/s/story/kochi-shore-operated-fishing-nets");
  await continueInLanguage(page);
  await expect(page).toHaveURL(/\/stories\/kochi-shore-operated-fishing-nets/);
  await expect(page.getByText("Contested").first()).toBeVisible();
});

test("selected language is respected and never silently replaced", async ({ page }) => {
  await signIn(page);
  await page.getByLabel(/हिन्दी/).check();
  await continueInLanguage(page);
  await expect(page.locator("html")).toHaveAttribute("lang", "hi");
  await expect(page.getByText(/Parts of the interface are not yet available in हिन्दी/)).toBeVisible();
  await expect(page.getByRole("heading", { name: "हर कहानी में और भी बहुत कुछ है।" })).toBeVisible();
  // No Hindi stories exist: the city explains the gap and offers an explicit choice.
  await page.goto("/cities/varanasi");
  await expect(page.getByText(/No stories for वाराणसी have been approved in हिन्दी yet/)).toBeVisible();
  await page.getByRole("link", { name: "Show versions available in other languages" }).click();
  await page.getByRole("link", { name: /The ghats/ }).click();
  await expect(page.getByText(/Shown in English\. Not yet available in हिन्दी/)).toBeVisible();
});

test("unavailable content, unknown routes and the editorial area for non-editors", async ({ page }) => {
  await signIn(page);
  await continueInLanguage(page);
  await page.goto("/stories/does-not-exist");
  await expect(page.getByRole("heading", { name: "This story is unavailable" })).toBeVisible();
  await page.goto("/cities/atlantis");
  await expect(page.getByText(/couldn.t find that page/)).toBeVisible();
  const r = await page.goto("/editorial");
  expect(r?.status()).toBe(404);
});

test("ask validates input and handles insufficient evidence honestly", async ({ page }) => {
  await signIn(page);
  await continueInLanguage(page);
  await page.goto("/ask");
  await page.getByRole("button", { name: "Ask" }).click();
  await expect(page.getByText("Please enter a question of at least 3 characters.")).toBeVisible();
  await page.getByLabel(/Ask about a tradition/).fill("Describe the Hornbill festival of Nagaland");
  await page.getByRole("button", { name: "Ask" }).click();
  await expect(page.getByText("We couldn't establish a reliable answer")).toBeVisible({ timeout: 30_000 });
});

test("API endpoints reject unauthenticated access", async ({ request }) => {
  expect((await request.post("/api/ask", { data: { question: "test question" } })).status()).toBe(401);
  expect((await request.post("/api/report", { data: {} })).status()).toBe(401);
  expect((await request.get("/api/health")).status()).toBe(200);
});
