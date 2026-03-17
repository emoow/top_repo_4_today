import Link from "next/link";

function fmt(n: number) {
  return Intl.NumberFormat("en", { notation: "compact" }).format(n);
}

export type PickCardData = {
  title: string;
  slug: string | null;
  fullName: string;
  htmlUrl: string;
  description: string | null;
  stars: number;
  forks: number;
  topics: string[];
};

export function PickCard({ data }: { data: PickCardData }) {
  const CardInner = (
    <div className="rounded-xl border border-line bg-surface p-5 hover:bg-surface/80">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 space-y-1">
          <div className="truncate text-sm font-semibold tracking-tight text-ink">
            {data.fullName}
          </div>
          <div className="line-clamp-2 text-sm leading-6 text-ink-muted">
            {data.description ?? "No description provided."}
          </div>
        </div>
        <div className="shrink-0 text-right text-xs text-ink-muted">
          <div>Stars {fmt(data.stars)}</div>
          <div>Forks {fmt(data.forks)}</div>
        </div>
      </div>

      {data.topics.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {data.topics.slice(0, 6).map((t) => (
            <span
              key={t}
              className="rounded-full border border-line bg-app px-2 py-0.5 text-[11px] text-ink-muted"
            >
              {t}
            </span>
          ))}
        </div>
      )}
    </div>
  );

  if (data.slug) {
    return (
      <Link href={`/p/${data.slug}`} className="block">
        {CardInner}
      </Link>
    );
  }

  return (
    <a
      href={data.htmlUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="block"
    >
      {CardInner}
    </a>
  );
}

