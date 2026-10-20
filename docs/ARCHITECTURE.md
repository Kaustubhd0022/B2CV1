# Architecture (as implemented)

```
Browser ──► src/proxy.ts (session-cookie gate, destination preservation)
              │
              ▼
        Next.js 16 App Router (single Node service)
        ├─ Pages (server components)      src/app/(app)/*, sign-in, language, policies
        ├─ Editorial workspace (editor)   src/app/editorial/*
        ├─ Route handlers                 /api/ask (NDJSON stream) /api/report /api/events /api/health
        │                                 /auth/[provider](/callback)  /language/select
        └─ Server libraries               src/lib/*
              ├─ auth/      sessions (hashed tokens), OTP (HMAC'd codes), OAuth (Arctic), delivery
              ├─ content/   schema (zod), repo (published-only reads), workflow, checklist, ingest, propose
              ├─ ai/        pipeline · retrieval · llm (provider boundary) · checks · sensitivity · prompts
              ├─ i18n/      11-language registry, catalogues, readiness
              └─ db/        Drizzle schema + client (Postgres | PGlite)
                     │
                     ▼
              PostgreSQL (prod) / PGlite (dev, tests)        External (optional, configured by env):
              18 tables, migrations in drizzle/              Anthropic API · Wikipedia API · Resend · Twilio
                                                             Google / Apple OAuth
```

## Data model (`src/lib/db/schema.ts`)

| Area | Tables | Notes |
|---|---|---|
| Accounts | `users`, `auth_identities`, `otp_challenges`, `sessions` | Only identifiers needed for sign-in. OTP target/code stored as HMACs; session tokens as SHA-256. Session row holds session language + session-only AI context. |
| Knowledge | `cities`, `entities`, `sources`, `content_items`, `content_versions`, `item_entities`, `claims`, `claim_evidence` | Stories and connections are versioned per language. Claims carry an epistemic status and are linked to source excerpts. A partial unique index guarantees ≤1 published version per item + language. |
| Retrieval | `corpus_passages` (generated `tsvector`, GIN index) | Built at publish time from published paragraphs and verbatim evidence excerpts; removed on withdraw/supersede. |
| Governance | `editorial_reviews`, `audit_log`, `reports`, `answer_runs` | Review decisions with reviewer/time/checklist; append-only audit; anonymous reports; answer check audit without question text or user id. |
| Analytics | `analytics_events` | Allow-listed events and props; random per-session reference, no user id. |

## Editorial workflow
`draft → in_review → (changes_requested ↺) → approved → published → withdrawn`, plus *correction* (new
draft version from any approved/published/withdrawn version). Approval requires the editor role, a
passing automated checklist (structure, claim references resolve, every claim supported, sources exist
and are locatable, narrative + significance present; for connections: cited rationale, "does not
establish", distinct subjects) **and** four reviewer confirmations. Every transition writes
`editorial_reviews` and `audit_log`.

Content enters as files under `content/` via `npm run content:ingest` (idempotent; any change becomes a
new draft). See [CONTENT_AUTHORING.md](CONTENT_AUTHORING.md).

## Ask pipeline (`src/lib/ai/pipeline.ts`)
1. **Validate** input (3–500 chars). **Classify** sensitivity deterministically.
2. **Understand** (model, optional): scope, risk (can only raise), standalone question for follow-ups using session context, English + native search queries.
3. High-risk → abstain. Out of scope → abstain.
4. **Retrieve** from configured providers with timeouts; dedupe; weight by source tier; rank. All providers failed → `failed`.
5. No model configured → `evidence_only` (passages shown directly) or abstain if insufficient.
6. Retrieval insufficient → abstain *before* calling the model.
7. **Generate** structured draft: every point has passage citations + verbatim quotes; epistemic label; perspectives on conflict; limitations; follow-ups.
8. **Judge** (optional model pass): may only remove points / summary / perspectives.
9. **Validate** deterministically (`checks.ts`) and decide the outcome (fail-closed).
10. Persist `answer_runs`, stream result, store a short context turn on the session.

Outcomes: `routine_approved` (every mandatory check passed) · `qualified` (shown with limitations, only
supported statements) · `abstained` (insufficient evidence / sensitive / out of scope) · `evidence_only` ·
`failed` (retrieval or model failure, retry offered). Details: [AI_QUALITY.md](AI_QUALITY.md).

## Frontend
Mobile-first; bottom navigation on mobile (Discover · Explore · Ask · Settings), inline header nav on
desktop; desktop story/connection pages add a sticky sources side panel. Design tokens from the Design
System v1.0 in `src/app/globals.css`. Components in `src/components/`. Every screen's loading, empty,
error, unavailable and unsupported-language states are implemented (see IMPLEMENTATION_MAP.md §5).

## Security notes
httpOnly SameSite=Lax session cookie; Apple OAuth state cookie SameSite=None+Secure (form_post);
OAuth state + PKCE (Google); open-redirect protection (`safeNext`); server-side role checks for editorial
actions (server actions call `requireEditor`); zod validation on every input; rate limits on OTP (per
identifier), Ask (per session/minute and per user/day), reports and events; security headers in
`next.config.ts`; production boot refuses unsafe configuration (`src/instrumentation.ts`). Prompts treat
retrieved passages as untrusted data. Secrets never reach the client bundle (all provider code is
`server-only`).
