"use client";

import { useEffect, useState } from "react";
import {
  continueListening,
  getProgress,
  progressKey,
  type ProgressEntry,
} from "./local-store";

/** Live playback progress for one episode (re-renders when it changes). */
export function useProgress(showSlug: string, epSlug: string) {
  const key = progressKey(showSlug, epSlug);
  const [entry, setEntry] = useState<ProgressEntry | undefined>(undefined);

  useEffect(() => {
    const sync = () => setEntry(getProgress(key));
    sync();
    window.addEventListener("heckwood:store", sync);
    window.addEventListener("storage", sync);
    const id = setInterval(sync, 5000); // catch the throttled in-session saves
    return () => {
      window.removeEventListener("heckwood:store", sync);
      window.removeEventListener("storage", sync);
      clearInterval(id);
    };
  }, [key]);

  return entry;
}

/** Live "continue listening" list. */
export function useContinueListening(limit = 12) {
  const [items, setItems] = useState<ProgressEntry[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const sync = () => {
      setItems(continueListening(limit));
      setReady(true);
    };
    sync();
    window.addEventListener("heckwood:store", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("heckwood:store", sync);
      window.removeEventListener("storage", sync);
    };
  }, [limit]);

  return { items, ready };
}
