"use client";

import { useMemo, useState } from "react";
import type { Language } from "@/lib/i18n";

type AppType = "MOVIE" | "SERIES" | "ANIME";
type MediaType = "movie" | "tv";
type PublicationStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";
type TmdbSearchResult = {
  tmdbId: number; mediaType: MediaType; type: "MOVIE" | "SERIES"; title: string;
  originalTitle: string; overview: string; releaseYear?: number; posterPath?: string;
  voteAverage?: number; voteCount?: number;
};
type TmdbMetadata = {
  tmdbId: number; mediaType: MediaType; type: AppType; title: string; originalTitle: string;
  alternativeTitles: string[]; posterPath?: string; backdropPath?: string; logoPath?: string;
  overview: string; status?: string; voteAverage?: number; voteCount?: number;
  genres: string[]; originalLanguage?: string; releaseYear?: number; endYear?: number;
  runtimeMinutes?: number; country?: string;
};
type Episode = { id: string; episodeNumber: number; title: string; embedUrl: string | null; isPublished: boolean };
type Season = { id: string; seasonNumber: number; title: string | null; episodes: Episode[] };
type Item = {
  id: string; tmdbId: number | null; mediaType: string | null; slug: string; type: AppType;
  title: string; originalTitle: string | null; alternativeTitles: string[]; overview: string;
  releaseYear: number | null; endYear: number | null; runtimeMinutes: number | null; status: string | null;
  publicationStatus: PublicationStatus; country: string | null; originalLanguage: string | null;
  genres: string[]; posterPath: string | null; backdropPath: string | null; logoPath: string | null;
  voteAverage: number | null; voteCount: number | null; embedUrl: string | null; isFeatured: boolean;
  seasons?: Season[];
};
type Form = {
  tmdbId: string; mediaType: "" | MediaType; slug: string; type: AppType; title: string;
  originalTitle: string; alternativeTitles: string; overview: string; releaseYear: string;
  endYear: string; runtimeMinutes: string; tmdbStatus: string; publicationStatus: PublicationStatus;
  country: string; originalLanguage: string; genres: string; posterPath: string; backdropPath: string;
  logoPath: string; voteAverage: string; voteCount: string; embedUrl: string; isFeatured: boolean;
};
const empty: Form = {
  tmdbId: "", mediaType: "tv", slug: "", type: "ANIME", title: "", originalTitle: "",
  alternativeTitles: "", overview: "", releaseYear: "", endYear: "", runtimeMinutes: "",
  tmdbStatus: "", publicationStatus: "DRAFT", country: "", originalLanguage: "", genres: "",
  posterPath: "", backdropPath: "", logoPath: "", voteAverage: "", voteCount: "",
  embedUrl: "", isFeatured: false
};
const slugify = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
  .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 110) || "new-title";

function imageUrl(path?: string | null, size = "w185") {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  if (!path.startsWith("/") || path.startsWith("//")) return null;
  return "https://image.tmdb.org/t/p/" + size + path;
}

export function AdminDashboard({ initialItems, databaseReady, lang = "en" }: { initialItems: Item[]; databaseReady: boolean; lang?: Language }) {
  const ar = lang === "ar";
  const t = (arabic: string, english: string) => ar ? arabic : english;
  const [items] = useState(initialItems);
  const [q, setQ] = useState("");
  const [tmdbQuery, setTmdbQuery] = useState("");
  const [searchMediaType, setSearchMediaType] = useState<"all" | MediaType>("all");
  const [results, setResults] = useState<TmdbSearchResult[]>([]);
  const [lookupId, setLookupId] = useState("");
  const [lookupMediaType, setLookupMediaType] = useState<MediaType>("tv");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<Item | null>(null);
  const [f, setF] = useState<Form>({ ...empty });
  const [target, setTarget] = useState<Item | null>(null);
  const [seasonId, setSeasonId] = useState("");
  const [epNo, setEpNo] = useState("1");
  const [epTitle, setEpTitle] = useState("");
  const [embed, setEmbed] = useState("");
  const [publishEpisode, setPublishEpisode] = useState(false);
  const filtered = useMemo(() => items.filter(item => (item.title + " " + (item.originalTitle ?? "") + " " + item.slug).toLowerCase().includes(q.toLowerCase())), [items, q]);

  function set<K extends keyof Form>(key: K, value: Form[K]) { setF(previous => ({ ...previous, [key]: value })); }
  function fresh() { setEditing(null); setF({ ...empty }); setError(""); }

  function edit(item: Item) {
    setEditing(item);
    setF({
      tmdbId: item.tmdbId?.toString() ?? "", mediaType: item.mediaType === "movie" || item.mediaType === "tv" ? item.mediaType : "",
      slug: item.slug, type: item.type, title: item.title, originalTitle: item.originalTitle ?? "",
      alternativeTitles: item.alternativeTitles.join("\n"), overview: item.overview,
      releaseYear: item.releaseYear?.toString() ?? "", endYear: item.endYear?.toString() ?? "",
      runtimeMinutes: item.runtimeMinutes?.toString() ?? "", tmdbStatus: item.status ?? "",
      publicationStatus: item.publicationStatus, country: item.country ?? "", originalLanguage: item.originalLanguage ?? "",
      genres: item.genres.join(", "), posterPath: item.posterPath ?? "", backdropPath: item.backdropPath ?? "",
      logoPath: item.logoPath ?? "", voteAverage: item.voteAverage?.toString() ?? "",
      voteCount: item.voteCount?.toString() ?? "", embedUrl: item.embedUrl ?? "", isFeatured: item.isFeatured
    });
    setError("");
  }

  function applyMetadata(item: TmdbMetadata) {
    setEditing(null);
    setF({
      tmdbId: String(item.tmdbId), mediaType: item.mediaType, slug: slugify(item.title), type: item.type,
      title: item.title, originalTitle: item.originalTitle, alternativeTitles: item.alternativeTitles.join("\n"),
      overview: item.overview, releaseYear: item.releaseYear?.toString() ?? "", endYear: item.endYear?.toString() ?? "",
      runtimeMinutes: item.runtimeMinutes?.toString() ?? "", tmdbStatus: item.status ?? "", publicationStatus: "DRAFT",
      country: item.country ?? "", originalLanguage: item.originalLanguage ?? "", genres: item.genres.join(", "),
      posterPath: item.posterPath ?? "", backdropPath: item.backdropPath ?? "", logoPath: item.logoPath ?? "",
      voteAverage: item.voteAverage?.toString() ?? "", voteCount: item.voteCount?.toString() ?? "",
      embedUrl: "", isFeatured: false
    });
    setResults([]);
    setError("");
  }

  async function getDetails(id: number | string, mediaType: MediaType) {
    const response = await fetch("/api/admin/tmdb-details?id=" + encodeURIComponent(String(id)) + "&mediaType=" + mediaType);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error ?? "TMDB details lookup failed.");
    return data.item as TmdbMetadata;
  }

  async function find(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setError("");
    try {
      const response = await fetch("/api/admin/tmdb-search?q=" + encodeURIComponent(tmdbQuery) + "&mediaType=" + searchMediaType);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "TMDB search failed.");
      setResults(data.items as TmdbSearchResult[]);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : t("تعذّر البحث في TMDB.", "TMDB search failed."));
    } finally { setBusy(false); }
  }

  async function lookupById(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setError("");
    try { applyMetadata(await getDetails(lookupId, lookupMediaType)); }
    catch (reason) { setError(reason instanceof Error ? reason.message : t("تعذّر استدعاء بيانات TMDB.", "TMDB ID lookup failed.")); }
    finally { setBusy(false); }
  }

  async function pick(result: TmdbSearchResult) {
    setBusy(true); setError("");
    try { applyMetadata(await getDetails(result.tmdbId, result.mediaType)); }
    catch (reason) { setError(reason instanceof Error ? reason.message : t("تعذّر استدعاء التفاصيل الكاملة.", "Could not fetch full details.")); }
    finally { setBusy(false); }
  }

  async function save(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setError("");
    const optionalNumber = (value: string) => value.trim() ? Number(value) : null;
    const body = {
      tmdbId: f.tmdbId ? Number(f.tmdbId) : null, mediaType: f.mediaType || null, slug: f.slug, type: f.type,
      title: f.title, originalTitle: f.originalTitle || null,
      alternativeTitles: f.alternativeTitles.split("\n").map(value => value.trim()).filter(Boolean),
      overview: f.overview, releaseYear: optionalNumber(f.releaseYear), endYear: optionalNumber(f.endYear),
      runtimeMinutes: optionalNumber(f.runtimeMinutes), status: f.tmdbStatus || null, publicationStatus: f.publicationStatus,
      country: f.country || null, originalLanguage: f.originalLanguage || null,
      genres: f.genres.split(",").map(value => value.trim()).filter(Boolean),
      posterPath: f.posterPath || null, backdropPath: f.backdropPath || null, logoPath: f.logoPath || null,
      voteAverage: optionalNumber(f.voteAverage), voteCount: optionalNumber(f.voteCount),
      embedUrl: f.embedUrl || null, isFeatured: f.isFeatured
    };
    try {
      const response = await fetch(editing ? "/api/admin/content/" + editing.id : "/api/admin/content", {
        method: editing ? "PATCH" : "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Failed to save content.");
      location.reload();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : t("تعذّر حفظ المحتوى.", "Failed to save content."));
    } finally { setBusy(false); }
  }

  async function removeEpisode(currentSeasonId: string, episodeId: string, title: string) {
    if (!confirm(t("حذف الحلقة ", "Delete episode ") + title + "?")) return;
    const response = await fetch("/api/admin/seasons/" + currentSeasonId + "/episodes?episodeId=" + encodeURIComponent(episodeId), { method: "DELETE" });
    if (response.ok) location.reload(); else setError(t("تعذّر حذف الحلقة.", "Failed to delete episode."));
  }

  async function remove(item: Item) {
    if (!confirm(t("حذف ", "Delete ") + item.title + t(" مع مواسمه وحلقاته؟", " with all its seasons and episodes?"))) return;
    const response = await fetch("/api/admin/content/" + item.id, { method: "DELETE" });
    if (response.ok) location.reload(); else setError(t("تعذّر حذف العنوان.", "Delete failed."));
  }

  async function addSeason(item: Item) {
    const seasonNumber = Number(prompt(t("رقم الموسم؟", "Season number?"), "1"));
    if (!Number.isInteger(seasonNumber) || seasonNumber < 1) return;
    const response = await fetch("/api/admin/seasons", {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ contentId: item.id, seasonNumber, title: (ar ? "الموسم " : "Season ") + seasonNumber })
    });
    const data = await response.json();
    if (!response.ok) setError(data.error ?? "Failed to create season."); else location.reload();
  }

  async function addEpisode(event: React.FormEvent) {
    event.preventDefault();
    if (!target?.seasons?.length) { setError(t("أضف موسمًا أولًا.", "Add a season first.")); return; }
    const chosenSeasonId = seasonId || target.seasons[0]?.id;
    if (!chosenSeasonId) { setError(t("اختر موسمًا أولًا.", "Select a season first.")); return; }
    setBusy(true);
    try {
      const response = await fetch("/api/admin/seasons/" + chosenSeasonId + "/episodes", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ episodeNumber: Number(epNo), title: epTitle, embedUrl: embed || null, isPublished: publishEpisode })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Failed to add episode.");
      location.reload();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : t("تعذّرت إضافة الحلقة.", "Failed to add episode."));
    } finally { setBusy(false); }
  }

  return <>
    <section className="admin-tools">
      <div className="admin-section-heading"><div><h2>{t("استيراد البيانات من TMDB", "Import metadata from TMDB")}</h2><p>{t("ابحث عن العمل أو استدعِ تفاصيله مباشرةً باستخدام المعرّف الرقمي ونوع TMDB.", "Search for a title or fetch full details directly using its numeric TMDB ID and media type.")}</p></div></div>
      <form className="admin-search" onSubmit={find}>
        <input value={tmdbQuery} onChange={event => setTmdbQuery(event.target.value)} placeholder={t("اسم الفيلم أو المسلسل أو الأنمي", "Movie, TV show or anime title")} minLength={2} required />
        <select value={searchMediaType} onChange={event => setSearchMediaType(event.target.value as "all" | MediaType)} aria-label={t("نوع بحث TMDB", "TMDB search media type")}>
          <option value="all">{t("كل الأنواع", "All media types")}</option><option value="movie">{t("أفلام", "Movies")}</option><option value="tv">{t("مسلسلات / أنمي", "TV / anime")}</option>
        </select>
        <button className="button button-primary" disabled={busy}>{t("بحث TMDB", "Search TMDB")}</button>
      </form>
      <form className="admin-search tmdb-id-search" onSubmit={lookupById}>
        <input value={lookupId} onChange={event => setLookupId(event.target.value)} placeholder={t("معرّف TMDB الرقمي", "Numeric TMDB ID")} inputMode="numeric" pattern="[0-9]+" required />
        <select value={lookupMediaType} onChange={event => setLookupMediaType(event.target.value as MediaType)} aria-label={t("نوع المعرّف", "TMDB media type")}><option value="tv">TV / anime</option><option value="movie">Movie</option></select>
        <button className="button button-ghost" disabled={busy}>{t("استدعاء حسب ID", "Fetch by ID")}</button>
      </form>
      {results.map(result => <article className="tmdb-result" key={result.mediaType + "-" + result.tmdbId}>
        {result.posterPath ? <img src={imageUrl(result.posterPath) ?? undefined} alt="" loading="lazy" /> : <div className="tmdb-result-placeholder">TMDB</div>}
        <div className="tmdb-result-copy"><strong>{result.title}</strong><small>{result.originalTitle} · {result.releaseYear ?? "—"} · TMDB {result.voteAverage?.toFixed(1) ?? "—"} · {result.mediaType}</small><p>{result.overview || t("لا توجد نبذة في نتيجة البحث.", "No overview in search result.")}</p></div>
        <button className="button button-ghost" type="button" disabled={busy} onClick={() => pick(result)}>{t("تحميل التفاصيل", "Load details")}</button>
      </article>)}
    </section>

    <section className="admin-tools">
      <div className="admin-section-heading"><div><h2>{editing ? t("تعديل العنوان", "Edit title") : t("إضافة عنوان", "Add title")}</h2><p>{t("تُحفظ البيانات الجديدة كمسودة حتى تنشرها يدويًا.", "New content is saved as a draft until you publish it.")}</p></div><button type="button" className="button button-ghost" onClick={fresh}>{t("عنصر جديد +", "New item +")}</button></div>
      {f.tmdbId ? <p className="tmdb-source-note">{t("مصدر البيانات:", "Metadata source:")} TMDB ID {f.tmdbId} ({f.mediaType || "manual"})</p> : null}
      <form className="admin-content-form" onSubmit={save}>
        <label>{t("العنوان", "Title")}<input value={f.title} onChange={event => set("title", event.target.value)} required /></label>
        <label>{t("العنوان الأصلي", "Original title")}<input value={f.originalTitle} onChange={event => set("originalTitle", event.target.value)} /></label>
        <label>{t("الرابط المختصر", "Slug")}<input value={f.slug} onChange={event => set("slug", event.target.value)} onBlur={() => !f.slug && set("slug", slugify(f.title))} required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" /></label>
        <label>{t("نوع المحتوى في Shineflix", "Shineflix content category")}<select value={f.type} onChange={event => set("type", event.target.value as AppType)}><option value="ANIME">{t("أنمي", "Anime")}</option><option value="MOVIE">{t("فيلم", "Movie")}</option><option value="SERIES">{t("مسلسل", "TV Series")}</option></select></label>
        <label>{t("معرّف TMDB", "TMDB ID")}<input inputMode="numeric" value={f.tmdbId} onChange={event => set("tmdbId", event.target.value)} /></label>
        <label>{t("نوع TMDB", "TMDB media type")}<select value={f.mediaType} onChange={event => set("mediaType", event.target.value as Form["mediaType"])}><option value="">—</option><option value="movie">movie</option><option value="tv">tv</option></select></label>
        <label>{t("سنة الإصدار", "Release year")}<input type="number" value={f.releaseYear} onChange={event => set("releaseYear", event.target.value)} /></label>
        <label>{t("سنة النهاية", "End year")}<input type="number" value={f.endYear} onChange={event => set("endYear", event.target.value)} /></label>
        <label>{t("مدة الحلقة / الفيلم بالدقائق", "Runtime in minutes")}<input type="number" min="1" value={f.runtimeMinutes} onChange={event => set("runtimeMinutes", event.target.value)} /></label>
        <label>{t("الحالة في TMDB", "TMDB source status")}<input value={f.tmdbStatus} onChange={event => set("tmdbStatus", event.target.value)} placeholder="Released / Returning Series" /></label>
        <label>{t("تقييم TMDB", "TMDB vote average")}<input type="number" min="0" max="10" step="0.1" value={f.voteAverage} onChange={event => set("voteAverage", event.target.value)} /></label>
        <label>{t("عدد التصويتات", "TMDB vote count")}<input type="number" min="0" step="1" value={f.voteCount} onChange={event => set("voteCount", event.target.value)} /></label>
        <label>{t("اللغة الأصلية (رمز ISO)", "Original language (ISO code)")}<input value={f.originalLanguage} onChange={event => set("originalLanguage", event.target.value)} placeholder="ja / en / ko" /></label>
        <label>{t("بلد الإنتاج", "Country")}<input value={f.country} onChange={event => set("country", event.target.value)} /></label>
        <label>{t("التصنيفات بفواصل", "Genres (comma-separated)")}<input value={f.genres} onChange={event => set("genres", event.target.value)} /></label>
        <label>{t("حالة النشر في Shineflix", "Shineflix publication status")}<select value={f.publicationStatus} onChange={event => set("publicationStatus", event.target.value as PublicationStatus)}><option value="DRAFT">{t("مسودة", "Draft")}</option><option value="PUBLISHED">{t("منشور", "Published")}</option><option value="ARCHIVED">{t("مؤرشف", "Archived")}</option></select></label>
        <label>{t("مسار الملصق / Poster Path", "Poster path")}<input value={f.posterPath} onChange={event => set("posterPath", event.target.value)} placeholder="/abc123.jpg" /></label>
        <label>{t("مسار الخلفية / Backdrop Path", "Backdrop path")}<input value={f.backdropPath} onChange={event => set("backdropPath", event.target.value)} placeholder="/abc123.jpg" /></label>
        <label>{t("مسار الشعار / Logo Path", "Logo path")}<input value={f.logoPath} onChange={event => set("logoPath", event.target.value)} placeholder="/abc123.png" /></label>
        <label className="admin-full">{t("العناوين البديلة (عنوان لكل سطر)", "Alternative titles (one per line)")}<textarea rows={3} value={f.alternativeTitles} onChange={event => set("alternativeTitles", event.target.value)} /></label>
        <label className="admin-full">{t("نبذة القصة / Overview", "Story overview")}<textarea rows={4} value={f.overview} onChange={event => set("overview", event.target.value)} /></label>
        <label className="admin-full">{t("رابط تضمين الفيلم (اختياري)", "Movie embed URL (optional)")}<input type="url" value={f.embedUrl} onChange={event => set("embedUrl", event.target.value)} placeholder="https://.../embed/..." /><small>{t("يُستخدم لملف الفيلم فقط. يلزم أن يكون المضيف مسموحًا في EMBED_ALLOWED_HOSTS.", "Used for movie pages only. The host must be included in EMBED_ALLOWED_HOSTS.")}</small></label>
        <label className="admin-checkbox"><input type="checkbox" checked={f.isFeatured} onChange={event => set("isFeatured", event.target.checked)} /> {t("إبراز المحتوى", "Feature this title")}</label>
        <div className="admin-form-actions"><button className="button button-primary" disabled={busy || !databaseReady}>{editing ? t("حفظ التعديلات", "Save changes") : t("إضافة العنوان", "Add title")}</button></div>
      </form>
    </section>

    <section className="admin-tools">
      <div className="admin-section-heading"><div><h2>{t("مكتبة المحتوى", "Content library")}</h2><p>{items.length} {t("عنوانًا", "titles")}</p></div><input className="admin-filter" value={q} onChange={event => setQ(event.target.value)} placeholder={t("ابحث في المكتبة", "Search library")} /></div>
      {!filtered.length ? <div className="admin-empty">{t("لا توجد عناوين محفوظة بعد.", "No saved titles yet.")}</div> : <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>{t("العنوان", "Title")}</th><th>{t("النوع", "Type")}</th><th>{t("السنة", "Year")}</th><th>{t("التقييم", "Rating")}</th><th>{t("النشر", "Publication")}</th><th>{t("المواسم", "Seasons")}</th><th>{t("إجراءات", "Actions")}</th></tr></thead><tbody>{filtered.map(item => <tr key={item.id}><td><strong>{item.title}</strong><small>{item.tmdbId ? "TMDB " + item.tmdbId + " · " + item.mediaType : item.slug}</small></td><td>{item.type === "MOVIE" ? t("فيلم", "Movie") : item.type === "SERIES" ? t("مسلسل", "TV series") : t("أنمي", "Anime")}</td><td>{item.releaseYear ?? "—"}</td><td>{item.voteAverage?.toFixed(1) ?? "—"}</td><td>{item.publicationStatus === "PUBLISHED" ? t("منشور", "Published") : item.publicationStatus === "DRAFT" ? t("مسودة", "Draft") : t("مؤرشف", "Archived")}</td><td>{item.seasons?.length ?? 0}</td><td><div className="admin-row-actions"><button onClick={() => edit(item)}>{t("تعديل", "Edit")}</button><button onClick={() => addSeason(item)}>{t("موسم +", "Season +")}</button><button onClick={() => { setTarget(item); setSeasonId(item.seasons?.[0]?.id ?? ""); setEpTitle(""); setEmbed(""); setEpNo("1"); setPublishEpisode(false); setError(""); }}>{t("حلقة +", "Episode +")}</button><button className="danger" onClick={() => remove(item)}>{t("حذف", "Delete")}</button></div></td></tr>)}</tbody></table></div>}
    </section>
    {target ? <div className="admin-modal-backdrop"><section className="admin-modal"><button className="admin-modal-close" onClick={() => setTarget(null)}>×</button><h2>{t("إضافة حلقة — ", "Add episode — ")}{target.title}</h2><p>{t("أدخل رابط Embed من مصدر تملك حق تضمينه. أضف موسمًا أولًا.", "Enter an embed URL from a source you are authorized to use. Add a season first.")}</p><form onSubmit={addEpisode}>{target.seasons?.length ? <label>{t("الموسم", "Season")}<select value={seasonId || target.seasons[0]?.id || ""} onChange={event => setSeasonId(event.target.value)}>{target.seasons.map(season => <option key={season.id} value={season.id}>{season.title || t("الموسم ", "Season ") + season.seasonNumber}</option>)}</select></label> : null}<label>{t("رقم الحلقة", "Episode number")}<input type="number" min="1" value={epNo} onChange={event => setEpNo(event.target.value)} required /></label><label>{t("عنوان الحلقة", "Episode title")}<input value={epTitle} onChange={event => setEpTitle(event.target.value)} required /></label><label>{t("رابط Embed", "Embed URL")}<input type="url" value={embed} onChange={event => setEmbed(event.target.value)} placeholder="https://.../embed/..." /></label><label className="admin-checkbox"><input type="checkbox" checked={publishEpisode} onChange={event => setPublishEpisode(event.target.checked)} /> {t("نشر الحلقة بعد التحقق من حقوق العرض", "Publish after confirming display rights")}</label><button className="button button-primary" disabled={busy}>{t("حفظ الحلقة", "Save episode")}</button></form>{target.seasons?.find(season => season.id === (seasonId || target.seasons?.[0]?.id))?.episodes.map(episode => <div className="admin-episode-row" key={episode.id}><span>{episode.episodeNumber}. {episode.title}</span><small>{episode.isPublished ? t("منشورة", "Published") : t("مسودة", "Draft")}</small><button type="button" className="danger" onClick={() => removeEpisode(seasonId || target.seasons?.[0]?.id || "", episode.id, episode.title)}>{t("حذف", "Delete")}</button></div>)}</section></div> : null}
    {error ? <div className="admin-toast" role="alert">{error}<button onClick={() => setError("")}>×</button></div> : null}
  </>;
}
