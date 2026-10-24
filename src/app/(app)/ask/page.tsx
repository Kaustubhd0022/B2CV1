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
    <Page className="max-w-6xl py-4 sm:py-6">
      {!getProvider() && (
        <Notice className="mb-6" tone="info">
          {t("ask.notConfigured")}
        </Notice>
      )}

      <AskClient messages={messages} lang={lang} initialQuestion={q} context={context} />
    </Page>
  );
}
