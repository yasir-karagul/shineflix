import type { Metadata } from "next";
import { getLanguage } from "@/lib/i18n";
import { RedirectLanding } from "@/components/redirect-landing";

export const metadata: Metadata = {
  title: "Shineflix — Official Redirect",
  robots: { index: false, follow: false }
};

export default async function RedirectPage() {
  const lang = await getLanguage();
  const configured = process.env.NEXT_PUBLIC_MAIN_SITE_URL?.trim() || process.env.NEXT_PUBLIC_SITE_URL?.trim();
  let target = configured || "/";
  try {
    const url = new URL(target, process.env.NEXT_PUBLIC_SITE_URL || "https://shineflix.example");
    url.searchParams.set("lang", lang);
    target = configured ? url.toString() : "/?lang=" + lang;
  } catch {
    target = "/?lang=" + lang;
  }
  return <RedirectLanding lang={lang} target={target} />;
}
