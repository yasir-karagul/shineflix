const IMAGE_BASE = "https://image.tmdb.org/t/p/";

export type TmdbImageSize = "w185" | "w342" | "w500" | "w780" | "w1280" | "original";

export function tmdbImageUrl(path: string | null | undefined, size: TmdbImageSize = "w500"): string | null {
  if (!path) return null;
  const value = path.trim();
  if (/^https?:\/\//i.test(value)) return value;
  if (!value.startsWith("/") || value.startsWith("//")) return null;
  return IMAGE_BASE + size + value;
}

export function tmdbPageUrl(id: number | null | undefined, mediaType: string | null | undefined): string | null {
  if (!id || (mediaType !== "movie" && mediaType !== "tv")) return null;
  return "https://www.themoviedb.org/" + mediaType + "/" + id;
}
