import Link from "next/link";
import { requireAdminPage } from "@/lib/admin-auth";
import { AdminAds } from "@/components/admin-ads";

export const dynamic = "force-dynamic";
export default async function AdminAdsPage() {
  await requireAdminPage();
  return <main className="admin-page page-shell">
    <div className="admin-top">
      <div><span className="eyebrow">SHINEFLIX / AD MANAGER</span><h1>إدارة الإعلانات</h1><p>أنشئ الإعلانات، حدّد موضعها، واضبط تفعيلها وجدولها الزمني.</p></div>
      <div className="admin-top-actions"><Link href="/admin" className="button button-ghost">العودة إلى لوحة التحكم</Link><Link href="/" className="button button-ghost">عرض الموقع ↗</Link></div>
    </div>
    <AdminAds />
  </main>;
}
