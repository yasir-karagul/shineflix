import Link from "next/link";
import type { Language } from "@/lib/i18n";

const tmdbLogo = "https://www.themoviedb.org/assets/2/v4/logos/v2/blue_long_2-9665a76b1ae401a510ec1e0ca40ddcb3b0cfe45f1d51b77a308fea0845885648.svg";
const tmdbNotice = "This website uses TMDB and the TMDB APIs but is not endorsed, certified, or otherwise approved by TMDB.";

export function Footer({ lang = "en" }: { lang?: Language }) {
  const ar = lang === "ar";
  return <footer className="site-footer">
    <div className="footer-inner">
      <Link href="/" className="brand"><span className="brand-mark">S<span>✦</span></span><span className="brand-name">shineflix</span></Link>
      <p>{ar ? "مساحة لاكتشاف الحكايات، لا لمشاركة محتوى غير مرخّص." : "A place to discover stories — not to distribute unlicensed content."}</p>
      <div className="footer-links"><Link href="/anime">{ar ? "الأنمي" : "Anime"}</Link><Link href="/movies">{ar ? "الأفلام" : "Movies"}</Link><Link href="/series">{ar ? "المسلسلات" : "TV Series"}</Link><Link href="/schedule">{ar ? "الجدول" : "Schedule"}</Link><Link href="/credits">{ar ? "المصادر" : "Credits"}</Link></div>
    </div>
    <div className="tmdb-attribution"><a href="https://www.themoviedb.org/about/logos-attribution" target="_blank" rel="noreferrer"><img src={tmdbLogo} alt="The Movie Database (TMDB)" /></a><span>{tmdbNotice}</span></div>
    <div className="footer-bottom"><span>© 2026 Shineflix</span><span>{ar ? "صُنع لعشّاق الحكايات ✦" : "Made for story lovers ✦"}</span></div>
  </footer>;
}
