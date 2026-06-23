"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AccountArea } from "./AccountArea";

export function TopBar() {
  const router = useRouter();
  const [q, setQ] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim()) router.push(`/search?q=${encodeURIComponent(q.trim())}`);
  };

  return (
    <header className="sticky top-0 z-40 flex items-center gap-3 border-b border-line bg-ink/80 px-4 py-3 backdrop-blur sm:px-6">
      <Link href="/" className="flex items-center gap-2 md:hidden">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent">
          <svg viewBox="0 0 24 24" fill="white" width="14" height="14">
            <path d="M12 3a9 9 0 100 18A9 9 0 0012 3zM9 9a3 3 0 116 0 3 3 0 01-6 0zm-2 9a7 7 0 0114 0H7z" />
          </svg>
        </span>
      </Link>

      <form onSubmit={submit} className="relative max-w-md flex-1">
        <svg
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
          width="16"
          height="16"
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
          placeholder="Search shows and episodes"
          className="w-full rounded-full border border-line bg-surface py-2 pl-9 pr-4 text-sm outline-none placeholder:text-muted focus:border-accent"
        />
      </form>

      <div className="ml-auto">
        <AccountArea />
      </div>
    </header>
  );
}
