import type { Metadata } from "next";
import Link from "next/link";
import { anime } from "@/lib/data";
import { AnimeCard } from "@/components/anime-card";
export const metadata:Metadata={title:"أفلام الأنمي"};
export default function MoviesPage(){return <div className="page-shell inner-page"><div className="page-intro"><span className="eyebrow">شاشة أكبر، حكايات أعمق</span><h1>أفلام <span>الأنمي.</span></h1><p>مساحة مخصصة للأفلام والقصص التي تكتمل في جلسة واحدة.</p></div><div className="notice-panel"><span>✦</span><div><strong>قائمة الأفلام قيد الإعداد</strong><p>المحتوى الحالي تجريبي. إلى أن تضاف بيانات أفلام مرخّصة، استكشف هذه الأعمال المختارة من المكتبة.</p></div><Link href="/anime" className="text-link">المكتبة ←</Link></div><div className="anime-grid">{anime.filter(a=>["paper-moon","garden-of-echoes","winter-letter","tiny-universe"].includes(a.slug)).map(item=><AnimeCard key={item.slug} anime={item}/>)}</div></div>}
