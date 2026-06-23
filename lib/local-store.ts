"use client";

/**
 * Browser-local persistence for playback progress and favorites.
 *
 * This is the source of truth when signed out. When the user signs in,
 * the sync layer (see lib/sync.ts, added in the D1 step) reconciles this
 * with the server. Keeping the same shape here means the UI never changes.
 */

const PROGRESS_KEY = "heckwood:progress:v1";
const FAVORITES_KEY = "heckwood:favorites:v1";

export type ProgressEntry = {
  key: string; // `${showSlug}/${epSlug}`
  showSlug: string;
  epSlug: string;
  showName: string;
  title: string;
  art: string;
  audioUrl: string;
  position: number; // seconds
  duration: number; // seconds
  updatedAt: number; // epoch ms
};

type ProgressMap = Record<string, ProgressEntry>;

const isBrowser = () => typeof window !== "undefined";

function read<T>(key: string, fallback: T): T {
  if (!isBrowser()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent("heckwood:store"));
  } catch {
    /* quota / private mode — ignore */
  }
}

/* ---------- progress ---------- */

export function loadProgress(): ProgressMap {
  return read<ProgressMap>(PROGRESS_KEY, {});
}

export function getProgress(key: string): ProgressEntry | undefined {
  return loadProgress()[key];
}

export function saveProgress(entry: ProgressEntry) {
  const all = loadProgress();
  all[entry.key] = entry;
  write(PROGRESS_KEY, all);
}

export function clearProgress(key: string) {
  const all = loadProgress();
  delete all[key];
  write(PROGRESS_KEY, all);
}

/** Most-recent, still-unfinished episodes for "Continue listening". */
export function continueListening(limit = 12): ProgressEntry[] {
  return Object.values(loadProgress())
    .filter((e) => e.position > 5 && (e.duration === 0 || e.position < e.duration - 30))
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .slice(0, limit);
}

/* ---------- favorites ---------- */

export function loadFavorites(): string[] {
  return read<string[]>(FAVORITES_KEY, []);
}

/** Overwrite the favorites list (used by the server-sync merge). */
export function replaceFavorites(slugs: string[]) {
  write(FAVORITES_KEY, [...new Set(slugs)]);
}

export function isFavorite(showSlug: string): boolean {
  return loadFavorites().includes(showSlug);
}

export function toggleFavorite(showSlug: string): boolean {
  const all = new Set(loadFavorites());
  let nowFav: boolean;
  if (all.has(showSlug)) {
    all.delete(showSlug);
    nowFav = false;
  } else {
    all.add(showSlug);
    nowFav = true;
  }
  write(FAVORITES_KEY, [...all]);
  return nowFav;
}

export function progressKey(showSlug: string, epSlug: string) {
  return `${showSlug}/${epSlug}`;
}
