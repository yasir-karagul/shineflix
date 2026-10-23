import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { getTmdbTitleDetails, type ShineflixContentType, type TmdbMediaType } from "@/lib/tmdb";

export async function GET(request: Request) {
  if (!await isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const url = new URL(request.url);
  const rawId = url.searchParams.get("id") ?? "";
  const rawMediaType = url.searchParams.get("mediaType");
  const rawContentType = url.searchParams.get("contentType");
  const id = Number(rawId);
  if (!/^\d+$/.test(rawId) || !Number.isSafeInteger(id) || id < 1) {
    return NextResponse.json({ error: "أدخل معرّف TMDB رقميًا وصحيحًا." }, { status: 400 });
  }
  if (rawMediaType !== "movie" && rawMediaType !== "tv") {
    return NextResponse.json({ error: "حدد نوع TMDB: movie أو tv." }, { status: 400 });
  }
  if (rawContentType && !["MOVIE", "SERIES", "ANIME"].includes(rawContentType)) {
    return NextResponse.json({ error: "نوع Shineflix غير صالح." }, { status: 400 });
  }
  try {
    const item = await getTmdbTitleDetails(id, rawMediaType as TmdbMediaType);
    return NextResponse.json({ item: { ...item, type: (rawContentType as ShineflixContentType | null) ?? item.type } });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "TMDB title details unavailable" }, { status: 503 });
  }
}
