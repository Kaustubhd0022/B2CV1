# Data inventory (FR-18, NFR-04)

Every stored field has a stated purpose. Retention periods marked *provisional* are not approved (OD-05,
release gate G4); nothing is deleted automatically — `npm run maintenance:purge` is a dry run unless
`--apply` is passed.

| Store | Fields | Purpose | Personal? | Retention (current) |
|---|---|---|---|---|
| `users` | email, email_verified_at, phone, phone_verified_at, role, created_at | sign-in identifier; editor authorisation | yes | until the user deletes the account (self-service, immediate) |
| `auth_identities` | provider, provider_user_id | recognise Google/Apple sign-in | yes (pseudonymous) | deleted with the account |
| `otp_challenges` | HMAC(channel:target), HMAC(code), attempts, expiry | verify one-time codes; rate limiting | pseudonymous | purge after 1 day (provisional) |
| `sessions` | SHA-256(token), user_id, language, ask_context (≤3 Q + short answer summary), analytics_id, expiry | keep the user signed in; session language; follow-up context | yes (ask_context contains questions) | deleted on sign-out, "sign out everywhere", account deletion; expired rows purged; default TTL 14 days |
| `answer_runs` | language, risk, outcome, check results, provider/model, source URLs, coverage, latency | audit runtime answer checks (FR-12) | **no question text, no user id** | 90 days (provisional) |
| `analytics_events` | event name, allow-listed props, random session reference | measure journey stages (FR-20) | no user id, no question text | 180 days (provisional) |
| `reports` | target, category, optional details, optional answer snapshot (reporter's choice), language, status, note | correction workflow (FR-19) | not linked to an account; free text may contain whatever the reporter types (UI asks not to include personal info) | 365 days after resolution (provisional) |
| `audit_log` | actor (editor email/label), action, target | editorial accountability | editor identifiers | not purged (policy OPEN) |
| `.dev-outbox/outbox.jsonl` | email/phone + code | **development only** code delivery | yes | local file; disabled in production |
| Logs (stdout) | event names, statuses, timings | operations | no question text, tokens, codes or contact details by design | per hosting platform |

Not collected: location, interest profiles, discovery history, saved items, device fingerprints.
Question text is sent to the configured model provider and (as search queries) to Wikipedia when those
integrations are enabled — this must appear in the approved privacy notice.
