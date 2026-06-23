import "server-only";
// Bundled at build time by fetch-feeds.js (data/podcasts/_all.js) so there is
// no runtime filesystem access — required for the Cloudflare edge runtime.
import ALL_SHOWS from "@/data/podcasts/_all.js";

export type Episode = {
  slug: string;
  title: string;
  description: string;
  audioUrl: string;
  pubDate: string;
  duration: string;
  durationSec: number;
  epNum: string | number;
  season: string | number;
  art: string;
};

export type Show = {
  slug: string;
  name: string;
  author: string;
  cat: string;
  feed: string;
  desc: string;
  feedTitle: string;
  feedDesc: string;
  art: string;
  link: string;
  episodeCount: number;
  episodes: Episode[];
};

/** Ensure episode slugs are unique within a show (the raw JSON can collide). */
function dedupeSlugs(episodes: Episode[]): Episode[] {
  const seen = new Map<string, number>();
  return episodes.map((ep) => {
    const base = ep.slug || "episode";
    const n = seen.get(base) ?? 0;
    seen.set(base, n + 1);
    return n === 0 ? ep : { ...ep, slug: `${base}-${n}` };
  });
}

let _cache: Show[] | null = null;

export function getAllShows(): Show[] {
  if (_cache) return _cache;
  const shows = (ALL_SHOWS as Show[]).map((raw) => ({
    ...raw,
    episodes: dedupeSlugs(raw.episodes || []),
  }));
  // Stable, nicely-ordered directory: by name.
  shows.sort((a, b) => a.name.localeCompare(b.name));
  _cache = shows;
  return shows;
}

export function getShow(slug: string): Show | undefined {
  return getAllShows().find((s) => s.slug === slug);
}

export function getEpisode(showSlug: string, epSlug: string) {
  const show = getShow(showSlug);
  if (!show) return undefined;
  const episode = show.episodes.find((e) => e.slug === epSlug);
  if (!episode) return undefined;
  return { show, episode };
}

export function getCategories(): { slug: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const s of getAllShows()) counts.set(s.cat, (counts.get(s.cat) ?? 0) + 1);
  return [...counts.entries()]
    .map(([slug, count]) => ({ slug, count }))
    .sort((a, b) => a.slug.localeCompare(b.slug));
}

export function getShowsByCategory(cat: string): Show[] {
  return getAllShows().filter((s) => s.cat === cat);
}

export type ShowMeta = {
  slug: string;
  name: string;
  author: string;
  art: string;
  cat: string;
  episodeCount: number;
};

/** Minimal show fields, safe to pass to client components. */
export function getCatalog(): ShowMeta[] {
  return getAllShows().map(({ slug, name, author, art, cat, episodeCount }) => ({
    slug,
    name,
    author,
    art,
    cat,
    episodeCount,
  }));
}

/** Lightweight episode record carrying its parent show, for the player & lists. */
export type PlayableEpisode = Episode & {
  showSlug: string;
  showName: string;
};

export function toPlayable(show: Show, ep: Episode): PlayableEpisode {
  return { ...ep, showSlug: show.slug, showName: show.name };
}
