"use client";

import { useMemo, useState } from "react";
import type { Language } from "@/lib/i18n";

type ContentStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";
type ContentType = "MOVIE" | "SERIES" | "ANIME";
type MediaType = "movie" | "tv";
type StreamServer = { id: string; name: string; url: string; sortOrder: number; isActive: boolean };
type Episode = { id: string; episodeNumber: number; title: string; synopsis: string; embedUrl: string | null; isPublished: boolean };
type Season = { id: string; seasonNumber: number; title: string | null; episodes: Episode[] };
type Item = {
  id: string; tmdbId: number | null; mediaType: MediaType | null; alternativeTitles: string[];
  posterPath: string | null; backdropPath: string | null; logoPath: string | null; tmdbStatus: string | null;
  originalLanguage: string | null; voteAverage: number | null; voteCount: number | null;
  slug: string; type: ContentType; title: string; originalTitle: string | null; synopsis: string;
  releaseYear: number | null; endYear: number | null; genres: string[]; posterUrl: string | null;
  backdropUrl: string | null; imdbRating: number | null; imdbVotes: number | null; imdbId: string | null;
  imdbUrl: string | null; embedUrl: string | null; status: ContentStatus; isFeatured: boolean; seasons?: Season[];
};
type TmdbResult = {
  tmdbId: number; mediaType: MediaType; suggestedType: ContentType; title: string; originalTitle: string;
  alternativeTitles: string[]; posterPath: string | null; backdropPath: string | null; logoPath: string | null;
  posterUrl: string | null; backdropUrl: string | null; logoUrl: string | null; overview: string; status: string;
  voteAverage: number | null; voteCount: number | null; genres: string[]; originalLanguage: string;
  releaseYear: number | null; endYear: number | null; tmdbUrl: string;
};
type Form = {
  tmdbId: string; mediaType: MediaType | ""; alternativeTitles: string; posterPath: string; backdropPath: string;
  logoPath: string; tmdbStatus: string; originalLanguage: string; voteAverage: string; voteCount: string;
  slug: string; type: ContentType; title: string; originalTitle: string; synopsis: string;
  releaseYear: string; endYear: string; genres: string; posterUrl: string; backdropUrl: string;
  status: ContentStatus; isFeatured: boolean;
};
type StreamOwner = { ownerType: "content" | "episode"; ownerId: string; label: string; legacyUrl?: string | null };

const empty: Form = {
  tmdbId: "", mediaType: "tv", alternativeTitles: "", posterPath: "", backdropPath: "", logoPath: "",
  tmdbStatus: "", originalLanguage: "", voteAverage: "", voteCount: "", slug: "", type: "ANIME",
  title: "", originalTitle: "", synopsis: "", releaseYear: "", endYear: "", genres: "",
  posterUrl: "", backdropUrl: "", status: "DRAFT", isFeatured: false
};
const slugify = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
  .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 110) || "new-title";
const tmdbImageUrl = (path: string, size: "w500" | "w1280") => {
  const value = path.trim();
  if (!value) return "";
  if (/^https:\/\//i.test(value)) return value;
  return "https://image.tmdb.org/t/p/" + size + (value.startsWith("/") ? value : "/" + value);
};

export function AdminDashboard({ initialItems, databaseReady, lang = "en" }: { initialItems: Item[]; databaseReady: boolean; lang?: Language }) {
  const ar = lang === "ar";
  const t = (arabic: string, english: string) => ar ? arabic : english;
  const [items] = useState(initialItems);
  const [q, Q] = useState("");
  const [tmdbIdInput, TI] = useState("");
  const [lookupMediaType, LMT] = useState<MediaType>("movie");
  const [lookupType, LT] = useState<ContentType>("MOVIE");
  const [tmdbResult, TR] = useState<TmdbResult | null>(null);
  const [busy, B] = useState(false);
  const [error, E] = useState("");
  const [editing, ED] = useState<Item | null>(null);
  const [f, F] = useState<Form>({ ...empty });
  const [target, T] = useState<Item | null>(null);
  const [seasonId, SI] = useState("");
  const [epNo, EN] = useState("1");
  const [epTitle, ET] = useState("");
  const [publishEpisode, PE] = useState(false);
  const [streamOwner, SO] = useState<StreamOwner | null>(null);
  const [streams, SS] = useState<StreamServer[]>([]);
  const [serverName, SN] = useState("Server 1");
  const [serverUrl, SU] = useState("");
  const [serverOrder, SOR] = useState(0);
  const filtered = useMemo(
    () => items.filter(i => (i.title + " " + (i.originalTitle ?? "") + " " + i.slug + " " + (i.tmdbId ?? "")).toLowerCase().includes(q.toLowerCase())),
    [items, q]
  );

  function set<K extends keyof Form>(key: K, value: Form[K]) { F(current => ({ ...current, [key]: value })); }
  function fresh() { ED(null); F({ ...empty }); TR(null); TI(""); E(""); }
  function edit(item: Item) {
    ED(item);
    F({
      tmdbId: item.tmdbId?.toString() ?? "", mediaType: item.mediaType ?? "tv",
      alternativeTitles: (item.alternativeTitles ?? []).join("\n"), posterPath: item.posterPath ?? "",
      backdropPath: item.backdropPath ?? "", logoPath: item.logoPath ?? "", tmdbStatus: item.tmdbStatus ?? "",
      originalLanguage: item.originalLanguage ?? "", voteAverage: item.voteAverage?.toString() ?? "",
      voteCount: item.voteCount?.toString() ?? "", slug: item.slug, type: item.type, title: item.title,
      originalTitle: item.originalTitle ?? "", synopsis: item.synopsis, releaseYear: item.releaseYear?.toString() ?? "",
      endYear: item.endYear?.toString() ?? "", genres: item.genres.join(", "), posterUrl: item.posterUrl ?? "",
      backdropUrl: item.backdropUrl ?? "", status: item.status, isFeatured: item.isFeatured
    });
    TR(null); E("");
  }
  function applyTmdb(item: TmdbResult) {
    const nextType: ContentType = item.mediaType === "movie" ? "MOVIE" : (editing?.type === "ANIME" || lookupType === "ANIME" ? "ANIME" : "SERIES");
    F(current => ({
      ...current, tmdbId: String(item.tmdbId), mediaType: item.mediaType,
      alternativeTitles: item.alternativeTitles.join("\n"), posterPath: item.posterPath ?? "",
      backdropPath: item.backdropPath ?? "", logoPath: item.logoPath ?? "", tmdbStatus: item.status,
      originalLanguage: item.originalLanguage, voteAverage: item.voteAverage?.toString() ?? "",
      voteCount: item.voteCount?.toString() ?? "", type: nextType, title: item.title,
      originalTitle: item.originalTitle, synopsis: item.overview, releaseYear: item.releaseYear?.toString() ?? "",
      endYear: item.endYear?.toString() ?? "", genres: item.genres.join(", "),
      posterUrl: item.posterUrl ?? "", backdropUrl: item.backdropUrl ?? "",
      slug: editing ? current.slug : slugify(item.title)
    }));
    E("");
  }
  async function lookupTmdb(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); B(true); E(""); TR(null);
    try {
      const response = await fetch("/api/admin/tmdb-lookup?tmdbId=" + encodeURIComponent(tmdbIdInput) + "&mediaType=" + lookupMediaType);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "TMDB lookup failed.");
      const item = data.item as TmdbResult;
      TR(item); applyTmdb(item); LT(item.suggestedType);
    } catch (error) {
      E(error instanceof Error ? error.message : t("تعذّر جلب بيانات TMDB.", "Could not fetch TMDB details."));
    } finally { B(false); }
  }
  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); B(true); E("");
    const body = {
      ...f,
      tmdbId: f.tmdbId ? Number(f.tmdbId) : null,
      mediaType: f.mediaType || null,
      alternativeTitles: f.alternativeTitles.split("\n").map(value => value.trim()).filter(Boolean),
      posterPath: f.posterPath || null, backdropPath: f.backdropPath || null, logoPath: f.logoPath || null,
      tmdbStatus: f.tmdbStatus || null, originalLanguage: f.originalLanguage || null,
      voteAverage: f.voteAverage ? Number(f.voteAverage) : null, voteCount: f.voteCount ? Number(f.voteCount) : null,
      releaseYear: f.releaseYear ? Number(f.releaseYear) : null, endYear: f.endYear ? Number(f.endYear) : null,
      genres: f.genres.split(",").map(value => value.trim()).filter(Boolean),
      posterUrl: f.posterUrl || tmdbImageUrl(f.posterPath, "w500") || null,
      backdropUrl: f.backdropUrl || tmdbImageUrl(f.backdropPath, "w1280") || null,
      originalTitle: f.originalTitle || null, synopsis: f.synopsis || "",
      embedUrl: editing?.embedUrl ?? null
    };
    try {
      const response = await fetch(editing ? "/api/admin/content/" + editing.id : "/api/admin/content", {
        method: editing ? "PATCH" : "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Failed to save content.");
      location.reload();
    } catch (error) {
      E(error instanceof Error ? error.message : t("تعذّر حفظ المحتوى.", "Failed to save content."));
    } finally { B(false); }
  }
  async function remove(item: Item) {
    if (!confirm(t("حذف ", "Delete ") + item.title + t(" مع مواسمه وحلقاته؟", " with all seasons and episodes?"))) return;
    const response = await fetch("/api/admin/content/" + item.id, { method: "DELETE" });
    if (response.ok) location.reload(); else E(t("تعذّر الحذف.", "Delete failed."));
  }
  async function createSeason(item: Item) {
    const number = Number(prompt(t("رقم الموسم؟", "Season number?"), "1"));
    if (!number) return;
    const response = await fetch("/api/admin/seasons", {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ contentId: item.id, seasonNumber: number, title: (ar ? "الموسم " : "Season ") + number })
    });
    const data = await response.json();
    if (!response.ok) E(data.error ?? t("تعذّر إنشاء الموسم.", "Could not create season.")); else location.reload();
  }
  async function addEpisode(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!target?.seasons?.length) { E(t("أضف موسمًا أولًا.", "Add a season first.")); return; }
    const chosenId = seasonId || target.seasons[0]?.id;
    if (!chosenId) { E(t("اختر موسمًا أولًا.", "Choose a season first.")); return; }
    B(true); E("");
    try {
      const response = await fetch("/api/admin/seasons/" + chosenId + "/episodes", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ episodeNumber: Number(epNo), title: epTitle, isPublished: publishEpisode })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Could not save episode.");
      location.reload();
    } catch (error) {
      E(error instanceof Error ? error.message : t("تعذّرت إضافة الحلقة.", "Could not add episode."));
    } finally { B(false); }
  }
  async function removeEpisode(chosenSeasonId: string, episodeId: string, title: string) {
    if (!confirm(t("حذف الحلقة ", "Delete episode ") + title + "?")) return;
    const response = await fetch("/api/admin/seasons/" + chosenSeasonId + "/episodes?episodeId=" + encodeURIComponent(episodeId), { method: "DELETE" });
    if (response.ok) location.reload(); else E(t("تعذّر حذف الحلقة.", "Failed to delete episode."));
  }

  async function openStreams(owner: StreamOwner) {
    SO(owner); SS([]); SN("Server 1"); SU(owner.legacyUrl ?? ""); SOR(0); E(""); B(true);
    try {
      const key = owner.ownerType === "content" ? "contentId" : "episodeId";
      const response = await fetch("/api/admin/stream-servers?" + key + "=" + encodeURIComponent(owner.ownerId));
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Could not load streaming servers.");
      const found = data.servers as StreamServer[];
      SS(found);
      SOR(found.length ? Math.max(...found.map(server => server.sortOrder)) + 1 : 0);
      SN("Server " + (found.length + 1));
      if (found.length) SU("");
    } catch (error) {
      E(error instanceof Error ? error.message : t("تعذّر تحميل السيرفرات.", "Could not load servers."));
    } finally { B(false); }
  }
  async function addStream(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!streamOwner) return;
    B(true); E("");
    try {
      const response = await fetch("/api/admin/stream-servers", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({
          [streamOwner.ownerType === "content" ? "contentId" : "episodeId"]: streamOwner.ownerId,
          name: serverName, url: serverUrl, sortOrder: serverOrder, isActive: true
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Could not add streaming server.");
      SS(current => [...current, data.server as StreamServer].sort((a, b) => a.sortOrder - b.sortOrder));
      SU(""); SOR(value => value + 1); SN("Server " + (streams.length + 2));
    } catch (error) {
      E(error instanceof Error ? error.message : t("تعذّرت إضافة السيرفر.", "Could not add server."));
    } finally { B(false); }
  }
  function updateStream(id: string, key: keyof Pick<StreamServer, "name" | "url" | "sortOrder" | "isActive">, value: string | number | boolean) {
    SS(current => current.map(server => server.id === id ? { ...server, [key]: value } : server));
  }
  async function saveStream(server: StreamServer) {
    B(true); E("");
    try {
      const response = await fetch("/api/admin/stream-servers/" + server.id, {
        method: "PATCH", headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: server.name, url: server.url, sortOrder: Number(server.sortOrder), isActive: server.isActive })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Could not update server.");
      SS(current => current.map(row => row.id === server.id ? data.server as StreamServer : row));
    } catch (error) {
      E(error instanceof Error ? error.message : t("تعذّر حفظ السيرفر.", "Could not update server."));
    } finally { B(false); }
  }
  async function deleteStream(server: StreamServer) {
    if (!confirm(t("حذف ", "Delete ") + server.name + "?")) return;
    B(true); E("");
    try {
      const response = await fetch("/api/admin/stream-servers/" + server.id, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Could not delete server.");
      SS(current => current.filter(row => row.id !== server.id));
    } catch (error) {
      E(error instanceof Error ? error.message : t("تعذّر حذف السيرفر.", "Could not delete server."));
    } finally { B(false); }
  }

  return <>
    <section className="admin-tools">
      <h2>{t("استيراد بيانات من TMDB", "Import metadata from TMDB")}</h2>
      <p>{t("أدخل معرّف TMDB واختر نوعه. ستُجلب البيانات من واجهة TMDB الرسمية، ثم يمكنك مراجعتها قبل الحفظ.", "Enter a TMDB ID and its media type. Data comes from the official TMDB API and can be reviewed before saving.")}</p>
      <form className="admin-search" onSubmit={lookupTmdb}>
        <input inputMode="numeric" pattern="[0-9]+" value={tmdbIdInput} onChange={event => TI(event.target.value)} placeholder={t("معرّف TMDB الرقمي", "Numeric TMDB ID")} minLength={1} required />
        <select value={lookupMediaType} onChange={event => { const value = event.target.value as MediaType; LMT(value); LT(value === "movie" ? "MOVIE" : "SERIES"); }}>
          <option value="movie">{t("فيلم في TMDB", "TMDB movie")}</option>
          <option value="tv">{t("مسلسل / أنمي في TMDB", "TMDB TV series / anime")}</option>
        </select>
        <button className="button button-primary" disabled={busy}>{busy ? t("جارٍ الجلب…", "Fetching…") : t("جلب البيانات", "Fetch details")}</button>
      </form>
      {tmdbResult ? <article className="tmdb-result">
        {tmdbResult.posterUrl ? <img src={tmdbResult.posterUrl} alt="" /> : null}
        <div><strong>{tmdbResult.title}</strong><small>TMDB {tmdbResult.tmdbId} · {tmdbResult.mediaType.toUpperCase()} · {tmdbResult.releaseYear ?? "—"} · ★ {tmdbResult.voteAverage ?? "—"} ({tmdbResult.voteCount ?? 0})</small><a href={tmdbResult.tmdbUrl} target="_blank" rel="noreferrer">{t("عرض صفحة العمل في TMDB ↗", "Open TMDB title ↗")}</a></div>
        <button type="button" className="button button-ghost" onClick={() => applyTmdb(tmdbResult)}>{t("إعادة تعبئة النموذج", "Apply metadata again")}</button>
      </article> : null}
    </section>

    <section className="admin-tools">
      <div className="admin-section-heading"><div><h2>{editing ? t("تعديل العنوان", "Edit title") : t("إضافة عنوان", "Add title")}</h2><p>{t("سيُحفظ المحتوى كمسودة افتراضيًا. حالة TMDB منفصلة عن حالة النشر في Shineflix.", "Content is saved as a draft by default. TMDB's work status is separate from Shineflix publication status.")}</p></div><button type="button" className="button button-ghost" onClick={fresh}>{t("عنصر جديد +", "New item +")}</button></div>
      <form className="admin-content-form" onSubmit={save}>
        <label>{t("العنوان", "Title")}<input value={f.title} onChange={event => set("title", event.target.value)} required /></label>
        <label>{t("العنوان الأصلي", "Original title")}<input value={f.originalTitle} onChange={event => set("originalTitle", event.target.value)} /></label>
        <label>{t("الرابط المختصر", "Slug")}<input value={f.slug} onChange={event => set("slug", event.target.value)} onBlur={() => !f.slug && set("slug", slugify(f.title))} required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" /></label>
        <label>{t("تصنيف Shineflix", "Shineflix category")}<select value={f.type} onChange={event => set("type", event.target.value as ContentType)}><option value="ANIME">{t("أنمي", "Anime")}</option><option value="MOVIE">{t("فيلم", "Movie")}</option><option value="SERIES">{t("مسلسل تلفزيوني", "TV series")}</option></select></label>
        <label>{t("نوع TMDB", "TMDB media type")}<select value={f.mediaType} onChange={event => set("mediaType", event.target.value as MediaType | "")}><option value="movie">movie</option><option value="tv">tv</option></select></label>
        <label>{t("معرّف TMDB", "TMDB ID")}<input type="number" min="1" value={f.tmdbId} onChange={event => set("tmdbId", event.target.value)} /></label>
        <label>{t("سنة الإصدار", "Release year")}<input type="number" value={f.releaseYear} onChange={event => set("releaseYear", event.target.value)} /></label>
        <label>{t("سنة النهاية", "End year")}<input type="number" value={f.endYear} onChange={event => set("endYear", event.target.value)} /></label>
        <label>{t("التصنيفات بفواصل", "Genres (comma-separated)")}<input value={f.genres} onChange={event => set("genres", event.target.value)} /></label>
        <label>{t("تقييم TMDB", "TMDB vote average")}<input type="number" min="0" max="10" step="0.1" value={f.voteAverage} onChange={event => set("voteAverage", event.target.value)} /></label>
        <label>{t("عدد المصوّتين", "Vote count")}<input type="number" min="0" step="1" value={f.voteCount} onChange={event => set("voteCount", event.target.value)} /></label>
        <label>{t("اللغة الأصلية", "Original language")}<input value={f.originalLanguage} onChange={event => set("originalLanguage", event.target.value)} maxLength={12} /></label>
        <label>{t("حالة العمل في TMDB", "TMDB work status")}<input value={f.tmdbStatus} onChange={event => set("tmdbStatus", event.target.value)} /></label>
        <label>{t("مسار الملصق (TMDB)", "Poster path (TMDB)")}<input value={f.posterPath} onChange={event => set("posterPath", event.target.value)} placeholder="/abc123.jpg" /></label>
        <label>{t("مسار الخلفية (TMDB)", "Backdrop path (TMDB)")}<input value={f.backdropPath} onChange={event => set("backdropPath", event.target.value)} placeholder="/xyz123.jpg" /></label>
        <label>{t("مسار الشعار (TMDB)", "Logo path (TMDB)")}<input value={f.logoPath} onChange={event => set("logoPath", event.target.value)} placeholder="/logo123.png" /></label>
        <label>{t("رابط الملصق (اختياري)", "Poster URL (optional)")}<input type="url" value={f.posterUrl} onChange={event => set("posterUrl", event.target.value)} /></label>
        <label>{t("رابط الخلفية (اختياري)", "Backdrop URL (optional)")}<input type="url" value={f.backdropUrl} onChange={event => set("backdropUrl", event.target.value)} /></label>
        <label className="admin-full">{t("العناوين البديلة — عنوان واحد في كل سطر", "Alternative titles — one per line")}<textarea rows={3} value={f.alternativeTitles} onChange={event => set("alternativeTitles", event.target.value)} /></label>
        <label className="admin-full">{t("نبذة عن القصة", "Overview / synopsis")}<textarea rows={4} value={f.synopsis} onChange={event => set("synopsis", event.target.value)} /></label>
        <label>{t("حالة النشر", "Publication status")}<select value={f.status} onChange={event => set("status", event.target.value as ContentStatus)}><option value="DRAFT">{t("مسودة", "Draft")}</option><option value="PUBLISHED">{t("منشور", "Published")}</option><option value="ARCHIVED">{t("مؤرشف", "Archived")}</option></select></label>
        <label className="admin-checkbox"><input type="checkbox" checked={f.isFeatured} onChange={event => set("isFeatured", event.target.checked)} /> {t("إبراز المحتوى", "Feature this title")}</label>
        <div className="admin-form-actions"><button className="button button-primary" disabled={busy || !databaseReady}>{editing ? t("حفظ التعديلات", "Save changes") : t("إضافة العنوان", "Add title")}</button></div>
      </form>
    </section>

    <section className="admin-tools">
      <div className="admin-section-heading"><div><h2>{t("مكتبة المحتوى", "Content library")}</h2><p>{items.length} {t("عنوانًا", "titles")}</p></div><input className="admin-filter" value={q} onChange={event => Q(event.target.value)} placeholder={t("ابحث في المكتبة", "Search library")} /></div>
      {!filtered.length ? <div className="admin-empty">{t("لا توجد عناوين محفوظة بعد.", "No saved titles yet.")}</div> : <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>{t("العنوان", "Title")}</th><th>{t("النوع", "Type")}</th><th>{t("السنة", "Year")}</th><th>{t("التقييم", "Rating")}</th><th>{t("النشر", "Status")}</th><th>{t("المواسم", "Seasons")}</th><th>{t("إجراءات", "Actions")}</th></tr></thead><tbody>{filtered.map(item => <tr key={item.id}>
        <td><strong>{item.title}</strong><small>{item.tmdbId ? "TMDB " + item.tmdbId + " · " + (item.mediaType ?? "") : item.slug}</small></td>
        <td>{item.type === "MOVIE" ? t("فيلم", "Movie") : item.type === "SERIES" ? t("مسلسل", "TV series") : t("أنمي", "Anime")}</td>
        <td>{item.releaseYear ?? "—"}</td><td>{item.voteAverage?.toFixed(1) ?? "—"}</td>
        <td>{item.status === "PUBLISHED" ? t("منشور", "Published") : item.status === "DRAFT" ? t("مسودة", "Draft") : t("مؤرشف", "Archived")}</td>
        <td>{item.seasons?.length ?? 0}</td>
        <td><div className="admin-row-actions"><button onClick={() => edit(item)}>{t("تعديل", "Edit")}</button><button onClick={() => openStreams({ ownerType: "content", ownerId: item.id, label: item.title, legacyUrl: item.embedUrl })}>{t("سيرفرات", "Servers")}</button><button onClick={() => createSeason(item)}>{t("موسم +", "Season +")}</button><button onClick={() => { T(item); SI(item.seasons?.[0]?.id ?? ""); ET(""); EN("1"); PE(false); E(""); }}>{t("حلقة +", "Episode +")}</button><button className="danger" onClick={() => remove(item)}>{t("حذف", "Delete")}</button></div></td>
      </tr>)}</tbody></table></div>}
    </section>

    {target ? <div className="admin-modal-backdrop"><section className="admin-modal admin-episode-modal"><button className="admin-modal-close" onClick={() => T(null)}>×</button><h2>{t("إضافة حلقة — ", "Add episode — ")}{target.title}</h2><p>{t("أضف الحلقة ثم افتح إدارة السيرفرات لإضافة روابط مشاهدة متعددة. أضف موسمًا أولًا.", "Add the episode, then open server management to attach multiple player links. Add a season first.")}</p><form onSubmit={addEpisode}>
      {target.seasons?.length ? <label>{t("الموسم", "Season")}<select value={seasonId || target.seasons[0]?.id || ""} onChange={event => SI(event.target.value)}>{target.seasons.map(season => <option key={season.id} value={season.id}>{season.title || t("الموسم ", "Season ") + season.seasonNumber}</option>)}</select></label> : null}
      <label>{t("رقم الحلقة", "Episode number")}<input type="number" min="1" value={epNo} onChange={event => EN(event.target.value)} required /></label>
      <label>{t("عنوان الحلقة", "Episode title")}<input value={epTitle} onChange={event => ET(event.target.value)} required /></label>
      <label className="admin-checkbox"><input type="checkbox" checked={publishEpisode} onChange={event => PE(event.target.checked)} /> {t("نشر الحلقة بعد التحقق من حقوق العرض", "Publish after confirming display rights")}</label>
      <button className="button button-primary" disabled={busy}>{t("حفظ الحلقة", "Save episode")}</button>
    </form>
    {target.seasons?.find(season => season.id === (seasonId || target.seasons?.[0]?.id))?.episodes.map(episode => <div className="admin-episode-row" key={episode.id}>
      <span>{episode.episodeNumber}. {episode.title}</span><small>{episode.isPublished ? t("منشورة", "Published") : t("مسودة", "Draft")}</small>
      <button type="button" onClick={() => openStreams({ ownerType: "episode", ownerId: episode.id, label: target.title + " — " + episode.title, legacyUrl: episode.embedUrl })}>{t("سيرفرات", "Servers")}</button>
      <button type="button" className="danger" onClick={() => removeEpisode(seasonId || target.seasons?.[0]?.id || "", episode.id, episode.title)}>{t("حذف", "Delete")}</button>
    </div>)}
    </section></div> : null}

    {streamOwner ? <div className="admin-modal-backdrop admin-stream-modal-backdrop"><section className="admin-modal admin-stream-modal"><button className="admin-modal-close" onClick={() => SO(null)}>×</button><h2>{t("سيرفرات المشاهدة", "Streaming servers")}</h2><p>{streamOwner.label}</p>
      {streamOwner.legacyUrl && !streams.length ? <p className="admin-legacy-note">{t("يوجد رابط قديم محفوظ. أُدرج في حقل الإضافة لتسجيله كسيرفر قابل للإدارة.", "A legacy player URL exists. It is prefilled below so you can save it as a manageable server.")}</p> : null}
      {streams.length ? <div className="admin-stream-list">{streams.map(server => <div className="admin-stream-row" key={server.id}>
        <label>{t("اسم السيرفر", "Server name")}<input value={server.name} onChange={event => updateStream(server.id, "name", event.target.value)} maxLength={100} /></label>
        <label>{t("رابط Embed آمن (HTTPS)", "HTTPS embed URL")}<input type="url" value={server.url} onChange={event => updateStream(server.id, "url", event.target.value)} /></label>
        <label>{t("الترتيب", "Order")}<input type="number" min="0" max="1000" value={server.sortOrder} onChange={event => updateStream(server.id, "sortOrder", Number(event.target.value))} /></label>
        <label className="admin-checkbox"><input type="checkbox" checked={server.isActive} onChange={event => updateStream(server.id, "isActive", event.target.checked)} /> {t("مفعّل للزوار", "Available to visitors")}</label>
        <div className="admin-row-actions"><button type="button" onClick={() => saveStream(server)} disabled={busy}>{t("حفظ", "Save")}</button><button type="button" className="danger" onClick={() => deleteStream(server)} disabled={busy}>{t("حذف", "Delete")}</button></div>
      </div>)}</div> : <div className="admin-empty">{t("لا توجد سيرفرات مسجلة بعد.", "No servers registered yet.")}</div>}
      <form className="admin-stream-form" onSubmit={addStream}>
        <h3>{t("إضافة سيرفر جديد", "Add a server")}</h3>
        <label>{t("اسم السيرفر", "Server name")}<input value={serverName} onChange={event => SN(event.target.value)} required maxLength={100} /></label>
        <label>{t("رابط تضمين المشغّل", "Player embed URL")}<input type="url" value={serverUrl} onChange={event => SU(event.target.value)} required placeholder="https://video-provider.example/embed/..." /></label>
        <label>{t("ترتيب العرض", "Display order")}<input type="number" min="0" max="1000" value={serverOrder} onChange={event => SOR(Number(event.target.value))} /></label>
        <small>{t("تُقبل روابط HTTPS من YouTube وVimeo أو المضيفين المسموح بهم في EMBED_ALLOWED_HOSTS. أضف روابط تملك حق تضمينها فقط.", "HTTPS is required. YouTube/Vimeo and hosts allowlisted in EMBED_ALLOWED_HOSTS are accepted. Only add links you are authorized to embed.")}</small>
        <button className="button button-primary" disabled={busy}>{t("إضافة السيرفر", "Add server")}</button>
      </form>
    </section></div> : null}

    {error ? <div className="admin-toast" role="alert">{error}<button onClick={() => E("")}>×</button></div> : null}
  </>;
}
