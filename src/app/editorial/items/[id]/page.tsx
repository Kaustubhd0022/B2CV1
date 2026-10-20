import Link from "next/link";
import { notFound } from "next/navigation";
import { itemDetail } from "@/lib/content/editorial";
import { checklistFor } from "@/lib/content/workflow";
import { HUMAN_CHECKS } from "@/lib/content/checklist";
import { claimsForVersion } from "@/lib/content/repo";
import { getDb } from "@/lib/db/client";
import { translator } from "@/lib/i18n/t";
import type { ConnectionBody, StoryBody } from "@/lib/content/types";
import { ClaimedParagraph } from "@/components/evidence";
import { Card, Notice } from "@/components/ui";
import { SubmitButton } from "@/components/submit-button";
import { approveAction, correctionAction, publishAction, requestChangesAction, submitAction, withdrawAction } from "../../actions";

export const metadata = { title: "Review" };

const ERRORS: Record<string, string> = {
  checklist_failed: "The automated checklist failed — fix the content file and re-ingest to create a new draft.",
  human_checks_missing: "All reviewer confirmations are required to approve.",
  bad_state: "That action is not allowed in the version's current status.",
  forbidden: "Only editors can do that.",
  notes_required: "A reason is required to withdraw published content.",
  not_found: "Version not found.",
};

export default async function ItemReview({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ v?: string; error?: string; detail?: string; ok?: string }> }) {
  const { id } = await params;
  const sp = await searchParams;
  const d = await itemDetail(id);
  if (!d) notFound();
  const version = d.versions.find((v) => v.id === sp.v) ?? d.versions[0];
  if (!version) notFound();
  const db = await getDb();
  const [checklist, claims] = await Promise.all([checklistFor(db, version.id), claimsForVersion(version.id)]);
  const t = translator("en");
  const hidden = (
    <>
      <input type="hidden" name="itemId" value={d.item.id} />
      <input type="hidden" name="versionId" value={version.id} />
    </>
  );
  const isStory = d.item.kind === "story";
  const body = version.body as StoryBody & ConnectionBody;
  const publicHref = `/${isStory ? "stories" : "connections"}/${d.item.slug}`;

  return (
    <div>
      <Link href="/editorial/items" className="text-support text-forest underline">
        ← All content
      </Link>
      <h1 className="mt-2 font-serif text-page font-semibold">{body.title}</h1>
      <p className="text-meta text-muted">
        {d.item.kind} · {d.item.slug} {d.item.citySlug ? `· ${d.item.citySlug}` : ""} · origin: {d.item.origin}
        {d.item.isFixture ? " · DEVELOPMENT FIXTURE" : ""}
      </p>
      {sp.error && (
        <Notice tone="error" role="alert" className="mt-3" title={ERRORS[sp.error] ?? "Action failed"}>
          {sp.detail}
        </Notice>
      )}
      {sp.ok && (
        <Notice tone="success" role="status" className="mt-3">
          {sp.ok === "proposed" ? "AI proposal saved as a draft. It is not public." : "Done."}
        </Notice>
      )}

      <div className="mt-4 flex flex-wrap gap-2 text-meta">
        {d.versions.map((v) => (
          <Link key={v.id} href={`?v=${v.id}`} className={`rounded-full border px-3 py-1 ${v.id === version.id ? "border-forest bg-forest text-on-forest" : "border-border bg-surface"}`}>
            {v.language} v{v.versionNo} · {v.status}
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <Card className="p-5">
          <p className="text-meta text-muted">
            Created by {version.createdBy} · {version.createdAt.toISOString().slice(0, 16)}
            {version.approvedAt ? ` · approved ${version.approvedAt.toISOString().slice(0, 16)}` : ""}
            {version.translationOf ? ` · translation of ${version.translationOf}` : ""}
          </p>
          {isStory ? (
            <>
              <p className="mt-2 text-body text-muted">{body.orientation}</p>
              {body.sections.map((s) => (
                <section key={s.id} className="mt-5">
                  <h2 className="font-serif text-card font-semibold">
                    {s.heading} <span className="text-meta font-normal text-muted">({s.kind})</span>
                  </h2>
                  {s.paragraphs.map((p, i) => (
                    <ClaimedParagraph key={i} text={p.text} claimKeys={p.claims} claims={claims} t={t} from={`story:${d.item.slug}`} />
                  ))}
                </section>
              ))}
            </>
          ) : (
            <>
              <p className="mt-2 text-body">
                <strong>{body.from.label}</strong> — {body.relationshipType} — <strong>{body.to.label}</strong>
              </p>
              <p className="mt-2 text-muted">{body.summary}</p>
              <h2 className="mt-4 font-semibold">Rationale</h2>
              {body.rationale.map((p, i) => (
                <ClaimedParagraph key={i} text={p.text} claimKeys={p.claims} claims={claims} t={t} from={`connection:${d.item.slug}`} />
              ))}
              <h2 className="mt-4 font-semibold">Why it matters</h2>
              {body.whyItMatters.map((p, i) => (
                <p key={i} className="mt-1">
                  {p.text}
                </p>
              ))}
              <h2 className="mt-4 font-semibold">Does not establish</h2>
              <p className="mt-1">{body.doesNotEstablish}</p>
            </>
          )}
        </Card>

        <div className="space-y-4">
          <Card className="p-4">
            <h2 className="font-semibold">Automated checklist</h2>
            <ul className="mt-2 space-y-1 text-support">
              {checklist.map((c) => (
                <li key={c.id} className={c.ok ? "text-success" : "text-error"}>
                  {c.ok ? "✓" : "✗"} {c.id.replace(/_/g, " ")} {c.detail && !c.ok ? <span className="block text-meta">{c.detail}</span> : null}
                </li>
              ))}
            </ul>
          </Card>

          <Card className="p-4">
            <h2 className="font-semibold">Actions · {version.status}</h2>
            {(version.status === "draft" || version.status === "changes_requested") && (
              <form action={submitAction} className="mt-3">
                {hidden}
                <SubmitButton>Submit for review</SubmitButton>
              </form>
            )}
            {version.status === "in_review" && (
              <>
                <form action={approveAction} className="mt-3 space-y-2">
                  {hidden}
                  <fieldset className="space-y-2 text-support">
                    <legend className="font-semibold">Reviewer confirmations</legend>
                    {HUMAN_CHECKS.map((h) => (
                      <label key={h.id} className="flex items-start gap-2">
                        <input type="checkbox" name={`hc_${h.id}`} className="mt-1 size-4 accent-forest" />
                        {h.label}
                      </label>
                    ))}
                  </fieldset>
                  <textarea name="notes" placeholder="Approval notes (optional)" className="w-full rounded-md border border-border p-2 text-support" />
                  <SubmitButton disabled={checklist.some((c) => !c.ok)}>Approve this version</SubmitButton>
                </form>
                <form action={requestChangesAction} className="mt-4 space-y-2 border-t border-border pt-3">
                  {hidden}
                  <textarea name="notes" required placeholder="What needs to change?" className="w-full rounded-md border border-border p-2 text-support" />
                  <SubmitButton variant="secondary">Request changes</SubmitButton>
                </form>
              </>
            )}
            {version.status === "approved" && (
              <form action={publishAction} className="mt-3">
                {hidden}
                <SubmitButton>Publish</SubmitButton>
                <p className="mt-1 text-meta text-muted">Publishing supersedes any currently published {version.language} version.</p>
              </form>
            )}
            {version.status === "published" && (
              <>
                <Link href={publicHref} className="mt-3 inline-block text-support text-forest underline">
                  View public page
                </Link>
                <form action={withdrawAction} className="mt-3 space-y-2">
                  {hidden}
                  <textarea name="notes" required minLength={5} placeholder="Reason for withdrawal (recorded)" className="w-full rounded-md border border-border p-2 text-support" />
                  <SubmitButton variant="secondary">Withdraw</SubmitButton>
                </form>
              </>
            )}
            {["published", "withdrawn", "superseded", "approved"].includes(version.status) && (
              <form action={correctionAction} className="mt-3 border-t border-border pt-3">
                {hidden}
                <SubmitButton variant="secondary">Open correction (new draft)</SubmitButton>
                <p className="mt-1 text-meta text-muted">Material edits always create a new version that needs full re-review.</p>
              </form>
            )}
          </Card>

          <Card className="p-4">
            <h2 className="font-semibold">Review history</h2>
            <ul className="mt-2 space-y-2 text-meta">
              {d.reviews.map(({ r, email }) => (
                <li key={r.id}>
                  <strong>{r.decision}</strong> · {email ?? "system"} · {r.createdAt.toISOString().slice(0, 16)}
                  {r.notes ? <span className="block text-muted">{r.notes}</span> : null}
                </li>
              ))}
            </ul>
          </Card>
          <Card className="p-4">
            <h2 className="font-semibold">Audit log</h2>
            <ul className="mt-2 space-y-1 text-meta">
              {d.audit.map((a) => (
                <li key={a.id}>
                  {a.createdAt.toISOString().slice(0, 16)} · {a.actorLabel} · {a.action}
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
