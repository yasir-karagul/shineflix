"use client";
import { useEffect, useState } from "react";
export function FavoriteButton({slug}:{slug:string}){
 const [saved,setSaved]=useState(false);
 useEffect(()=>{try{setSaved(JSON.parse(localStorage.getItem("shineflix-watchlist")||"[]").includes(slug));}catch{}},[slug]);
 function toggle(){try{const list:string[]=JSON.parse(localStorage.getItem("shineflix-watchlist")||"[]");const next=list.includes(slug)?list.filter(x=>x!==slug):[...list,slug];localStorage.setItem("shineflix-watchlist",JSON.stringify(next));setSaved(next.includes(slug));window.dispatchEvent(new Event("shineflix-watchlist-change"));}catch{}}
 return <button type="button" className={saved?"favorite-button saved":"favorite-button"} onClick={toggle} aria-label={saved?"إزالة من قائمتي":"أضف إلى قائمتي"} title={saved?"إزالة من قائمتي":"أضف إلى قائمتي"}>{saved?"♥":"♡"}</button>;
}
