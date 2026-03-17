import type { GitHubClient } from "@/lib/github/githubClient";
import { buildPostSlug } from "@/lib/posts/slug";
import { renderPostMarkdown } from "@/lib/posts/renderPostMarkdown";
import { summarizeRepo } from "@/lib/summarize/summarizeRepo";
import { prisma } from "@/server/db";
import type { Prisma } from "@prisma/client";

function toDayUTCISO(d: Date): string {
  const day = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  return day.toISOString().slice(0, 10);
}

export async function createPostForRepo(params: {
  client: GitHubClient;
  owner: string;
  repo: string;
  now?: Date;
}) {
  const now = params.now ?? new Date();
  const dayISO = toDayUTCISO(now);

  const repoRes = await params.client.getRepo({ owner: params.owner, repo: params.repo });
  const fullName = String(repoRes.full_name ?? `${params.owner}/${params.repo}`);
  const htmlUrl = String(repoRes.html_url ?? "");

  const topicsRes = await params.client
    .getRepoTopics({ owner: params.owner, repo: params.repo })
    .catch(() => ({ names: [] as string[] }));
  const languagesRes = await params.client
    .getRepoLanguages({ owner: params.owner, repo: params.repo })
    .catch(() => ({} as Record<string, number>));

  const summary = await summarizeRepo({
    client: params.client,
    owner: params.owner,
    repo: params.repo,
  });

  const slug = buildPostSlug({ fullName, dayISO });
  const title = `${fullName} (${dayISO})`;

  const bodyMarkdown = renderPostMarkdown({
    fullName,
    htmlUrl,
    stars: Number(repoRes.stargazers_count ?? 0),
    forks: Number(repoRes.forks_count ?? 0),
    summary,
  });

  const savedRepo = await prisma.repo.upsert({
    where: { githubId: Number(repoRes.id) },
    update: {
      owner: String(repoRes.owner?.login ?? params.owner),
      name: String(repoRes.name ?? params.repo),
      fullName,
      htmlUrl,
    },
    create: {
      githubId: Number(repoRes.id),
      owner: String(repoRes.owner?.login ?? params.owner),
      name: String(repoRes.name ?? params.repo),
      fullName,
      htmlUrl,
    },
  });

  const snapshot = await prisma.repoSnapshot.create({
    data: {
      repoId: savedRepo.id,
      stars: Number(repoRes.stargazers_count ?? 0),
      forks: Number(repoRes.forks_count ?? 0),
      openIssues: Number(repoRes.open_issues_count ?? 0),
      watchers: Number(repoRes.watchers_count ?? 0),
      defaultBranch: typeof repoRes.default_branch === "string" ? repoRes.default_branch : null,
      pushedAt: typeof repoRes.pushed_at === "string" ? new Date(repoRes.pushed_at) : null,
      topics: Array.isArray(topicsRes.names) ? topicsRes.names : [],
      languageMain: typeof repoRes.language === "string" ? repoRes.language : null,
      languagesJson: languagesRes as Prisma.InputJsonValue,
      licenseSpdx:
        typeof repoRes.license?.spdx_id === "string" ? repoRes.license.spdx_id : null,
      homepage: typeof repoRes.homepage === "string" ? repoRes.homepage : null,
      description: typeof repoRes.description === "string" ? repoRes.description : null,
    },
  });

  const post = await prisma.post.upsert({
    where: { slug },
    update: {
      title,
      snapshotId: snapshot.id,
      summaryJson: summary as Prisma.InputJsonValue,
      bodyMarkdown,
    },
    create: {
      repoId: savedRepo.id,
      snapshotId: snapshot.id,
      title,
      slug,
      summaryJson: summary as Prisma.InputJsonValue,
      bodyMarkdown,
    },
  });

  return { repo: savedRepo, snapshot, post, dayISO };
}

