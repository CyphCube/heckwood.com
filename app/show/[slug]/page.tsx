import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getAllShows, getShow } from "@/lib/podcasts";
import { EpisodeRow } from "@/components/EpisodeRow";
import { FavoriteButton } from "@/components/FavoriteButton";

const MAX_EPISODES = 60;

// Only the known shows exist; unknown slugs 404 (keeps the route fully static).
export const dynamicParams = false;

export function generateStaticParams() {
  return getAllShows().map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const show = getShow(slug);
  if (!show) return {};
  return {
    title: `${show.name} Podcast`,
    description: show.feedDesc?.slice(0, 160) || show.desc,
    openGraph: { images: show.art ? [show.art] : [] },
  };
}

export default async function ShowPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const show = getShow(slug);
  if (!show) notFound();

  const episodes = show.episodes.slice(0, MAX_EPISODES);

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-end">
        <div className="relative h-44 w-44 shrink-0 overflow-hidden rounded-2xl bg-line">
          {show.art ? (
            <Image
              src={show.art}
              alt={`${show.name} artwork`}
              fill
              sizes="176px"
              className="object-cover"
              unoptimized
              priority
            />
          ) : null}
        </div>
        <div className="min-w-0">
          <span className="inline-block rounded-full bg-elevated px-2.5 py-0.5 text-[11px] uppercase tracking-wide text-muted">
            {show.cat}
          </span>
          <h1 className="mt-2 font-serif text-3xl sm:text-4xl">{show.name}</h1>
          <p className="mt-1 text-muted">by {show.author}</p>
          <p className="mt-3 line-clamp-3 max-w-2xl text-sm text-muted">
            {show.feedDesc || show.desc}
          </p>
          <div className="mt-4 flex items-center gap-3">
            <FavoriteButton showSlug={show.slug} variant="labeled" />
            <span className="text-sm text-muted">{show.episodeCount} episodes</span>
          </div>
        </div>
      </div>

      <section>
        <h2 className="mb-2 text-lg font-semibold">Episodes</h2>
        {show.episodeCount > MAX_EPISODES ? (
          <p className="mb-3 text-xs text-muted">
            Showing the {MAX_EPISODES} most recent of {show.episodeCount}.
          </p>
        ) : null}
        <div className="divide-y divide-line/60">
          {episodes.map((ep) => (
            <EpisodeRow
              key={ep.slug}
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
    </div>
  );
}
