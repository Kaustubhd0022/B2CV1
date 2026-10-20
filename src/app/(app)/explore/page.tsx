import type { Metadata } from "next";
import { pageContext } from "@/lib/page";
import { cityStoryCounts, listCities, localName } from "@/lib/content/repo";
import { CityCard } from "@/components/cards";
import { IconSearch } from "@/components/icons";
import { Notice, Page } from "@/components/ui";

export const metadata: Metadata = { title: "Explore places" };

export default async function ExplorePage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { lang, t } = await pageContext();
  const q = ((await searchParams).q ?? "").trim().slice(0, 60);
  const [cities, counts] = await Promise.all([listCities(), cityStoryCounts(lang)]);
  const needle = q.toLocaleLowerCase();
  // Search matches the city's name in any launch language and its theme line.
  const shown = needle
    ? cities.filter((c) => [...Object.values(c.names), ...Object.values(c.taglines)].some((v) => v.toLocaleLowerCase().includes(needle)))
    : cities;

  return (
    <Page>
      <h1 className="mt-4 font-serif text-page font-semibold md:text-page-lg">{t("explore.title")}</h1>
      <p className="mt-1 text-body text-muted">{t("explore.intro")}</p>

      <form method="get" role="search" className="mt-5 flex max-w-md items-center gap-2">
        <label htmlFor="city-search" className="sr-only">
          {t("explore.search")}
        </label>
        <div className="relative flex-1">
          <IconSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" width={18} height={18} />
          <input id="city-search" name="q" defaultValue={q} placeholder={t("explore.search")} className="glass block w-full min-h-12 rounded-full py-2 pl-10 pr-4 text-charcoal placeholder:text-muted" />
        </div>
      </form>

      {shown.length === 0 ? (
        <Notice className="mt-6" tone="info" role="status">
          {t("explore.noMatch", { query: q })}
        </Notice>
      ) : (
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((c) => {
            const n = counts.get(c.slug);
            return (
              <li key={c.slug}>
                <CityCard
                  href={`/cities/${c.slug}`}
                  name={localName(c.names, lang)}
                  tagline={c.taglines[lang] ?? c.taglines.en}
                  taglineNote={c.taglineReviewed ? undefined : t("common.illustrative")}
                  image={c.image}
                  badge={t("city.label")}
                  meta={t("lang.storiesAvailable", { count: n?.inLang ?? 0 })}
                />
              </li>
            );
          })}
        </ul>
      )}
      <p className="mt-8 text-meta text-muted">{t("explore.pilotNote")}</p>
    </Page>
  );
}
