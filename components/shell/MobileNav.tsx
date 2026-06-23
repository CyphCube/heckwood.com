"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/browse", label: "Browse" },
  { href: "/search", label: "Search" },
  { href: "/library", label: "Library" },
];

export function MobileNav() {
  const pathname = usePathname();
  const active = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex h-14 items-stretch border-t border-line bg-surface md:hidden">
      {NAV.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          className={clsx(
            "flex flex-1 flex-col items-center justify-center text-xs font-medium",
            active(href) ? "text-accent-soft" : "text-muted"
          )}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}
