# B2C Cultural Discovery Engine — Implementation Backlog

Status: implementation planning baseline; created on `feat/b2c-discovery-completion`.
Scope approved by product owner: Core discovery experience; Intelligence and cultural depth; Engagement, account and trust. Preserve existing functionality and extend it. Interactive map/place detail is required. Prepare 18–24 flagship stories in parallel with UI work. Editorial workspace is out of scope. Additional features require separate approval.

## Guardrails
- Do not merge directly to `main`; use reviewable commits and pull requests.
- Do not replace existing routes or architecture without evidence that extension is insufficient.
- Do not represent fixture stories, unlicensed imagery, unconfigured providers, or untested languages as launch-ready.
- No bookings, commerce, social features, persistent personalization, saved library, location tracking, or editorial workspace changes in this scope.
- UI acceptance is separate from provider, editorial, privacy, and production launch readiness.

## Phase 0 — Reconcile deployment and code
### AUD-01 — Confirm deployed commit and environment
**Routes/files:** `docs/DEPLOYMENT.md`, `docs/HANDOVER.md`, Vercel project settings (external).
**Acceptance:** identify default branch, deployed commit SHA, production vs preview environment, build command, environment-variable names (never expose secret values), database target, and whether deployment matches repository head.
**Tests/evidence:** deployment metadata and a successful smoke check for `/`, `/explore`, `/ask`, `/settings`.
**Dependencies/blockers:** Vercel access and provider configuration. A GitHub connector cannot verify browser rendering or live deployment by itself.

### AUD-02 — Establish route/component inventory
**Known route map:** `/`, `/explore`, `/cities/[city]`, `/stories/[slug]`, `/connections/[slug]`, `/sources/[id]`, `/ask`, `/settings/*`, `/s/[kind]/[slug]`, `/report`; protected auth routes; editor-only `/editorial/*` remains out of scope.
**Acceptance:** map each approved screen/reference to existing route, components, data source, interaction and tests; mark each as implemented, partial, missing, or unverified.
**Tests/evidence:** route inventory and source-path evidence; do not infer a feature from a screenshot alone.

## Phase 1 — Shared shell and core discovery
### DISC-01 — Shared navigation, responsive layout and visual parity
**Routes/files:** `src/app/(app)/*`, `src/components/*`, `src/app/globals.css`.
**Acceptance:** preserve the existing near-black/gold design tokens; consistent header, active route, language affordance, focus states, spacing and content widths; no horizontal overflow at 360, 390, 430, 768, 1024, 1280, 1440 and 1920px; respect reduced-motion.
**Tests:** lint, typecheck, component/route tests, Playwright viewport matrix; verify all navigation links and keyboard focus.
**Dependencies:** AUD-01/AUD-02.

### DISC-02 — Discover home parity
**Routes/files:** `src/app/(app)/page.tsx` (confirm actual path before edit), shared story/city/theme components, `content/*`.
**Acceptance:** preserve Ask entry point, theme dimensions, six pilot-city cards, Stories of the Day, featured evidence-backed connection and CTA to Ask; every card/link routes to real content; fixtures display their development status.
**Tests:** route E2E for all sections, empty/loading/error states, link targets, responsive card layout.
**Dependencies:** DISC-01; content/media rights review.

### DISC-03 — Explore themes, regions and collections
**Routes/files:** `/explore` route and shared collection components; `content/*`.
**Acceptance:** all nine approved themes are discoverable; region cards and featured thematic collections link to filtered, non-empty results or an explicit empty state; no dead-end CTA; counts reflect actual available items.
**Tests:** theme/region filters, query-string state, back/forward navigation, zero-results state, accessibility.
**Dependencies:** DISC-01; data inventory.

### DISC-04 — City discovery
**Routes/files:** `/cities/[city]`, city seed/content data, story cards.
**Acceptance:** six pilot cities have consistent overview, context, thematic paths and published-story lists; only published content is presented as approved; clearly show empty states where editorial inventory is not ready.
**Tests:** six city routes, invalid city, unpublished story exclusion, image fallback and mobile layout.
**Dependencies:** DISC-02/03; editorial content stream.

## Phase 2 — Cultural intelligence and depth
### INT-01 — Story reading and evidence UX
**Routes/files:** `/stories/[slug]`, claims/evidence/source components, content workflow.
**Acceptance:** story orientation, readable sections, epistemic labels, claim-linked sources, connections, related stories, follow-up CTA, share and report controls; source link status is visible; no unsupported citation is invented.
**Tests:** approved/unapproved story access, source link integrity, epistemic labels, keyboard navigation, share/report.
**Dependencies:** DISC-04; reviewed story corpus.

### INT-02 — Ask flow, answer states and source traceability
**Routes/files:** `/ask`, `src/lib/ai/pipeline.ts`, retrieval/checks, ask API and answer components.
**Acceptance:** loading/progress, grounded answer, qualified answer, insufficient evidence/abstention, provider unavailable, retry and source states are all explicit; answers distinguish evidence, tradition, interpretation and uncertainty; follow-up context remains session-only.
**Tests:** existing eval suite plus unsupported question, conflicting sources, sensitive-topic, provider timeout, no-model and source-click tests.
**Dependencies:** configured provider for live-model verification; language quality gates remain a release blocker.

### INT-03 — Cultural connections
**Routes/files:** `/connections/[slug]`, connection data/workflow, story/answer components.
**Acceptance:** connection explains why items relate, cites evidence, names what the connection does not establish, and communicates uncertainty; proposed/unreviewed connections remain private.
**Tests:** published vs proposed access, evidence links, relationship navigation, share route.
**Dependencies:** INT-01 and editorially reviewed connection records.

### INT-04 — Interactive map and place detail (required)
**Routes/files:** create/extend place route only after inspecting current route tree; city/place data, map component, `content/*`, map provider boundary.
**Acceptance:** interactive map plots only validated coordinates; marker selection opens the matching place detail; detail shows name, location, cultural context, related approved stories and sources; map/list toggle and accessible list alternative work without map JS; loading, no-coordinate, provider failure and no-results states are handled. Do not request geolocation or track user location by default.
**Tests:** valid/invalid coordinates, marker-to-detail mapping, keyboard-accessible list alternative, provider failure, mobile viewport, no network credentials fallback.
**Dependencies/blockers:** choose provider and licensing/credentials; validate coordinates and content. Do not fabricate coordinates or claim map works until browser-tested.

## Phase 3 — Engagement, account and trust
### TRUST-01 — Settings, account and language controls
**Routes/files:** `/settings/*`, auth/session/i18n modules.
**Acceptance:** account details and sign-out controls reflect actual session; language setting persists only according to approved persistence decision; readiness status is explicit; no fake profile/history/library features are added.
**Tests:** sign-in method states, language switch, session expiry, sign-out, account deletion confirmation and retention behaviour.
**Dependencies:** provider setup and privacy decision.

### TRUST-02 — Privacy, policy, reporting and issue states
**Routes/files:** `/settings/*`, `/report`, policy pages, report API and DB.
**Acceptance:** privacy/data summaries match actual collection and retention; report categories and submission confirmation work; policies are clearly marked draft until legally/product approved; no success state without server confirmation.
**Tests:** submit report, invalid input, unavailable API, deletion path, policy link checks.
**Dependencies:** approved retention/deletion policy and named report owner/SLA.

### TRUST-03 — Share and continue discovery
**Routes/files:** share sheet, `/s/[kind]/[slug]`, story/connection pages.
**Acceptance:** share/copy produces canonical published-content URL only; no question text, session data or personal data in URL; destination handling respects account access rules; continue-discovery items are grounded in real relations.
**Tests:** clipboard fallback, Web Share unavailable, invalid/unpublished target, destination preservation.
**Dependencies:** current sharing access policy.

## Parallel editorial workstream — 18–24 flagship stories
### CONTENT-01 — Inventory and story briefs
**Files:** `content/*`, ingestion schema and source workflow.
**Acceptance:** create a tracker for 3–4 candidate flagship stories per city across Varanasi, Jaipur, Hampi, Kochi, Kolkata and Madurai; record title, theme, claims, primary/secondary sources, source excerpts, rights-cleared media needs, cultural sensitivity, reviewer and status. This is a target inventory, not a claim that stories are already approved.
**Tests/evidence:** all claims trace to sources; source links checked; no copyrighted image used without rights/permission; oral/community sources follow an approved consent and attribution rubric.
**Dependencies/blockers:** editorial owner, source access, rights clearance, native/community review as appropriate.

### CONTENT-02 — Editorial approval and ingestion
**Files:** content files and ingestion scripts/workflow; existing editorial workspace is not expanded by this ticket.
**Acceptance:** ingest only reviewed versions; preserve source attribution and epistemic status; unreviewed stories remain fixtures/drafts and do not appear as approved.
**Tests:** ingestion idempotence, published filtering, per-language version status, source-check script.
**Dependencies:** CONTENT-01 and assigned reviewer.

## Phase 4 — Cross-cutting QA and release evidence
### QA-01 — Responsive, accessibility and motion audit
**Acceptance:** keyboard-only path, visible focus, semantic headings/labels, contrast, 44px targets where applicable, reduced-motion behaviour, no clipping/overlap and no horizontal overflow at the viewport matrix.
**Tests:** Playwright plus manual screen-reader/keyboard check; report failures separately from automated checks.

### QA-02 — Regression, evaluation and production smoke
**Acceptance:** lint, typecheck, unit/integration, E2E, content source checks, AI eval and build pass; staging uses production-like PostgreSQL and configured providers; test results record commit SHA and environment.
**Blockers:** cannot be declared passed by repository inspection alone; requires execution and deployment access.

## Additional features — NOT APPROVED / do not implement
Potentially useful future proposals, each requiring separate approval: geolocation-based discovery, saved stories/library, persistent personalization/history, user-contributed content, social/community features, bookings/commerce, offline mode, editorial workspace expansion, and additional map layers/trail planning. These are intentionally excluded from the current implementation.
