import { requireAdminPage } from "@/lib/admin-auth";
import { AdminTmdbSettings } from "@/components/admin-tmdb-settings";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  await requireAdminPage();
  return <AdminTmdbSettings />;
}
