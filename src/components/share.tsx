"use client";

import { useRef, useState } from "react";
import { IconShare } from "./icons";
import { Button } from "./ui";

type Labels = { share: string; title: string; preview: string; url: string; copy: string; copied: string; native: string; privacy: string; close: string };

/**
 * Share sheet (Screen 10). The URL is the canonical published-item link only; it never
 * includes account, question or session data. Uses the Web Share API where available,
 * with a copy-link fallback.
 */
export function ShareButton({ path, kind, title, summary, labels }: { path: string; kind: "story" | "connection"; title: string; summary: string; labels: Labels }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [copied, setCopied] = useState(false);
  // Resolved when the sheet opens, so server and client renders stay identical.
  const [url, setUrl] = useState(path);
  const [canShare, setCanShare] = useState(false);

  function open() {
    setUrl(new URL(path, window.location.origin).toString());
    setCanShare(typeof navigator.share === "function");
    dialog.current?.showModal();
  }

  function record(method: string) {
    void fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "share_click", props: { kind, method } }),
      keepalive: true,
    }).catch(() => {});
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      record("copy");
    } catch {
      setCopied(false);
    }
  }

  async function nativeShare() {
    try {
      await navigator.share({ title, url });
      record("native");
    } catch {
      /* user cancelled */
    }
  }

  return (
    <>
      <Button variant="secondary" type="button" onClick={open}>
        <IconShare width={18} height={18} /> {labels.share}
      </Button>
      <dialog
        ref={dialog}
        aria-labelledby="share-title"
        className="m-auto w-[min(32rem,calc(100vw-2rem))] rounded-lg border border-border bg-canvas p-0 text-charcoal shadow-xl backdrop:bg-black/70"
        onClose={() => setCopied(false)}
      >
        <div className="p-5">
          <h2 id="share-title" className="font-serif text-section font-semibold">
            {labels.title}
          </h2>
          <div className="mt-4 rounded-md border border-border bg-surface p-4">
            <p className="text-meta font-semibold uppercase tracking-[0.12em] text-terracotta-text">{labels.preview}</p>
            <p className="mt-1 font-serif text-card font-semibold">{title}</p>
            <p className="mt-1 text-support text-muted">{summary}</p>
          </div>
          <label className="mt-4 block text-support font-medium">
            {labels.url}
            <input readOnly value={url} onFocus={(e) => e.currentTarget.select()} className="mt-1 block w-full min-h-11 rounded-md border border-border bg-surface px-3 text-support" />
          </label>
          <p className="mt-2 text-meta text-muted">{labels.privacy}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button type="button" onClick={copy}>
              {copied ? labels.copied : labels.copy}
            </Button>
            {canShare && (
              <Button type="button" variant="secondary" onClick={nativeShare}>
                {labels.native}
              </Button>
            )}
            <Button type="button" variant="tertiary" onClick={() => dialog.current?.close()}>
              {labels.close}
            </Button>
          </div>
          <p role="status" aria-live="polite" className="sr-only">
            {copied ? labels.copied : ""}
          </p>
        </div>
      </dialog>
    </>
  );
}
