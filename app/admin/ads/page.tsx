import Link from "next/link";
import { requireAdminPage } from "@/lib/admin-auth";
import { AdminAds } from "@/components/admin-ads";
import { getLanguage } from "@/lib/i18n";

export const dynamic = "force-dynamic";
export default async function AdminAdsPage() {
  await requireAdminPage();
  const lang = await getLanguage();
  const ar = lang === "ar";
  return <main className="admin-page page-shell">
    <div className="admin-top">
      <div><span className="eyebrow">SHINEFLIX / AD MANAGER</span><h1>{ar ? "إدارة الإعلانات" : "Ad management"}</h1><p>{ar ? "أنشئ الإعلانات، حدّد موضعها، واضبط تفعيلها وجدولها الزمني." : "Create ads, choose placements, and schedule or pause campaigns."}</p></div>
      <div className="admin-top-actions"><Link href="/admin" className="button button-ghost">{ar ? "العودة إلى لوحة التحكم" : "Back to dashboard"}</Link><Link href="/" className="button button-ghost">{ar ? "عرض الموقع ↗" : "View site ↗"}</Link></div>
    </div>
    <AdminAds lang={lang} />
  </main>;
}
