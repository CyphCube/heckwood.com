"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function SearchBar({ initialQuery = "" }: { initialQuery?: string }) {
  const router = useRouter();
  const [q, setQ] = useState(initialQuery);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const t = q.trim();
    router.push(t ? `/search?q=${encodeURIComponent(t)}` : "/search");
  };

  return (
    <form onSubmit={submit} className="relative mb-8">
      <svg
        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      >
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        // eslint-disable-next-line jsx-a11y/no-autofocus
        autoFocus
        placeholder="Search shows and episodes"
        aria-label="Search shows and episodes"
        className="w-full rounded-full border border-line bg-surface py-3 pl-11 pr-4 text-sm outline-none placeholder:text-muted focus:border-accent"
      />
    </form>
  );
}
