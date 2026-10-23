import Link from "next/link";
import { FavoriteButton } from "@/components/favorite-button";
import { AdSlot } from "@/components/ad-slot";
import type { Language } from "@/lib/i18n";

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

const labels = { en: { MOVIE: "Movie", SERIES: "TV Series", ANIME: "Anime" }, ar: { MOVIE: "فيلم", SERIES: "مسلسل", ANIME: "أنمي" } } as const;

export function ContentDetail({ item, lang = "en" }: { item: DetailItem; lang?: Language }) {
  const ar = lang === "ar";
  const originalTitle = item.originalTitle ?? item.title;
  const rating = item.imdbRating?.toFixed(1) ?? "—";
  const backHref = item.type === "MOVIE" ? "/movies" : item.type === "SERIES" ? "/series" : "/anime";
  const cover = item.posterUrl ? `url("${item.posterUrl}") center/cover no-repeat` : "linear-gradient(145deg,#24121f,#8d233e)";
  return <div className="page-shell inner-page">
    <Link href={backHref} className="back-link">→ {ar ? "العودة إلى " : "Back to "}{labels[lang][item.type]}</Link>
    <section className="detail-layout">
      <div className="detail-poster" style={{ background: cover }}>
        <span className="poster-vertical">{originalTitle}</span><span className="poster-title">{item.title}</span><span className="poster-rating">★ {rating}</span>
      </div>
      <div className="detail-copy">
        <span className="eyebrow">{labels[lang][item.type]} · {item.releaseYear ?? "—"}</span>
        <h1>{item.title}</h1><p className="detail-en">{originalTitle}</p>
        <div className="detail-meta"><span>{ar ? (item.endYear ? "مكتمل" : "متاح") : (item.endYear ? "Completed" : "Available")}</span><span>{item.releaseYear ?? "—"}</span><span>★ {rating}</span>{item.imdbVotes ? <span>{item.imdbVotes.toLocaleString(lang === "ar" ? "ar" : "en-US")} {ar ? "تقييمًا" : "votes"}</span> : null}</div>
        <p className="detail-description">{item.synopsis}</p>
        <div className="detail-tags">{item.genres.map(genre => <span key={genre}>{genre}</span>)}</div>
        <div className="detail-actions"><FavoriteButton slug={item.slug}/><span>{ar ? "أضف العمل إلى قائمتك الشخصية" : "Save this title to your watchlist"}</span>{item.imdbUrl ? <a href={item.imdbUrl} target="_blank" rel="noreferrer">صفحة IMDb ↗</a> : null}</div>
      </div>
    </section>
    {item.type === "MOVIE" && item.embedUrl ? <><AdSlot placement="PLAYER_BEFORE" /><section className="episode-library"><h2>{ar ? "مشاهدة الفيلم" : "Watch movie"}</h2><div className="embed-frame"><iframe src={item.embedUrl} title={item.title} loading="lazy" referrerPolicy="strict-origin-when-cross-origin" sandbox="allow-scripts allow-presentation" allow="fullscreen; picture-in-picture" allowFullScreen /></div></section></> : null}
    {item.seasons.length ? <section className="episode-library"><h2>{ar ? "المواسم والحلقات" : "Seasons & episodes"}</h2>
      {item.seasons.map(season => <div className="episode-season" key={season.id}><h3>{season.title || (ar ? "الموسم " : "Season ") + season.seasonNumber}</h3>
        {season.episodes.map(episode => <article className="episode-card" key={episode.id}><div><strong>{episode.episodeNumber}. {episode.title}</strong>{episode.synopsis ? <p>{episode.synopsis}</p> : null}</div>
          {episode.embedUrl ? <details><summary>{ar ? "مشاهدة الحلقة" : "Watch episode"}</summary><div className="embed-frame"><iframe src={episode.embedUrl} title={episode.title} loading="lazy" referrerPolicy="strict-origin-when-cross-origin" sandbox="allow-scripts allow-presentation" allow="fullscreen; picture-in-picture" allowFullScreen /></div></details> : null}
        </article>)}
      </div>)}
    </section> : null}
    <AdSlot placement="DETAIL_BOTTOM" />
    <p className="detail-disclaimer">{ar ? "تُعرض روابط المشغّلات التي يضيفها مدير الموقع فقط. يجب أن يكون مصدر الفيديو مرخّصًا ويسمح بالتضمين." : "Only player links added by the site administrator are shown. Video sources must be licensed and permit embedding."}</p>
  </div>;
}
