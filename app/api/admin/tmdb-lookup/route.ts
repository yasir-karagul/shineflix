import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { getTmdbDetails, type TmdbMediaType } from "@/lib/tmdb";

export async function GET(req: Request) {
  if (!await isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const params = new URL(req.url).searchParams;
  const rawId = params.get("tmdbId")?.trim() ?? "";
  const mediaType = params.get("mediaType");
  if (!/^\d{1,10}$/.test(rawId) || Number(rawId) < 1 || Number(rawId) > 2147483647) {
    return NextResponse.json({ error: "Enter a valid numeric TMDB ID." }, { status: 400 });
  }
  if (mediaType !== "movie" && mediaType !== "tv") {
    return NextResponse.json({ error: "Choose the TMDB media type: movie or tv." }, { status: 400 });
  }
  try {
    const item = await getTmdbDetails(Number(rawId), mediaType as TmdbMediaType);
    return NextResponse.json({ item });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "TMDB request failed." },
      { status: 503 }
    );
  }
}
