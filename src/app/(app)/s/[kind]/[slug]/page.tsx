import { redirect } from "next/navigation";
import { pageContext } from "@/lib/page";
import { getConnection, getStory } from "@/lib/content/repo";
import { Unavailable } from "@/components/unavailable";

/**
 * SH02 Shared destination. Sign-in (if needed) has already happened via the proxy, with this
 * URL preserved as the destination (IA default for open item G6). Resolves only published
 * stories/verified connections; the URL never carries private context.
 */
export default async function SharedPage({ params }: { params: Promise<{ kind: string; slug: string }> }) {
  const { lang, t } = await pageContext();
  const { kind, slug } = await params;
  if (!/^[a-z0-9-]{1,120}$/.test(slug) || (kind !== "story" && kind !== "connection")) {
    return <Unavailable title={t("story.unavailable")} body={t("story.unavailableBody")} t={t} />;
  }
  const res = kind === "story" ? await getStory(slug, lang, true) : await getConnection(slug, lang, true);
  if (res.status !== "ok") {
    return <Unavailable title={kind === "story" ? t("story.unavailable") : t("connection.unavailable")} body={t("story.unavailableBody")} t={t} />;
  }
  const base = kind === "story" ? "/stories" : "/connections";
  redirect(`${base}/${slug}${res.shownLanguage !== lang ? "?all=1" : ""}`);
}
