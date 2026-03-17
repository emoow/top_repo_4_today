import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/server/db";
import { Markdown } from "@/components/Markdown";

export const runtime = "nodejs";

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const post = await prisma.post.findUnique({
    where: { slug },
    include: {
      repo: true,
      snapshot: true,
    },
  });

  if (!post) notFound();

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <div className="text-sm text-ink-muted">
          <Link href="/archive" className="hover:text-ink">
            Archive
          </Link>
          <span className="px-2">/</span>
          <span className="text-ink">{post.repo.fullName}</span>
        </div>

        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h1 className="text-3xl font-semibold tracking-tight">{post.title}</h1>
          <a
            href={post.repo.htmlUrl}
            className="rounded-md border border-line bg-surface px-3 py-1.5 text-sm text-ink-muted hover:text-ink"
            target="_blank"
            rel="noopener noreferrer"
          >
            View on GitHub
          </a>
        </div>
      </div>

      <div className="grid gap-3 rounded-xl border border-line bg-surface p-5 sm:grid-cols-3">
        <div>
          <div className="text-xs uppercase tracking-wide text-ink-muted">
            Stars
          </div>
          <div className="mt-1 text-sm">{post.snapshot.stars}</div>
        </div>
        <div>
          <div className="text-xs uppercase tracking-wide text-ink-muted">
            Forks
          </div>
          <div className="mt-1 text-sm">{post.snapshot.forks}</div>
        </div>
        <div>
          <div className="text-xs uppercase tracking-wide text-ink-muted">
            Captured
          </div>
          <div className="mt-1 text-sm">
            {post.snapshot.capturedAt.toISOString().slice(0, 10)}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-line bg-surface p-6">
        <Markdown markdown={post.bodyMarkdown} />
      </div>
    </div>
  );
}

