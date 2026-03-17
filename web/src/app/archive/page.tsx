import Link from "next/link";

export default function ArchivePage() {
  return (
    <div className="space-y-10">
      <section className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight">Archive</h1>
        <p className="max-w-2xl text-base leading-7 text-ink-muted">
          Daily picks grouped by date. Filters and search will be added once the
          data pipeline is in place.
        </p>
      </section>

      <section className="rounded-xl border border-line bg-surface p-5">
        <div className="text-sm text-ink-muted">
          No archive yet. Return to{" "}
          <Link href="/" className="text-ink underline underline-offset-4">
            Today
          </Link>
          .
        </div>
      </section>
    </div>
  );
}

