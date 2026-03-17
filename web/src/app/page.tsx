import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/server/db";
import { PickCard } from "@/components/PickCard";

export const metadata: Metadata = {
  title: "Today",
  description:
    "Daily picks of top GitHub repositories by stars and forks, with structured, rule-based summaries.",
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function Home() {
  const latest = await prisma.pick.findFirst({
    orderBy: { date: "desc" },
    select: { date: true },
  });

  const picks = latest
    ? await prisma.pick.findMany({
        where: { date: latest.date },
        orderBy: [{ source: "asc" }, { rank: "asc" }],
        include: {
          repo: true,
          post: { include: { snapshot: true } },
        },
      })
    : [];

  const stars = picks.filter((p) => p.source === "star");
  const forks = picks.filter((p) => p.source === "fork");

  return (
    <div className="space-y-10">
      <section className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight">Today</h1>
        <p className="max-w-2xl text-base leading-7 text-ink-muted">
          Each day we select top GitHub repositories by stars and forks, ensure
          no repeats, and publish a structured summary of purpose, tech stack,
          update history, and notable signals.
        </p>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight">Latest picks</h2>
          <Link
            href="/archive"
            className="rounded-md px-2 py-1 text-sm text-ink-muted hover:bg-surface hover:text-ink"
          >
            View archive
          </Link>
        </div>

        {latest ? (
          <div className="space-y-8">
            <div className="text-sm text-ink-muted">
              Date: {latest.date.toISOString().slice(0, 10)}
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <section className="space-y-3">
                <h3 className="text-sm font-semibold tracking-tight">
                  Top starred
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
                <h3 className="text-sm font-semibold tracking-tight">
                  Top forked
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
        ) : (
          <div className="rounded-xl border border-line bg-surface p-5">
            <div className="text-sm text-ink-muted">
              No data yet. Once the daily job runs, posts will show up here.
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
