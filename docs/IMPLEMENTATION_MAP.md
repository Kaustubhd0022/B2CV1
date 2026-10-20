# TattvaCo Phase 1 — Requirement-to-Implementation Map

Status: working engineering map, created 2026-10-20 from the three supplied documents.
It records how each requirement is implemented and which product decisions remain open.
It does **not** approve any OPEN item. Where an OPEN item had to be given a working
behaviour, that behaviour is a configurable, reversible default and is listed in
[DECISIONS.md](DECISIONS.md).

## 1. Document inventory

| File | Version / status | Purpose | Governs |
|---|---|---|---|
| `TattvaCo_Phase1_Consolidated_BRD_PRD_v0.9.docx` | Draft v0.9, 20 Oct 2026. Confirmed decisions + OPEN items marked | Product source of truth | Scope, BR-01..13, FR-01..20, NFR-01..12, AI/data concepts (§9), governance, open decisions OD-01..16, decision log |
| `TattvaCo_Phase1_Information_Architecture_Refined_v1.1.docx` | v1.1, 20 Oct 2026. "IA DEFAULT" = recommendation | Screen hierarchy, navigation, flows, state rules | Screens A01–E05, navigation rules, flows 5.1–5.5, release gates G1–G8 |
| `TattvaCo — Phase 1 Design.docx` | Wireframe spec + visual strategy + Design System v1.0 ("proposed baseline") | Screen wireframes 01–13, visual direction, tokens, components | Layout, copy patterns, colour/type/spacing tokens, component library, responsive rules |

The design document embeds 13 images: four direction mood-boards, a principles graphic,
and city/story photographs (Varanasi ×3, Jaipur, Hampi, Kochi, an Adalaj-style stepwell
used as a "story card" example captioned `mindtrip.ai`). **Usage rights for these images are
not documented**; the design doc itself says shipped images need verified rights, captions and
relevance. They are used only as development placeholders, labelled as such (see DECISIONS D-11).

No separate technical specification, Figma file, or approved story inventory was supplied.

## 2. Precedence applied

1. Confirmed decisions (PRD decision log §18, IA §1) → 2. PRD FRs/acceptance criteria →
3. IA flows and IA defaults → 4. Wireframes → 5. Design System v1.0 (proposed) → 6. notes.

## 3. Conflicts and tensions found

| # | Tension | Resolution used |
|---|---|---|
| C1 | Design §1 proposes bottom nav **Discover / Explore / Ask / Settings**; IA has no nav spec beyond "Browse and Ask are equal". | Implemented the 4-item nav (it is consistent with IA). Connections reachable from stories/answers (design note). |
| C2 | Home wireframe offers three entry points (browse, ask, *follow a connection*); IA says Browse and Ask are equal primary entry points. | Both satisfied: Ask composer + city browse + one featured verified connection. |
| C3 | Shared link must open intended content, but an account is required (OPEN G6). | Default: shared URL → sign-in → return to same destination. No public read. Configurable later. |
| C4 | PRD "11 languages full core journey" is CONFIRMED, while thresholds/workflow are OPEN and PRD §20 says "not build-ready for release". | Architecture supports all 11; every language carries an explicit readiness status; nothing is labelled quality-gated because no gate is defined (OD-01). |
| C5 | Routine answers "auto-approved only if all checks pass" yet thresholds/language gates are OPEN. | Fail-closed: with no language gate passed, answers render as *qualified* (shown with limitations), never as routine-approved. Thresholds configurable, marked provisional. |
| C6 | Report categories differ: PRD FR-19 lists 4 (factual, source, cultural context, translation); Design Screen 11 lists 6. | Used the Design 6 (superset that maps onto the PRD 4); mapping stored in code. |
| C7 | Master build prompt suggests FastAPI backend; PRD §10.3 says no stack is approved and to prefer solo-builder feasibility. | Single Next.js (TypeScript) service; rationale in D-01. |
| C8 | Design §4 recommends shadcn/ui; not a requirement. | Small set of hand-built accessible components using the tokens; no extra UI framework. |

## 4. Requirement → implementation map

| Req | Implementation | Verification |
|---|---|---|
| FR-01 Mandatory account | `src/proxy.ts` redirects unauthenticated requests with `?next=`; `requireUser()` in every protected page; DB sessions expire; sign-out deletes session | `tests/integration/auth.test.ts`, e2e |
| FR-02 Four methods | Email OTP + phone OTP (`src/lib/auth/otp.ts`), Google + Apple OAuth (`src/lib/auth/oauth.ts`, Arctic). Delivery/OAuth providers configured by env; unconfigured methods render as unavailable, never simulated | integration + e2e (email via dev outbox) |
| FR-03 11 languages | `src/lib/i18n/*`: language registry, UI catalogues, per-language readiness; per-language content versions; source-language labels | unit + e2e |
| FR-04 Hybrid home | `src/app/(app)/page.tsx` — composer + cities + featured verified connection | e2e |
| FR-05 Six cities | `cities` table seeded with the six confirmed cities; city pages list published stories only | integration |
| FR-06 Story page | `src/app/(app)/stories/[slug]` renders approved template: orientation, sections, epistemic labels, claim-linked sources, connections, follow-up, share, report | e2e |
| FR-07 Open-domain Q&A | `src/lib/ai/pipeline.ts` — retrieval (corpus + Wikipedia, configurable) → generation (Claude, structured output) → checks → render | eval suite |
| FR-08 Tiered sources | `source_type` + `tier` on every source; tier influences ranking only; checks require claim-level quote support, never domain reputation alone | unit |
| FR-09 Traceability | Claims → `claim_evidence` → sources (stories); answer points → passage IDs → verbatim-quote grounding (answers) | unit + eval |
| FR-10 Epistemic labels | `epistemic` enum on claims/answer points; rendered as text labels (not colour only) | unit |
| FR-11 Sensitive topics | `src/lib/ai/sensitivity.ts` provisional taxonomy + model risk label; max wins; sensitive → stricter handling, high-risk → abstain | eval |
| FR-12 Auto-approval | `src/lib/ai/checks.ts` — each check returns pass/fail/indeterminate/n.a.; any non-pass mandatory → not routine-approved; audit row in `answer_runs` without question text or user id | unit |
| FR-13 Editorial approval | `content_versions.status` workflow, partial unique index (one published per item+language), reviews table, audit log; material edits create a new draft version | integration |
| FR-14 Connections | Connection items: type, rationale, evidence, does-not-establish, uncertainty; AI proposals stored as `proposed`, never public | integration |
| FR-15 Continue discovery | Story → connections/related stories; answer → only stories actually retrieved for the answer, with stated rationale | e2e |
| FR-16 Share links | `/s/story/<slug>`, `/s/connection/<slug>` canonical URLs; Web Share API + copy fallback; no session data in URL | e2e |
| FR-17 Session-only context | Ask context stored on the session row only; deleted with the session; new session starts empty | integration |
| FR-18 Minimal data | `docs/DATA_INVENTORY.md`; users table holds only identifiers needed for auth; tokens hashed | review |
| FR-19 Reporting | `/report` flow + `reports` table + editorial queue with statuses | integration + e2e |
| FR-20 Analytics | `analytics_events` allow-listed events, no user id, no question text | unit |
| NFR-02 Reliability | Retrieval/LLM timeouts, typed error handling, retry UI; no blank failure states | eval (failure fixtures) |
| NFR-03 Security | httpOnly/SameSite cookies, hashed tokens/OTPs, server-side role checks, input validation (zod), rate limits, CSP-safe headers | integration |
| NFR-05 Accessibility | Semantic HTML, focus rings, 44px targets, labels, reduced-motion | manual + e2e smoke |
| NFR-12 Content integrity | Public queries filter `status='published'`; fixture content excluded in production unless explicitly allowed | integration |

## 5. Screen map (IA §6)

A01 `/sign-in` · A02 `/sign-in/verify` · A03 recovery = re-verification via OTP (no passwords exist) · A04 `/language` ·
H01 `/` · B01 `/explore` · B02 `/cities/[city]` · S01 `/stories/[slug]` · Q01–Q03, ST01, ST02 `/ask` ·
C01 `/connections/[slug]` · R01 `/sources/[id]` · SH01 share sheet component · SH02 `/s/[kind]/[slug]` ·
RP01 `/report` · ST03 `not-found`/`error` boundaries + unavailable states · Settings `/settings/*` ·
E01–E05 `/editorial/*` (editor role only, not in public nav).

## 6. Genuine blockers (external — cannot be resolved in code)

1. **Story inventory and researched content (OD-06).** No approved stories exist. The build ships the full content
   pipeline plus a small set of *clearly labelled development fixtures*; 18–24 editorially approved stories must come from editors.
2. **Provider credentials (OD-04, OD-09).** No LLM key, SMS provider, email provider, Google or Apple OAuth credentials
   are available. Each integration is implemented behind a boundary and reports itself as "not configured".
3. **Language quality gates (OD-01).** No thresholds, reviewers or validated translations exist; UI translations
   provided are unreviewed drafts and labelled so.
4. **Privacy/retention policy (OD-05, G4).** Retention periods are configurable placeholders; no irreversible policy chosen.
5. **Sensitive-topic taxonomy (OD-03).** A provisional taxonomy is implemented and flagged as provisional.
6. **Hosting/production Postgres.** No Docker daemon or database server was available locally; the app runs on embedded
   PGlite for development/tests and on PostgreSQL via `DATABASE_URL` in production.
