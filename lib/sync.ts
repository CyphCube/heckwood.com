"use client";

/**
 * Reconciles browser-local favorites/history with the server (D1) when the
 * user is signed in. Strategy: union favorites, newest-wins for history.
 * When signed out or no server storage, everything stays in localStorage and
 * these functions are no-ops.
 */

import {
  loadFavorites,
  loadProgress,
  replaceFavorites,
  saveProgress,
  type ProgressEntry,
} from "./local-store";

let serverOk = false;
let started = false;

export function isServerSync() {
  return serverOk;
}

async function postJSON(url: string, body: unknown) {
  try {
    await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    /* offline — local copy is still the source of truth */
  }
}

export async function pushFavorite(showSlug: string, favorite: boolean) {
  if (!serverOk) return;
  await postJSON("/api/favorites", { showSlug, favorite });
}

export async function pushHistory(entry: ProgressEntry) {
  if (!serverOk) return;
  await postJSON("/api/history", entry);
}

/** Runs once on load; pulls server state, merges, and pushes local-only items up. */
export async function initialSync(): Promise<boolean> {
  if (started) return serverOk;
  started = true;
  try {
    const [fRes, hRes] = await Promise.all([
      fetch("/api/favorites"),
      fetch("/api/history"),
    ]);
    if (!fRes.ok || !hRes.ok) return false;
    const f = (await fRes.json()) as { favorites?: string[]; server?: boolean };
    const h = (await hRes.json()) as { history?: ProgressEntry[]; server?: boolean };
    if (!f.server || !h.server) return false; // signed in but DB not bound → stay local

    serverOk = true;

    // Favorites: union of local + server.
    const localFav = loadFavorites();
    const serverFav = f.favorites ?? [];
    replaceFavorites([...new Set([...serverFav, ...localFav])]);
    await Promise.all(
      localFav.filter((s) => !serverFav.includes(s)).map((s) => pushFavorite(s, true))
    );

    // History: newest updatedAt wins, per episode.
    const localProg = loadProgress();
    const serverHist = h.history ?? [];
    const serverMap = new Map(serverHist.map((e) => [e.key, e]));
    for (const se of serverHist) {
      const le = localProg[se.key];
      if (!le || se.updatedAt > le.updatedAt) saveProgress(se);
    }
    for (const le of Object.values(localProg)) {
      const se = serverMap.get(le.key);
      if (le.position > 1 && (!se || le.updatedAt > se.updatedAt)) await pushHistory(le);
    }

    return true;
  } catch {
    return false;
  }
}
