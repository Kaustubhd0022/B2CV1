import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      // server-only throws outside React Server Components; tests run server code directly.
      "server-only": path.resolve(import.meta.dirname, "tests/stubs/empty.ts"),
    },
  },
  test: {
    include: ["tests/unit/**/*.test.ts", "tests/integration/**/*.test.ts"],
    environment: "node",
    env: { NODE_ENV: "test", PGLITE_DIR: ":memory:", AUTH_SECRET: "test-secret-test-secret-test-secret!!", LLM_PROVIDER: "none" },
    testTimeout: 30_000,
    hookTimeout: 60_000,
    pool: "forks",
  },
});
