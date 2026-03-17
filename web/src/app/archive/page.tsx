import type { Metadata } from "next";
import Link from "next/link";
import { ArchiveFilters } from "@/components/ArchiveFilters";
import { PickCard } from "@/components/PickCard";
import { prisma } from "@/server/db";

export const metadata: Metadata = {
  title: "Archive",
  description:
    "Browse the historical archive of daily top GitHub repository picks with filters and a timeline view.",
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function dayKey(d: Date) {
  return d.toISOString().slice(0, 10);
}

export default async function ArchivePage() {
  const picks = await prisma.pick.findMany({
    orderBy: [{ date: "desc" }, { source: "asc" }, { rank: "asc" }],
    take: 300,
    include: {
      repo: true,
      post: { include: { snapshot: true } },
    },
  });

  const byDay = new Map<string, typeof picks>();
  for (const p of picks) {
    const k = dayKey(p.date);
    const arr = byDay.get(k) ?? [];
    arr.push(p);
    byDay.set(k, arr);
  }
  const days = Array.from(byDay.keys()).sort((a, b) => b.localeCompare(a));

  return (
    <div className="space-y-10">
      <section className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight">Archive</h1>
        <p className="max-w-2xl text-base leading-7 text-ink-muted">
          Daily picks grouped by date with filters and a timeline view. Once the
          pipeline is live, each day&apos;s post will appear here.
        </p>
      </section>

      <ArchiveFilters disabled />

      <section className="space-y-4">
        {days.length === 0 ? (
          <div className="rounded-xl border border-dashed border-line bg-surface/60 p-5 text-sm text-ink-muted">
            <div className="space-y-1">
              <div className="font-medium text-ink">No archive entries yet.</div>
              <p>
                As soon as the daily job starts writing posts, this page will
                show a chronological timeline of picks. For now, return to{" "}
                <Link
                  href="/"
                  className="font-medium text-ink underline underline-offset-4"
                >
                  Today
                </Link>
                .
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-10">
            {days.map((day) => {
              const dayPicks = byDay.get(day) ?? [];
              const stars = dayPicks.filter((p) => p.source === "star");
              const forks = dayPicks.filter((p) => p.source === "fork");

              return (
                <div key={day} className="space-y-4">
                  <div className="flex items-baseline justify-between gap-4">
                    <div className="text-sm font-semibold tracking-tight">
                      {day}
                    </div>
                    <div className="text-xs text-ink-muted">
                      {dayPicks.length} picks
                    </div>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <section className="space-y-3">
                      <h3 className="text-xs font-medium uppercase tracking-wide text-ink-muted">
                        Stars
                      </h3>
                      <div className="space-y-3">
                        {stars.map((p) => (
                          <PickCard
                            key={p.id}
                            data={{
                              title: p.post?.title ?? p.repo.fullName,
                              slug: p.post?.slug ?? null,
                              fullName: p.repo.fullName,
                              htmlUrl: p.repo.htmlUrl,
                              description: p.post?.snapshot.description ?? null,
                              stars: p.post?.snapshot.stars ?? 0,
                              forks: p.post?.snapshot.forks ?? 0,
                              topics: p.post?.snapshot.topics ?? [],
                            }}
                          />
                        ))}
                      </div>
                    </section>

                    <section className="space-y-3">
                      <h3 className="text-xs font-medium uppercase tracking-wide text-ink-muted">
                        Forks
                      </h3>
                      <div className="space-y-3">
                        {forks.map((p) => (
                          <PickCard
                            key={p.id}
                            data={{
                              title: p.post?.title ?? p.repo.fullName,
                              slug: p.post?.slug ?? null,
                              fullName: p.repo.fullName,
                              htmlUrl: p.repo.htmlUrl,
                              description: p.post?.snapshot.description ?? null,
                              stars: p.post?.snapshot.stars ?? 0,
                              forks: p.post?.snapshot.forks ?? 0,
                              topics: p.post?.snapshot.topics ?? [],
                            }}
                          />
                        ))}
                      </div>
                    </section>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
