"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button, Notice } from "@/components/ui";

type Labels = Record<
  | "category"
  | "details"
  | "detailsHint"
  | "includeAnswer"
  | "submit"
  | "thanks"
  | "thanksBody"
  | "chooseCategory"
  | "tooLong"
  | "error"
  | "rateLimited"
  | "home",
  string
>;

type Snapshot = { question: string; answer: string; sources: { title: string; url: string | null }[]; outcome: string };

export function ReportForm({
  targetType,
  targetRef,
  language,
  categories,
  labels,
}: {
  targetType: string;
  targetRef: string;
  language: string;
  categories: { value: string; label: string }[];
  labels: Labels;
}) {
  const [category, setCategory] = useState("");
  const [details, setDetails] = useState("");
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [include, setInclude] = useState(true);
  const [state, setState] = useState<"idle" | "sending" | "done" | "error" | "rate">("idle");
  const [invalid, setInvalid] = useState<string | null>(null);

  // The Ask page keeps the answer in this tab's sessionStorage so it can be attached on request.
  useEffect(() => {
    if (targetType !== "answer") return;
    try {
      const raw = sessionStorage.getItem(`tc_answer_${targetRef}`);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reading browser-only storage after mount
      if (raw) setSnapshot(JSON.parse(raw));
    } catch {
      /* storage unavailable */
    }
  }, [targetType, targetRef]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!category) return setInvalid(labels.chooseCategory);
    if (details.length > 2000) return setInvalid(labels.tooLong);
    setInvalid(null);
    setState("sending");
    try {
      const res = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetType, targetRef, category, details, language, snapshot: include && snapshot ? snapshot : null }),
      });
      setState(res.ok ? "done" : res.status === 429 ? "rate" : "error");
    } catch {
      setState("error");
    }
  }

  if (state === "done")
    return (
      <Notice tone="success" role="status" title={labels.thanks} className="mt-6">
        <p>{labels.thanksBody}</p>
        <Link href="/" className="mt-2 inline-flex min-h-11 items-center font-semibold text-forest underline">
          {labels.home}
        </Link>
      </Notice>
    );

  return (
    <form onSubmit={submit} className="mt-6 space-y-5" noValidate>
      <fieldset aria-describedby={invalid ? "report-error" : undefined}>
        <legend className="font-semibold">{labels.category}</legend>
        <div className="mt-2 grid gap-2">
          {categories.map((c) => (
            <label key={c.value} className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-border bg-surface px-3 has-[:checked]:border-forest">
              <input type="radio" name="category" value={c.value} checked={category === c.value} onChange={() => setCategory(c.value)} className="size-4 accent-forest" />
              {c.label}
            </label>
          ))}
        </div>
      </fieldset>
      <label className="block">
        <span className="font-semibold">{labels.details}</span>
        <span className="block text-meta text-muted">{labels.detailsHint}</span>
        <textarea value={details} onChange={(e) => setDetails(e.target.value)} maxLength={2000} rows={4} className="mt-1 block w-full rounded-md border border-border bg-surface px-3 py-2" />
      </label>
      {snapshot && (
        <label className="flex items-start gap-3 text-support">
          <input type="checkbox" checked={include} onChange={(e) => setInclude(e.target.checked)} className="mt-1 size-4 accent-forest" />
          <span>
            {labels.includeAnswer}
            <span className="mt-1 block text-meta text-muted">“{snapshot.question}”</span>
          </span>
        </label>
      )}
      {invalid && (
        <p id="report-error" role="alert" className="text-support text-error">
          {invalid}
        </p>
      )}
      {state === "error" && <Notice tone="error" role="alert">{labels.error}</Notice>}
      {state === "rate" && <Notice tone="warning" role="alert">{labels.rateLimited}</Notice>}
      <Button type="submit" loading={state === "sending"}>
        {labels.submit}
      </Button>
    </form>
  );
}
