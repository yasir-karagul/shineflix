import type { Metadata } from "next";
import Link from "next/link";
import { AdSlot } from "@/components/ad-slot";
import { getLanguage } from "@/lib/i18n";
export const metadata: Metadata = {
  title: "Home",
  description: "Discover anime, movies and TV series on Shineflix."
};

const features = {
  en: [
    { icon: "⌕", title: "Discover with ease", text: "Search stories and explore by genre or release status." },
    { icon: "✦", title: "A library that feels organized", text: "Clear title pages and details that help you decide what to watch." },
    { icon: "♡", title: "Your personal watchlist", text: "Save the titles you love and return to them from your browser." },
    { icon: "◷", title: "Keep track of releases", text: "Browse the episode schedule, and verify release times with official sources." }
  ],
  ar: [
    { icon: "⌕", title: "اكتشف بسهولة", text: "ابحث عن الأعمال واستكشفها حسب التصنيف أو حالة العرض." },
    { icon: "✦", title: "مكتبة مرتّبة", text: "صفحات واضحة لكل عمل مع تفاصيل تساعدك على الاختيار." },
    { icon: "♡", title: "قائمتك الخاصة", text: "احفظ الأعمال التي تهمك وارجع إليها لاحقًا." },
    { icon: "◷", title: "تابع المواعيد", text: "تصفّح جدول الحلقات وتحقق من المواعيد عبر المصادر الرسمية." }
  ]
};
export default async function HomePage() {
  const lang = await getLanguage();
  const ar = lang === "ar";
  return <div className="landing-page">
    <section className="landing-hero page-shell">
      <div className="landing-copy">
        <span className="eyebrow"><span className="live-dot" /> {ar ? "عالم الحكايات بين يديك" : "Stories at your fingertips"}</span>
        <h1>{ar ? <>حكايتك التالية<br /><span>تبدأ مع Shineflix.</span></> : <>Your next story<br /><span>starts with Shineflix.</span></>}</h1>
        <p>{ar ? "اكتشف الأنمي والأفلام والمسلسلات، تعرّف على أعمال جديدة، ونظّم قائمة المشاهدة — في تجربة بسيطة." : "Discover anime, movies and TV series, find your next favourite, and organize your watchlist in one simple experience."}</p>
        <div className="landing-actions">
          <Link href="/anime" className="button button-primary">{ar ? "استكشف المكتبة" : "Explore the library"} <span>←</span></Link>
          <Link href="/schedule" className="button button-ghost">{ar ? "جدول الحلقات" : "Episode schedule"} <span>↗</span></Link>
        </div>
        <div className="landing-note"><span>✦</span> {ar ? "اكتشاف أفضل، وتنظيم أسهل، وتجربة تناسبك." : "Discover better. Keep your watchlist close. Find your next story."}</div>
      </div>
      <div className="landing-visual" aria-label={ar ? "لوحة فنية تجريدية لهوية Shineflix" : "Abstract Shineflix brand artwork"} role="img">
        <div className="landing-visual-glow" /><div className="landing-visual-ring ring-a" /><div className="landing-visual-ring ring-b" /><div className="landing-visual-sphere" />
        <div className="landing-visual-logo">SHINE<span>FLIX</span></div>
        <div className="landing-visual-caption"><span className="live-dot" /> FIND YOUR NEXT STORY</div>
        <div className="landing-sticker">YOUR NEXT<br /><strong>FAVORITE</strong><br />✦</div>
      </div>
    </section>
    <section className="landing-stats page-shell" aria-label={ar ? "مميزات Shineflix" : "Shineflix features"}>
      <div><strong>{ar ? "اكتشف" : "Discover"}</strong><span>{ar ? "حسب النوع والحالة" : "By type and status"}</span></div>
      <div><strong>{ar ? "نظّم" : "Organize"}</strong><span>{ar ? "قائمة مشاهدة محلية" : "A personal watchlist"}</span></div>
      <div><strong>{ar ? "تابع" : "Keep up"}</strong><span>{ar ? "صفحات وجدول في مكان واحد" : "Titles and schedule in one place"}</span></div>
    </section>
    <section className="landing-features page-shell">
      <div className="section-heading"><div><span className="eyebrow">{ar ? "مصمم لعشّاق الحكايات" : "Made for story lovers"}</span><h2>{ar ? "كل شيء يبدأ باختيار جيد." : "Every great watch starts with a good pick."}</h2><p>{ar ? "أدوات بسيطة تساعدك على العثور على العمل المناسب." : "Simple tools to help you find the right story for your mood."}</p></div></div>
      <div className="landing-feature-grid">{features[lang].map(feature => <article className="landing-feature" key={feature.title}><span className="landing-feature-icon" aria-hidden="true">{feature.icon}</span><h3>{feature.title}</h3><p>{feature.text}</p></article>)}</div>
    </section>
    <AdSlot placement="HOME_INLINE" />
    <section className="landing-cta page-shell"><div className="landing-cta-panel"><div><span className="eyebrow">{ar ? "ابدأ الاستكشاف" : "Start exploring"}</span><h2>{ar ? "عالمك التالي ينتظرك." : "Your next favourite is waiting."}</h2><p>{ar ? "افتح مكتبة Shineflix واعثر على عمل جديد تضيفه إلى قائمتك." : "Explore Shineflix and find something new to add to your watchlist."}</p></div><Link href="/anime" className="button button-primary">{ar ? "تصفّح المكتبة" : "Browse the library"} <span>←</span></Link></div></section>
  </div>;
}
