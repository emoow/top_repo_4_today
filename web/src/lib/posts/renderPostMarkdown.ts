import type { RepoSummary } from "@/lib/summarize/summarizeRepo";

function fmtPct(p: number) {
  return `${Math.round(p * 1000) / 10}%`;
}

export function renderPostMarkdown(params: {
  fullName: string;
  htmlUrl: string;
  stars: number;
  forks: number;
  summary: RepoSummary;
}): string {
  const s = params.summary;

  const lines: string[] = [];
  lines.push(`# ${params.fullName}`);
  lines.push("");
  lines.push(`- Repository: ${params.htmlUrl}`);
  lines.push(`- Stars: ${params.stars}`);
  lines.push(`- Forks: ${params.forks}`);
  lines.push("");

  lines.push("## Purpose");
  lines.push("");
  if (s.purpose.description) lines.push(s.purpose.description);
  else lines.push("No description provided.");
  lines.push("");
  if (s.purpose.homepage) {
    lines.push(`Homepage: ${s.purpose.homepage}`);
    lines.push("");
  }
  if (s.purpose.topics.length > 0) {
    lines.push(`Topics: ${s.purpose.topics.join(", ")}`);
    lines.push("");
  }
  if (s.purpose.readmeExcerpt) {
    lines.push("README excerpt:");
    lines.push("");
    lines.push(`> ${s.purpose.readmeExcerpt}`);
    lines.push("");
  }

  lines.push("## Tech stack");
  lines.push("");
  if (s.techStack.languages.length > 0) {
    lines.push("### Languages");
    lines.push("");
    for (const l of s.techStack.languages) {
      lines.push(`- ${l.name}: ${fmtPct(l.pct)}`);
    }
    lines.push("");
  }

  if (s.techStack.manifests.length > 0) {
    lines.push("### Detected files");
    lines.push("");
    for (const m of s.techStack.manifests) {
      lines.push(`- ${m.label} (\`${m.path}\`)`);
    }
    lines.push("");
  }

  if (s.techStack.js?.dependenciesTop?.length || s.techStack.js?.devDependenciesTop?.length) {
    lines.push("### JavaScript packages (top)");
    lines.push("");
    if (s.techStack.js.dependenciesTop?.length) {
      lines.push(`Dependencies: ${s.techStack.js.dependenciesTop.join(", ")}`);
      lines.push("");
    }
    if (s.techStack.js.devDependenciesTop?.length) {
      lines.push(`Dev dependencies: ${s.techStack.js.devDependenciesTop.join(", ")}`);
      lines.push("");
    }
  }

  lines.push("## Pros");
  lines.push("");
  if (s.pros.length === 0) lines.push("- No strong positives detected.");
  else s.pros.forEach((p) => lines.push(`- ${p}`));
  lines.push("");

  lines.push("## Cons");
  lines.push("");
  if (s.cons.length === 0) lines.push("- No strong concerns detected.");
  else s.cons.forEach((c) => lines.push(`- ${c}`));
  lines.push("");

  lines.push("## Update history");
  lines.push("");
  if (s.updateHistory.pushedAt) lines.push(`Last push: ${s.updateHistory.pushedAt}`);
  if (s.updateHistory.latestRelease?.tag) {
    lines.push(
      `Latest release: ${s.updateHistory.latestRelease.tag}${
        s.updateHistory.latestRelease.publishedAt ? ` (${s.updateHistory.latestRelease.publishedAt})` : ""
      }`,
    );
  }
  lines.push("");
  if (s.updateHistory.recentReleases?.length) {
    lines.push("Recent releases:");
    lines.push("");
    for (const r of s.updateHistory.recentReleases.slice(0, 8)) {
      lines.push(`- ${r.tag} (${r.publishedAt})`);
    }
    lines.push("");
  }

  return lines.join("\n");
}

