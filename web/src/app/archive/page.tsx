import type { Metadata } from "next";
import Link from "next/link";
import { ArchiveFilters } from "@/components/ArchiveFilters";
import { TimelineShell } from "@/components/TimelineShell";

export const metadata: Metadata = {
  title: "Archive",
  description:
    "Browse the historical archive of daily top GitHub repository picks with filters and a timeline view.",
};

export default function ArchivePage() {
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
        <TimelineShell />

        <div className="rounded-xl border border-dashed border-line bg-surface/60 p-5 text-sm text-ink-muted">
          <div className="space-y-1">
            <div className="font-medium text-ink">
              No archive entries yet.
            </div>
            <p>
              As soon as the daily job starts writing posts, this page will show
              a chronological timeline of picks. For now, return to{" "}
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
      </section>
    </div>
  );
}
