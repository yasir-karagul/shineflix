import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
  title: { default: "Shineflix — عالم الأنمي", template: "%s | Shineflix" },
  description: "اكتشف الأنمي الذي يستحق وقتك. تصفّح الأعمال، تابع المواعيد، واحفظ قائمتك على Shineflix.",
  applicationName: "Shineflix",
  metadataBase: new URL("https://shineflix.example")
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ar" dir="rtl"><body><Header /><main>{children}</main><Footer /></body></html>;
}
