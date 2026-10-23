import Link from "next/link";
import type { Language } from "@/lib/i18n";

export function Footer({ lang = "en" }: { lang?: Language }) {
  const ar = lang === "ar";
  return <footer className="site-footer">
    <div className="footer-inner">
      <Link href="/" className="brand"><span className="brand-mark">S<span>✦</span></span><span className="brand-name">shineflix</span></Link>
      <p>{ar ? "مساحة لاكتشاف الحكايات، لا لمشاركة محتوى غير مرخّص." : "A place to discover stories — not to distribute unlicensed content."}</p>
      <div className="footer-links">
        <Link href="/anime">{ar ? "الأنمي" : "Anime"}</Link><Link href="/movies">{ar ? "الأفلام" : "Movies"}</Link>
        <Link href="/series">{ar ? "المسلسلات" : "TV Series"}</Link><Link href="/schedule">{ar ? "الجدول" : "Schedule"}</Link><Link href="/about">{ar ? "حول الموقع" : "About"}</Link>
      </div>
    </div>
    <div className="tmdb-attribution">
      <a href="https://www.themoviedb.org/" target="_blank" rel="noreferrer" aria-label="The Movie Database (TMDB)">
        <img src="https://www.themoviedb.org/assets/2/v4/logos/stacked-blue.svg" alt="The Movie Database (TMDB)" loading="lazy" />
      </a>
      <span>This product uses the TMDB API but is not endorsed or certified by TMDB.</span>
    </div>
    <div className="footer-bottom"><span>© 2026 Shineflix</span><span>{ar ? "صُنع لعشّاق الحكايات ✦" : "Made for story lovers ✦"}</span></div>
  </footer>;
}
