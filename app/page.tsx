import type { Metadata } from "next";
import { getCatalog, getCategories } from "@/lib/podcasts";
import { ShowCard } from "@/components/ShowCard";
import { ContinueListening } from "@/components/ContinueListening";
import Link from "next/link";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Heckwood",
  url: "https://heckwood.com",
  potentialAction: {
    "@type": "SearchAction",
    target: "https://heckwood.com/search?q={search_term_string}",
    "query-input": "required name=search_term_string",
  },
};

export default function Home() {
  const shows = getCatalog();
  const categories = getCategories();

  return (
    <div className="mx-auto max-w-6xl">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      <div className="mb-8">
        <h1 className="font-serif text-3xl sm:text-4xl">Good listening starts here</h1>
        <p className="mt-2 max-w-xl text-muted">
          A curated podcast player for curious listeners. Subscribe to your
          favorite shows, stream new episodes, and pick up right where you left
          off — across every device.
        </p>
      </div>

      <ContinueListening />

      <section className="mb-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Featured shows</h2>
          <Link href="/browse" className="text-sm text-accent-soft hover:underline">
            Browse all
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {shows.map((s) => (
            <ShowCard key={s.slug} {...s} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold">Categories</h2>
        <div className="flex flex-wrap gap-3">
          {categories.map((c) => (
            <Link
              key={c.slug}
              href={`/browse?cat=${c.slug}`}
              className="rounded-full border border-line bg-surface px-4 py-2 text-sm capitalize transition hover:border-accent hover:text-white"
            >
              {c.slug}{" "}
              <span className="text-muted">({c.count})</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
