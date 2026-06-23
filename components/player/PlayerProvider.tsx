"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  getProgress,
  progressKey,
  saveProgress,
  type ProgressEntry,
} from "@/lib/local-store";
import { pushHistory } from "@/lib/sync";

export type Track = {
  showSlug: string;
  showName: string;
  epSlug: string;
  title: string;
  art: string;
  audioUrl: string;
};

type PlayerState = {
  track: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  rate: number;
  /** True if the given show/episode is the one currently loaded. */
  isCurrent: (showSlug: string, epSlug: string) => boolean;
  play: (track: Track) => void;
  toggle: () => void;
  seek: (seconds: number) => void;
  seekTo: (seconds: number) => void;
  skip: (delta: number) => void;
  setRate: (rate: number) => void;
};

const PlayerContext = createContext<PlayerState | null>(null);

const SAVE_EVERY_MS = 12_000;

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [track, setTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [rate, setRateState] = useState(1);

  const pendingSeek = useRef<number | null>(null);
  const lastSaved = useRef(0);
  const trackRef = useRef<Track | null>(null);
  trackRef.current = track;

  const persist = useCallback((force = false) => {
    const a = audioRef.current;
    const t = trackRef.current;
    if (!a || !t) return;
    const now = Date.now();
    if (!force && now - lastSaved.current < SAVE_EVERY_MS) return;
    // Don't persist an empty entry before playback has actually started.
    if ((a.currentTime || 0) < 1) return;
    lastSaved.current = now;
    const entry: ProgressEntry = {
      key: progressKey(t.showSlug, t.epSlug),
      showSlug: t.showSlug,
      epSlug: t.epSlug,
      showName: t.showName,
      title: t.title,
      art: t.art,
      audioUrl: t.audioUrl,
      position: a.currentTime || 0,
      duration: a.duration && isFinite(a.duration) ? a.duration : 0,
      updatedAt: now,
    };
    saveProgress(entry);
    void pushHistory(entry);
  }, []);

  const play = useCallback(
    (next: Track) => {
      const a = audioRef.current;
      if (!a) return;
      const sameTrack =
        trackRef.current &&
        trackRef.current.showSlug === next.showSlug &&
        trackRef.current.epSlug === next.epSlug;

      if (sameTrack) {
        if (a.paused) void a.play();
        else a.pause();
        return;
      }

      // Switching episodes — save the outgoing one first.
      persist(true);
      setTrack(next);
      const saved = getProgress(progressKey(next.showSlug, next.epSlug));
      pendingSeek.current = saved && saved.position > 5 ? saved.position : 0;
      a.src = next.audioUrl;
      a.load();
      void a.play();
    },
    [persist]
  );

  const toggle = useCallback(() => {
    const a = audioRef.current;
    if (!a || !trackRef.current) return;
    if (a.paused) void a.play();
    else a.pause();
  }, []);

  const seekTo = useCallback((seconds: number) => {
    const a = audioRef.current;
    if (!a) return;
    a.currentTime = Math.max(0, seconds);
  }, []);

  const skip = useCallback((delta: number) => {
    const a = audioRef.current;
    if (!a) return;
    a.currentTime = Math.max(0, Math.min(a.duration || Infinity, a.currentTime + delta));
  }, []);

  const setRate = useCallback((r: number) => {
    const a = audioRef.current;
    if (!a) return;
    a.playbackRate = r;
    setRateState(r);
  }, []);

  const isCurrent = useCallback(
    (showSlug: string, epSlug: string) =>
      !!track && track.showSlug === showSlug && track.epSlug === epSlug,
    [track]
  );

  // Wire audio element events once.
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const onPlay = () => setIsPlaying(true);
    const onPause = () => {
      setIsPlaying(false);
      persist(true);
    };
    const onTime = () => {
      setCurrentTime(a.currentTime);
      persist(false);
    };
    const onMeta = () => {
      setDuration(a.duration || 0);
      if (pendingSeek.current != null) {
        if (pendingSeek.current > 0) a.currentTime = pendingSeek.current;
        pendingSeek.current = null;
      }
    };
    const onEnded = () => {
      setIsPlaying(false);
      persist(true);
    };
    a.addEventListener("play", onPlay);
    a.addEventListener("pause", onPause);
    a.addEventListener("timeupdate", onTime);
    a.addEventListener("loadedmetadata", onMeta);
    a.addEventListener("ended", onEnded);
    return () => {
      a.removeEventListener("play", onPlay);
      a.removeEventListener("pause", onPause);
      a.removeEventListener("timeupdate", onTime);
      a.removeEventListener("loadedmetadata", onMeta);
      a.removeEventListener("ended", onEnded);
    };
  }, [persist]);

  // Save on tab hide / unload so we never lose the user's place.
  useEffect(() => {
    const onHide = () => persist(true);
    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("pagehide", onHide);
    return () => {
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("pagehide", onHide);
    };
  }, [persist]);

  return (
    <PlayerContext.Provider
      value={{
        track,
        isPlaying,
        currentTime,
        duration,
        rate,
        isCurrent,
        play,
        toggle,
        seek: skip,
        seekTo,
        skip,
        setRate,
      }}
    >
      {children}
      {/* The one and only audio element — lives in the root layout, survives navigation. */}
      <audio ref={audioRef} preload="metadata" />
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used within PlayerProvider");
  return ctx;
}
