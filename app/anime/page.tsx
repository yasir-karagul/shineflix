import type {Metadata} from "next";
import {CatalogExperience} from "@/components/catalog-experience";
import {getPublishedContent} from "@/lib/content";
export const metadata:Metadata={title:"اكتشف الأنمي"};
export const dynamic="force-dynamic";
export default async function AnimePage({searchParams}:{searchParams:Promise<{genre?:string}>}){
 const params=await searchParams;const items=await getPublishedContent("ANIME");const genres=Array.from(new Set(items.flatMap((a:any)=>a.genres)));
 return <div className="page-shell inner-page"><div className="page-intro"><span className="eyebrow">مكتبة Shineflix</span><h1>كل حكاية، <span>عالم جديد.</span></h1><p>اكتشف أعمالًا جديدة وابحث حسب التصنيف أو حالة العرض.</p></div><CatalogExperience items={items.filter((a:any)=>!params.genre||a.genres.includes(params.genre))} genres={genres}/></div>;
}
