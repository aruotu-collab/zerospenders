import { CategoryBrowse } from "@/components/CategoryBrowse";
import { countryLabel } from "@/lib/countries";
import { getSelectedCountry } from "@/lib/country-server";
import { parsePage, takeForPage } from "@/lib/pagination";
import { countSignals, listSignals } from "@/lib/queries";
import type { SignalCategory } from "@/lib/types";

export const dynamic = "force-dynamic";

const pages: Record<
  string,
  { category: SignalCategory; title: string; blurb: string }
> = {
  "get-free": {
    category: "get",
    title: "GET FREE",
    blurb: "Physical things coming your way — samples, beauty, home, baby, pets and giveaways.",
  },
  "go-free": {
    category: "go",
    title: "GO FREE",
    blurb: "Things happening around you — attractions, museums, events, exercise and days out.",
  },
  "eat-free": {
    category: "eat",
    title: "EAT FREE",
    blurb: "Food and drink for £0 — coffee, tastings, birthday desserts and kids-eat-free.",
  },
  "learn-free": {
    category: "learn",
    title: "LEARN FREE",
    blurb: "Increase your knowledge for £0 — courses, certificates, books, AI and skills.",
  },
  "play-free": {
    category: "play",
    title: "PLAY FREE",
    blurb: "Entertainment without the bill — games, streaming unlocks, sport and activities.",
  },
  "try-free": {
    category: "try",
    title: "TRY FREE",
    blurb: "Normally paid products you can test — software, apps, gyms, streaming and services.",
  },
  "kids-free": {
    category: "kids",
    title: "KIDS FREE",
    blurb: "Family activities, children's offers and school-holiday freebies that actually work.",
  },
  "online-free": {
    category: "online",
    title: "ONLINE FREE",
    blurb: "Software, AI, downloads, ebooks and tools you can claim without leaving home.",
  },
};

export function makeCategoryPage(slug: keyof typeof pages) {
  const meta = pages[slug];
  return async function CategoryPage({
    searchParams,
  }: {
    searchParams: Promise<{ page?: string | string[] }>;
  }) {
    const country = await getSelectedCountry();
    const { page: pageParam } = await searchParams;
    const page = parsePage(pageParam);
    const [signals, total] = await Promise.all([
      listSignals({ category: meta.category, country, take: takeForPage(page) }),
      countSignals({ category: meta.category, country }),
    ]);

    return (
      <CategoryBrowse
        title={meta.title}
        blurb={meta.blurb}
        signals={signals}
        countryName={countryLabel(country)}
        total={total}
        page={page}
        basePath={`/${slug}`}
      />
    );
  };
}
