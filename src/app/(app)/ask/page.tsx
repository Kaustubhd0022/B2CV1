import type { Metadata } from "next";
import { pageContext } from "@/lib/page";
import { clientMessages } from "@/lib/i18n/t";
import { getProvider } from "@/lib/ai/llm";
import { Notice, Page } from "@/components/ui";
import { AskClient } from "./ask-client";

export const metadata: Metadata = { title: "Ask TattvaCo" };

export default async function AskPage({ searchParams }: { searchParams: Promise<{ q?: string; context?: string }> }) {
  const { lang, t } = await pageContext();
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.slice(0, 500) : undefined;
  const context = typeof sp.context === "string" && /^(story|connection):[a-z0-9-]{1,120}$/.test(sp.context) ? sp.context : undefined;
  const messages = clientMessages(lang, ["ask.", "check.", "epistemic.", "source.type.", "source.noUrl", "source.languageDiffers", "common."]);

  return (
    <Page className="max-w-6xl pt-2">
      <div className="rounded-2xl border border-border bg-gradient-to-br from-[#1b1916] via-[#161513] to-[#111110] p-6 sm:p-8 shadow-lg">
        <div className="flex items-center gap-2 text-meta font-semibold uppercase tracking-wider text-gold">
          <span>✦</span>
          <span>AI Cultural Assistant</span>
        </div>
        <h1 className="mt-2 font-serif text-page font-semibold text-charcoal md:text-page-lg">
          {t("ask.title")}
        </h1>
        <p className="mt-1 max-w-2xl text-body text-secondary-text leading-relaxed">
          {t("ask.subtitle")} Every response is synthesized exclusively from statutory archives, research repositories and verified source material.
        </p>
      </div>

      {!getProvider() && (
        <Notice className="mt-4" tone="info">
          {t("ask.notConfigured")}
        </Notice>
      )}

      <div className="mt-8">
        <AskClient messages={messages} lang={lang} initialQuestion={q} context={context} />
      </div>
    </Page>
  );
}
