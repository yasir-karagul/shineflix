import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ContentDetail } from "@/components/content-detail";
import { getPublicDetail } from "@/lib/public-detail";
import { getLanguage } from "@/lib/i18n";

type Props = { params: Promise<{ slug: string }> };
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const lang = await getLanguage();
  const item = await getPublicDetail(slug, "ANIME");
  return { title: item?.title ?? "العنوان غير موجود", description: item?.synopsis ?? undefined, robots: item ? undefined : { index: false, follow: false } };
}

export default async function AnimeDetailPage({ params }: Props) {
  const { slug } = await params;
  const lang = await getLanguage();
  const item = await getPublicDetail(slug, "ANIME");
  if (!item) notFound();
  return <ContentDetail item={item} lang={lang} />;
}
