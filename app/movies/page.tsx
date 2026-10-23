import type {Metadata} from "next";
import {AnimeCard} from "@/components/anime-card";
import {getPublishedContent} from "@/lib/content";
import {getLanguage} from "@/lib/i18n";
export const metadata:Metadata={title:"Movies | Shineflix"};
export const dynamic="force-dynamic";
export default async function MoviesPage(){const [items,lang]=await Promise.all([getPublishedContent("MOVIE"),getLanguage()]);const ar=lang==="ar";return <div className="page-shell inner-page"><div className="page-intro"><span className="eyebrow">{ar?"شاشة أكبر، حكايات أعمق":"A bigger screen, deeper stories"}</span><h1>{ar?<>أفلام <span>Shineflix.</span></>:<>Movies <span>on Shineflix.</span></>}</h1><p>{ar?"اكتشف الأفلام المنشورة في مكتبة Shineflix.":"Discover movies published in the Shineflix library."}</p></div>{items.length===0?<div className="empty-state"><span>✦</span><h3>{ar?"لا توجد أفلام منشورة بعد":"No movies published yet"}</h3><p>{ar?"أضف فيلمًا من لوحة التحكم ثم غيّر حالته إلى «منشور» ليظهر هنا.":"Add a movie in the admin panel and publish it to show it here."}</p></div>:<div className="anime-grid">{items.map((item)=><AnimeCard key={item.slug} anime={item} lang={lang}/>)}</div>}</div>}
