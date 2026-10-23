import Link from "next/link";
import { FavoriteButton } from "@/components/favorite-button";
import { AdSlot } from "@/components/ad-slot";
import { MultiServerPlayer, type PlaybackSource } from "@/components/multi-server-player";
import type { Language } from "@/lib/i18n";

type Stream = { id: string; name: string; url: string; sortOrder: number };
type DetailItem = {
  id: string; slug: string; type: "MOVIE" | "SERIES" | "ANIME"; title: string;
  tmdbId: number | null; mediaType: "movie" | "tv" | null; alternativeTitles: string[];
  posterPath: string | null; backdropPath: string | null; logoPath: string | null; tmdbStatus: string | null;
  originalLanguage: string | null; voteAverage: number | null; voteCount: number | null;
  originalTitle: string | null; synopsis: string; releaseYear: number | null; endYear: number | null;
  genres: string[]; posterUrl: string | null; imdbRating: number | null; imdbVotes: number | null;
  embedUrl: string | null; streamServers: Stream[];
  seasons: Array<{ id: string; seasonNumber: number; title: string | null; episodes: Array<{
    id: string; episodeNumber: number; title: string; synopsis: string; embedUrl: string | null; streamServers: Stream[];
  }> }>;
};

const labels = { en: { MOVIE: "Movie", SERIES: "TV Series", ANIME: "Anime" }, ar: { MOVIE: "فيلم", SERIES: "مسلسل", ANIME: "أنمي" } } as const;
function sources(servers: Stream[], legacyUrl: string | null, ownerId: string): PlaybackSource[] {
  if (servers.length) return servers.filter(server => server.url).map(server => ({ id: server.id, name: server.name, url: server.url, sortOrder: server.sortOrder }));
  return legacyUrl ? [{ id: "legacy-" + ownerId, name: "Server 1", url: legacyUrl, sortOrder: 0 }] : [];
}

export function ContentDetail({ item, lang = "en" }: { item: DetailItem; lang?: Language }) {
  const ar = lang === "ar";
  const originalTitle = item.originalTitle ?? item.title;
  const ratingValue = item.voteAverage ?? item.imdbRating;
  const voteCount = item.voteCount ?? item.imdbVotes;
  const rating = typeof ratingValue === "number" ? ratingValue.toFixed(1) : "—";
  const backHref = item.type === "MOVIE" ? "/movies" : item.type === "SERIES" ? "/series" : "/anime";
  const cover = item.posterUrl ? `url("${item.posterUrl}") center/cover no-repeat` : "linear-gradient(145deg,#24121f,#8d233e)";
  const movieSources = sources(item.streamServers ?? [], item.embedUrl, item.id);
  return <div className="page-shell inner-page">
    <Link href={backHref} className="back-link">→ {ar ? "العودة إلى " : "Back to "}{labels[lang][item.type]}</Link>
    <section className="detail-layout">
      <div className="detail-poster" style={{ background: cover }}>
        <span className="poster-vertical">{originalTitle}</span><span className="poster-title">{item.title}</span><span className="poster-rating">★ {rating}</span>
      </div>
      <div className="detail-copy">
        <span className="eyebrow">{labels[lang][item.type]} · {item.releaseYear ?? "—"}</span>
        <h1>{item.title}</h1><p className="detail-en">{originalTitle}</p>
        <div className="detail-meta">
          <span>{ar ? (item.tmdbStatus || (item.endYear ? "مكتمل" : "متاح")) : (item.tmdbStatus || (item.endYear ? "Completed" : "Available"))}</span>
          <span>{item.releaseYear ?? "—"}</span><span>★ {rating}</span>
          {voteCount ? <span>{voteCount.toLocaleString(ar ? "ar" : "en-US")} {ar ? "مصوّتًا" : "votes"}</span> : null}
          {item.originalLanguage ? <span>{ar ? "اللغة الأصلية" : "Original language"}: {item.originalLanguage}</span> : null}
        </div>
        <p className="detail-description">{item.synopsis}</p>
        <div className="detail-tags">{item.genres.map(genre => <span key={genre}>{genre}</span>)}</div>
        <div className="detail-actions">
          <FavoriteButton slug={item.slug} lang={lang}/><span>{ar ? "أضف العمل إلى قائمتك الشخصية" : "Save this title to your watchlist"}</span>
          {item.tmdbId && item.mediaType ? <a href={`https://www.themoviedb.org/${item.mediaType}/${item.tmdbId}`} target="_blank" rel="noreferrer">{ar ? "بيانات TMDB ↗" : "TMDB details ↗"}</a> : null}
        </div>
      </div>
    </section>
    {item.type === "MOVIE" && movieSources.length ? <><AdSlot placement="PLAYER_BEFORE" /><section className="episode-library"><h2>{ar ? "مشاهدة الفيلم" : "Watch movie"} </h2><MultiServerPlayer sources={movieSources} title={item.title} lang={lang}/></section></> : null}
    {item.seasons.length ? <section className="episode-library"><h2>{ar ? "المواسم والحلقات" : "Seasons & episodes"}</h2>
      {item.seasons.map(season => <div className="episode-season" key={season.id}><h3>{season.title || (ar ? "الموسم " : "Season ") + season.seasonNumber}</h3>
        {season.episodes.map(episode => {
          const episodeSources = sources(episode.streamServers ?? [], episode.embedUrl, episode.id);
          return <article className="episode-card" key={episode.id}>
            <div><strong>{episode.episodeNumber}. {episode.title}</strong>{episode.synopsis ? <p>{episode.synopsis}</p> : null}</div>
            {episodeSources.length ? <details><summary>{ar ? `مشاهدة الحلقة · ${episodeSources.length} سيرفر` : `Watch episode · ${episodeSources.length} server(s)`}</summary><MultiServerPlayer sources={episodeSources} title={episode.title} lang={lang}/></details> : null}
          </article>;
        })}
      </div>)}
    </section> : null}
    <AdSlot placement="DETAIL_BOTTOM" />
    <p className="detail-disclaimer">{ar ? "تُعرض روابط المشغّلات التي يضيفها مدير الموقع فقط. يجب أن يكون مصدر الفيديو مرخّصًا ويسمح بالتضمين." : "Only player links added by the site administrator are shown. Video sources must be licensed and permit embedding."}</p>
  </div>;
}
