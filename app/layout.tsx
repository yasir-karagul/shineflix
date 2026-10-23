import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { AdSlot } from "@/components/ad-slot";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

export const metadata: Metadata = {
  title: { default: "Shineflix — اكتشف عالم الأنمي", template: "%s | Shineflix" },
  description: "اكتشف عالم الأنمي مع Shineflix: تصفّح الأعمال، ابحث حسب التصنيف، احفظ قائمتك، وتابع جدول الحلقات.",
  applicationName: "Shineflix",
  metadataBase: siteUrl ? new URL(siteUrl) : undefined,
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 }
  },
  openGraph: {
    type: "website",
    locale: "ar_AR",
    siteName: "Shineflix",
    title: "Shineflix — اكتشف عالم الأنمي",
    description: "تصفّح أعمال الأنمي، استكشف التصنيفات، واحفظ قائمتك في تجربة عربية بسيطة."
  },
  twitter: {
    card: "summary_large_image",
    title: "Shineflix — اكتشف عالم الأنمي",
    description: "تصفّح أعمال الأنمي، استكشف التصنيفات، واحفظ قائمتك."
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ar" dir="rtl"><body><Header /><AdSlot placement="SITE_TOP" />{children}<Footer /></body></html>;
}
