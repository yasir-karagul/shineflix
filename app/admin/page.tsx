import type { Prisma } from "@prisma/client";
import Link from "next/link";
import { requireAdminPage } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { AdminDashboard } from "@/components/admin-dashboard";
import { AdminLogout } from "@/components/admin-logout";
import { getLanguage } from "@/lib/i18n";

type DashboardItem = Prisma.ContentGetPayload<{ include: { seasons: { include: { episodes: true } } } }>;
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  await requireAdminPage();
  const lang = await getLanguage();
  const ar = lang === "ar";
  let items: DashboardItem[] = [];
  let ready = true;
  try {
    items = await prisma.content.findMany({
      orderBy: { updatedAt: "desc" },
      include: { seasons: { orderBy: { seasonNumber: "asc" }, include: { episodes: { orderBy: { episodeNumber: "asc" } } } } },
      take: 300
    });
  } catch { ready = false; }
  const stats = {
    total: items.length, published: items.filter(item => item.publicationStatus === "PUBLISHED").length,
    movies: items.filter(item => item.type === "MOVIE").length,
    series: items.filter(item => item.type === "SERIES").length,
    anime: items.filter(item => item.type === "ANIME").length
  };
  return <main className="admin-page page-shell">
    <div className="admin-top"><div><span className="eyebrow">SHINEFLIX / CMS</span><h1>{ar ? "لوحة التحكم" : "Admin dashboard"}</h1><p>{ar ? "إدارة المحتوى وبيانات TMDB والمواسم والحلقات." : "Manage content, TMDB metadata, seasons and episodes."}</p></div>
      <div className="admin-top-actions"><Link href="/admin/settings" className="button button-primary">{ar ? "إعدادات TMDB" : "TMDB settings"}</Link><Link href="/admin/ads" className="button button-ghost">{ar ? "إدارة الإعلانات" : "Manage ads"}</Link><Link href="/" className="button button-ghost">{ar ? "عرض الموقع ↗" : "View site ↗"}</Link><AdminLogout lang={lang} /></div>
    </div>
    {!ready && <div className="admin-alert">{ar ? "قاعدة البيانات غير جاهزة. اضبط DATABASE_URL ثم نفّذ npm run db:push." : "Database is not ready. Set DATABASE_URL, then run npm run db:push."}</div>}
    <div className="admin-stats"><div><strong>{stats.total}</strong><span>{ar ? "كل العناوين" : "All titles"}</span></div><div><strong>{stats.published}</strong><span>{ar ? "منشور" : "Published"}</span></div><div><strong>{stats.movies}</strong><span>{ar ? "أفلام" : "Movies"}</span></div><div><strong>{stats.series}</strong><span>{ar ? "مسلسلات" : "TV series"}</span></div><div><strong>{stats.anime}</strong><span>{ar ? "أنمي" : "Anime"}</span></div></div>
    <AdminDashboard initialItems={items} databaseReady={ready} lang={lang} />
  </main>;
}
