"use client";
import { useMemo, useState } from "react";
import { AnimeCard } from "@/components/anime-card";
import type { Anime } from "@/lib/data";
export function CatalogExperience({items,genres}:{items:Anime[];genres:string[]}){
 const [query,setQuery]=useState("");const [genre,setGenre]=useState("الكل");const [status,setStatus]=useState("الكل");
 const filtered=useMemo(()=>items.filter(a=>(a.title.includes(query)||a.titleEn.toLowerCase().includes(query.toLowerCase()))&&(genre==="الكل"||a.genres.includes(genre))&&(status==="الكل"||a.status===status)),[items,query,genre,status]);
 return <><div className="catalog-controls"><label className="search-field"><span>⌕</span><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="ابحث عن اسم الأنمي..." aria-label="ابحث عن أنمي"/></label><select value={genre} onChange={e=>setGenre(e.target.value)} aria-label="تصفية حسب التصنيف"><option>الكل</option>{genres.map(g=><option key={g}>{g}</option>)}</select><select value={status} onChange={e=>setStatus(e.target.value)} aria-label="تصفية حسب الحالة"><option>الكل</option><option>يعرض الآن</option><option>مكتمل</option><option>قريبًا</option></select></div><p className="results-count">{filtered.length} أعمال في القائمة</p>{filtered.length?<div className="anime-grid">{filtered.map(item=><AnimeCard key={item.slug} anime={item}/>)}</div>:<div className="empty-state"><span>⌕</span><h3>لم نعثر على نتائج</h3><p>جرّب تغيير كلمات البحث أو عوامل التصفية.</p><button className="button button-ghost" onClick={()=>{setQuery("");setGenre("الكل");setStatus("الكل")}}>إعادة ضبط الفلاتر</button></div>}</>
}
