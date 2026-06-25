import type { Metadata } from "next";
import Link from "next/link";
import { getCatalog, getCategories } from "@/lib/podcasts";
import { ShowCard } from "@/components/ShowCard";

export const runtime = "edge";

export const metadata: Metadata = {
  title: "Browse",
  description: "Browse every show in the Heckwood podcast directory by category.",
  alternates: { canonical: "/browse" },
};

export default async function Browse({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string }>;
}) {
  const { cat } = await searchParams;
  const categories = getCategories();
  const all = getCatalog();
  const shows = cat ? all.filter((s) => s.cat === cat) : all;

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="mb-6 font-serif text-3xl">Browse</h1>

      <div className="mb-8 flex flex-wrap gap-2">
        <Link
          href="/browse"
          className={`rounded-full px-4 py-1.5 text-sm capitalize transition ${
            !cat ? "bg-accent text-white" : "border border-line text-muted hover:text-white"
          }`}
        >
          All
        </Link>
        {categories.map((c) => (
          <Link
            key={c.slug}
            href={`/browse?cat=${c.slug}`}
            className={`rounded-full px-4 py-1.5 text-sm capitalize transition ${
              cat === c.slug
                ? "bg-accent text-white"
                : "border border-line text-muted hover:text-white"
            }`}
          >
            {c.slug}
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {shows.map((s) => (
          <ShowCard key={s.slug} {...s} />
        ))}
      </div>
    </div>
  );
}
