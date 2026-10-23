import Link from "next/link";
import type { Anime } from "@/lib/data";
import { FavoriteButton } from "@/components/favorite-button";
import type { Language } from "@/lib/i18n";

type CardItem = Anime & { type?: "MOVIE" | "SERIES" | "ANIME" };
export function AnimeCard({ anime: item, lang = "en" }: { anime: CardItem; lang?: Language }) {
  const ar = lang === "ar";
  const displayTitle = ar ? item.title : item.titleEn;
  const href = item.type === "MOVIE" ? "/movies/" + item.slug : item.type === "SERIES" ? "/series/" + item.slug : "/anime/" + item.slug;
  return <article className="anime-card">
    <Link href={href} className="poster" style={{ background: item.cover }} aria-label={(ar ? "تفاصيل " : "Details for ") + displayTitle}>
      <span className="poster-sheen" /><span className="poster-vertical">{item.titleEn}</span><span className="poster-title">{displayTitle}</span><span className="poster-year">{item.year}</span><span className="poster-rating">★ {item.rating}</span>
    </Link>
    <div className="card-info">
      <div className="card-title-row"><Link href={href} className="card-title">{displayTitle}</Link><FavoriteButton slug={item.slug}/></div>
      <p className="card-meta">{ar ? (item.titleEn + " • " + item.episodes) : item.episodes}</p>
      <div className="card-tags"><span>{ar ? item.status : ({"يعرض الآن":"Airing","مكتمل":"Completed","قريبًا":"Coming soon"}[item.status] ?? item.status)}</span>{item.genres.slice(0,1).map(genre=><span key={genre}>{genre}</span>)}</div>
    </div>
  </article>;
}
