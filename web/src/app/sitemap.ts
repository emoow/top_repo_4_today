import type { MetadataRoute } from "next";
import { prisma } from "@/server/db";

export const runtime = "nodejs";

function siteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://toprepostoday.vercel.app"
  );
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl().replace(/\/+$/, "");

  const staticEntries: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: new Date() },
    { url: `${base}/archive`, lastModified: new Date() },
    { url: `${base}/about`, lastModified: new Date() },
  ];

  // Allow builds without DATABASE_URL (local builds, previews without DB).
  if (!process.env.DATABASE_URL) return staticEntries;

  const posts = await prisma.post.findMany({
    select: { slug: true, updatedAt: true },
    orderBy: { updatedAt: "desc" },
    take: 5000,
  });

  return [
    ...staticEntries,
    ...posts.map((p) => ({
      url: `${base}/p/${p.slug}`,
      lastModified: p.updatedAt,
    })),
  ];
}

