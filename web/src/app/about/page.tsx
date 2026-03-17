import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn how Top Repos Today selects daily GitHub repositories and generates deterministic, rule-based summaries.",
};

export default function AboutPage() {
  return (
    <div className="space-y-10">
      <section className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight">About</h1>
        <p className="max-w-2xl text-base leading-7 text-ink-muted">
          This site publishes daily posts about top GitHub repositories,
          selected by stars and forks with a no-repeat rule. Summaries are
          generated from repository metadata, file signals, and update history.
        </p>
      </section>

      <section className="rounded-xl border border-line bg-surface p-5">
        <div className="space-y-2 text-sm text-ink-muted">
          <div>Data sources: GitHub public APIs.</div>
          <div>Summaries: deterministic rule-based extraction (no LLM).</div>
        </div>
      </section>
    </div>
  );
}

