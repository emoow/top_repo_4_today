export function TimelineShell() {
  return (
    <div className="space-y-4 rounded-xl border border-line bg-surface p-5">
      <div className="space-y-1">
        <div className="text-xs font-medium uppercase tracking-wide text-ink-muted">
          Timeline
        </div>
        <p className="text-sm text-ink-muted">
          Once daily posts are ingested, this view will render a chronological
          timeline of picks grouped by date, with key metrics and update
          highlights for each repository.
        </p>
      </div>

      <div className="space-y-6">
        {[1, 2, 3].map((idx) => (
          <div key={idx} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className="h-2 w-2 rounded-full bg-ink-muted/60" />
              {idx !== 3 && (
                <div className="mt-1 h-16 w-px bg-gradient-to-b from-ink-muted/40 via-ink-muted/20 to-transparent" />
              )}
            </div>

            <div className="flex-1 space-y-2">
              <div className="h-3 w-24 rounded-full bg-ink-muted/10" />
              <div className="space-y-1.5">
                <div className="h-3 w-40 rounded-full bg-ink-muted/10" />
                <div className="h-3 w-32 rounded-full bg-ink-muted/5" />
              </div>
              <div className="mt-2 flex gap-2">
                <div className="h-5 w-20 rounded-full bg-ink-muted/5" />
                <div className="h-5 w-16 rounded-full bg-ink-muted/5" />
                <div className="h-5 w-14 rounded-full bg-ink-muted/5" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

