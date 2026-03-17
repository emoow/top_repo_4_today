import type { GitHubClient } from "@/lib/github/githubClient";

export type ManifestSignal = {
  path: string;
  kind: "manifest" | "lockfile" | "ci" | "infra" | "docs";
  label: string;
};

export type RepoSummary = {
  purpose: {
    description: string | null;
    homepage?: string | null;
    topics: string[];
    readmeExcerpt?: string | null;
  };
  techStack: {
    languages: { name: string; bytes: number; pct: number }[];
    manifests: ManifestSignal[];
    js?: {
      dependenciesTop?: string[];
      devDependenciesTop?: string[];
    };
  };
  pros: string[];
  cons: string[];
  updateHistory: {
    pushedAt?: string | null;
    latestRelease?: { tag?: string | null; publishedAt?: string | null } | null;
    recentReleases?: { tag: string; publishedAt: string }[];
  };
};

function pctBreakdown(map: Record<string, number>) {
  const entries = Object.entries(map);
  const total = entries.reduce((acc, [, v]) => acc + v, 0);
  return entries
    .map(([name, bytes]) => ({
      name,
      bytes,
      pct: total > 0 ? bytes / total : 0,
    }))
    .sort((a, b) => b.bytes - a.bytes);
}

function clip(s: string, max: number) {
  if (s.length <= max) return s;
  return `${s.slice(0, max - 1).trimEnd()}…`;
}

async function tryGetTextFileViaContents(
  client: GitHubClient,
  params: { owner: string; repo: string; path: string },
): Promise<string | null> {
  try {
    const res = await client.getContents({
      owner: params.owner,
      repo: params.repo,
      path: params.path,
    });
    if (!res || Array.isArray(res)) return null;
    const obj =
      res && typeof res === "object" ? (res as Record<string, unknown>) : null;
    const downloadUrl =
      typeof obj?.download_url === "string" ? obj.download_url : null;
    if (downloadUrl && downloadUrl.length > 0) return await client.downloadText(downloadUrl);
    return null;
  } catch {
    return null;
  }
}

async function detectManifests(
  client: GitHubClient,
  owner: string,
  repo: string,
): Promise<ManifestSignal[]> {
  const candidates: ManifestSignal[] = [
    { path: "package.json", kind: "manifest", label: "Node package.json" },
    { path: "pnpm-lock.yaml", kind: "lockfile", label: "pnpm lockfile" },
    { path: "yarn.lock", kind: "lockfile", label: "Yarn lockfile" },
    { path: "package-lock.json", kind: "lockfile", label: "npm lockfile" },
    { path: "pyproject.toml", kind: "manifest", label: "Python pyproject.toml" },
    { path: "requirements.txt", kind: "manifest", label: "Python requirements.txt" },
    { path: "poetry.lock", kind: "lockfile", label: "Poetry lockfile" },
    { path: "go.mod", kind: "manifest", label: "Go go.mod" },
    { path: "Cargo.toml", kind: "manifest", label: "Rust Cargo.toml" },
    { path: "pom.xml", kind: "manifest", label: "Maven pom.xml" },
    { path: "build.gradle", kind: "manifest", label: "Gradle build.gradle" },
    { path: "Dockerfile", kind: "infra", label: "Dockerfile" },
    { path: "docker-compose.yml", kind: "infra", label: "docker-compose" },
    { path: ".github/workflows", kind: "ci", label: "GitHub Actions" },
    { path: "README.md", kind: "docs", label: "README" },
    { path: "LICENSE", kind: "docs", label: "License file" },
  ];

  const found: ManifestSignal[] = [];

  await Promise.all(
    candidates.map(async (c) => {
      try {
        await client.getContents({ owner, repo, path: c.path });
        found.push(c);
      } catch {
        // ignore
      }
    }),
  );

  return found.sort((a, b) => a.path.localeCompare(b.path));
}

function heuristicsProsCons(params: {
  hasReadme: boolean;
  hasLicense: boolean;
  hasCI: boolean;
  stars: number;
  openIssues: number;
  pushedAt?: string | null;
}) {
  const pros: string[] = [];
  const cons: string[] = [];

  if (params.hasReadme) pros.push("Documentation is present (README).");
  else cons.push("No README detected, documentation may be incomplete.");

  if (params.hasLicense) pros.push("License file detected.");
  else cons.push("No license file detected; usage terms may be unclear.");

  if (params.hasCI) pros.push("CI configuration detected (GitHub Actions).");
  else cons.push("No CI workflows detected.");

  if (params.openIssues > 500 && params.stars < params.openIssues)
    cons.push("High open issue count relative to stars.");

  if (!params.pushedAt) cons.push("No recent push timestamp available.");

  return { pros, cons };
}

export async function summarizeRepo(params: {
  client: GitHubClient;
  owner: string;
  repo: string;
}): Promise<RepoSummary> {
  const [repo, topicsRes, languagesRes] = await Promise.all([
    params.client.getRepo({ owner: params.owner, repo: params.repo }),
    params.client.getRepoTopics({ owner: params.owner, repo: params.repo }).catch(() => ({
      names: [],
    })),
    params.client.getRepoLanguages({ owner: params.owner, repo: params.repo }).catch(() => ({})),
  ]);

  const manifests = await detectManifests(params.client, params.owner, params.repo);

  const hasReadme = manifests.some((m) => m.path === "README.md");
  const hasLicense = manifests.some((m) => m.path === "LICENSE");
  const hasCI = manifests.some((m) => m.path.startsWith(".github/workflows"));

  const readmeExcerpt = await (async () => {
    const md = await tryGetTextFileViaContents(params.client, {
      owner: params.owner,
      repo: params.repo,
      path: "README.md",
    });
    if (!md) return null;
    const firstParagraph =
      md
        .split(/\n\s*\n/g)
        .map((p) => p.replace(/\s+/g, " ").trim())
        .find((p) => p.length > 40) ?? null;
    return firstParagraph ? clip(firstParagraph, 280) : null;
  })();

  const latestRelease = await params.client
    .getLatestRelease({ owner: params.owner, repo: params.repo })
    .then((r) => ({
      tag: typeof r.tag_name === "string" ? r.tag_name : null,
      publishedAt: typeof r.published_at === "string" ? r.published_at : null,
    }))
    .catch(() => null);

  const recentReleases = await params.client
    .listReleases({ owner: params.owner, repo: params.repo, perPage: 10, page: 1 })
    .then((rels) =>
      rels
        .map((r) => ({
          tag: String(r.tag_name ?? ""),
          publishedAt: String(r.published_at ?? ""),
        }))
        .filter((r) => r.tag && r.publishedAt),
    )
    .catch(() => []);

  const { pros, cons } = heuristicsProsCons({
    hasReadme,
    hasLicense,
    hasCI,
    stars: Number(repo.stargazers_count ?? 0),
    openIssues: Number(repo.open_issues_count ?? 0),
    pushedAt: typeof repo.pushed_at === "string" ? repo.pushed_at : null,
  });

  const langBreakdown = pctBreakdown(languagesRes as Record<string, number>).slice(0, 8);

  const jsSignals = await (async () => {
    const pkgJson = await tryGetTextFileViaContents(params.client, {
      owner: params.owner,
      repo: params.repo,
      path: "package.json",
    });
    if (!pkgJson) return undefined;
    try {
      const parsed: unknown = JSON.parse(pkgJson);
      const obj =
        parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : null;
      const depsObj =
        obj?.dependencies && typeof obj.dependencies === "object"
          ? (obj.dependencies as Record<string, unknown>)
          : null;
      const devDepsObj =
        obj?.devDependencies && typeof obj.devDependencies === "object"
          ? (obj.devDependencies as Record<string, unknown>)
          : null;
      const deps = depsObj ? Object.keys(depsObj) : [];
      const devDeps = devDepsObj ? Object.keys(devDepsObj) : [];
      return {
        dependenciesTop: deps.slice(0, 12),
        devDependenciesTop: devDeps.slice(0, 12),
      };
    } catch {
      return undefined;
    }
  })();

  return {
    purpose: {
      description: typeof repo.description === "string" ? repo.description : null,
      homepage: typeof repo.homepage === "string" ? repo.homepage : null,
      topics: Array.isArray(topicsRes.names) ? topicsRes.names : [],
      readmeExcerpt,
    },
    techStack: {
      languages: langBreakdown.map((l) => ({
        name: l.name,
        bytes: l.bytes,
        pct: l.pct,
      })),
      manifests,
      js: jsSignals,
    },
    pros,
    cons,
    updateHistory: {
      pushedAt: typeof repo.pushed_at === "string" ? repo.pushed_at : null,
      latestRelease,
      recentReleases,
    },
  };
}

