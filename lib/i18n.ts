import { cookies } from "next/headers";

export type Language = "en" | "ar";

export async function getLanguage(): Promise<Language> {
  const store = await cookies();
  return store.get("shineflix_locale")?.value === "ar" ? "ar" : "en";
}

export function text(lang: Language, en: string, ar: string): string {
  return lang === "ar" ? ar : en;
}

export function localeDirection(lang: Language): "ltr" | "rtl" {
  return lang === "ar" ? "rtl" : "ltr";
}

export function getMainSiteTarget(lang: Language): string {
  const configured = process.env.NEXT_PUBLIC_MAIN_SITE_URL?.trim();
  if (!configured) {
    return process.env.REDIRECT_SITE_MODE === "true" ? "/anime?lang=" + lang : "/?lang=" + lang;
  }
  try {
    const url = new URL(configured);
    url.searchParams.set("lang", lang);
    return url.toString();
  } catch {
    return process.env.REDIRECT_SITE_MODE === "true" ? "/anime?lang=" + lang : "/?lang=" + lang;
  }
}
