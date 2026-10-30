import { defineConfig, devices } from "@playwright/test";

const PORT = 3200;

/**
 * E2E runs against a dev server with its own embedded database (.data/e2e), seeded with the
 * labelled development fixtures, email codes delivered to the local dev outbox, and no model
 * configured (so answers are evidence-only — the honest no-LLM state).
 */
export default defineConfig({
  testDir: "tests/e2e",
  timeout: 90_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  workers: 1,
  reporter: [["list"]],
  use: { baseURL: `http://localhost:${PORT}`, trace: "retain-on-failure" },
  projects: [
    { name: "mobile", use: { ...devices["Pixel 7"] } },
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 900 } } },
  ],
  webServer: {
    command: `rm -rf .data/e2e && DATABASE_URL= PGLITE_DIR=.data/e2e npm run seed:dev && DATABASE_URL= NEXT_PUBLIC_SUPABASE_ANON_KEY= PGLITE_DIR=.data/e2e DEV_EDITOR_EMAILS=editor@e2e.test DEMO_MODE=false EMAIL_PROVIDER=dev-outbox SMS_PROVIDER=dev-outbox LLM_PROVIDER=none RETRIEVAL_PROVIDERS=corpus npx next dev -p ${PORT}`,
    url: `http://localhost:${PORT}/api/health`,
    reuseExistingServer: false,
    timeout: 180_000,
  },
});
