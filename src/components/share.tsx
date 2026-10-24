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
        aria-modal="true"
        className="m-auto w-[min(32rem,calc(100vw-2rem))] rounded-3xl border border-[#F0DCE4] bg-white p-0 text-[#20101B] shadow-2xl backdrop:bg-black/60 backdrop:backdrop-blur-sm"
        onClose={() => setCopied(false)}
      >
        <div className="p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <h2 id="share-title" className="font-serif text-section font-semibold text-[#20101B]">
              {labels.title}
            </h2>
            <button
              type="button"
              onClick={() => dialog.current?.close()}
              className="rounded-full p-1.5 text-[#5A4450] hover:text-[#20101B] hover:bg-[#FFF5F8] transition-colors"
              aria-label={labels.close}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          <div className="mt-4 rounded-xl border border-[#F0DCE4] bg-[#FFF5F8]/70 p-4">
            <p className="text-meta font-semibold uppercase tracking-[0.12em] text-amber-700">{labels.preview}</p>
            <p className="mt-1 font-serif text-card font-semibold text-[#20101B]">{title}</p>
            <p className="mt-1 text-support text-[#5A4450]">{summary}</p>
          </div>
          <label className="mt-4 block text-support font-medium text-[#20101B]">
            {labels.url}
            <input
              readOnly
              value={url}
              onFocus={(e) => e.currentTarget.select()}
              className="mt-1.5 block w-full min-h-11 rounded-lg border border-[#F0DCE4] bg-[#FFF5F8] px-3 text-support text-[#20101B] focus:border-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            />
          </label>
          <p className="mt-2 text-meta text-[#5A4450]">{labels.privacy}</p>
          <div className="mt-5 flex flex-wrap gap-2.5">
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
