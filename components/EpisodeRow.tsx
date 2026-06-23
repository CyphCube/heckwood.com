"use client";

import Link from "next/link";
import { PlayButton } from "./PlayButton";
import { useProgress } from "@/lib/use-progress";
import { formatDate, formatTime } from "@/lib/format";
import type { Track } from "./player/PlayerProvider";

export function EpisodeRow({
  showSlug,
  showName,
  epSlug,
  title,
  art,
  audioUrl,
  pubDate,
  duration,
  description,
  href,
}: {
  showSlug: string;
  showName: string;
  epSlug: string;
  title: string;
  art: string;
  audioUrl: string;
  pubDate: string;
  duration: string;
  description?: string;
  href?: string;
}) {
  const progress = useProgress(showSlug, epSlug);
  const track: Track = { showSlug, showName, epSlug, title, art, audioUrl };

  const pct =
    progress && progress.duration > 0
      ? Math.min(100, (progress.position / progress.duration) * 100)
      : 0;
  const finished = progress ? progress.position >= progress.duration - 30 && progress.duration > 0 : false;
  const remaining =
    progress && progress.duration > 0
      ? Math.max(0, progress.duration - progress.position)
      : 0;

  return (
    <div className="flex items-start gap-3 rounded-xl px-2 py-3 transition hover:bg-surface">
      <div className="pt-0.5">
        <PlayButton track={track} />
      </div>
      <div className="min-w-0 flex-1">
        <Link href={href ?? `/show/${showSlug}/${epSlug}`} className="block">
          <h3 className="truncate text-sm font-semibold hover:underline">{title}</h3>
        </Link>
        {description ? (
          <p className="mt-1 line-clamp-2 text-xs text-muted">{description}</p>
        ) : null}
        <div className="mt-2 flex items-center gap-2 text-[11px] text-muted">
          {pubDate ? <span>{formatDate(pubDate)}</span> : null}
          {duration ? (
            <>
              <span>·</span>
              <span>{duration}</span>
            </>
          ) : null}
          {finished ? (
            <>
              <span>·</span>
              <span className="text-accent-soft">Played</span>
            </>
          ) : pct > 0 ? (
            <>
              <span>·</span>
              <span className="text-accent-soft">
                {formatTime(remaining)} left
              </span>
            </>
          ) : null}
        </div>
        {pct > 0 && !finished ? (
          <div className="mt-2 h-1 w-full max-w-xs overflow-hidden rounded-full bg-line">
            <div
              className="h-full rounded-full bg-accent"
              style={{ width: `${pct}%` }}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}
