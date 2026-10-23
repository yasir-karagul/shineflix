"use client";
import { useEffect, useState } from "react";
import type { Language } from "@/lib/i18n";
export function FavoriteButton({slug,lang="en"}:{slug:string;lang?:Language}){
 const ar=lang==="ar";
 const [saved,setSaved]=useState(false);
 useEffect(()=>{try{setSaved(JSON.parse(localStorage.getItem("shineflix-watchlist")||"[]").includes(slug));}catch{}},[slug]);
 function toggle(){try{const list:string[]=JSON.parse(localStorage.getItem("shineflix-watchlist")||"[]");const next=list.includes(slug)?list.filter(x=>x!==slug):[...list,slug];localStorage.setItem("shineflix-watchlist",JSON.stringify(next));setSaved(next.includes(slug));window.dispatchEvent(new Event("shineflix-watchlist-change"));}catch{}}
 return <button type="button" className={saved?"favorite-button saved":"favorite-button"} onClick={toggle} aria-label={saved?(ar?"إزالة من قائمتي":"Remove from watchlist"):(ar?"أضف إلى قائمتي":"Add to watchlist")} title={saved?(ar?"إزالة من قائمتي":"Remove from watchlist"):(ar?"أضف إلى قائمتي":"Add to watchlist")}>{saved?"♥":"♡"}</button>;
}
