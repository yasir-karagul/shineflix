import Link from "next/link";
import type { Anime } from "@/lib/data";
import { FavoriteButton } from "@/components/favorite-button";

type CardItem = Anime & { type?: "MOVIE" | "SERIES" | "ANIME" };
export function AnimeCard({ anime: item }: { anime: CardItem }) {
  const href = item.type === "MOVIE" ? "/movies/" + item.slug : item.type === "SERIES" ? "/series/" + item.slug : "/anime/" + item.slug;
  return <article className="anime-card">
    <Link href={href} className="poster" style={{ background: item.cover }} aria-label={"تفاصيل " + item.title}>
      <span className="poster-sheen" /><span className="poster-vertical">{item.titleEn}</span><span className="poster-title">{item.title}</span><span className="poster-year">{item.year}</span><span className="poster-rating">★ {item.rating}</span>
    </Link>
    <div className="card-info">
      <div className="card-title-row"><Link href={href} className="card-title">{item.title}</Link><FavoriteButton slug={item.slug}/></div>
      <p className="card-meta">{item.titleEn} <span>•</span> {item.episodes}</p>
      <div className="card-tags"><span>{item.status}</span>{item.genres.slice(0,1).map(genre=><span key={genre}>{genre}</span>)}</div>
    </div>
  </article>;
}
