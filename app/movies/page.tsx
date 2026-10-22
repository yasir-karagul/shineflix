import type {Metadata} from "next";
import {AnimeCard} from "@/components/anime-card";
import {getPublishedContent} from "@/lib/content";
export const metadata:Metadata={title:"الأفلام"};
export const dynamic="force-dynamic";
export default async function MoviesPage(){const items=await getPublishedContent("MOVIE");return <div className="page-shell inner-page"><div className="page-intro"><span className="eyebrow">شاشة أكبر، حكايات أعمق</span><h1>أفلام <span>Shineflix.</span></h1><p>اكتشف الأفلام المنشورة في مكتبة Shineflix.</p></div>{items.length===0?<div className="empty-state"><span>✦</span><h3>لا توجد أفلام منشورة بعد</h3><p>أضف فيلمًا من لوحة التحكم ثم غيّر حالته إلى «منشور» ليظهر هنا.</p></div>:<div className="anime-grid">{items.map((item:any)=><AnimeCard key={item.slug} anime={item}/>)}</div>}</div>}
