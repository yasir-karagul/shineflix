import Link from "next/link";
import { AdSlot } from "@/components/ad-slot";

const features = [
  { icon: "⌕", title: "اكتشف بسهولة", text: "ابحث عن الأعمال واستكشفها حسب التصنيف والحالة بدلًا من التنقل العشوائي." },
  { icon: "✦", title: "مكتبة مرتّبة", text: "صفحات واضحة لكل عمل مع نبذة مختصرة وتفاصيل تساعدك على الاختيار." },
  { icon: "♡", title: "قائمتك الخاصة", text: "احفظ الأعمال التي تهمك وارجع إليها لاحقًا من متصفحك." },
  { icon: "◷", title: "تابع المواعيد", text: "اعرض جدول الحلقات التجريبي في صفحة واحدة، مع التنبيه إلى التحقق من المصادر الرسمية." }
];

export default function HomePage() {
  return <div className="landing-page">
    <section className="landing-hero page-shell">
      <div className="landing-copy">
        <span className="eyebrow"><span className="live-dot" /> عالم الأنمي بين يديك</span>
        <h1>حكايتك التالية<br /><span>تبدأ مع Shineflix.</span></h1>
        <p>اكتشف المسلسلات والأفلام، تعرّف على أعمال جديدة، ونظّم قائمة الأنمي التي تريد متابعتها — في تجربة عربية بسيطة وسريعة.</p>
        <div className="landing-actions">
          <Link href="/anime" className="button button-primary">اذهب إلى المكتبة <span>←</span></Link>
          <Link href="/schedule" className="button button-ghost">مواعيد الحلقات <span>↗</span></Link>
        </div>
        <div className="landing-note"><span>✦</span> اكتشاف أفضل، وتنظيم أسهل، وتجربة تناسبك.</div>
      </div>
      <div className="landing-visual" aria-label="لوحة فنية تجريدية لهوية Shineflix" role="img">
        <div className="landing-visual-glow" />
        <div className="landing-visual-ring ring-a" />
        <div className="landing-visual-ring ring-b" />
        <div className="landing-visual-sphere" />
        <div className="landing-visual-logo">SHINE<span>FLIX</span></div>
        <div className="landing-visual-caption"><span className="live-dot" /> FIND YOUR NEXT STORY</div>
        <div className="landing-sticker">YOUR NEXT<br /><strong>FAVORITE</strong><br />✦</div>
      </div>
    </section>

    <section className="landing-stats page-shell" aria-label="مميزات Shineflix">
      <div><strong>اكتشف</strong><span>حسب النوع والحالة</span></div>
      <div><strong>نظّم</strong><span>قائمة مشاهدة محلية</span></div>
      <div><strong>تابع</strong><span>صفحات وجدول في مكان واحد</span></div>
    </section>

    <section className="landing-features page-shell">
      <div className="section-heading">
        <div><span className="eyebrow">مصمم لعشّاق الأنمي</span><h2>كل شيء يبدأ باختيار جيد.</h2><p>أدوات بسيطة تساعدك على العثور على العمل المناسب لمزاجك.</p></div>
      </div>
      <div className="landing-feature-grid">
        {features.map(feature => <article className="landing-feature" key={feature.title}>
          <span className="landing-feature-icon" aria-hidden="true">{feature.icon}</span>
          <h3>{feature.title}</h3>
          <p>{feature.text}</p>
        </article>)}
      </div>
    </section>

    <AdSlot placement="HOME_INLINE" />
    <section className="landing-cta page-shell">
      <div className="landing-cta-panel">
        <div><span className="eyebrow">ابدأ الاستكشاف</span><h2>العالم التالي ينتظرك.</h2><p>افتح مكتبة Shineflix واعثر على أنمي جديد تضيفه إلى قائمتك.</p></div>
        <Link href="/anime" className="button button-primary">تصفّح الأنمي <span>←</span></Link>
      </div>
    </section>
  </div>;
}
