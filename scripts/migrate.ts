import { existsSync } from "node:fs";

if (existsSync(".env")) {
  process.loadEnvFile(".env");
}

const { closeDb, runMigrations } = await import("@/lib/db/client");

console.log("Connecting to database and running migrations...");
await runMigrations();
console.log("✅ Migrations applied successfully to database.");
await closeDb();
