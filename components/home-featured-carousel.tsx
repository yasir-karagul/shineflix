"use client";

import { useState } from "react";
import Link from "next/link";
import type { Anime } from "@/lib/data";
import type { Language } from "@/lib/i18n";
import styles from "@/app/home-page.module.css";

type FeaturedItem = Anime & {
  type?: "ANIME" | "MOVIE" | "SERIES";
  posterUrl?: string | null;
  backdropUrl?: string | null;
};

export function HomeFeaturedCarousel({ items, lang }: { items: FeaturedItem[]; lang: Language }) {
  const ar = lang === "ar";
  const [activeIndex, setActiveIndex] = useState(0);

  if (!items.length) {
    return (
      <section className={styles.featuredEmpty}>
        <span className={styles.featuredKicker}>{ar ? "مرحبًا بك في Shineflix" : "Welcome to Shineflix"}</span>
        <h1>{ar ? "عالم من الحكايات بانتظارك." : "A world of stories is waiting."}</h1>
        <p>{ar ? "أضف أعمالًا منشورة من لوحة الإدارة لتظهر في الصفحة الرئيسية." : "Publish titles in the admin panel to feature them on the homepage."}</p>
        <Link href="/anime" className="button button-primary">{ar ? "تصفّح المكتبة" : "Browse the library"} <span aria-hidden="true">→</span></Link>
      </section>
    );
  }

  const item = items[activeIndex] ?? items[0];
  const href = item.type === "MOVIE"
    ? `/movies/${item.slug}`
    : item.type === "SERIES"
      ? `/series/${item.slug}`
      : `/anime/${item.slug}`;
  const background = item.backdropUrl ?? item.posterUrl ?? undefined;
  const typeLabel = item.type === "MOVIE"
    ? (ar ? "فيلم" : "Movie")
    : item.type === "SERIES"
      ? (ar ? "مسلسل" : "TV Series")
      : (ar ? "أنمي" : "Anime");

  function shift(direction: -1 | 1) {
    setActiveIndex(current => (current + direction + items.length) % items.length);
  }

  return (
    <section className={styles.featured} aria-label={ar ? "الأعمال المميزة" : "Featured titles"}>
      <div
        key={item.slug}
        className={styles.featuredBackdrop}
        style={background ? { backgroundImage: `url("${background}")` } : undefined}
        aria-hidden="true"
      />
      <div className={styles.featuredOverlay} aria-hidden="true" />
      <div className={styles.featuredContent} key={item.slug}>
        <div className={styles.featuredMeta}>
          <span className={styles.featuredKicker}><span aria-hidden="true">✦</span>{ar ? "مختار لك من Shineflix" : "Selected for you"}</span>
          <span className={styles.featuredType}>{typeLabel}</span>
          {item.year ? <span>{item.year}</span> : null}
          {item.rating !== "—" ? <span>★ {item.rating}</span> : null}
        </div>
        <h1>{ar ? item.title : item.titleEn}</h1>
        {item.titleEn && ar ? <p className={styles.featuredOriginalTitle} dir="ltr">{item.titleEn}</p> : null}
        <p className={styles.featuredDescription}>{item.description || (ar ? "اكتشف تفاصيل العمل وتعرّف على قصته." : "Discover the title and learn more about its story.")}</p>
        <div className={styles.featuredTags}>
          {item.genres.slice(0, 3).map(genre => <span key={genre}>{genre}</span>)}
        </div>
        <div className={styles.featuredActions}>
          <Link href={href} className="button button-primary">{ar ? "عرض التفاصيل" : "View details"} <span aria-hidden="true">{ar ? "←" : "→"}</span></Link>
          <Link href="/anime" className="button button-ghost">{ar ? "كل الأنمي" : "Explore anime"}</Link>
        </div>
      </div>
      {items.length > 1 ? (
        <div className={styles.featuredControls}>
          <div className={styles.featuredDots} aria-label={ar ? "اختر عملاً مميزًا" : "Choose featured title"}>
            {items.map((entry, index) => (
              <button
                type="button"
                key={entry.slug}
                className={index === activeIndex ? styles.featuredDotActive : styles.featuredDot}
                onClick={() => setActiveIndex(index)}
                aria-label={ar ? `عرض العمل المميز ${index + 1}` : `Show featured title ${index + 1}`}
                aria-current={index === activeIndex ? "true" : undefined}
              />
            ))}
          </div>
          <div className={styles.featuredArrows}>
            <button type="button" onClick={() => shift(-1)} aria-label={ar ? "السابق" : "Previous"}>{ar ? "→" : "←"}</button>
            <button type="button" onClick={() => shift(1)} aria-label={ar ? "التالي" : "Next"}>{ar ? "←" : "→"}</button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
