import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";

export type TmdbMediaType = "movie" | "tv";
export type ShineflixContentType = "MOVIE" | "SERIES" | "ANIME";
export type TmdbCredentialMode = "bearer" | "api_key";
export type TmdbCredential = { mode: TmdbCredentialMode; value: string };

const CREDENTIAL_SETTING_KEY = "tmdb.credentials";
const API_BASE = "https://api.themoviedb.org/3";

function encryptionKey(): Buffer {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("ADMIN_SESSION_SECRET must be configured with at least 32 characters before saving a TMDB credential.");
  }
  return createHash("sha256").update("shineflix:tmdb-credential:v1:").update(secret).digest();
}

export function encryptTmdbCredential(credential: TmdbCredential): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(JSON.stringify(credential), "utf8"), cipher.final()]);
  return ["v1", iv.toString("base64url"), cipher.getAuthTag().toString("base64url"), encrypted.toString("base64url")].join(".");
}

export function decryptTmdbCredential(ciphertext: string): TmdbCredential {
  try {
    const parts = ciphertext.split(".");
    if (parts.length !== 4 || parts[0] !== "v1") throw new Error("format");
    const decipher = createDecipheriv("aes-256-gcm", encryptionKey(), Buffer.from(parts[1], "base64url"));
    decipher.setAuthTag(Buffer.from(parts[2], "base64url"));
    const raw = Buffer.concat([decipher.update(Buffer.from(parts[3], "base64url")), decipher.final()]).toString("utf8");
    const value = JSON.parse(raw) as TmdbCredential;
    if ((value.mode !== "bearer" && value.mode !== "api_key") || typeof value.value !== "string" || !value.value) throw new Error("credential");
    return value;
  } catch {
    throw new Error("تعذّر فك تشفير بيانات TMDB المحفوظة. أدخل بيانات TMDB مرة أخرى من لوحة التحكم إذا غيّرت ADMIN_SESSION_SECRET.");
  }
}

export async function getTmdbCredentialDetails(): Promise<{ credential: TmdbCredential; source: "dashboard" | "environment" }> {
  try {
    const saved = await prisma.integrationSetting.findUnique({ where: { key: CREDENTIAL_SETTING_KEY } });
    if (saved) return { credential: decryptTmdbCredential(saved.value), source: "dashboard" };
  } catch (error) {
    if (error instanceof Error && error.message.includes("فك تشفير")) throw error;
    // Environment credentials remain usable while database settings are temporarily unavailable.
  }
  const accessToken = process.env.TMDB_API_READ_ACCESS_TOKEN?.trim();
  if (accessToken) return { credential: { mode: "bearer", value: accessToken }, source: "environment" };
  const apiKey = process.env.TMDB_API_KEY?.trim();
  if (apiKey) return { credential: { mode: "api_key", value: apiKey }, source: "environment" };
  throw new Error("TMDB غير مهيأ. أضف API Read Access Token من لوحة التحكم: /admin/settings.");
}

async function tmdbRequest<T>(path: string, params: Record<string, string> = {}, credential?: TmdbCredential): Promise<T> {
  const auth = credential ?? (await getTmdbCredentialDetails()).credential;
  const url = new URL(API_BASE + path);
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
  const headers: Record<string, string> = { accept: "application/json" };
  if (auth.mode === "bearer") headers.authorization = "Bearer " + auth.value;
  else url.searchParams.set("api_key", auth.value);

  const response = await fetch(url, { headers, cache: "no-store" });
  const payload = await response.json().catch(() => ({})) as { status_message?: string; status_code?: number };
  if (!response.ok) {
    if (response.status === 401 || response.status === 403) throw new Error("رفض TMDB المصادقة. تحقق من API Read Access Token أو API Key في إعدادات التكامل.");
    if (response.status === 404) throw new Error("لم يعثر TMDB على عمل بهذا المعرّف ونوع المحتوى.");
    throw new Error(payload.status_message || "تعذّر الاتصال بواجهة TMDB (HTTP " + response.status + ").");
  }
  return payload as T;
}

export async function validateTmdbCredential(credential: TmdbCredential): Promise<void> {
  await tmdbRequest<{ images?: unknown }>("/configuration", {}, credential);
}

type TmdbSearchResponse = {
  results?: Array<{
    id: number; title?: string; name?: string; original_title?: string; original_name?: string;
    overview?: string; poster_path?: string | null; release_date?: string; first_air_date?: string;
    vote_average?: number; vote_count?: number;
  }>;
};

export type TmdbSearchResult = {
  tmdbId: number; mediaType: TmdbMediaType; type: "MOVIE" | "SERIES"; title: string;
  originalTitle: string; overview: string; releaseYear?: number; posterPath?: string;
  voteAverage?: number; voteCount?: number;
};

function yearFromDate(value?: string): number | undefined {
  const match = value?.match(/^(\d{4})/);
  return match ? Number(match[1]) : undefined;
}

async function searchOne(query: string, mediaType: TmdbMediaType): Promise<TmdbSearchResult[]> {
  const data = await tmdbRequest<TmdbSearchResponse>("/search/" + mediaType, {
    query, include_adult: "false", language: "en-US", page: "1"
  });
  return (data.results ?? []).map(item => ({
    tmdbId: item.id,
    mediaType,
    type: mediaType === "movie" ? "MOVIE" : "SERIES",
    title: item.title ?? item.name ?? item.original_title ?? item.original_name ?? "Untitled",
    originalTitle: item.original_title ?? item.original_name ?? item.title ?? item.name ?? "",
    overview: item.overview ?? "",
    releaseYear: yearFromDate(item.release_date ?? item.first_air_date),
    posterPath: item.poster_path ?? undefined,
    voteAverage: typeof item.vote_average === "number" ? item.vote_average : undefined,
    voteCount: typeof item.vote_count === "number" ? item.vote_count : undefined
  }));
}

export async function searchTmdbTitles(query: string, mediaType: "all" | TmdbMediaType = "all"): Promise<TmdbSearchResult[]> {
  const term = query.trim();
  if (term.length < 2 || term.length > 120) throw new Error("أدخل عبارة بحث بين حرفين و120 حرفًا.");
  const types: TmdbMediaType[] = mediaType === "all" ? ["movie", "tv"] : [mediaType];
  const groups = await Promise.all(types.map(type => searchOne(term, type)));
  if (groups.length === 1) return groups[0].slice(0, 20);
  const movies = groups[0] ?? [];
  const shows = groups[1] ?? [];
  const combined: TmdbSearchResult[] = [];
  for (let index = 0; index < Math.max(movies.length, shows.length); index += 1) {
    if (movies[index]) combined.push(movies[index]);
    if (shows[index]) combined.push(shows[index]);
  }
  return combined.slice(0, 20);
}

type TmdbDetailResponse = {
  id: number; title?: string; name?: string; original_title?: string; original_name?: string;
  overview?: string; status?: string; vote_average?: number; vote_count?: number;
  genres?: Array<{ name?: string }>; original_language?: string; poster_path?: string | null;
  backdrop_path?: string | null; release_date?: string; first_air_date?: string; last_air_date?: string;
  runtime?: number; episode_run_time?: number[]; production_countries?: Array<{ name?: string }>;
  origin_country?: string[];
  alternative_titles?: { titles?: Array<{ title?: string }>; results?: Array<{ title?: string }> };
  images?: { logos?: Array<{ file_path?: string; iso_639_1?: string | null; vote_average?: number; vote_count?: number }> };
};

export type TmdbTitleMetadata = {
  tmdbId: number; mediaType: TmdbMediaType; type: ShineflixContentType; title: string;
  originalTitle: string; alternativeTitles: string[]; posterPath?: string; backdropPath?: string;
  logoPath?: string; overview: string; status?: string; voteAverage?: number; voteCount?: number;
  genres: string[]; originalLanguage?: string; releaseYear?: number; endYear?: number;
  runtimeMinutes?: number; country?: string;
};

export async function getTmdbTitleDetails(id: number, mediaType: TmdbMediaType): Promise<TmdbTitleMetadata> {
  if (!Number.isSafeInteger(id) || id < 1) throw new Error("أدخل معرّف TMDB رقميًا وصحيحًا.");
  const raw = await tmdbRequest<TmdbDetailResponse>("/" + mediaType + "/" + id, {
    language: "en-US", append_to_response: "alternative_titles,images", include_image_language: "en,null"
  });
  const alternatives = mediaType === "movie" ? raw.alternative_titles?.titles : raw.alternative_titles?.results;
  const alternativeTitles = [...new Set((alternatives ?? []).map(item => item.title?.trim()).filter((item): item is string => Boolean(item)))];
  const logos = raw.images?.logos ?? [];
  const selectedLogo = [...logos].sort((a, b) => {
    const rank = (item: typeof a) => item.iso_639_1 === "en" ? 3 : item.iso_639_1 == null ? 2 : 1;
    return rank(b) - rank(a) || (b.vote_count ?? 0) - (a.vote_count ?? 0) || (b.vote_average ?? 0) - (a.vote_average ?? 0);
  })[0];
  const firstDate = mediaType === "movie" ? raw.release_date : raw.first_air_date;
  const endYear = mediaType === "tv" && raw.status === "Ended" ? yearFromDate(raw.last_air_date) : undefined;
  const countryNames = (raw.production_countries ?? []).map(item => item.name).filter((item): item is string => Boolean(item));
  const country = countryNames.length ? countryNames.join(", ") : (raw.origin_country ?? []).join(", ");
  return {
    tmdbId: raw.id, mediaType, type: mediaType === "movie" ? "MOVIE" : "SERIES",
    title: raw.title ?? raw.name ?? raw.original_title ?? raw.original_name ?? "Untitled",
    originalTitle: raw.original_title ?? raw.original_name ?? raw.title ?? raw.name ?? "",
    alternativeTitles, posterPath: raw.poster_path ?? undefined, backdropPath: raw.backdrop_path ?? undefined,
    logoPath: selectedLogo?.file_path ?? undefined, overview: raw.overview ?? "", status: raw.status ?? undefined,
    voteAverage: typeof raw.vote_average === "number" ? raw.vote_average : undefined,
    voteCount: typeof raw.vote_count === "number" ? raw.vote_count : undefined,
    genres: (raw.genres ?? []).map(item => item.name?.trim()).filter((item): item is string => Boolean(item)),
    originalLanguage: raw.original_language ?? undefined, releaseYear: yearFromDate(firstDate), endYear,
    runtimeMinutes: raw.runtime ?? raw.episode_run_time?.[0] ?? undefined, country: country || undefined
  };
}

export async function getTmdbSettingsStatus(): Promise<{ configured: boolean; source: "dashboard" | "environment" | null }> {
  try {
    const details = await getTmdbCredentialDetails();
    return { configured: true, source: details.source };
  } catch {
    return { configured: false, source: null };
  }
}

export async function saveTmdbCredential(credential: TmdbCredential): Promise<void> {
  const encrypted = encryptTmdbCredential(credential);
  await prisma.integrationSetting.upsert({
    where: { key: CREDENTIAL_SETTING_KEY },
    create: { key: CREDENTIAL_SETTING_KEY, value: encrypted },
    update: { value: encrypted }
  });
}

export async function clearTmdbCredential(): Promise<void> {
  await prisma.integrationSetting.deleteMany({ where: { key: CREDENTIAL_SETTING_KEY } });
}
