import { expect, test, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";

async function signInAs(page: Page, email: string) {
  await page.goto("/sign-in");
  await page.waitForLoadState("networkidle");
  await page.getByLabel("Email address").fill(email);
  await page.getByRole("button", { name: "Continue with email" }).click();
  await expect(page).toHaveURL(/verify/);
  const code = readFileSync(".dev-outbox/outbox.jsonl", "utf8").trim().split("\n").map((l) => JSON.parse(l)).filter((l) => l.to === email).at(-1).code;
  await page.waitForLoadState("networkidle");
  await page.getByLabel("Verification code").fill(code);
  await page.getByRole("button", { name: "Verify and continue" }).click();
  await page.getByRole("button", { name: "Continue in selected language" }).click();
  await expect(page).toHaveURL(/localhost:\d+\/$/);
}

test.describe.configure({ mode: "serial" });

test("editor withdraws, corrects, re-reviews and republishes a story", async ({ page }, info) => {
  test.skip(info.project.name !== "desktop", "editorial workflow runs once");
  await signInAs(page, "editor@e2e.test");
  await page.goto("/editorial");
  await expect(page.getByRole("heading", { name: "Content review queue" })).toBeVisible();

  await page.goto("/editorial/items");
  await page.getByRole("link", { name: "Kochi's shore-operated fishing nets: a practice and its contested origins" }).click();
  await expect(page.getByText("✓ claims have support")).toBeVisible();

  // Withdraw requires a recorded reason; the public page then shows an unavailable state.
  await page.getByPlaceholder("Reason for withdrawal (recorded)").fill("Origin claims need specialist sources");
  await page.getByRole("button", { name: "Withdraw" }).click();
  await expect(page.getByText("Done.")).toBeVisible();
  await page.goto("/stories/kochi-shore-operated-fishing-nets");
  await expect(page.getByRole("heading", { name: "This story is unavailable" })).toBeVisible();

  // Correction → new draft → review → approve (all reviewer confirmations required) → publish.
  await page.goBack();
  await page.goto("/editorial/items");
  await page.getByRole("link", { name: /Kochi's shore-operated/ }).click();
  await page.getByRole("button", { name: "Open correction (new draft)" }).click();
  await page.getByRole("link", { name: /en v2 · draft/ }).click();
  await page.getByRole("button", { name: "Submit for review" }).click();
  await page.getByRole("link", { name: /en v2 · in_review/ }).click();
  await page.getByRole("button", { name: "Approve this version" }).click();
  await expect(page.getByText("All reviewer confirmations are required to approve.")).toBeVisible();
  await page.getByRole("link", { name: /en v2 · in_review/ }).click();
  for (const box of await page.getByRole("checkbox").all()) await box.check();
  await page.getByRole("button", { name: "Approve this version" }).click();
  await page.getByRole("link", { name: /en v2 · approved/ }).click();
  await page.getByRole("button", { name: "Publish" }).click();
  await page.getByRole("link", { name: /en v2 · published/ }).click();
  await expect(page.getByText(/publish · editor@e2e.test/).first()).toBeVisible();

  await page.goto("/stories/kochi-shore-operated-fishing-nets");
  await expect(page.getByText("Version 2", { exact: false })).toBeVisible();
});

test("report triage: an editor can move a report through statuses", async ({ page }, info) => {
  test.skip(info.project.name !== "desktop", "runs once");
  await signInAs(page, "editor@e2e.test");
  await page.goto("/report?type=source&ref=wp-hampi");
  await page.getByLabel("Missing or broken source").check();
  await page.getByRole("button", { name: "Submit report" }).click();
  await expect(page.getByText("Thank you — your report has been received")).toBeVisible();
  await page.goto("/editorial/reports?status=new");
  const card = page.locator("li", { hasText: "broken source" }).first();
  await card.getByLabel("Status").selectOption("triaged");
  await card.getByLabel("Note").fill("Checking link");
  await card.getByRole("button", { name: "Update" }).click();
  await expect(page.getByText("Report updated.")).toBeVisible();
});

/**
 * UI rendering of a model-backed answer. The e2e server has no model configured, so this test
 * supplies a representative pipeline result at the network boundary. Pipeline behaviour itself is
 * covered by tests/integration/ask-pipeline.test.ts.
 */
test("renders a qualified answer with labels, perspectives, limits, failed checks and numbered sources", async ({ page }) => {
  await signInAs(page, `reader-${Date.now()}@example.org`);
  const result = {
    runId: "11111111-2222-3333-4444-555555555555",
    outcome: "qualified",
    risk: "routine",
    language: "en",
    languageValidated: false,
    summary: "Accounts link the nets to Chinese contact, but they differ in certainty.",
    summarySources: [1],
    sections: [
      {
        heading: "What the sources say",
        points: [
          { text: "One account says Chinese explorers introduced them in the 14th century.", epistemic: "contested", sources: [1] },
          { text: "Another says they may have been introduced by Zheng He.", epistemic: "uncertain", sources: [1] },
        ],
      },
    ],
    perspectives: [
      { label: "Stated as fact", text: "Introduced by 14th-century explorers.", sources: [1] },
      { label: "Stated as possibility", text: "Possibly Zheng He.", sources: [1] },
    ],
    limitations: ["Both statements come from a single tertiary source."],
    followUps: ["What evidence exists for Chinese contact with Kerala?"],
    sources: [
      { key: "k", n: 1, title: "Chinese fishing nets", publisher: "Wikipedia (English)", url: "https://en.wikipedia.org/w/index.php?oldid=1375589428", language: "en", sourceType: "reference", tier: 2, quotes: ["may have been introduced by the Chinese explorer Zheng He"] },
    ],
    foundSources: [],
    failedChecks: [{ id: "language_quality_gate", status: "indeterminate" }],
    retrievalIssues: [],
    nextDiscoveries: [{ kind: "story", slug: "kochi-shore-operated-fishing-nets", title: "Kochi's shore-operated fishing nets", isFixture: true }],
  };
  await page.route("**/api/ask", (route) =>
    route.fulfill({ status: 200, contentType: "application/x-ndjson", body: [{ type: "stage", stage: "retrieving" }, { type: "result", result }].map((x) => JSON.stringify(x)).join("\n") + "\n" }),
  );
  await page.goto("/ask?q=" + encodeURIComponent("Where did Kochi's fishing nets come from?"));
  await expect(page.getByText("Shown with limitations")).toBeVisible();
  await expect(page.getByText("This is an AI-generated answer, not an editorially reviewed story.")).toBeVisible();
  await expect(page.getByText("Contested").first()).toBeVisible();
  await expect(page.getByText("Different perspectives")).toBeVisible();
  await expect(page.getByText("Both statements come from a single tertiary source.")).toBeVisible();
  await page.getByText("Checks that did not pass").click();
  await expect(page.getByText(/have not yet passed TattvaCo's language quality review/).first()).toBeVisible();
  await expect(page.getByRole("link", { name: "Open source" })).toHaveAttribute("href", /oldid=1375589428/);
  await page.screenshot({ path: `test-results/answer-${test.info().project.name}.png`, fullPage: true });
  // Report path carries the answer snapshot only on the reporter's choice.
  await page.getByRole("link", { name: "Report a problem with this answer" }).click();
  await expect(page.getByText("Include the question and answer text so editors can review it")).toBeVisible();
});
