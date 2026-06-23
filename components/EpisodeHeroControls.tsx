"use client";

import { PlayButton } from "./PlayButton";
import { usePlayer, type Track } from "./player/PlayerProvider";
import { useProgress } from "@/lib/use-progress";
import { formatTime } from "@/lib/format";

export function EpisodeHeroControls({ track }: { track: Track }) {
  const progress = useProgress(track.showSlug, track.epSlug);
  const { seekTo, play, isCurrent } = usePlayer();

  const hasResume =
    progress && progress.position > 5 && progress.position < (progress.duration || Infinity) - 30;

  const resumeFromStart = () => {
    play(track);
    // play() auto-resumes; force start if user explicitly chooses "from beginning"
    setTimeout(() => isCurrent(track.showSlug, track.epSlug) && seekTo(0), 50);
  };

  return (
    <div className="flex flex-wrap items-center gap-4">
      <PlayButton track={track} size="lg" />
      <div>
        <div className="text-sm font-medium">
          {hasResume ? "Resume" : "Play episode"}
        </div>
        {hasResume ? (
          <button
            onClick={resumeFromStart}
            className="text-xs text-muted underline-offset-2 hover:underline"
          >
            Resume at {formatTime(progress!.position)} · play from start
          </button>
        ) : null}
      </div>
    </div>
  );
}
