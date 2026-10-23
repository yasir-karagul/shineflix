import { NextResponse } from "next/server";
import { z } from "zod";
import { isAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { isAllowedEmbedUrl } from "@/lib/embed";

const schema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  url: z.string().url().max(2000).refine(isAllowedEmbedUrl, "رابط المشغّل غير مسموح به.").optional(),
  sortOrder: z.number().int().min(0).max(1000).optional(),
  isActive: z.boolean().optional()
}).refine(value => Object.keys(value).length > 0, "No fields to update.");

type Context = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, ctx: Context) {
  if (!await isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid streaming server." }, { status: 400 });
  try {
    return NextResponse.json({ server: await prisma.streamServer.update({ where: { id }, data: parsed.data }) });
  } catch {
    return NextResponse.json({ error: "Could not update this streaming server." }, { status: 404 });
  }
}

export async function DELETE(_: Request, ctx: Context) {
  if (!await isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  try {
    await prisma.streamServer.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Streaming server not found." }, { status: 404 });
  }
}
