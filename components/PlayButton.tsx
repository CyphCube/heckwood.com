"use client";

import clsx from "clsx";
import { usePlayer, type Track } from "./player/PlayerProvider";

export function PlayButton({
  track,
  size = "md",
  variant = "solid",
}: {
  track: Track;
  size?: "sm" | "md" | "lg";
  variant?: "solid" | "ghost";
}) {
  const { isCurrent, isPlaying, play } = usePlayer();
  const active = isCurrent(track.showSlug, track.epSlug);
  const showPause = active && isPlaying;

  const dim = size === "lg" ? "h-14 w-14" : size === "sm" ? "h-9 w-9" : "h-11 w-11";
  const icon = size === "lg" ? 26 : size === "sm" ? 16 : 20;

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        play(track);
      }}
      title={showPause ? "Pause" : "Play"}
      aria-label={showPause ? "Pause" : "Play"}
      className={clsx(
        "flex shrink-0 items-center justify-center rounded-full transition",
        dim,
        variant === "solid"
          ? "bg-accent text-white hover:bg-accent-soft"
          : active
            ? "text-accent-soft"
            : "text-muted hover:text-white"
      )}
    >
      {showPause ? (
        <svg width={icon} height={icon} viewBox="0 0 24 24" fill="currentColor">
          <rect x="6" y="4" width="4" height="16" rx="1" />
          <rect x="14" y="4" width="4" height="16" rx="1" />
        </svg>
      ) : (
        <svg width={icon} height={icon} viewBox="0 0 24 24" fill="currentColor">
          <polygon points="6,4 20,12 6,20" />
        </svg>
      )}
    </button>
  );
}
