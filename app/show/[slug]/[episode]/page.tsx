import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getEpisode } from "@/lib/podcasts";
import { EpisodeHeroControls } from "@/components/EpisodeHeroControls";
import { formatDate } from "@/lib/format";

export const runtime = "edge";

type Params = Promise<{ slug: string; episode: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug, episode } = await params;
  const found = getEpisode(slug, episode);
  if (!found) return {};
  const { show, episode: ep } = found;
  const title = ep.title;
  const description = ep.description?.slice(0, 160) ?? "";
  const url = `/show/${show.slug}/${ep.slug}`;
  const images = ([ep.art || show.art].filter(Boolean) as string[]).concat(
    ep.art || show.art ? [] : ["/og.png"]
  );
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { type: "article", title, description, url, images },
    twitter: { card: "summary_large_image", title, description, images },
  };
}

export default async function EpisodePage({ params }: { params: Params }) {
  const { slug, episode } = await params;
  const found = getEpisode(slug, episode);
  if (!found) notFound();
  const { show, episode: ep } = found;

  const track = {
    showSlug: show.slug,
    showName: show.name,
    epSlug: ep.slug,
    title: ep.title,
    art: ep.art || show.art,
    audioUrl: ep.audioUrl,
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "PodcastEpisode",
    name: ep.title,
    description: ep.description,
    url: `https://heckwood.com/show/${show.slug}/${ep.slug}`,
    image: ep.art || show.art || undefined,
    datePublished: ep.pubDate,
    associatedMedia: ep.audioUrl
      ? { "@type": "MediaObject", contentUrl: ep.audioUrl }
      : undefined,
    partOfSeries: {
      "@type": "PodcastSeries",
      name: show.name,
      url: `https://heckwood.com/show/${show.slug}`,
    },
  };
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://heckwood.com/" },
      { "@type": "ListItem", position: 2, name: show.name, item: `https://heckwood.com/show/${show.slug}` },
      { "@type": "ListItem", position: 3, name: ep.title, item: `https://heckwood.com/show/${show.slug}/${ep.slug}` },
    ],
  };

  return (
    <div className="mx-auto max-w-3xl">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([jsonLd, breadcrumbJsonLd]) }}
      />

      <nav className="mb-6 text-sm text-muted">
        <Link href="/browse" className="hover:underline">
          Browse
        </Link>
        <span className="px-2">›</span>
        <Link href={`/show/${show.slug}`} className="hover:underline">
          {show.name}
        </Link>
      </nav>

      <div className="mb-6 flex gap-5">
        <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-xl bg-line">
          {track.art ? (
            <Image
              src={track.art}
              alt=""
              fill
              sizes="112px"
              className="object-cover"
              unoptimized
            />
          ) : null}
        </div>
        <div className="min-w-0">
          <Link
            href={`/show/${show.slug}`}
            className="text-sm text-accent-soft hover:underline"
          >
            {show.name}
          </Link>
          <h1 className="mt-1 font-serif text-2xl sm:text-3xl">{ep.title}</h1>
          <div className="mt-2 text-xs text-muted">
            {formatDate(ep.pubDate)}
            {ep.duration ? ` · ${ep.duration}` : ""}
          </div>
        </div>
      </div>

      {ep.audioUrl ? (
        <div className="mb-8 rounded-2xl border border-line bg-surface p-5">
          <EpisodeHeroControls track={track} />
        </div>
      ) : (
        <p className="mb-8 text-sm text-muted">Audio not available for this episode.</p>
      )}

      {ep.description ? (
        <section>
          <h2 className="mb-3 text-lg font-semibold">About this episode</h2>
          <p className="whitespace-pre-line leading-relaxed text-[#d9d4e2]">
            {ep.description}
          </p>
        </section>
      ) : null}
    </div>
  );
}
