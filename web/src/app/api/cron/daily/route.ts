import { GitHubClient } from "@/lib/github/githubClient";
import { crawlDailyTopRepos } from "@/lib/github/dailyCrawl";
import { createPostForRepo } from "@/lib/posts/createPostForRepo";
import { prisma } from "@/server/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function requireCronSecret(request: Request): void {
  const configured = process.env.CRON_SECRET;
  if (!configured) throw new Error("CRON_SECRET is not set");

  const url = new URL(request.url);
  const provided =
    url.searchParams.get("secret") ?? request.headers.get("x-cron-secret");
  if (!provided || provided !== configured) throw new Error("Unauthorized");
}

function startOfDayUTC(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

export async function GET(request: Request): Promise<Response> {
  try {
    requireCronSecret(request);

    const token = process.env.GITHUB_TOKEN;
    if (!token) throw new Error("GITHUB_TOKEN is not set");

    const client = new GitHubClient({
      token,
      userAgent: "top_repo_4_today (cron)",
    });

    const candidates = await crawlDailyTopRepos(client, {
      desiredPerSource: 5,
      allowArchived: false,
      allowForks: true,
    });

    const day = startOfDayUTC(new Date());

    const picks: Array<{
      source: "stars" | "forks";
      rank: number;
      full_name: string;
      slug: string;
    }> = [];

    for (const c of candidates) {
      const [owner, repo] = c.repo.full_name.split("/", 2);
      if (!owner || !repo) continue;

      const { post, repo: savedRepo } = await createPostForRepo({
        client,
        owner,
        repo,
        now: day,
      });

      await prisma.pick.upsert({
        where: {
          date_source_rank: {
            date: day,
            source: c.source === "stars" ? "star" : "fork",
            rank: c.rank,
          },
        },
        update: { repoId: savedRepo.id, postId: post.id },
        create: {
          date: day,
          source: c.source === "stars" ? "star" : "fork",
          rank: c.rank,
          repoId: savedRepo.id,
          postId: post.id,
        },
      });

      picks.push({
        source: c.source,
        rank: c.rank,
        full_name: c.repo.full_name,
        slug: post.slug,
      });
    }

    return Response.json(
      {
        ok: true,
        date: day.toISOString().slice(0, 10),
        count: picks.length,
        picks,
      },
      { status: 200 },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    const status = message === "Unauthorized" ? 401 : 500;
    return Response.json({ ok: false, error: message }, { status });
  }
}

