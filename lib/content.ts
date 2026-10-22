import type { ContentType } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function getPublishedContent(type?: ContentType) {
  try {
    const rows = await prisma.content.findMany({
      where: { status: "PUBLISHED", ...(type ? { type } : {}) },
      orderBy: [{ isFeatured: "desc" }, { updatedAt: "desc" }],
      take: 100
    });
    return rows.map(row => ({
      id: row.id,
      slug: row.slug,
      title: row.title,
      titleEn: row.originalTitle ?? row.title,
      year: row.releaseYear ?? 0,
      status: row.endYear ? "مكتمل" as const : "يعرض الآن" as const,
      genres: row.genres,
      rating: row.imdbRating?.toFixed(1) ?? "—",
      episodes: row.type === "MOVIE" ? "فيلم" : row.type === "ANIME" ? "أنمي" : "مسلسل",
      description: row.synopsis,
      accent: "#ef334f",
      cover: row.posterUrl ? `url("${row.posterUrl}") center/cover no-repeat` : "linear-gradient(145deg,#24121f,#8d233e)",
      featured: row.isFeatured,
      type: row.type,
      posterUrl: row.posterUrl,
      imdbId: row.imdbId
    }));
  } catch {
    return [];
  }
}

export function toContentType(value: string): ContentType | undefined {
  return value === "MOVIE" || value === "SERIES" || value === "ANIME" ? value : undefined;
}
