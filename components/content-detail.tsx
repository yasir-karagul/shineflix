import Link from "next/link";
import { FavoriteButton } from "@/components/favorite-button";

type DetailItem = {
  id: string; slug: string; type: "MOVIE" | "SERIES" | "ANIME"; title: string;
  originalTitle: string | null; synopsis: string; releaseYear: number | null;
  endYear: number | null; genres: string[]; posterUrl: string | null;
  imdbRating: number | null; imdbVotes: number | null; imdbUrl: string | null;
  embedUrl: string | null;
  seasons: Array<{ id: string; seasonNumber: number; title: string | null; episodes: Array<{
    id: string; episodeNumber: number; title: string; synopsis: string; embedUrl: string | null;
  }> }>;
};

const labels = { MOVIE: "فيلم", SERIES: "مسلسل", ANIME: "أنمي" } as const;

export function ContentDetail({ item }: { item: DetailItem }) {
  const originalTitle = item.originalTitle ?? item.title;
  const rating = item.imdbRating?.toFixed(1) ?? "—";
  const backHref = item.type === "MOVIE" ? "/movies" : item.type === "SERIES" ? "/series" : "/anime";
  const cover = item.posterUrl ? `url("${item.posterUrl}") center/cover no-repeat` : "linear-gradient(145deg,#24121f,#8d233e)";
  return <div className="page-shell inner-page">
    <Link href={backHref} className="back-link">→ العودة إلى {labels[item.type]}</Link>
    <section className="detail-layout">
      <div className="detail-poster" style={{ background: cover }}>
        <span className="poster-vertical">{originalTitle}</span><span className="poster-title">{item.title}</span><span className="poster-rating">★ {rating}</span>
      </div>
      <div className="detail-copy">
        <span className="eyebrow">{labels[item.type]} · {item.releaseYear ?? "—"}</span>
        <h1>{item.title}</h1><p className="detail-en">{originalTitle}</p>
        <div className="detail-meta"><span>{item.endYear ? "مكتمل" : "متاح"}</span><span>{item.releaseYear ?? "—"}</span><span>★ {rating}</span>{item.imdbVotes ? <span>{item.imdbVotes.toLocaleString("en-US")} تقييمًا</span> : null}</div>
        <p className="detail-description">{item.synopsis}</p>
        <div className="detail-tags">{item.genres.map(genre => <span key={genre}>{genre}</span>)}</div>
        <div className="detail-actions"><FavoriteButton slug={item.slug}/><span>أضف العمل إلى قائمتك الشخصية</span>{item.imdbUrl ? <a href={item.imdbUrl} target="_blank" rel="noreferrer">صفحة IMDb ↗</a> : null}</div>
      </div>
    </section>
    {item.type === "MOVIE" && item.embedUrl ? <section className="episode-library"><h2>مشاهدة الفيلم</h2><div className="embed-frame"><iframe src={item.embedUrl} title={item.title} loading="lazy" referrerPolicy="strict-origin-when-cross-origin" sandbox="allow-scripts allow-presentation" allow="fullscreen; picture-in-picture" allowFullScreen /></div></section> : null}
    {item.seasons.length ? <section className="episode-library"><h2>المواسم والحلقات</h2>
      {item.seasons.map(season => <div className="episode-season" key={season.id}><h3>{season.title || "الموسم " + season.seasonNumber}</h3>
        {season.episodes.map(episode => <article className="episode-card" key={episode.id}><div><strong>{episode.episodeNumber}. {episode.title}</strong>{episode.synopsis ? <p>{episode.synopsis}</p> : null}</div>
          {episode.embedUrl ? <details><summary>مشاهدة الحلقة</summary><div className="embed-frame"><iframe src={episode.embedUrl} title={episode.title} loading="lazy" referrerPolicy="strict-origin-when-cross-origin" sandbox="allow-scripts allow-presentation" allow="fullscreen; picture-in-picture" allowFullScreen /></div></details> : null}
        </article>)}
      </div>)}
    </section> : null}
    <p className="detail-disclaimer">تُعرض روابط المشغّلات التي يضيفها مدير الموقع فقط. يجب أن يكون مصدر الفيديو مرخّصًا ويسمح بالتضمين.</p>
  </div>;
}
