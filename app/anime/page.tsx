import type { Metadata } from "next";
import { CatalogExperience } from "@/components/catalog-experience";
import { anime, genres } from "@/lib/data";
export const metadata:Metadata={title:"اكتشف الأنمي"};
export default async function AnimePage({searchParams}:{searchParams:Promise<{genre?:string}>}){
 const params=await searchParams;
 return <div className="page-shell inner-page"><div className="page-intro"><span className="eyebrow">مكتبة Shineflix</span><h1>كل حكاية، <span>عالم جديد.</span></h1><p>اكتشف أعمالًا جديدة وابحث حسب التصنيف أو حالة العرض.</p></div><CatalogExperience items={anime.filter(a=>!params.genre||a.genres.includes(params.genre!))} genres={genres}/></div>
}
