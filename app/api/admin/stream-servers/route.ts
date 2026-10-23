import { NextResponse } from "next/server";
import { z } from "zod";
import { isAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { isAllowedEmbedUrl } from "@/lib/embed";

const schema = z.object({
  contentId: z.string().min(1).optional().nullable(),
  episodeId: z.string().min(1).optional().nullable(),
  name: z.string().trim().min(1).max(100),
  url: z.string().url().max(2000).refine(isAllowedEmbedUrl, "رابط المشغّل غير مسموح به. استخدم HTTPS ومضيفًا مسموحًا."),
  sortOrder: z.number().int().min(0).max(1000).optional(),
  isActive: z.boolean().default(true)
}).superRefine((value, ctx) => {
  if (Boolean(value.contentId) === Boolean(value.episodeId)) {
    ctx.addIssue({ code: "custom", message: "Choose exactly one content item or episode for this server." });
  }
});

export async function GET(req: Request) {
  if (!await isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const params = new URL(req.url).searchParams;
  const contentId = params.get("contentId");
  const episodeId = params.get("episodeId");
  if (Boolean(contentId) === Boolean(episodeId)) {
    return NextResponse.json({ error: "Pass exactly one of contentId or episodeId." }, { status: 400 });
  }
  try {
    const servers = await prisma.streamServer.findMany({
      where: contentId ? { contentId } : { episodeId: episodeId! },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }]
    });
    return NextResponse.json({ servers });
  } catch {
    return NextResponse.json({ error: "Could not load streaming servers. Apply the latest Prisma schema first." }, { status: 503 });
  }
}

export async function POST(req: Request) {
  if (!await isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid streaming server." }, { status: 400 });
  try {
    const servers = await prisma.streamServer.findMany({
      where: parsed.data.contentId ? { contentId: parsed.data.contentId } : { episodeId: parsed.data.episodeId! },
      select: { sortOrder: true }
    });
    const server = await prisma.$transaction(async tx => {
      const created = await tx.streamServer.create({
        data: {
          ...parsed.data,
          contentId: parsed.data.contentId || null,
          episodeId: parsed.data.episodeId || null,
          sortOrder: parsed.data.sortOrder ?? (servers.length ? Math.max(...servers.map(s => s.sortOrder)) + 1 : 0)
        }
      });
      // Once a legacy single URL is migrated into the StreamServer table, don't let it bypass server activation controls.
      if (parsed.data.contentId) {
        await tx.content.update({ where: { id: parsed.data.contentId }, data: { embedUrl: null } });
      } else if (parsed.data.episodeId) {
        await tx.episode.update({ where: { id: parsed.data.episodeId }, data: { embedUrl: null } });
      }
      return created;
    });
    return NextResponse.json({ server }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Could not save the streaming server. Check the parent item and database schema." }, { status: 400 });
  }
}
