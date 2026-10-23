import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { AdSlot } from "@/components/ad-slot";
import { getLanguage, localeDirection } from "@/lib/i18n";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

export const metadata: Metadata = {
  title: { default: "Shineflix — Discover Your Next Story", template: "%s | Shineflix" },
  description: "Discover anime, movies and TV series. Explore stories, save your watchlist and browse Shineflix in English or Arabic.",
  applicationName: "Shineflix",
  metadataBase: siteUrl ? new URL(siteUrl) : undefined,
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } },
  openGraph: { type: "website", locale: "en_US", siteName: "Shineflix", title: "Shineflix — Discover Your Next Story", description: "Explore anime, films and series in a clean bilingual catalogue." },
  twitter: { card: "summary_large_image", title: "Shineflix — Discover Your Next Story", description: "Explore anime, films and series in a clean bilingual catalogue." }
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const lang = await getLanguage();
  const redirectOnly = process.env.REDIRECT_SITE_MODE === "true";
  return <html lang={lang} dir={localeDirection(lang)}><body>{redirectOnly ? children : <><Header lang={lang} /><AdSlot placement="SITE_TOP" />{children}<Footer lang={lang} /></>}</body></html>;
}
