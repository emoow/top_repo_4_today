import Link from "next/link";

export default function Home() {
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

        <div className="rounded-xl border border-line bg-surface p-5">
          <div className="text-sm text-ink-muted">
            No data yet. Once the daily job runs, posts will show up here.
          </div>
        </div>
      </section>
    </div>
  );
}
