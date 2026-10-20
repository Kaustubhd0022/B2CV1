import Image from "next/image";
import Link from "next/link";
import { pageContext } from "@/lib/page";
import { cityStoryCounts, featuredConnection, listCities, localName } from "@/lib/content/repo";
import { languageInfo } from "@/lib/i18n/languages";
import { track } from "@/lib/analytics";
import { CityCard, ConnectionCard } from "@/components/cards";
import { QuestionComposer } from "@/components/composer";
import { IconExplore } from "@/components/icons";
import { Page, SectionTitle } from "@/components/ui";

const HERO = { src: "/images/dev/varanasi-hero.jpg", alt: "The riverfront of Varanasi at sunrise", credit: "Placeholder from design document — usage rights not verified" };

export default async function HomePage() {
  const { session, lang, t } = await pageContext();
  const [cities, counts, featured] = await Promise.all([listCities(), cityStoryCounts(lang), featuredConnection(lang)]);
  await track("home_view", {}, session.analyticsId);

  return (
    <Page className="pt-2">
      {/* Hero: Browse and Ask are equal entry points (IA §4); the question bar is prominent, not a blank chatbot. */}
      <section className="relative isolate overflow-hidden rounded-lg">
        <Image src={HERO.src} alt={HERO.alt} fill priority sizes="(min-width: 1024px) 960px, 100vw" className="-z-10 object-cover" />
        <div className="scrim absolute inset-0 -z-10" aria-hidden="true" />
        <div className="flex min-h-[540px] flex-col justify-between p-5 md:min-h-[560px] md:p-8">
          <div className="flex items-center gap-3">
            <span className="glass flex size-11 items-center justify-center rounded-full font-semibold text-white" aria-hidden="true">
              {(session.email ?? "T").slice(0, 1).toUpperCase()}
            </span>
            <p className="text-support text-white/85">{t("home.greeting")}</p>
          </div>
          <div>
            <p className="flex items-center gap-2 text-support text-white/85">
              <IconExplore width={18} height={18} /> {t("brand.tagline")}
            </p>
            <h1 className="mt-2 max-w-xl text-display font-semibold leading-[1.08] text-white md:text-display-lg">{t("home.headline")}</h1>
            <p className="mt-3 max-w-lg text-support text-white/80">{t("home.intro")}</p>
            <div className="mt-6 max-w-2xl">
              <QuestionComposer
                variant="hero"
                label={t("home.askTitle")}
                placeholder={t("home.askPlaceholder")}
                languageNote={`${t("home.askLanguage")} · ${languageInfo(lang).native}`}
                submitLabel={t("ask.submit")}
              />
            </div>
          </div>
        </div>
        <p className="absolute right-4 top-4 hidden max-w-48 text-right text-[11px] leading-snug text-white/55 sm:block">{HERO.credit}</p>
      </section>

      {/* City shortcut chips */}
      <nav aria-label={t("home.cities")} className="no-scrollbar -mx-4 mt-6 overflow-x-auto px-4">
        <ul className="flex w-max gap-2">
          <li>
            <Link href="/explore" className="inline-flex min-h-11 items-center rounded-full bg-forest px-5 text-support font-semibold text-on-forest">
              {t("home.allCities")}
            </Link>
          </li>
          {cities.map((c) => (
            <li key={c.slug}>
              <Link href={`/cities/${c.slug}`} className="glass inline-flex min-h-11 items-center rounded-full px-5 text-support text-charcoal hover:bg-surface-2">
                {localName(c.names, lang)}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <section className="mt-8" aria-labelledby="cities-title">
        <div className="flex items-baseline justify-between gap-3">
          <SectionTitle id="cities-title">{t("home.cities")}</SectionTitle>
          <Link href="/explore" className="inline-flex min-h-11 items-center text-support text-muted hover:text-charcoal">
            {t("home.viewAll", { count: cities.length })}
          </Link>
        </div>
        <ul className="no-scrollbar -mx-4 mt-3 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2">
          {cities.map((c, i) => {
            const n = counts.get(c.slug);
            return (
              <li key={c.slug} className="w-[68%] shrink-0 snap-start sm:w-[42%] lg:w-[23.5%]">
                <CityCard
                  href={`/cities/${c.slug}`}
                  name={localName(c.names, lang)}
                  tagline={c.taglines[lang] ?? c.taglines.en}
                  taglineNote={c.taglineReviewed ? undefined : t("common.illustrative")}
                  image={c.image}
                  badge={t("city.label")}
                  meta={n?.inLang ? t("lang.storiesAvailable", { count: n.inLang }) : undefined}
                  priority={i < 2}
                />
              </li>
            );
          })}
        </ul>
      </section>

      <section className="mt-10" aria-labelledby="connection-title">
        <SectionTitle id="connection-title">{t("home.connection")}</SectionTitle>
        <div className="mt-4 max-w-2xl">
          {featured ? (
            <ConnectionCard
              featured
              href={`/connections/${featured.slug}`}
              title={featured.title}
              summary={featured.summary}
              typeLabel={t("connection.verified")}
              cta={t("home.exploreConnection")}
              fixtureLabel={featured.isFixture ? t("common.devFixture") : undefined}
            />
          ) : (
            <p className="rounded-md border border-dashed border-border p-4 text-support text-muted">{t("home.noConnection")}</p>
          )}
        </div>
      </section>
    </Page>
  );
}
