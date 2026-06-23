import type { Metadata } from "next";
import { getAllShows } from "@/lib/podcasts";
import { ShowCard } from "@/components/ShowCard";
import { EpisodeRow } from "@/components/EpisodeRow";

export const runtime = "edge";

export const metadata: Metadata = { title: "Search" };

const MAX_EP_RESULTS = 30;

export default async function Search({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = (q || "").trim().toLowerCase();

  if (!query) {
    return (
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-2 font-serif text-3xl">Search</h1>
        <p className="text-muted">
          Find shows and episodes — type in the search bar above.
        </p>
      </div>
    );
  }

  const shows = getAllShows();
  const showHits = shows.filter(
    (s) =>
      s.name.toLowerCase().includes(query) ||
      s.author.toLowerCase().includes(query) ||
      (s.feedDesc || s.desc || "").toLowerCase().includes(query)
  );

  const epHits: {
    show: (typeof shows)[number];
    ep: (typeof shows)[number]["episodes"][number];
  }[] = [];
  for (const show of shows) {
    for (const ep of show.episodes) {
      if (ep.title.toLowerCase().includes(query)) {
        epHits.push({ show, ep });
        if (epHits.length >= MAX_EP_RESULTS) break;
      }
    }
    if (epHits.length >= MAX_EP_RESULTS) break;
  }

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="mb-6 font-serif text-2xl">
        Results for <span className="text-accent-soft">“{q}”</span>
      </h1>

      {showHits.length > 0 ? (
        <section className="mb-10">
          <h2 className="mb-4 text-lg font-semibold">Shows</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {showHits.map((s) => (
              <ShowCard key={s.slug} {...s} />
            ))}
          </div>
        </section>
      ) : null}

      {epHits.length > 0 ? (
        <section>
          <h2 className="mb-2 text-lg font-semibold">Episodes</h2>
          <div className="divide-y divide-line/60">
            {epHits.map(({ show, ep }) => (
              <EpisodeRow
                key={`${show.slug}/${ep.slug}`}
                showSlug={show.slug}
                showName={show.name}
                epSlug={ep.slug}
                title={ep.title}
                art={ep.art || show.art}
                audioUrl={ep.audioUrl}
                pubDate={ep.pubDate}
                duration={ep.duration}
                description={ep.description}
              />
            ))}
          </div>
        </section>
      ) : null}

      {showHits.length === 0 && epHits.length === 0 ? (
        <p className="text-muted">No matches. Try a different search.</p>
      ) : null}
    </div>
  );
}
