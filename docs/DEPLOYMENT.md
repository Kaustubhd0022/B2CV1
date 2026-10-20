# Deployment

Nothing has been deployed. These are the steps to deploy once hosting, providers and launch gates are
approved (OD-09, OD-12).

## Requirements
* Node.js ≥ 20.9 (developed on Node 24), PostgreSQL ≥ 15, HTTPS origin (required by Apple sign-in).
* Single instance recommended for the pilot (in-memory rate limits and Wikipedia cache — D-20).

## Steps
1. Provision PostgreSQL; set `DATABASE_URL`.
2. Set environment from `.env.example`. Production refuses to start without `DATABASE_URL`, a ≥ 32-char
   `AUTH_SECRET`, and with dev-outbox delivery or the scripted model.
3. `npm ci && npm run build`
4. `npm run db:migrate` (applies `drizzle/*.sql`; production never auto-migrates).
5. `npm run content:ingest` to load editorial content as drafts (do **not** run `seed:dev`).
6. Start: `npm start` (honours `PORT`). Health check: `GET /api/health` (200 ok / 503 degraded; reports
   which integrations are configured, never their values).
7. A first editor signs in once, then `npm run editor:grant -- editor@your-domain`.
8. Review and publish content in `/editorial`.
9. Schedule `npm run sources:check` (daily) and, once retention is approved,
   `npm run maintenance:purge -- --apply`.

## Provider configuration checklist
| Integration | Needed | Where |
|---|---|---|
| Email codes | `EMAIL_PROVIDER=resend`, `RESEND_API_KEY`, verified sender domain in `EMAIL_FROM` | resend.com |
| SMS codes | `SMS_PROVIDER=twilio`, account SID, auth token, sender number (DLT registration for India) | twilio.com |
| Google | OAuth client (web); redirect URI `${APP_URL}/auth/google/callback`; scopes openid, email | Google Cloud console |
| Apple | Services ID (`APPLE_CLIENT_ID`), team ID, key ID, .p8 key; return URL `${APP_URL}/auth/apple/callback` | Apple Developer |
| Model | Either `GROQ_API_KEY` (default model `openai/gpt-oss-120b`; the free tier's 8,000 tokens/minute supports roughly one question per minute — use a paid tier for real users) or `ANTHROPIC_API_KEY` (`claude-opus-5-5`). Costs per request; budget OPEN (NFR-10) | console.groq.com · console.anthropic.com |
| Retrieval | `RETRIEVAL_PROVIDERS=corpus,wikipedia`; `WIKIPEDIA_USER_AGENT` with real contact details | — |

## Before scaling beyond one instance
Move rate limiting and the Wikipedia cache to a shared store; consider a job runner for source link checks.

## Migrations
Schema changes: edit `src/lib/db/schema.ts` → `npm run db:generate` → review SQL in `drizzle/` → commit →
`npm run db:migrate` on deploy.
