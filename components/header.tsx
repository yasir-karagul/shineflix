"use client";
import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";

const links = [{href:"/",label:"الرئيسية"},{href:"/anime",label:"الأنمي"},{href:"/movies",label:"الأفلام"},{href:"/schedule",label:"جدول الحلقات"}];
export function Header() {
  const [open,setOpen] = useState(false);
  const pathname = usePathname();
  return <header className="site-header"><div className="header-inner">
    <Link href="/" className="brand" aria-label="Shineflix الرئيسية"><span className="brand-mark">S<span>✦</span></span><span className="brand-name">shineflix</span></Link>
    <button className="mobile-toggle" onClick={()=>setOpen(!open)} aria-label="فتح القائمة" aria-expanded={open}>☰</button>
    <nav className={open?"main-nav nav-open":"main-nav"}>{links.map(link=><Link key={link.href} href={link.href} onClick={()=>setOpen(false)} className={pathname===link.href?"nav-link active":"nav-link"}>{link.label}</Link>)}</nav>
    <Link href="/anime" className="header-search"><span>⌕</span><span>اكتشف أنميًا</span></Link>
  </div></header>;
}
