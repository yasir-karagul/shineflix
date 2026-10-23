import type { Metadata } from "next";
import Link from "next/link";
import { AdSlot } from "@/components/ad-slot";
import { AnimeCard } from "@/components/anime-card";
import { HomeFeaturedCarousel } from "@/components/home-featured-carousel";
import { WatchlistSection } from "@/components/watchlist-section";
import { getLatestEpisodes, getPublishedContent } from "@/lib/content";
import { tmdbImageUrl } from "@/lib/tmdb-images";
import { getLanguage } from "@/lib/i18n";
import styles from "./home-page.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Shineflix — Anime, Movies & TV Series",
  description: "Explore anime, the latest episodes, movies and series in Shineflix’s bilingual catalogue."
};

type DatedItem = { createdAt?: string; updatedAt?: string };

function newestFirst<T extends DatedItem>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    const aDate = Date.parse(a.updatedAt ?? a.createdAt ?? "");
    const bDate = Date.parse(b.updatedAt ?? b.createdAt ?? "");
    return (Number.isFinite(bDate) ? bDate : 0) - (Number.isFinite(aDate) ? aDate : 0);
  });
}

function SectionHeading({
  eyebrow, title, description, href, linkLabel, lang
}: {
  eyebrow: string; title: string; description?: string; href?: string; linkLabel?: string; lang: "en" | "ar";
}) {
  return (
    <div className={`section-heading ${styles.sectionHeading}`}>
      <div><span className="eyebrow">{eyebrow}</span><h2>{title}</h2>{description ? <p>{description}</p> : null}</div>
      {href && linkLabel ? <Link href={href} className="text-link">{linkLabel} <span aria-hidden="true">{lang === "ar" ? "←" : "→"}</span></Link> : null}
    </div>
  );
}

export default async function HomePage() {
  const [anime, movies, series, latestEpisodes, lang] = await Promise.all([
    getPublishedContent("ANIME"), getPublishedContent("MOVIE"), getPublishedContent("SERIES"), getLatestEpisodes(8), getLanguage()
  ]);
  const ar = lang === "ar";
  const allItems = newestFirst([...anime, ...movies, ...series]);
  const featured = anime.filter(item => item.featured).length ? anime.filter(item => item.featured).slice(0, 6) : anime.slice(0, 6);
  const topRatedAnime = anime.filter(item => Number.isFinite(Number.parseFloat(item.rating)))
    .sort((a, b) => Number.parseFloat(b.rating) - Number.parseFloat(a.rating)).slice(0, 8);
  const newMovies = newestFirst(movies).slice(0, 8);
  const newTitles = allItems.slice(0, 8);
  const genres = Array.from(new Set(anime.flatMap(item => item.genres))).slice(0, 16);

  return (
    <main className={styles.homePage}>
      <div className={`page-shell ${styles.featuredWrap}`}><HomeFeaturedCarousel items={featured} lang={lang} /></div>
      <nav className={`page-shell ${styles.quickNav}`} aria-label={ar ? "روابط سريعة" : "Quick links"}>
        <Link href="/anime" className={styles.quickLink}><span className={styles.quickIcon} aria-hidden="true">✦</span><span><strong>{ar ? "قائمة الأنمي" : "Anime library"}</strong><small>{ar ? "تصفح جميع الأعمال" : "Browse the catalogue"}</small></span><span className={styles.quickArrow} aria-hidden="true">{ar ? "←" : "→"}</span></Link>
        <Link href="/movies" className={styles.quickLink}><span className={styles.quickIcon} aria-hidden="true">▣</span><span><strong>{ar ? "الأفلام" : "Movies"}</strong><small>{ar ? "أفلام المكتبة" : "Explore films"}</small></span><span className={styles.quickArrow} aria-hidden="true">{ar ? "←" : "→"}</span></Link>
        <Link href="/series" className={styles.quickLink}><span className={styles.quickIcon} aria-hidden="true">▤</span><span><strong>{ar ? "المسلسلات" : "TV series"}</strong><small>{ar ? "المواسم والحلقات" : "Seasons and episodes"}</small></span><span className={styles.quickArrow} aria-hidden="true">{ar ? "←" : "→"}</span></Link>
        <Link href="/schedule" className={styles.quickLink}><span className={styles.quickIcon} aria-hidden="true">◷</span><span><strong>{ar ? "جدول الحلقات" : "Schedule"}</strong><small>{ar ? "مواعيد العرض" : "Episode schedule"}</small></span><span className={styles.quickArrow} aria-hidden="true">{ar ? "←" : "→"}</span></Link>
      </nav>

      <section className={`page-shell ${styles.homeSection}`}>
        <SectionHeading lang={lang} eyebrow={ar ? "اختيارات تستحق وقتك" : "Worth your time"} title={ar ? "أعلى الأنميات تقييمًا" : "Top-rated anime"}
          description={ar ? "رتّبنا الأعمال حسب تقييم TMDB المتاح في بيانات المكتبة." : "Anime ranked by the TMDB ratings available in your catalogue."} href="/anime" linkLabel={ar ? "كل الأنمي" : "All anime"} />
        {topRatedAnime.length ? <div className="anime-grid">{topRatedAnime.map(item => <AnimeCard key={item.slug} anime={item} lang={lang} />)}</div> :
          <div className="empty-state"><span>✦</span><h3>{ar ? "لا توجد أنميات منشورة بعد" : "No published anime yet"}</h3><p>{ar ? "عندما تنشر أعمال الأنمي من لوحة الإدارة، ستظهر هنا." : "Published anime from the admin panel will appear here."}</p></div>}
      </section>

      <section className={`page-shell ${styles.homeSection}`}>
        <SectionHeading lang={lang} eyebrow={ar ? "الجديد في المكتبة" : "Fresh from the library"} title={ar ? "أحدث الحلقات" : "Latest episodes"}
          description={ar ? "الحلقات المنشورة حديثًا، مع روابط لصفحات أعمالها." : "Recently published episodes, linked to their title pages."} href="/anime" linkLabel={ar ? "تصفح الأنمي" : "Browse anime"} />
        {latestEpisodes.length ? <div className={styles.episodeGrid}>{latestEpisodes.map(episode => {
          const item = episode.season.content;
          const rating = item.voteAverage?.toFixed(1);
          const posterUrl = tmdbImageUrl(item.posterPath, "w185");
          const posterStyle = posterUrl ? { backgroundImage: `url("${posterUrl}")` } : undefined;
          return <Link href={`/anime/${item.slug}`} key={episode.id} className={styles.episodeCard}>
            <span className={styles.episodePoster} style={posterStyle} aria-hidden="true"><span>{ar ? `الحلقة ${episode.episodeNumber}` : `EP ${episode.episodeNumber}`}</span></span>
            <span className={styles.episodeInfo}><strong>{item.title}</strong><span>{episode.title}</span><small>{ar ? `الموسم ${episode.season.seasonNumber}` : `Season ${episode.season.seasonNumber}`}{rating ? ` · ★ ${rating}` : ""}</small></span>
            <span className={styles.episodeArrow} aria-hidden="true">{ar ? "←" : "→"}</span>
          </Link>;
        })}</div> : <div className="empty-state"><span>◷</span><h3>{ar ? "لا توجد حلقات منشورة بعد" : "No published episodes yet"}</h3><p>{ar ? "أضف الحلقات وانشرها من لوحة الإدارة لتظهر في هذا القسم." : "Add and publish episodes from the admin panel to fill this section."}</p></div>}
      </section>

      <AdSlot placement="HOME_INLINE" />
      <WatchlistSection items={allItems} lang={lang} />

      <section className={`page-shell ${styles.homeSection}`}>
        <SectionHeading lang={lang} eyebrow={ar ? "ليلتك القادمة" : "For your next movie night"} title={ar ? "أحدث الأفلام" : "Latest movies"}
          description={ar ? "تعرّف على أحدث الأفلام المنشورة في Shineflix." : "Discover the newest movies published in Shineflix."} href="/movies" linkLabel={ar ? "كل الأفلام" : "All movies"} />
        {newMovies.length ? <div className="anime-grid">{newMovies.map(item => <AnimeCard key={item.slug} anime={item} lang={lang} />)}</div> :
          <div className="empty-state"><span>▣</span><h3>{ar ? "لا توجد أفلام منشورة بعد" : "No movies published yet"}</h3><p>{ar ? "ستظهر الأفلام هنا بعد إضافتها ونشرها." : "Movies will appear here after they are added and published."}</p></div>}
      </section>

      <section className={`page-shell ${styles.homeSection}`}>
        <SectionHeading lang={lang} eyebrow={ar ? "وصل حديثًا" : "Recently added"} title={ar ? "اكتشف أعمالًا جديدة" : "Discover new titles"}
          description={ar ? "أنمي وأفلام ومسلسلات أضيفت إلى المكتبة مؤخرًا." : "Anime, movies and series added to the catalogue recently."} href="/anime" linkLabel={ar ? "استكشف المكتبة" : "Explore library"} />
        {newTitles.length ? <div className="anime-grid">{newTitles.map(item => <AnimeCard key={item.slug} anime={item} lang={lang} />)}</div> :
          <div className="empty-state"><span>⌕</span><h3>{ar ? "المكتبة قيد التجهيز" : "The library is being prepared"}</h3><p>{ar ? "ستظهر الأعمال هنا بمجرد نشرها من لوحة الإدارة." : "Titles will appear here as soon as they are published from the admin panel."}</p></div>}
      </section>

      <section className={`page-shell ${styles.homeSection}`}>
        <SectionHeading lang={lang} eyebrow={ar ? "اختر ما يناسب مزاجك" : "Find your mood"} title={ar ? "تصفّح حسب التصنيف" : "Browse by genre"}
          description={ar ? "ابدأ من النوع الذي تحبّه، واكتشف أعمالًا جديدة." : "Start with a genre you enjoy and find something new."} href="/anime" linkLabel={ar ? "كل التصنيفات" : "All genres"} />
        {genres.length ? <div className={styles.genreGrid}>{genres.map(genre => <Link className={styles.genrePill} href={`/anime?genre=${encodeURIComponent(genre)}`} key={genre}><span aria-hidden="true">✦</span>{genre}<span aria-hidden="true">↗</span></Link>)}</div> :
          <div className={styles.genreEmpty}>{ar ? "ستظهر التصنيفات عند نشر أعمال الأنمي." : "Genres will appear when anime titles are published."}</div>}
      </section>

      <section className={`page-shell ${styles.homeFooterCta}`}>
        <div><span className="eyebrow">{ar ? "ابدأ الاستكشاف" : "Start exploring"}</span><h2>{ar ? "حكايتك التالية على بُعد اختيار." : "Your next story is one good pick away."}</h2><p>{ar ? "اكتشف مكتبة Shineflix واحفظ الأعمال التي تهمك في قائمتك." : "Explore Shineflix and save the titles you want to revisit."}</p></div>
        <Link href="/anime" className="button button-primary">{ar ? "استكشف الأنمي" : "Explore anime"} <span aria-hidden="true">{ar ? "←" : "→"}</span></Link>
      </section>
    </main>
  );
}
