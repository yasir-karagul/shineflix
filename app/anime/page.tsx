import type { Metadata } from "next";
import { CatalogExperience } from "@/components/catalog-experience";
import { getPublishedContent } from "@/lib/content";
import { getLanguage } from "@/lib/i18n";
export const metadata:Metadata={title:"Anime | Shineflix"};
export const dynamic="force-dynamic";
export default async function AnimePage({searchParams}:{searchParams:Promise<{genre?:string}>}){
 const [params,items,lang]=await Promise.all([searchParams,getPublishedContent("ANIME"),getLanguage()]);
 const genres=Array.from(new Set(items.flatMap((a:any)=>a.genres)));
 const ar=lang==="ar";
 return <div className="page-shell inner-page"><div className="page-intro"><span className="eyebrow">{ar?"مكتبة Shineflix":"The Shineflix Library"}</span><h1>{ar?<>كل حكاية، <span>عالم جديد.</span></>:<>Every story, <span>a new world.</span></>}</h1><p>{ar?"اكتشف أعمالًا جديدة وابحث حسب التصنيف أو حالة العرض.":"Discover something new and filter titles by genre or release status."}</p></div><CatalogExperience items={items.filter((a:any)=>!params.genre||a.genres.includes(params.genre))} genres={genres} lang={lang}/></div>;
}
