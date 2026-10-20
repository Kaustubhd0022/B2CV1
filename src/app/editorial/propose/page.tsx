import { listEntities } from "@/lib/content/editorial";
import { getProvider } from "@/lib/ai/llm";
import { Card, Notice } from "@/components/ui";
import { SubmitButton } from "@/components/submit-button";
import { proposeAction } from "../actions";

export const metadata = { title: "Propose connection" };

const ERRORS: Record<string, string> = {
  not_configured: "AI generation is not configured (set ANTHROPIC_API_KEY).",
  no_evidence: "Not enough source excerpts mention these subjects to propose anything.",
  not_viable: "The model found no supportable relationship in the evidence.",
  model_failed: "The model call failed. Try again later.",
  invalid_quotes: "The proposal quoted text that is not in the evidence, so it was discarded.",
  pick_two: "Choose two different subjects.",
};

export default async function ProposePage({ searchParams }: { searchParams: Promise<{ error?: string; detail?: string }> }) {
  const sp = await searchParams;
  const entities = await listEntities();
  const configured = !!getProvider();
  return (
    <div className="max-w-2xl">
      <h1 className="font-serif text-page font-semibold">Propose a connection (AI-assisted)</h1>
      <p className="mt-1 text-support text-muted">
        The model may only use verbatim excerpts already in the source store, must state a relationship type, rationale and what the connection does not establish, and every quote is verified. The proposal is
        saved as a draft and is never public until reviewed, approved and published by an editor.
      </p>
      {sp.error && (
        <Notice tone="error" className="mt-3" title={ERRORS[sp.error] ?? "Proposal failed"}>
          {sp.detail}
        </Notice>
      )}
      {!configured && <Notice className="mt-3">{ERRORS.not_configured}</Notice>}
      <Card className="mt-4 p-4">
        <form action={proposeAction} className="grid gap-3 sm:grid-cols-2">
          {(["from", "to"] as const).map((k) => (
            <label key={k} className="text-support font-medium">
              {k === "from" ? "Subject A" : "Subject B"}
              <select name={k} required className="mt-1 block min-h-11 w-full rounded-md border border-border bg-surface px-2">
                <option value="">Choose…</option>
                {entities.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.canonicalName} ({e.type})
                  </option>
                ))}
              </select>
            </label>
          ))}
          <div className="sm:col-span-2">
            <SubmitButton disabled={!configured}>Generate proposal draft</SubmitButton>
          </div>
        </form>
      </Card>
    </div>
  );
}
