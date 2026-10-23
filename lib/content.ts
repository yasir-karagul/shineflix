import type { ContentType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { tmdbImageUrl, tmdbPageUrl } from "@/lib/tmdb-images";

export async function getPublishedContent(type?: ContentType) {
  try {
    const rows = await prisma.content.findMany({
      where: { publicationStatus: "PUBLISHED", ...(type ? { type } : {}) },
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
      rating: row.voteAverage?.toFixed(1) ?? "—",
      episodes: row.type === "MOVIE" ? "فيلم" : row.type === "ANIME" ? "أنمي" : "مسلسل",
      description: row.overview,
      accent: "#ef334f",
      cover: row.posterPath ? "url(\"" + (tmdbImageUrl(row.posterPath, "w500") ?? "") + "\") center/cover no-repeat" : "linear-gradient(145deg,#24121f,#8d233e)",
      featured: row.isFeatured,
      type: row.type,
      posterUrl: tmdbImageUrl(row.posterPath, "w500"),
      backdropUrl: tmdbImageUrl(row.backdropPath, "w1280"),
      logoUrl: tmdbImageUrl(row.logoPath, "original"),
      tmdbId: row.tmdbId,
      mediaType: row.mediaType,
      tmdbUrl: tmdbPageUrl(row.tmdbId, row.mediaType),
      originalLanguage: row.originalLanguage,
      alternativeTitles: row.alternativeTitles,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString()
    }));
  } catch {
    return [];
  }
}

export async function getLatestEpisodes(take = 8) {
  try {
    const safeTake = Math.max(1, Math.min(Math.floor(take), 12));
    return await prisma.episode.findMany({
      where: {
        isPublished: true,
        season: {
          is: {
            content: {
              is: { publicationStatus: "PUBLISHED", type: "ANIME" }
            }
          }
        }
      },
      orderBy: [
        { releaseDate: { sort: "desc", nulls: "last" } },
        { updatedAt: "desc" }
      ],
      take: safeTake,
      select: {
        id: true,
        episodeNumber: true,
        title: true,
        releaseDate: true,
        season: {
          select: {
            seasonNumber: true,
            content: {
              select: {
                slug: true, title: true, originalTitle: true, posterPath: true,
                backdropPath: true, releaseYear: true, voteAverage: true
              }
            }
          }
        }
      }
    });
  } catch {
    return [];
  }
}

export function toContentType(value: string): ContentType | undefined {
  return value === "MOVIE" || value === "SERIES" || value === "ANIME" ? value : undefined;
}
