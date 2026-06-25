import Image from "next/image";
import Link from "next/link";

export function ShowCard({
  slug,
  name,
  author,
  art,
  cat,
}: {
  slug: string;
  name: string;
  author: string;
  art: string;
  cat?: string;
}) {
  return (
    <div>
      <Link
        href={`/show/${slug}`}
        className="block rounded-xl bg-surface p-3 transition hover:bg-elevated"
      >
        <div className="relative mb-3 aspect-square overflow-hidden rounded-lg bg-line">
          {art ? (
            <Image
              src={art}
              alt={`${name} artwork`}
              fill
              sizes="(max-width: 768px) 45vw, 200px"
              className="object-cover"
              unoptimized
            />
          ) : null}
        </div>
        <div className="truncate text-sm font-semibold">{name}</div>
        <div className="truncate text-xs text-muted">{author}</div>
        {cat ? (
          <span className="mt-2 inline-block rounded-full bg-elevated px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted">
            {cat}
          </span>
        ) : null}
      </Link>

    </div>
  );
}
