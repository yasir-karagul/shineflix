import type { Metadata } from "next";
import { getLanguage, getMainSiteTarget } from "@/lib/i18n";
import { RedirectLanding } from "@/components/redirect-landing";

export const metadata: Metadata = {
  title: "Shineflix — Official Redirect",
  robots: { index: false, follow: false }
};

export default async function RedirectPage() {
  const lang = await getLanguage();
  return <RedirectLanding lang={lang} target={getMainSiteTarget(lang)} />;
}
