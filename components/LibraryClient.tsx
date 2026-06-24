"use client";

import Link from "next/link";
import type { ShowMeta } from "@/lib/podcasts";
import { useFavorites } from "./providers/FavoritesProvider";
import { ShowCard } from "./ShowCard";
import { ContinueListening } from "./ContinueListening";

export function LibraryClient({ catalog }: { catalog: ShowMeta[] }) {
  const { favorites, ready } = useFavorites();
  const followed = catalog.filter((s) => favorites.includes(s.slug));

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="mb-8 font-serif text-3xl">Library</h1>

      <ContinueListening />

      <section>
        <h2 className="mb-4 text-lg font-semibold">Following</h2>
        {!ready ? null : followed.length === 0 ? (
          <div className="rounded-xl border border-dashed border-line p-8 text-center text-muted">
            <p>You aren’t following any shows yet.</p>
            <Link href="/browse" className="mt-2 inline-block text-accent-soft hover:underline">
              Browse shows →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {followed.map((s) => (
              <ShowCard key={s.slug} {...s} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
