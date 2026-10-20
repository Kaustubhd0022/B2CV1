# Engineering handover — TattvaCo Phase 1

Date: 2026-10-20 · Status: **pre-release pilot build** — runs end to end locally; not deployed; launch
gates open. Everything below is from code that was run and tests that were executed in this workspace.

## A. What was built
* **Frontend** (Next.js 16, mobile-first, Living Editorial Atlas tokens): sign-in (email/phone codes,
  Google/Apple), verification, language selection (11 languages with readiness labels), Discover home
  (Ask + browse + featured connection), Explore with city search, six city pages, story page, connection
  page, source detail, Ask with streamed progress and all answer states, share sheet, share-link
  resolver, report flow, settings (account, sign out everywhere, account deletion, privacy summary),
  policies placeholder, not-found / error / loading / unavailable / other-language states.
* **Backend**: route protection with destination preservation; hashed sessions; HMAC'd one-time codes
  with attempt limits and rate limits; OAuth with PKCE/state and safe account linking; APIs for ask
  (NDJSON), reports, events, health; security headers; production boot guard.
* **Data**: 18-table PostgreSQL schema (Drizzle migrations): versioned per-language stories/connections,
  claims with epistemic status, claim→source evidence with verbatim excerpts, sources with tier and link
  status, entities, editorial reviews, audit log, reports, answer audit, analytics.
* **Knowledge & AI**: idempotent content ingestion; publish-time retrieval index (Postgres FTS); Wikipedia
  retrieval (11 languages, revision-pinned); provider-agnostic LLM layer (Claude implementation);
  query understanding; grounded generation; claim-support judge; 14 deterministic fail-closed checks;
  provisional sensitivity taxonomy; session-only follow-up context.
* **Governance**: editorial workspace (queue, item review with automated + human checklist,
  approve/publish/withdraw/correct, review history, audit log), report triage, answer-check audit,
  AI-proposed connections saved as drafts only.
* **Operations**: CLI for migrations, ingestion, editor role, live evaluation, source link checks,
  retention purge (dry-run default).

## B. What actually works (verified by execution)
| Journey | Evidence |
|---|---|
| Unauthenticated access → sign-in → back to intended page | e2e (mobile + desktop) |
| Email code sign-in; one account per identifier; wrong/expired/locked codes; rate limit | integration + e2e |
| Language selection; `<html lang>` updates; English fallback shown with banner, never silent | e2e |
| City → story → claim evidence → source detail → connection | e2e |
| Share URL contains only the published item path | e2e |
| Ask: no-model evidence-only state; insufficient evidence abstains; input validation | e2e |
| Ask with a model: 17 scenario cases through real retrieval + checks (scripted model) | integration |
| Qualified answer rendering (labels, perspectives, limits, failed checks, sources) | e2e (UI fed a representative result) |
| Report submission and editorial triage | e2e |
| Editor withdraw → correction → review (confirmations enforced) → approve → publish | e2e |
| Non-editors get 404 on `/editorial`; APIs return 401 unauthenticated | e2e |
| Fixtures hidden when `ALLOW_FIXTURE_CONTENT=false`; drafts never public | integration |
| Live Wikipedia retrieval (Hindi + English) | `npm run eval -- --retrieval-only` |
| Production refuses to boot without DATABASE_URL / AUTH_SECRET | `next start` run |
| Live answers via Groq (`openai/gpt-oss-120b`): 6 evaluation cases incl. a Hindi answer grounded in Hindi + English Wikipedia with verbatim quotes | `npm run eval` (all 6 met expectations) |

**Not verified live:** a real Claude answer (no Anthropic key), Google/Apple sign-in, Resend email, Twilio SMS,
PostgreSQL server (only embedded Postgres), deployment.

## C. Architecture
See [ARCHITECTURE.md](ARCHITECTURE.md) and [AI_QUALITY.md](AI_QUALITY.md). Single Next.js service; Postgres
via Drizzle (PGlite locally); retrieval from the editorial corpus + Wikipedia; model behind `LLMProvider`.

## D. Important files
`src/lib/db/schema.ts`, `drizzle/0000_init.sql` · `src/lib/auth/*`, `src/proxy.ts` ·
`src/lib/content/{types,workflow,checklist,ingest,repo,editorial,propose}.ts` ·
`src/lib/ai/{pipeline,retrieval,llm,checks,sensitivity,prompts,text,types}.ts` ·
`src/lib/i18n/*` · `src/app/(app)/*`, `src/app/editorial/*`, `src/app/api/*` · `src/components/*` ·
`content/` (cities, fixture catalogue, 6 stories, 3 connections) · `scripts/*` · `tests/*` ·
`.env.example`, `playwright.config.ts`, `vitest.config.ts`, `next.config.ts`, `docs/*`.

## E. Verification results (final run)
| Command | Result |
|---|---|
| `npx eslint .` | clean |
| `npx tsc --noEmit` | clean |
| `npm test` (Vitest) | 5 files, **84/84 passed** |
| `npm run test:e2e` (Playwright, mobile + desktop) | **16 passed, 2 skipped** (editorial tests intentionally run once, on desktop) |
| `next build` | succeeded, 30 routes |
| `npm run eval -- --retrieval-only` | corpus + Wikipedia retrieval working (after fixing a 429 rate-limit issue) |

One intermediate e2e run failed with a dev-server reload loop caused by a stray production server and a
stale `.next` from a concurrent build; after stopping those processes and clearing `.next` the suite
passed. Documented in the README (`npm run clean`).

## F. Setup
```bash
npm install && npx playwright install chromium
npm run seed:dev && npm run dev          # http://localhost:3000, codes in .dev-outbox/outbox.jsonl
DEV_EDITOR_EMAILS=you@example.org npm run dev   # to use the editorial workspace locally
```
Production: [DEPLOYMENT.md](DEPLOYMENT.md).

## G. Outstanding dependencies
See the final summary in the conversation and the lists below.
* **Credentials / services:** Anthropic API key; email provider (Resend or other) + verified domain;
  SMS provider (Twilio or other; India DLT registration); Google OAuth client; Apple Services ID + key;
  PostgreSQL; HTTPS hosting; Wikimedia contact User-Agent.
* **Content:** 18–24 researched, editorially approved flagship stories (6 cities); connections;
  rights-cleared images with captions; editors and reviewers.
* **Language:** native-speaker review of 10 UI catalogues (23% drafted each); translated story versions;
  per-language benchmark sets and approvers.
* **Product decisions (OPEN):** OD-01 language thresholds · OD-02 answer thresholds · OD-03 sensitive-topic
  taxonomy · OD-04 auth providers/linking · OD-05 retention/deletion & privacy notice · OD-06 story
  inventory · OD-07 oral/community source rubric · OD-08 editorial owners & audit cadence · OD-10
  performance/accessibility/cost targets · OD-11 metric targets · OD-12 launch type · OD-14 language
  persistence · OD-15 report SLA · G6 public reading of shared links.

## H. Known limitations
* Keyword retrieval only (no embeddings); Wikipedia is the only external source (tertiary).
* No answer is ever "routine-approved" until a language is added to `QUALITY_GATE_PASSED_LANGUAGES`.
* Editorial content is authored as files + ingestion; there is no in-browser editor for text.
* Single editor role; no separate reviewer/publisher permissions.
* In-memory rate limits and cache (single instance only).
* Analytics are stored but there is no reporting dashboard.
* Terms of Service / Privacy Policy pages are placeholders.
* Account deletion is immediate and self-service (policy unapproved).
* Accessibility built to WCAG 2.2 AA practices but not audited with assistive technology.

## I. Recommended next actions (by release risk)
1. Configure the model key and run `npm run eval`; audit citations by hand.
2. Commission and review the real story inventory; remove `content/fixtures/`.
3. Decide OD-01/02/03 thresholds and taxonomy; set them in env.
4. Select auth/email/SMS providers; test all four sign-in methods on a staging HTTPS domain.
5. Privacy review: retention periods, notice, deletion; then enable the purge job.
6. Native review of Hindi first, then the other nine languages, with story translations.
7. Staging deployment on PostgreSQL; shared rate-limit store if more than one instance.
8. Accessibility audit (screen readers, all 11 scripts), performance targets, monitoring.
