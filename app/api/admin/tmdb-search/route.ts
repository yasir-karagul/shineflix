import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { searchTmdbTitles, type TmdbMediaType } from "@/lib/tmdb";

export async function GET(request: Request) {
  if (!await isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const url = new URL(request.url);
  const query = url.searchParams.get("q") ?? "";
  const filter = url.searchParams.get("mediaType") ?? "all";
  if (filter !== "all" && filter !== "movie" && filter !== "tv") {
    return NextResponse.json({ error: "نوع TMDB يجب أن يكون movie أو tv أو all." }, { status: 400 });
  }
  try {
    return NextResponse.json({ items: await searchTmdbTitles(query, filter as "all" | TmdbMediaType) });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "TMDB search unavailable" }, { status: 503 });
  }
}
