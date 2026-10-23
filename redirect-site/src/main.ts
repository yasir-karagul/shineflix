import "./style.css";

type Language = "en" | "ar";

const copy = {
  en: {
    title: "Shineflix — Find Your Next Story",
    description: "Discover anime, movies and series on Shineflix. Continue to the main library in one click.",
    siteLabel: "OFFICIAL DESTINATION",
    navCta: "Go to Shineflix",
    heroEyebrow: "YOUR NEXT STORY STARTS HERE",
    heroTitleStart: "Find a story",
    heroTitleEnd: "worth staying for.",
    heroDescription: "Anime, movies and series — all waiting to be explored. Step into the main Shineflix library and find what feels right for your next watch.",
    heroCta: "Enter the main site",
    secondaryCta: "Explore the library",
    heroNote: "You’re on the official Shineflix destination page. Continue to the main site whenever you’re ready.",
    pillAnime: "Anime",
    pillMovies: "Movies",
    pillSeries: "TV Series",
    pillLanguages: "English + Arabic",
    factOneTitle: "Find your next watch",
    factOneText: "Explore by category",
    factTwoTitle: "Details at a glance",
    factTwoText: "Clear pages for every title",
    factThreeTitle: "Make it yours",
    factThreeText: "Keep a personal watchlist",
    featuresEyebrow: "MADE FOR STORY LOVERS",
    featuresTitle: "A better place to",
    featuresTitleEnd: "begin your search.",
    featuresDescription: "A simple starting point. The main Shineflix website has the catalogue, title pages and discovery tools in one place.",
    featureOneTitle: "A catalogue to explore",
    featureOneText: "Browse anime, films and series, then follow the titles that catch your attention.",
    featureTwoTitle: "Know before you choose",
    featureTwoText: "Open each title’s page to review its information and available details.",
    featureThreeTitle: "Keep your picks close",
    featureThreeText: "Use the main site’s watchlist and schedule tools to keep track of what matters to you.",
    finalEyebrow: "READY WHEN YOU ARE",
    finalTitle: "Your next story is",
    finalTitleEnd: "one click away.",
    finalDescription: "Continue to the main Shineflix website and start exploring.",
    finalCta: "Go to Shineflix",
    footerCopy: "The official Shineflix destination. The main catalogue opens on a separate website."
  },
  ar: {
    title: "Shineflix — اكتشف حكايتك التالية",
    description: "اكتشف الأنمي والأفلام والمسلسلات في Shineflix، وانتقل إلى المكتبة الرئيسية بنقرة واحدة.",
    siteLabel: "الوجهة الرسمية",
    navCta: "اذهب إلى Shineflix",
    heroEyebrow: "حكايتك التالية تبدأ من هنا",
    heroTitleStart: "اكتشف حكاية",
    heroTitleEnd: "تستحق وقتك.",
    heroDescription: "أنمي وأفلام ومسلسلات بانتظارك. انتقل إلى مكتبة Shineflix الرئيسية واكتشف ما يناسب مشاهدتك القادمة.",
    heroCta: "الدخول إلى الموقع الرئيسي",
    secondaryCta: "استكشف المكتبة",
    heroNote: "أنت الآن في صفحة Shineflix التعريفية الرسمية. انتقل إلى الموقع الرئيسي في الوقت الذي يناسبك.",
    pillAnime: "أنمي",
    pillMovies: "أفلام",
    pillSeries: "مسلسلات",
    pillLanguages: "العربية والإنجليزية",
    factOneTitle: "اعثر على عملك القادم",
    factOneText: "استكشف حسب الفئة",
    factTwoTitle: "تفاصيل واضحة",
    factTwoText: "صفحات مخصصة لكل عنوان",
    factThreeTitle: "قائمتك الخاصة",
    factThreeText: "احتفظ بما ترغب في متابعته",
    featuresEyebrow: "صُمم لعشّاق الحكايات",
    featuresTitle: "المكان الأنسب",
    featuresTitleEnd: "لبداية البحث.",
    featuresDescription: "هذه نقطة انطلاق بسيطة؛ يجمع موقع Shineflix الرئيسي المكتبة وصفحات العناوين وأدوات الاستكشاف في مكان واحد.",
    featureOneTitle: "مكتبة تستحق الاستكشاف",
    featureOneText: "تصفح الأنمي والأفلام والمسلسلات، وتابع الأعمال التي تلفت انتباهك.",
    featureTwoTitle: "اعرف التفاصيل أولًا",
    featureTwoText: "افتح صفحة كل عنوان للاطلاع على بياناته وتفاصيله المتاحة.",
    featureThreeTitle: "احتفظ باختياراتك",
    featureThreeText: "استخدم قائمة المشاهدة وجدول الحلقات في الموقع الرئيسي لتنظيم ما يهمك.",
    finalEyebrow: "نحن بانتظارك",
    finalTitle: "حكايتك التالية",
    finalTitleEnd: "على بُعد نقرة.",
    finalDescription: "انتقل إلى موقع Shineflix الرئيسي وابدأ الاستكشاف.",
    finalCta: "اذهب إلى Shineflix",
    footerCopy: "الوجهة التعريفية الرسمية لـ Shineflix. تُفتح المكتبة الرئيسية في موقع مستقل."
  }
} satisfies Record<Language, Record<string, string>>;

const mainSiteUrl = (import.meta.env.VITE_MAIN_SITE_URL || "https://shineflix-yorion.vercel.app").trim();

function getMainSiteHref(lang: Language): string {
  try {
    const url = new URL(mainSiteUrl);
    if (url.protocol !== "https:" && url.hostname !== "localhost") {
      return "https://shineflix-yorion.vercel.app/?lang=" + lang;
    }
    url.searchParams.set("lang", lang);
    return url.toString();
  } catch {
    return "https://shineflix-yorion.vercel.app/?lang=" + lang;
  }
}

function setText(id: string, value: string): void {
  const element = document.getElementById(id);
  if (element) element.textContent = value;
}

function setLanguage(lang: Language): void {
  const text = copy[lang];
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  document.title = text.title;
  const description = document.querySelector<HTMLMetaElement>('meta[name="description"]');
  if (description) description.content = text.description;

  for (const [id, value] of Object.entries({
    "site-label": text.siteLabel,
    "nav-cta": text.navCta,
    "hero-eyebrow": text.heroEyebrow,
    "hero-title-start": text.heroTitleStart,
    "hero-title-end": text.heroTitleEnd,
    "hero-description": text.heroDescription,
    "hero-cta": text.heroCta,
    "secondary-cta": text.secondaryCta,
    "hero-note": text.heroNote,
    "pill-anime": text.pillAnime,
    "pill-movies": text.pillMovies,
    "pill-series": text.pillSeries,
    "pill-languages": text.pillLanguages,
    "fact-one-title": text.factOneTitle,
    "fact-one-text": text.factOneText,
    "fact-two-title": text.factTwoTitle,
    "fact-two-text": text.factTwoText,
    "fact-three-title": text.factThreeTitle,
    "fact-three-text": text.factThreeText,
    "features-eyebrow": text.featuresEyebrow,
    "features-title": text.featuresTitle,
    "features-title-end": text.featuresTitleEnd,
    "features-description": text.featuresDescription,
    "feature-one-title": text.featureOneTitle,
    "feature-one-text": text.featureOneText,
    "feature-two-title": text.featureTwoTitle,
    "feature-two-text": text.featureTwoText,
    "feature-three-title": text.featureThreeTitle,
    "feature-three-text": text.featureThreeText,
    "final-eyebrow": text.finalEyebrow,
    "final-title": text.finalTitle,
    "final-title-end": text.finalTitleEnd,
    "final-description": text.finalDescription,
    "final-cta": text.finalCta,
    "footer-copy": text.footerCopy
  })) {
    setText(id, value);
  }

  for (const link of document.querySelectorAll<HTMLAnchorElement>(".main-site-link")) {
    link.href = getMainSiteHref(lang);
  }

  const enButton = document.getElementById("language-en");
  const arButton = document.getElementById("language-ar");
  enButton?.classList.toggle("is-active", lang === "en");
  arButton?.classList.toggle("is-active", lang === "ar");
  enButton?.setAttribute("aria-pressed", String(lang === "en"));
  arButton?.setAttribute("aria-pressed", String(lang === "ar"));
  document.getElementById("year")!.textContent = String(new Date().getFullYear());

  try {
    localStorage.setItem("shineflix-redirect-language", lang);
  } catch {
    // The language selector still works when storage is unavailable.
  }
}

document.getElementById("language-en")?.addEventListener("click", () => setLanguage("en"));
document.getElementById("language-ar")?.addEventListener("click", () => setLanguage("ar"));

const requestedLanguage = new URLSearchParams(window.location.search).get("lang");
let initialLanguage: Language = "en";
if (requestedLanguage === "ar" || requestedLanguage === "en") {
  initialLanguage = requestedLanguage;
} else {
  try {
    initialLanguage = localStorage.getItem("shineflix-redirect-language") === "ar" ? "ar" : "en";
  } catch {
    initialLanguage = "en";
  }
}

setLanguage(initialLanguage);
