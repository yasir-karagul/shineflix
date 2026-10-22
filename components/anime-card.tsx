import Link from "next/link";
import type { Anime } from "@/lib/data";
import { FavoriteButton } from "@/components/favorite-button";
export function AnimeCard({anime:item}:{anime:Anime}){
 return <article className="anime-card"><Link href={"/anime/"+item.slug} className="poster" style={{background:item.cover}} aria-label={"تفاصيل "+item.title}><span className="poster-sheen" /><span className="poster-vertical">{item.titleEn}</span><span className="poster-title">{item.title}</span><span className="poster-year">{item.year}</span><span className="poster-rating">★ {item.rating}</span></Link><div className="card-info"><div className="card-title-row"><Link href={"/anime/"+item.slug} className="card-title">{item.title}</Link><FavoriteButton slug={item.slug}/></div><p className="card-meta">{item.titleEn} <span>•</span> {item.episodes}</p><div className="card-tags"><span>{item.status}</span>{item.genres.slice(0,1).map(g=><span key={g}>{g}</span>)}</div></div></article>
}
