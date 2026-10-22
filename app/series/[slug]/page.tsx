import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ContentDetail } from "@/components/content-detail";
import { getPublicDetail } from "@/lib/public-detail";

type Props = { params: Promise<{ slug: string }> };
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const item = await getPublicDetail(slug, "SERIES");
  return { title: item?.title ?? "العنوان غير موجود", description: item?.synopsis ?? undefined, robots: item ? undefined : { index: false, follow: false } };
}

export default async function DetailPage({ params }: Props) {
  const { slug } = await params;
  const item = await getPublicDetail(slug, "SERIES");
  if (!item) notFound();
  return <ContentDetail item={item} />;
}
