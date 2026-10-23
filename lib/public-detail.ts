import type { ContentType } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function getPublicDetail(slug: string, type?: ContentType) {
  try {
    return await prisma.content.findFirst({
      where: { slug, status: "PUBLISHED", ...(type ? { type } : {}) },
      include: {
        streamServers: { where: { isActive: true }, orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] },
        seasons: {
          orderBy: { seasonNumber: "asc" },
          include: {
            episodes: {
              where: { isPublished: true },
              orderBy: { episodeNumber: "asc" },
              include: {
                streamServers: { where: { isActive: true }, orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] }
              }
            }
          }
        }
      }
    });
  } catch {
    return null;
  }
}
