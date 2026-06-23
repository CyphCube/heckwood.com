"use client";

import clsx from "clsx";
import { useFavorites } from "./providers/FavoritesProvider";

export function FavoriteButton({
  showSlug,
  variant = "icon",
}: {
  showSlug: string;
  variant?: "icon" | "labeled";
}) {
  const { isFavorite, toggle, ready } = useFavorites();
  const fav = ready && isFavorite(showSlug);

  if (variant === "labeled") {
    return (
      <button
        onClick={() => toggle(showSlug)}
        className={clsx(
          "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition",
          fav
            ? "border-accent bg-accent/15 text-accent-soft"
            : "border-line text-muted hover:text-white"
        )}
      >
        <Heart filled={fav} />
        {fav ? "Following" : "Follow"}
      </button>
    );
  }

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(showSlug);
      }}
      title={fav ? "Remove favorite" : "Add favorite"}
      aria-pressed={fav}
      className={clsx(
        "rounded-full p-2 transition",
        fav ? "text-accent-soft" : "text-muted hover:text-white"
      )}
    >
      <Heart filled={fav} />
    </button>
  );
}

function Heart({ filled }: { filled: boolean }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 1 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}
