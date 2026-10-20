# AI answer quality controls

Runtime governance for Ask TattvaCo (PRD FR-07…FR-12, §9.2–9.3, Appendix B; IA §2).
**All thresholds are provisional** (OD-02) and configurable in `.env`.

## Mandatory checks (`src/lib/ai/checks.ts`)
Each check returns `pass | fail | indeterminate | not_applicable`. An answer is **routine-approved only if
every mandatory check passes**. Any `fail` or `indeterminate` → *qualified* (only supported statements shown,
limits and non-passing checks listed) or *abstained*.

| Check | What it verifies | Deterministic? |
|---|---|---|
| `retrieval_sufficiency` | ≥ `ANSWER_MIN_PASSAGES` passages with query-term coverage ≥ `ANSWER_MIN_PASSAGE_SCORE` | yes |
| `citation_existence` | every cited passage id was actually retrieved | yes |
| `quote_grounding` | each point carries a quote that appears **verbatim** in a passage it cites (≥ 15 chars); otherwise the point is removed | yes |
| `claim_support_judge` | a second model pass judges statement-vs-evidence support; can only remove; unavailable → `indeterminate` | model (advisory, removal-only) |
| `evidence_coverage` | supported points / drafted points ≥ `ANSWER_MIN_COVERAGE`; below `ANSWER_ABSTAIN_BELOW_COVERAGE` → abstain | yes |
| `epistemic_consistency` | points whose evidence speaks of legend/belief may not be labelled "documented" (relabelled to tradition) | yes |
| `summary_support` | summary cites passages that ground retained points (and passes the judge) — otherwise summary hidden | yes (+judge) |
| `conflict_handling` | if conflict is reported, ≥ 2 attributed, cited perspectives | yes |
| `uncertainty_communication` | hedged/contested points or partial coverage require stated limitations | yes |
| `sensitivity` | routine topics pass; sensitive topics never routine-approve; high-risk abstain | yes (+model can raise) |
| `language_script` | share of letters in the selected language's script ≥ `ANSWER_MIN_SCRIPT_RATIO` | yes |
| `language_quality_gate` | the language is listed in `QUALITY_GATE_PASSED_LANGUAGES` (none by default) | config |
| `no_fabricated_links` | model text contains no URLs (all links come from retrieved records) | yes |
| `completeness` | summary and ≥ 1 supported point | yes |

The model's self-assessment is never the sole proof: grounding, citation existence and coverage are
checked against the retrieved text itself. Sources shown to users come only from retrieval records, with
revision-pinned URLs for Wikipedia and internal links for TattvaCo content.

## Evaluation
* `tests/eval/cases.ts` — 17 reviewable cases: supported, language gate not passed, insufficient (model
  declines / nothing relevant retrieved), fabricated quote, invalid passage id, conflicting sources,
  sensitive, high-risk, out-of-scope, Hindi answer, wrong-language answer, retrieval failure, provider
  failure, refusal, judge unavailable, malformed model output; plus malformed user inputs.
* `npm test` runs them through the **real** retrieval and validation code with a scripted model
  (`tests/integration/ask-pipeline.test.ts`) and asserts invariants (no routine approval with failing
  checks; every shown point has a source; every shown source is traceable).
* `npm run eval` runs the same questions against the **live** configured model and writes
  `eval-report.json` for human citation audit. Without a model it runs `--retrieval-only`.

Passing these does not establish factual correctness. Launch requires human-audited benchmark sets in all
11 languages with approved numeric targets (PRD §13.4, OD-01, OD-02, OD-11).

## Provisional sensitive-topic taxonomy (OD-03)
`src/lib/ai/sensitivity.ts`: *high-risk* — ranking/denigrating religions, castes or communities;
adjudicating live site disputes. *Sensitive* — caste and social hierarchy; communal violence and
partition; contested histories and sites; sacred/restricted practice; health claims of traditional
remedies; whether beliefs are literally true. Needs review by the product owner and cultural advisers.
