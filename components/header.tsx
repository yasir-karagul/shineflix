"use client";
import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { LanguageSwitcher } from "@/components/language-switcher";
import type { Language } from "@/lib/i18n";

const nav = { en: [{href:"/",label:"Home"},{href:"/anime",label:"Anime"},{href:"/movies",label:"Movies"},{href:"/series",label:"TV Series"},{href:"/schedule",label:"Schedule"}], ar: [{href:"/",label:"الرئيسية"},{href:"/anime",label:"الأنمي"},{href:"/movies",label:"الأفلام"},{href:"/series",label:"المسلسلات"},{href:"/schedule",label:"جدول الحلقات"}] };
export function Header({ lang = "en" }: { lang?: Language }) {
  const [open,setOpen] = useState(false);
  const pathname = usePathname();
  return <header className="site-header"><div className="header-inner">
    <Link href="/" className="brand" aria-label={lang === "en" ? "Shineflix home" : "Shineflix الرئيسية"}><span className="brand-mark">S<span>✦</span></span><span className="brand-name">shineflix</span></Link>
    <button className="mobile-toggle" onClick={()=>setOpen(!open)} aria-label={lang === "en" ? "Open menu" : "فتح القائمة"} aria-expanded={open}>☰</button>
    <nav className={open?"main-nav nav-open":"main-nav"}>{nav[lang].map(link=><Link key={link.href} href={link.href} onClick={()=>setOpen(false)} className={pathname===link.href?"nav-link active":"nav-link"}>{link.label}</Link>)}</nav>
    <Link href="/anime" className="header-search"><span>⌕</span><span>{lang === "en" ? "Explore anime" : "اكتشف أنميًا"}</span></Link>
    <LanguageSwitcher lang={lang} />
  </div></header>;
}
