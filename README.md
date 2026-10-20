# TattvaCo — B2C Cultural Discovery Engine (Phase 1)

Mobile-first web app for discovering the relationships, context and living meaning within India's
cultural universe: curated city stories, source-aware AI answers and explained connections.

**Status: pre-release pilot build.** It runs end to end locally, but launch gates are open (language
quality, answer thresholds, providers, privacy/retention, editorial ownership) and the only content is
clearly labelled development fixtures. See [docs/HANDOVER.md](docs/HANDOVER.md).

## Quick start (local, no external accounts needed)

```bash
npm install
npx playwright install chromium   # only for end-to-end tests
npm run seed:dev                  # creates .data/pglite, ingests content, publishes labelled dev fixtures
npm run dev                       # http://localhost:3000
```

Sign in with any email; in development the 6-digit code is written to `.dev-outbox/outbox.jsonl`
(not sent). For walkthroughs, set `DEMO_MODE=true`, `EMAIL_PROVIDER=screen`, `SMS_PROVIDER=screen` and the code
is shown on the verification screen instead (labelled as demo). To use the editorial workspace locally, start with `DEV_EDITOR_EMAILS=you@example.org npm run dev`
and sign in with that email, then open **Settings → Editorial workspace**.

Without `ANTHROPIC_API_KEY`, Ask shows retrieved sources only (clearly labelled). To enable answers:

```bash
cp .env.example .env.local   # then set ANTHROPIC_API_KEY, RETRIEVAL_PROVIDERS=corpus,wikipedia, WIKIPEDIA_USER_AGENT
```

> PGlite is single-process: stop `npm run dev` before running `seed:dev`, `content:ingest` or other scripts
> against the same `PGLITE_DIR`. Don't run `next build` / `next start` while a dev server or the e2e suite is
> running in the same folder — they share `.next`, and the dev server then reloads pages in a loop. If that
> happens: stop all servers, `npm run clean`, and retry.

## Commands

| Command | Purpose |
|---|---|
| `npm run dev` / `build` / `start` | develop / production build / serve |
| `npm test` | unit + integration + evaluation cases (Vitest, in-memory Postgres) |
| `npm run test:e2e` | Playwright journeys on mobile + desktop (starts its own seeded server on :3200) |
| `npm run lint` / `typecheck` | ESLint / TypeScript |
| `npm run db:generate` / `db:migrate` | create / apply SQL migrations |
| `npm run content:ingest` | load `content/` as draft versions (idempotent) |
| `npm run seed:dev` | ingest and auto-publish development fixtures (refused in production) |
| `npm run editor:grant -- <email> [--revoke]` | grant/revoke the editor role |
| `npm run eval [-- --retrieval-only] [-- --case id]` | live evaluation against configured providers |
| `npm run sources:check` | check source links, flag broken ones |
| `npm run maintenance:purge [-- --apply]` | provisional retention purge (dry run by default) |

## Documentation
* [docs/IMPLEMENTATION_MAP.md](docs/IMPLEMENTATION_MAP.md) — document inventory, conflicts, requirement → code map, blockers
* [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — system, data model, workflow, Ask pipeline, security
* [docs/AI_QUALITY.md](docs/AI_QUALITY.md) — answer checks, thresholds, evaluation
* [docs/DECISIONS.md](docs/DECISIONS.md) — engineering decisions and the OPEN items they touch
* [docs/LANGUAGE_READINESS.md](docs/LANGUAGE_READINESS.md) — honest status of all 11 languages
* [docs/DATA_INVENTORY.md](docs/DATA_INVENTORY.md) — every stored field, purpose, retention
* [docs/CONTENT_AUTHORING.md](docs/CONTENT_AUTHORING.md) — content files, ingestion, fixtures
* [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) — production setup and provider checklist
* [docs/HANDOVER.md](docs/HANDOVER.md) — what works, verification results, outstanding dependencies

Source documents: the BRD/PRD v0.9, IA v1.1 and Phase 1 Design `.docx` files in this folder.
