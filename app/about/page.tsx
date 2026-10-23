import Link from "next/link";
import { getLanguage } from "@/lib/i18n";

export const metadata = {
  title: "About Shineflix",
  description: "Shineflix information, data sources and attribution."
};

export default async function AboutPage() {
  const lang = await getLanguage();
  const ar = lang === "ar";
  return <main className="page-shell inner-page about-page">
    <Link href="/" className="back-link">→ {ar ? "العودة إلى Shineflix" : "Back to Shineflix"}</Link>
    <section className="about-card">
      <span className="eyebrow">{ar ? "المصادر والإسناد" : "SOURCES & CREDITS"}</span>
      <h1>{ar ? "حول Shineflix" : "About Shineflix"}</h1>
      <p>{ar ? "يستخدم Shineflix واجهة TMDB الرسمية لجلب بيانات الأفلام والمسلسلات، بما في ذلك العناوين والتصنيفات والتقييمات والصور المتاحة عبر الخدمة." : "Shineflix uses the official TMDB API for movie and TV metadata, including titles, genres, ratings, and artwork available through the service."}</p>
      <a className="about-tmdb-logo" href="https://www.themoviedb.org/" target="_blank" rel="noreferrer" aria-label="The Movie Database (TMDB)">
        <img src="https://www.themoviedb.org/assets/2/v4/logos/stacked-blue.svg" alt="The Movie Database (TMDB)" loading="lazy" />
      </a>
      <p className="tmdb-legal-notice">This product uses the TMDB API but is not endorsed or certified by TMDB.</p>
      <p>{ar ? "تعود بيانات TMDB وصوره إلى أصحاب الحقوق المعنيين وتخضع لشروط TMDB. يجب التحقق من التراخيص المناسبة لأي استخدام تجاري." : "TMDB data and images remain subject to their respective rights and TMDB's terms. Appropriate licensing must be confirmed for commercial use."}</p>
      <a className="text-link" href="https://developer.themoviedb.org/docs/faq" target="_blank" rel="noreferrer">{ar ? "متطلبات TMDB الرسمية ↗" : "Official TMDB attribution requirements ↗"}</a>
    </section>
  </main>;
}
