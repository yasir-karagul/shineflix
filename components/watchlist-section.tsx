"use client";

import { useEffect, useState } from "react";
import type { Anime } from "@/lib/data";
import type { Language } from "@/lib/i18n";
import { AnimeCard } from "@/components/anime-card";
import styles from "@/app/home-page.module.css";

type WatchlistItem = Anime & { type?: "ANIME" | "MOVIE" | "SERIES" };

export function WatchlistSection({ items, lang }: { items: WatchlistItem[]; lang: Language }) {
  const [loaded, setLoaded] = useState(false);
  const [savedSlugs, setSavedSlugs] = useState<string[]>([]);
  const ar = lang === "ar";

  useEffect(() => {
    const readWatchlist = () => {
      try {
        const value: unknown = JSON.parse(window.localStorage.getItem("shineflix-watchlist") ?? "[]");
        setSavedSlugs(Array.isArray(value) ? value.filter((slug): slug is string => typeof slug === "string") : []);
      } catch {
        setSavedSlugs([]);
      }
      setLoaded(true);
    };
    readWatchlist();
    window.addEventListener("shineflix-watchlist-change", readWatchlist);
    window.addEventListener("storage", readWatchlist);
    return () => {
      window.removeEventListener("shineflix-watchlist-change", readWatchlist);
      window.removeEventListener("storage", readWatchlist);
    };
  }, []);

  const savedItems = items.filter(item => savedSlugs.includes(item.slug));
  if (!loaded || savedItems.length === 0) return null;

  return (
    <section className={`page-shell ${styles.homeSection}`}>
      <div className={`section-heading ${styles.sectionHeading}`}>
        <div>
          <span className="eyebrow">{ar ? "قائمتك الخاصة" : "Your collection"}</span>
          <h2>{ar ? "تابع من حيث اخترت" : "Picked for later"}</h2>
          <p>{ar ? "الأعمال التي حفظتها على هذا المتصفح تظهر هنا." : "Titles saved in this browser appear here."}</p>
        </div>
        <span className={styles.watchlistCount}>{savedItems.length} {ar ? "عمل محفوظ" : savedItems.length === 1 ? "saved title" : "saved titles"}</span>
      </div>
      <div className="anime-grid">
        {savedItems.slice(0, 8).map(item => <AnimeCard key={item.slug} anime={item} lang={lang} />)}
      </div>
    </section>
  );
}
