import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { pageContext } from "@/lib/page";
import { cityStories, getCity, localName } from "@/lib/content/repo";
import { languageInfo } from "@/lib/i18n/languages";
import { track } from "@/lib/analytics";
import { StoryCard } from "@/components/cards";
import { Notice, Page, SectionTitle } from "@/components/ui";
import { PhotoHero } from "@/components/hero";

export async function generateMetadata({ params }: { params: Promise<{ city: string }> }): Promise<Metadata> {
  const c = await getCity((await params).city);
  return { title: c ? c.names.en : "City" };
}

export default async function CityPage({ params, searchParams }: { params: Promise<{ city: string }>; searchParams: Promise<{ all?: string }> }) {
  const { session, lang, t } = await pageContext();
  const { city: slug } = await params;
  const city = await getCity(slug);
  if (!city) notFound();
  const showOther = (await searchParams).all === "1";
  const [stories, storiesAny] = await Promise.all([cityStories(slug, lang), cityStories(slug, lang, true)]);
  const list = showOther ? storiesAny : stories;
  const name = localName(city.names, lang);
  await track("city_view", { city: slug }, session.analyticsId);

  return (
    <Page className="pt-0 sm:pt-4">
      <PhotoHero image={city.image} back={{ href: "/explore", label: t("explore.title") }} eyebrow={t("city.label")} title={name}>
        {(city.taglines[lang] ?? city.taglines.en) && (
          <>
            {city.taglines[lang] ?? city.taglines.en}
            {!city.taglineReviewed && <span className="block text-meta italic text-white/65">{t("common.illustrative")}</span>}
          </>
        )}
      </PhotoHero>

      <section className="mt-8" aria-labelledby="stories-title">
        <h2 className="text-card font-semibold">{t("city.startTitle")}</h2>
        <p className="text-support text-muted">{t("city.startIntro")}</p>
        <div className="mt-6">
          <SectionTitle id="stories-title">{t("city.stories")}</SectionTitle>
        </div>

        {list.length === 0 && storiesAny.length === 0 && (
          <Notice className="mt-4" role="status">
            {t("city.empty", { city: name })}
          </Notice>
        )}
        {list.length === 0 && storiesAny.length > 0 && (
          // Never silently substitute another language: explain, and let the user choose.
          <Notice className="mt-4" role="status" title={t("city.emptyLanguage", { city: name, language: languageInfo(lang).native })}>
            <Link href={`/cities/${slug}?all=1`} className="inline-flex min-h-11 items-center font-semibold text-forest underline underline-offset-4">
              {t("city.showOther")}
            </Link>
          </Notice>
        )}

        <ul className="mt-4 grid gap-4 md:grid-cols-2">
          {list.map((s) => (
            <li key={s.slug}>
              <StoryCard
                href={`/stories/${s.slug}${s.language !== lang ? "?all=1" : ""}`}
                title={s.title}
                summary={s.orientation}
                meta={t("city.storyMeta")}
                languageNote={s.language !== lang ? languageInfo(s.language).native : undefined}
                fixtureLabel={s.isFixture ? t("common.devFixture") : undefined}
              />
            </li>
          ))}
        </ul>
      </section>
    </Page>
  );
}
