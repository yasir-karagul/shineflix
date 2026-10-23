"use client";
import type { Language } from "@/lib/i18n";

export function LanguageSwitcher({ lang }: { lang: Language }) {
  const next: Language = lang === "en" ? "ar" : "en";
  function switchLanguage() {
    document.cookie = `shineflix_locale=${next}; Path=/; Max-Age=31536000; SameSite=Lax`;
    window.location.reload();
  }
  return <button type="button" className="language-switch" onClick={switchLanguage} lang={next} aria-label={lang === "en" ? "Switch language to Arabic" : "تغيير اللغة إلى الإنجليزية"}>
    {lang === "en" ? "العربية" : "English"}
  </button>;
}
