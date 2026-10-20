# Content authoring and ingestion

Stories, connections, sources and entities live as JSON files under `content/` and are loaded with:

```bash
npm run content:ingest        # creates DRAFT versions for new/changed content; never publishes
```

Ingestion is idempotent: unchanged versions are skipped (content hash), and any change to a body or claim
set becomes a **new draft version** that must be reviewed, approved and published in `/editorial`.

## Files
* `content/cities.json` — the six pilot cities, localised names, theme lines (`taglineReviewed: false`
  until editorially approved), image with `credit` and `rightsCleared`.
* `content/**/catalog.json` — `sources` (id, title, creator, publisher, `sourceType`
  primary|official|academic|specialist|reference|media|community|other, url or citation, language, dates,
  `assessment`) and `entities`.
* Any other `*.json` — one story or connection (`kind`, `slug`, `city`, `entities`, `versions[]`). Each
  version has `language`, optional `translationOf`, a `body` and `claims`.

Schema: `src/lib/content/types.ts` (`StoryBodySchema`, `ConnectionBodySchema`, `ClaimDefSchema`).

## Rules enforced before approval
* Every paragraph lists the claim keys it relies on; every key must exist.
* Every claim has an epistemic status and ≥ 1 `supports` evidence item with a verbatim `excerpt`, an
  optional `locator` and `limitation`.
* Every cited source exists and has a URL or a citation.
* Stories need `narrative` and `significance` sections; connections need a cited rationale, a
  `doesNotEstablish` statement and two distinct subjects.
* Reviewers confirm: sources read, epistemic labels correct, perspectives represented, language reviewed.

## Development fixtures
`content/fixtures/` contains six stories and three connections (`"fixture": true`) built from
revision-pinned Wikipedia articles. `npm run seed:dev` ingests **and** auto-publishes them for local use
with an audit entry `fixture_auto_publish`. They are labelled in every view and excluded in production
unless `ALLOW_FIXTURE_CONTENT=true`. **Remove the fixtures directory before launch.**

## AI-proposed connections
Editors can ask the model to propose a connection between two entities (`/editorial/propose`). It may only
use verbatim excerpts already in the source store; quotes are verified; the result is a draft with
`origin = ai_proposed` that follows the normal review workflow.
