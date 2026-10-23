import type {Metadata} from "next";
import {AnimeCard} from "@/components/anime-card";
import {getPublishedContent} from "@/lib/content";
import {getLanguage} from "@/lib/i18n";
export const metadata:Metadata={title:"TV Series | Shineflix"};
export const dynamic="force-dynamic";
export default async function SeriesPage(){const [items,lang]=await Promise.all([getPublishedContent("SERIES"),getLanguage()]);const ar=lang==="ar";return <div className="page-shell inner-page"><div className="page-intro"><span className="eyebrow">{ar?"مكتبة Shineflix":"The Shineflix Library"}</span><h1>{ar?<>المسلسلات <span>التي تستحق وقتك.</span></>:<>TV series <span>worth your time.</span></>}</h1><p>{ar?"استكشف المسلسلات المنشورة وتفاصيل المواسم والحلقات.":"Explore published series, seasons and episodes."}</p></div>{items.length===0?<div className="empty-state"><span>✦</span><h3>{ar?"لا توجد مسلسلات منشورة بعد":"No series published yet"}</h3><p>{ar?"أضف مسلسلًا من لوحة التحكم ثم انشره ليظهر هنا.":"Add and publish a series from the admin panel to show it here."}</p></div>:<div className="anime-grid">{items.map((item)=><AnimeCard key={item.slug} anime={item} lang={lang}/>)}</div>}</div>}
