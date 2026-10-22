import type { Metadata } from "next";
import { pageContext } from "@/lib/page";
import { track } from "@/lib/analytics";
import { ComingSoonClient } from "./coming-soon-client";

export const metadata: Metadata = {
  title: "Coming to TattvaCo · The Next Chapter of Cultural Discovery",
  description:
    "Go beyond places. Discover the stories, people and traditions that connect India's cultural universe. Preview upcoming experiences including AI Cultural Trails, Living Culture & Artisans, and Cultural Connections.",
  openGraph: {
    title: "Coming to TattvaCo · The Next Chapter of Cultural Discovery",
    description: "Six experiences. One deeper way to discover India's cultural universe.",
    images: ["/images/coming-soon/hero.jpg"],
  },
};

export default async function ComingSoonPage() {
  const { session, lang, t } = await pageContext();
  await track("home_view", { section: "coming_soon" }, session.analyticsId);

  return <ComingSoonClient lang={lang} />;
}
