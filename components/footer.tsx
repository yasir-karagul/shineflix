import Link from "next/link";
import type { Language } from "@/lib/i18n";
export function Footer({ lang = "en" }: { lang?: Language }) {
  const ar = lang === "ar";
  return <footer className="site-footer"><div className="footer-inner"><Link href="/" className="brand"><span className="brand-mark">S<span>✦</span></span><span className="brand-name">shineflix</span></Link><p>{ar ? "مساحة لاكتشاف الحكايات، لا لمشاركة محتوى غير مرخّص." : "A place to discover stories — not to distribute unlicensed content."}</p><div className="footer-links"><Link href="/anime">{ar ? "الأنمي" : "Anime"}</Link><Link href="/movies">{ar ? "الأفلام" : "Movies"}</Link><Link href="/series">{ar ? "المسلسلات" : "TV Series"}</Link><Link href="/schedule">{ar ? "الجدول" : "Schedule"}</Link></div></div><div className="footer-bottom"><span>© 2026 Shineflix</span><span>{ar ? "صُنع لعشّاق الحكايات ✦" : "Made for story lovers ✦"}</span></div></footer>;
}
