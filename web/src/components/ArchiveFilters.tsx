type ArchiveFiltersProps = {
  disabled?: boolean;
};

export function ArchiveFilters({ disabled }: ArchiveFiltersProps) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-line bg-surface p-4 text-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="text-xs font-medium uppercase tracking-wide text-ink-muted">
            Filters
          </div>
          <div className="text-xs text-ink-muted">
            Narrow by date, source, and language once posts are available.
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="rounded-full border border-line px-3 py-1 text-xs font-medium text-ink-muted hover:bg-app hover:text-ink disabled:opacity-60"
            disabled={disabled}
          >
            Clear
          </button>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <div className="space-y-1">
          <label className="text-xs font-medium text-ink-muted">Date</label>
          <div className="flex items-center gap-2">
            <select
              className="w-full rounded-md border border-line bg-app px-2 py-1.5 text-xs text-ink outline-none ring-0 focus:border-ink"
              disabled={disabled}
            >
              <option>Any time</option>
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>This year</option>
            </select>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-ink-muted">Source</label>
          <div className="flex flex-wrap gap-1.5">
            {["Stars", "Forks", "Re-summaries"].map((label) => (
              <button
                key={label}
                type="button"
                className="rounded-full border border-line px-2.5 py-1 text-xs text-ink-muted hover:bg-app hover:text-ink disabled:opacity-60"
                disabled={disabled}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-ink-muted">
            Language tags
          </label>
          <div className="flex items-center gap-2">
            <input
              type="search"
              placeholder="e.g. TypeScript, Rust"
              className="w-full rounded-md border border-line bg-app px-2 py-1.5 text-xs text-ink placeholder:text-ink-muted outline-none ring-0 focus:border-ink"
              disabled={disabled}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

