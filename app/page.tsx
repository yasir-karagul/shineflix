import Link from "next/link";
import { AnimeCard } from "@/components/anime-card";
import { anime, genres } from "@/lib/data";

export default function HomePage() {
  const featured = anime[0];
  return <div className="page-shell">
    <section className="hero">
      <div className="hero-content">
        <span className="eyebrow"><span className="live-dot" /> اكتشف عالمك التالي</span>
        <h1>قصتك القادمة<br /><span>تبدأ من هنا.</span></h1>
        <p>وجهتك لاكتشاف الأنمي، متابعة الإصدارات، وبناء قائمتك الخاصة — كل ذلك في تجربة عربية مصممة لك.</p>
        <div className="hero-actions"><Link className="button button-primary" href="/anime">استكشف الأنمي <span>←</span></Link><Link className="button button-ghost" href="/schedule">جدول الحلقات</Link></div>
        <div className="hero-proof"><span>✦</span> اكتشاف أسهل. مشاهدة أذكى.</div>
      </div>
      <div className="hero-art" aria-label="تصميم فني تجريدي" role="img">
        <div className="orb orb-one" /><div className="orb orb-two" /><div className="art-ring" /><div className="art-word">SHINE<span>FLIX</span></div>
        <div className="art-label"><span className="live-dot" /> YOUR NEXT OBSESSION</div>
        <div className="art-sticker">NEW<br />WORLD<br /><b>↗</b></div>
      </div>
    </section>
    <section className="stats-strip"><div><strong>اكتشف</strong><span>أعمال تناسب ذوقك</span></div><div><strong>تابع</strong><span>مواعيد الحلقات القادمة</span></div><div><strong>احفظ</strong><span>قائمة المشاهدة الخاصة بك</span></div></section>
    <section className="section-block"><div className="section-heading"><div><span className="eyebrow">مختارة لك</span><h2>أنميات تستحق وقتك</h2><p>ابدأ من هنا، وقد تجد حكايتك المفضلة التالية.</p></div><Link className="text-link" href="/anime">عرض الكل <span>←</span></Link></div><div className="anime-grid">{anime.slice(0,4).map(item => <AnimeCard key={item.slug} anime={item} />)}</div></section>
    <section className="genre-section"><div className="section-heading"><div><span className="eyebrow">حسب مزاجك</span><h2>ما الذي تحب مشاهدته؟</h2></div></div><div className="genre-pills">{genres.map(g => <Link key={g} href={"/anime?genre="+encodeURIComponent(g)} className="genre-pill">{g}<span>↗</span></Link>)}</div></section>
    <section className="cta-panel"><div><span className="eyebrow">قائمتك، بطريقتك</span><h2>لا تفقد أنميًا تريد العودة إليه.</h2><p>احفظ الأعمال التي تهمك في قائمة شخصية على هذا الجهاز.</p></div><Link href="/anime" className="button button-primary">ابنِ قائمتك <span>←</span></Link></section>
  </div>;
}
