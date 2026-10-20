import { closeDb } from "@/lib/db/client";
import { ingestContent } from "@/lib/content/ingest";

const publishFixtures = process.argv.includes("--publish-fixtures");
const report = await ingestContent({ publishFixtures });
console.log(JSON.stringify(report, null, 2));
if (publishFixtures && report.publishedFixtures.length) {
  console.warn(
    "\nNOTE: development fixtures were auto-published for local use only. They are labelled in the UI and are " +
      "excluded in production unless ALLOW_FIXTURE_CONTENT=true.",
  );
}
await closeDb();
process.exit(report.errors.length ? 1 : 0);
