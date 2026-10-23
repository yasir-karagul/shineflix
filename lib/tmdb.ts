export type TmdbMediaType = "movie" | "tv";
export type ShineflixContentType = "MOVIE" | "SERIES" | "ANIME";

type TmdbImage = { file_path?: string; iso_639_1?: string | null; vote_average?: number };
type TmdbDetails = {
  id: number;
  title?: string;
  name?: string;
  original_title?: string;
  original_name?: string;
  overview?: string;
  status?: string;
  vote_average?: number;
  vote_count?: number;
  genres?: Array<{ id: number; name: string }>;
  original_language?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  release_date?: string;
  first_air_date?: string;
  last_air_date?: string;
  last_episode_to_air?: { air_date?: string | null } | null;
  alternative_titles?: { titles?: Array<{ title?: string }>; results?: Array<{ title?: string }> };
  images?: { posters?: TmdbImage[]; backdrops?: TmdbImage[]; logos?: TmdbImage[] };
};

function imagePath(items: TmdbImage[] | undefined): string | null {
  if (!items?.length) return null;
  const sorted = [...items].sort((a, b) => {
    const lang = (x: TmdbImage) => x.iso_639_1 === "en" ? 0 : x.iso_639_1 == null ? 1 : 2;
    return lang(a) - lang(b) || (b.vote_average ?? 0) - (a.vote_average ?? 0);
  });
  return sorted.find(item => item.file_path)?.file_path ?? null;
}

function year(value?: string | null): number | null {
  const match = value?.match(/^(\d{4})/);
  return match ? Number(match[1]) : null;
}

function imageUrl(path: string | null, size: "w500" | "w1280"): string | null {
  return path ? `https://image.tmdb.org/t/p/${size}${path.startsWith("/") ? path : `/${path}`}` : null;
}

function requiredTmdbAuth(): { token?: string; apiKey?: string } {
  const token = process.env.TMDB_ACCESS_TOKEN?.trim();
  const apiKey = process.env.TMDB_API_KEY?.trim();
  if (!token && !apiKey) {
    throw new Error("TMDB is not configured. Add TMDB_ACCESS_TOKEN or TMDB_API_KEY to the server environment.");
  }
  return { token, apiKey };
}

export async function getTmdbDetails(tmdbId: number, mediaType: TmdbMediaType) {
  const auth = requiredTmdbAuth();
  const url = new URL(`https://api.themoviedb.org/3/${mediaType}/${tmdbId}`);
  url.searchParams.set("language", "en-US");
  url.searchParams.set("append_to_response", "alternative_titles,images");
  url.searchParams.set("include_image_language", "en,null");
  if (!auth.token && auth.apiKey) url.searchParams.set("api_key", auth.apiKey);

  const response = await fetch(url, {
    method: "GET",
    headers: auth.token
      ? { Authorization: `Bearer ${auth.token}`, Accept: "application/json" }
      : { Accept: "application/json" },
    cache: "no-store"
  });

  if (response.status === 401) {
    throw new Error("TMDB authentication failed. Check TMDB_ACCESS_TOKEN or TMDB_API_KEY in your hosting environment.");
  }
  if (response.status === 404) {
    throw new Error("TMDB did not find this ID for the selected media type. Check the ID and choose movie or TV correctly.");
  }
  if (!response.ok) {
    throw new Error(`TMDB API request failed (HTTP ${response.status}). Check the TMDB account, API access, and rate limits.`);
  }

  const data = await response.json() as TmdbDetails;
  const posterPath = data.poster_path ?? imagePath(data.images?.posters);
  const backdropPath = data.backdrop_path ?? imagePath(data.images?.backdrops);
  const logoPath = imagePath(data.images?.logos);
  const releaseDate = mediaType === "movie" ? data.release_date : data.first_air_date;
  const finalDate = mediaType === "tv" ? (data.last_air_date ?? data.last_episode_to_air?.air_date) : undefined;
  const titles = data.alternative_titles?.titles ?? data.alternative_titles?.results ?? [];
  const alternativeTitles = [...new Set(titles.map(item => item.title?.trim()).filter((value): value is string => Boolean(value)))];

  return {
    tmdbId: data.id,
    mediaType,
    suggestedType: mediaType === "movie" ? "MOVIE" as const : "SERIES" as const,
    title: data.title ?? data.name ?? "",
    originalTitle: data.original_title ?? data.original_name ?? data.title ?? data.name ?? "",
    alternativeTitles,
    posterPath,
    backdropPath,
    logoPath,
    posterUrl: imageUrl(posterPath, "w500"),
    backdropUrl: imageUrl(backdropPath, "w1280"),
    logoUrl: imageUrl(logoPath, "w500"),
    overview: data.overview ?? "",
    status: data.status ?? "",
    voteAverage: typeof data.vote_average === "number" ? data.vote_average : null,
    voteCount: typeof data.vote_count === "number" ? data.vote_count : null,
    genres: (data.genres ?? []).map(genre => genre.name).filter(Boolean),
    originalLanguage: data.original_language ?? "",
    releaseYear: year(releaseDate),
    endYear: year(finalDate),
    tmdbUrl: `https://www.themoviedb.org/${mediaType}/${data.id}`
  };
}
