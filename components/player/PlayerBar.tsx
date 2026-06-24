"use client";

import Image from "next/image";
import { useState } from "react";
import { usePlayer } from "./PlayerProvider";
import { formatTime } from "@/lib/format";

const RATES = [1, 1.25, 1.5, 1.75, 2];

export function PlayerBar() {
  const { track, isPlaying, currentTime, duration, rate, toggle, skip, seekTo, setRate } =
    usePlayer();
  const [scrubbing, setScrubbing] = useState<number | null>(null);

  if (!track) return null;

  const shown = scrubbing ?? currentTime;
  const pct = duration > 0 ? (shown / duration) * 100 : 0;

  const onScrub = (e: React.ChangeEvent<HTMLInputElement>) => {
    setScrubbing(Number(e.target.value));
  };
  const commitScrub = (e: React.FormEvent<HTMLInputElement>) => {
    const val = Number((e.target as HTMLInputElement).value);
    seekTo(val);
    setScrubbing(null);
  };

  const cycleRate = () => {
    const i = RATES.indexOf(rate);
    setRate(RATES[(i + 1) % RATES.length]);
  };

  return (
    <div className="fixed inset-x-0 bottom-14 z-50 border-t border-line bg-elevated/95 shadow-player backdrop-blur md:bottom-0">
      {/* Progress scrubber spans the full width at the very top of the bar */}
      <div className="px-3 pt-2 sm:px-6">
        <div className="flex items-center gap-3">
          <span className="w-10 shrink-0 text-right text-[11px] tabular-nums text-muted">
            {formatTime(shown)}
          </span>
          <input
            type="range"
            min={0}
            max={Math.max(duration, 1)}
            step={1}
            value={shown}
            onChange={onScrub}
            onMouseUp={commitScrub}
            onTouchEnd={commitScrub}
            aria-label="Seek"
            className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-line accent-accent"
            style={{
              background: `linear-gradient(to right, #22a14f ${pct}%, #2a322a ${pct}%)`,
            }}
          />
          <span className="w-10 shrink-0 text-[11px] tabular-nums text-muted">
            {formatTime(duration)}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3 px-3 py-3 sm:px-6">
        {/* Now playing */}
        <div className="flex min-w-0 flex-1 items-center gap-3">
          {track.art ? (
            <Image
              src={track.art}
              alt=""
              width={48}
              height={48}
              className="h-12 w-12 shrink-0 rounded-md object-cover"
              unoptimized
            />
          ) : (
            <div className="h-12 w-12 shrink-0 rounded-md bg-line" />
          )}
          <div className="min-w-0">
            <div className="truncate text-sm font-medium">{track.title}</div>
            <div className="truncate text-xs text-muted">{track.showName}</div>
          </div>
        </div>

        {/* Transport */}
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => skip(-15)}
            title="Back 15s"
            className="rounded-full p-2 text-muted hover:text-white"
          >
            <SkipBack />
          </button>
          <button
            onClick={toggle}
            title={isPlaying ? "Pause" : "Play"}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-accent text-white transition hover:bg-accent-soft"
          >
            {isPlaying ? <Pause /> : <Play />}
          </button>
          <button
            onClick={() => skip(30)}
            title="Forward 30s"
            className="rounded-full p-2 text-muted hover:text-white"
          >
            <SkipFwd />
          </button>
        </div>

        {/* Speed */}
        <button
          onClick={cycleRate}
          title="Playback speed"
          className="ml-1 hidden w-12 shrink-0 rounded-full border border-line py-1.5 text-xs font-medium text-muted hover:text-white sm:block"
        >
          {rate}×
        </button>
      </div>
    </div>
  );
}

/* — inline icons (no icon dependency) — */
function Play() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <polygon points="6,4 20,12 6,20" />
    </svg>
  );
}
function Pause() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <rect x="6" y="4" width="4" height="16" rx="1" />
      <rect x="14" y="4" width="4" height="16" rx="1" />
    </svg>
  );
}
function SkipBack() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="1 4 1 10 7 10" />
      <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
    </svg>
  );
}
function SkipFwd() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 4 23 10 17 10" />
      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
    </svg>
  );
}
