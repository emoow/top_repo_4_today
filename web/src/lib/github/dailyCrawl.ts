import type {
  CrawlSource,
  DailyPickCandidate,
  GitHubRepoSearchItem,
} from "@/lib/github/types";
import { GitHubClient } from "@/lib/github/githubClient";
import { prisma } from "@/server/db";

export type CrawlOptions = {
  desiredPerSource?: number;
  allowForks?: boolean;
  allowArchived?: boolean;
};

function uniqById(items: GitHubRepoSearchItem[]): GitHubRepoSearchItem[] {
  const seen = new Set<number>();
  const out: GitHubRepoSearchItem[] = [];
  for (const it of items) {
    if (seen.has(it.id)) continue;
    seen.add(it.id);
    out.push(it);
  }
  return out;
}

async function collectTopUnique(params: {
  client: GitHubClient;
  sort: "stars" | "forks";
  desired: number;
  excludeIds: Set<number>;
  allowForks: boolean;
  allowArchived: boolean;
}): Promise<GitHubRepoSearchItem[]> {
  const perPage = 30;
  const maxPages = 6; // 180 items max; helps fill after no-repeat filtering

  const qualifiers: string[] = ["is:public", "archived:false"];
  if (!params.allowForks) qualifiers.push("fork:false");
  if (params.allowArchived) {
    const idx = qualifiers.indexOf("archived:false");
    if (idx >= 0) qualifiers.splice(idx, 1);
  }
  qualifiers.push(params.sort === "stars" ? "stars:>1" : "forks:>1");

  const q = qualifiers.join(" ");

  const collected: GitHubRepoSearchItem[] = [];
  const localSeen = new Set<number>();

  for (let page = 1; page <= maxPages; page++) {
    const res = await params.client.searchRepositories({
      q,
      sort: params.sort,
      order: "desc",
      perPage,
      page,
    });

    for (const repo of res.items) {
      if (params.excludeIds.has(repo.id)) continue;
      if (localSeen.has(repo.id)) continue;
      if (!params.allowForks && repo.fork) continue;
      if (!params.allowArchived && repo.archived) continue;
      if (repo.disabled) continue;
      localSeen.add(repo.id);
      collected.push(repo);
      if (collected.length >= params.desired) return collected;
    }

    if (res.items.length < perPage) break;
  }

  return collected;
}

async function getAlreadyPickedGithubIds(repos: GitHubRepoSearchItem[]) {
  const ids = repos.map((r) => r.id);
  if (ids.length === 0) return new Set<number>();

  const found = await prisma.repo.findMany({
    where: { githubId: { in: ids } },
    select: { githubId: true, picks: { select: { id: true }, take: 1 } },
  });

  const picked = new Set<number>();
  for (const r of found) {
    if (r.picks.length > 0) picked.add(r.githubId);
  }
  return picked;
}

function rerankBySource(cands: DailyPickCandidate[]): DailyPickCandidate[] {
  const bySource: Record<CrawlSource, DailyPickCandidate[]> = {
    stars: [],
    forks: [],
  };
  for (const c of cands) bySource[c.source].push(c);

  const out: DailyPickCandidate[] = [];
  (["stars", "forks"] as const).forEach((source) => {
    bySource[source].forEach((c, idx) => out.push({ ...c, rank: idx + 1 }));
  });
  return out;
}

export async function crawlDailyTopRepos(
  client: GitHubClient,
  opts: CrawlOptions = {},
): Promise<DailyPickCandidate[]> {
  const desired = opts.desiredPerSource ?? 5;
  const allowForks = opts.allowForks ?? true;
  const allowArchived = opts.allowArchived ?? false;

  const chosen: DailyPickCandidate[] = [];
  const takenIds = new Set<number>();

  const stars = await collectTopUnique({
    client,
    sort: "stars",
    desired: desired * 4,
    excludeIds: takenIds,
    allowForks,
    allowArchived,
  });
  stars.forEach((repo) => takenIds.add(repo.id));
  chosen.push(
    ...stars.map((repo, idx) => ({
      source: "stars" as const,
      rank: idx + 1,
      repo,
    })),
  );

  const forks = await collectTopUnique({
    client,
    sort: "forks",
    desired: desired * 4,
    excludeIds: takenIds,
    allowForks,
    allowArchived,
  });
  forks.forEach((repo) => takenIds.add(repo.id));
  chosen.push(
    ...forks.map((repo, idx) => ({
      source: "forks" as const,
      rank: idx + 1,
      repo,
    })),
  );

  const combinedRepos = uniqById(chosen.map((c) => c.repo));
  const alreadyPicked = await getAlreadyPickedGithubIds(combinedRepos);

  const filtered = chosen.filter((c) => !alreadyPicked.has(c.repo.id));
  const reranked = rerankBySource(filtered);

  const finalBySource: Record<CrawlSource, DailyPickCandidate[]> = {
    stars: [],
    forks: [],
  };
  for (const c of reranked) finalBySource[c.source].push(c);

  const final: DailyPickCandidate[] = [];
  (["stars", "forks"] as const).forEach((source) => {
    final.push(...finalBySource[source].slice(0, desired));
  });

  return final;
}

