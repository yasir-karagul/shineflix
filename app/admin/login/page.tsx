import { getLanguage } from "@/lib/i18n";
import { AdminLoginForm } from "@/components/admin-login-form";

export const dynamic = "force-dynamic";
export default async function AdminLoginPage() {
  const lang = await getLanguage();
  return <AdminLoginForm lang={lang} />;
}
