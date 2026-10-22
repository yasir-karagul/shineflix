import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { anime } from "@/lib/data";
import { FavoriteButton } from "@/components/favorite-button";
type Props={params:Promise<{slug:string}>};
export function generateStaticParams(){return anime.map(a=>({slug:a.slug}));}
export async function generateMetadata({params}:Props):Promise<Metadata>{const {slug}=await params;const item=anime.find(a=>a.slug===slug);return {title:item?.title??"الأنمي غير موجود",description:item?.description};}
export default async function AnimeDetailPage({params}:Props){const {slug}=await params;const item=anime.find(a=>a.slug===slug);if(!item)notFound();return <div className="page-shell inner-page"><Link href="/anime" className="back-link">→ العودة إلى المكتبة</Link><section className="detail-layout"><div className="detail-poster" style={{background:item.cover}}><span className="poster-vertical">{item.titleEn}</span><span className="poster-title">{item.title}</span><span className="poster-rating">★ {item.rating}</span></div><div className="detail-copy"><span className="eyebrow">ملف العمل · {item.year}</span><h1>{item.title}</h1><p className="detail-en">{item.titleEn}</p><div className="detail-meta"><span>{item.status}</span><span>{item.episodes}</span><span>★ {item.rating}</span></div><p className="detail-description">{item.description}</p><div className="detail-tags">{item.genres.map(g=><span key={g}>{g}</span>)}</div><div className="detail-actions"><FavoriteButton slug={item.slug}/><span>أضف العمل إلى قائمتك الشخصية</span></div><div className="detail-disclaimer">صفحة معلومات تجريبية. لا تتضمن مشغّل فيديو أو روابط لمصادر غير مرخّصة.</div></div></section></div>}
