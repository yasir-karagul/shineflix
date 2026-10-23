import { NextResponse } from "next/server";
import { z } from "zod";
import { isAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { isAllowedEmbedUrl } from "@/lib/embed";

const imageReference = z.string().max(2000).nullable().optional().refine(
  value => value == null || (/^https:\/\//i.test(value) && !/[\r\n]/.test(value)) || (value.startsWith("/") && !value.startsWith("//") && !/[\r\n]/.test(value)),
  "يجب أن يكون مسار صورة TMDB صالحًا أو رابط HTTPS."
);

const schema = z.object({
  tmdbId: z.number().int().positive().max(2147483647).optional().nullable(),
  mediaType: z.enum(["movie", "tv"]).optional().nullable(),
  slug: z.string().min(2).max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  type: z.enum(["MOVIE", "SERIES", "ANIME"]),
  title: z.string().min(1).max(240),
  originalTitle: z.string().max(240).optional().nullable(),
  alternativeTitles: z.array(z.string().min(1).max(300)).max(100).default([]),
  overview: z.string().max(12000).default(""),
  releaseYear: z.number().int().min(1888).max(2200).optional().nullable(),
  endYear: z.number().int().min(1888).max(2200).optional().nullable(),
  runtimeMinutes: z.number().int().min(1).max(1000).optional().nullable(),
  status: z.string().max(80).optional().nullable(),
  publicationStatus: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("DRAFT"),
  country: z.string().max(160).optional().nullable(),
  originalLanguage: z.string().max(10).optional().nullable(),
  genres: z.array(z.string().min(1).max(60)).max(30).default([]),
  posterPath: imageReference,
  backdropPath: imageReference,
  logoPath: imageReference,
  voteAverage: z.number().min(0).max(10).optional().nullable(),
  voteCount: z.number().int().min(0).optional().nullable(),
  embedUrl: z.string().url().max(2000).optional().nullable().refine(value => value == null || isAllowedEmbedUrl(value), "رابط التضمين غير مسموح به."),
  isFeatured: z.boolean().default(false)
});

export async function GET() {
  if (!await isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    return NextResponse.json({
      items: await prisma.content.findMany({
        orderBy: { updatedAt: "desc" }, include: { seasons: { include: { episodes: true } } }, take: 300
      })
    });
  } catch {
    return NextResponse.json({ error: "قاعدة البيانات غير جاهزة. اضبط DATABASE_URL وشغّل prisma db push." }, { status: 503 });
  }
}

export async function POST(req: Request) {
  if (!await isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid content" }, { status: 400 });
  try {
    return NextResponse.json({ item: await prisma.content.create({ data: parsed.data }) }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error && error.message.includes("Unique constraint")
      ? "معرّف TMDB أو الرابط المختصر مستخدم مسبقًا."
      : "تعذّر حفظ المحتوى.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
