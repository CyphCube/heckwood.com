"use client";

import Image from "next/image";
import Link from "next/link";
import { PlayButton } from "./PlayButton";
import { useContinueListening } from "@/lib/use-progress";

export function ContinueListening() {
  const { items, ready } = useContinueListening();
  if (!ready || items.length === 0) return null;

  return (
    <section className="mb-10">
      <h2 className="mb-4 text-lg font-semibold">Continue listening</h2>
      <div className="flex gap-4 overflow-x-auto pb-2">
        {items.map((e) => {
          const pct =
            e.duration > 0 ? Math.min(100, (e.position / e.duration) * 100) : 0;
          return (
            <div
              key={e.key}
              className="w-44 shrink-0 rounded-xl bg-surface p-3 transition hover:bg-elevated"
            >
              <div className="relative mb-3 aspect-square overflow-hidden rounded-lg bg-line">
                {e.art ? (
                  <Image
                    src={e.art}
                    alt=""
                    fill
                    sizes="176px"
                    className="object-cover"
                    unoptimized
                  />
                ) : null}
                <div className="absolute bottom-2 right-2">
                  <PlayButton
                    track={{
                      showSlug: e.showSlug,
                      showName: e.showName,
                      epSlug: e.epSlug,
                      title: e.title,
                      art: e.art,
                      audioUrl: e.audioUrl,
                    }}
                  />
                </div>
              </div>
              <Link href={`/show/${e.showSlug}/${e.epSlug}`}>
                <div className="line-clamp-2 text-xs font-semibold hover:underline">
                  {e.title}
                </div>
              </Link>
              <div className="truncate text-[11px] text-muted">{e.showName}</div>
              <div className="mt-2 h-1 overflow-hidden rounded-full bg-line">
                <div className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
