import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "");
  if (!siteUrl) return [];

  const staticRoutes = ["/", "/anime", "/movies", "/series", "/schedule"];
  const entries: MetadataRoute.Sitemap = staticRoutes.map(path => ({
    url: siteUrl + path,
    changeFrequency: path === "/" ? "weekly" : "daily",
    priority: path === "/" ? 1 : path === "/anime" ? 0.9 : 0.7
  }));

  try {
    const items = await prisma.content.findMany({
      where: { publicationStatus: "PUBLISHED" },
      select: { slug: true, type: true, updatedAt: true },
      take: 10000
    });
    for (const item of items) {
      const prefix = item.type === "MOVIE" ? "/movies/" : item.type === "SERIES" ? "/series/" : "/anime/";
      entries.push({
        url: siteUrl + prefix + item.slug,
        lastModified: item.updatedAt,
        changeFrequency: "weekly",
        priority: 0.6
      });
    }
  } catch {
    // Keep the static catalogue routes available if the database is temporarily unavailable.
  }
  return entries;
}
