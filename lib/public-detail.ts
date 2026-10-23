import type { ContentType } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function getPublicDetail(slug: string, type?: ContentType) {
  try {
    return await prisma.content.findFirst({
      where: { slug, publicationStatus: "PUBLISHED", ...(type ? { type } : {}) },
      include: {
        seasons: {
          orderBy: { seasonNumber: "asc" },
          include: { episodes: { where: { isPublished: true }, orderBy: { episodeNumber: "asc" } } }
        }
      }
    });
  } catch {
    return null;
  }
}
