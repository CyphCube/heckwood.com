"use client";

import Link from "next/link";
import { AccountArea } from "./AccountArea";
import { Logo } from "@/components/Logo";

export function TopBar() {
  return (
    <header className="sticky top-0 z-40 flex items-center gap-3 border-b border-line bg-ink/80 px-4 py-3 backdrop-blur sm:px-6">
      <Link href="/" className="flex items-center md:hidden">
        <Logo size={28} />
      </Link>

      {/* Reserved space (e.g. for ads) — search lives on the Search page. */}
      <div className="flex-1" />

      <AccountArea />
    </header>
  );
}
