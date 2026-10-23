"use client";
import { useMemo, useState } from "react";
import { AnimeCard } from "@/components/anime-card";
import type { Anime } from "@/lib/data";
import type { Language } from "@/lib/i18n";
export function CatalogExperience({items,genres,lang="en"}:{items:Anime[];genres:string[];lang?:Language}){
 const ar=lang==="ar";
 const all=ar?"الكل":"All";
 const statusText=(value:Anime["status"]):string=>ar?value:({"يعرض الآن":"Airing","مكتمل":"Completed","قريبًا":"Coming soon"}[value]??value);
 const [query,setQuery]=useState("");const [genre,setGenre]=useState(all);const [status,setStatus]=useState(all);
 const filtered=useMemo(()=>items.filter(a=>(a.title.includes(query)||a.titleEn.toLowerCase().includes(query.toLowerCase()))&&(genre===all||a.genres.includes(genre))&&(status===all||statusText(a.status)===status)),[items,query,genre,status,all,ar]);
 return <><div className="catalog-controls"><label className="search-field"><span>⌕</span><input value={query} onChange={e=>setQuery(e.target.value)} placeholder={ar?"ابحث عن عنوان...":"Search titles..."} aria-label={ar?"البحث عن عنوان":"Search titles"}/></label><select value={genre} onChange={e=>setGenre(e.target.value)} aria-label={ar?"تصفية حسب التصنيف":"Filter by genre"}><option>{all}</option>{genres.map(g=><option key={g}>{g}</option>)}</select><select value={status} onChange={e=>setStatus(e.target.value)} aria-label={ar?"تصفية حسب الحالة":"Filter by status"}><option>{all}</option><option>{statusText("يعرض الآن")}</option><option>{statusText("مكتمل")}</option><option>{statusText("قريبًا")}</option></select></div><p className="results-count">{ar ? filtered.length + " أعمال في القائمة" : filtered.length + " titles found"}</p>{filtered.length?<div className="anime-grid">{filtered.map(item=><AnimeCard key={item.slug} anime={item} lang={lang}/>)}</div>:<div className="empty-state"><span>⌕</span><h3>{ar?"لم نعثر على نتائج":"No results found"}</h3><p>{ar?"جرّب تغيير كلمات البحث أو عوامل التصفية.":"Try another search term or adjust your filters."}</p><button className="button button-ghost" onClick={()=>{setQuery("");setGenre(all);setStatus(all)}}>{ar?"إعادة ضبط الفلاتر":"Reset filters"}</button></div>}</>
}
