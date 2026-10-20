# Language readiness (FR-03, release gate G1)

The architecture supports all 11 confirmed launch languages end to end (UI, story/connection versions per
language with source-language links, answers in the selected language, script checks, source-language
labels, Noto fonts for every script, `lang` attributes). **No language has passed a quality gate** — the
thresholds, test set and approver (OD-01) do not exist yet — so the product labels every language as a
preview and never marks answers routine-approved until `QUALITY_GATE_PASSED_LANGUAGES` is set.

| Language | UI strings | UI review | Published stories | Answers | Status |
|---|---|---|---|---|---|
| English | 281/281 | authored, not formally reviewed | 6 dev fixtures | generated + checked | preview |
| Hindi · Kannada · Malayalam · Bengali · Tamil · Marathi · Telugu · Gujarati · Punjabi · Odia | 65–66/281 (core labels) | **unreviewed AI-assisted drafts** | 0 | generated in-language, script-checked, gate not passed | preview |

Behaviour when a language is incomplete (no silent English substitution):
* Missing UI strings fall back to English **with a visible banner** naming the language.
* City pages explain that no stories are approved in the language and offer an explicit "show versions in
  other languages" choice; story pages then state which language is shown.
* Answers carry a notice that the language has not passed quality review; sources in other languages are
  labelled with their original language.

To make a language launch-ready: native-speaker review of the UI catalogue
(`src/lib/i18n/messages/<code>.ts`), translated and editorially approved story/connection versions
(`translationOf` set), per-language benchmark questions in `tests/eval/cases.ts`, approved thresholds,
then add the code to `QUALITY_GATE_PASSED_LANGUAGES`.
