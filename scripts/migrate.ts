import { closeDb, runMigrations } from "@/lib/db/client";

await runMigrations();
console.log("Migrations applied.");
await closeDb();
