import { NextResponse } from "next/server";
import { z } from "zod";
import { isAdmin } from "@/lib/admin-auth";
import { clearTmdbCredential, getTmdbSettingsStatus, saveTmdbCredential, validateTmdbCredential, type TmdbCredential } from "@/lib/tmdb";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!await isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(await getTmdbSettingsStatus());
}

const schema = z.object({ mode: z.enum(["bearer", "api_key"]), credential: z.string().trim().min(10).max(2000) });

export async function POST(request: Request) {
  if (!await isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "أدخل بيانات TMDB صالحة." }, { status: 400 });
  const credential: TmdbCredential = { mode: parsed.data.mode, value: parsed.data.credential };
  try {
    await validateTmdbCredential(credential);
    await saveTmdbCredential(credential);
    return NextResponse.json({ ok: true, configured: true, source: "dashboard" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "تعذّر حفظ بيانات TMDB.";
    if (/integrationSetting|relation .* does not exist|Unknown field/.test(message)) {
      return NextResponse.json({ error: "حدّث مخطط قاعدة البيانات أولًا عبر npm run db:push، ثم أعد المحاولة." }, { status: 503 });
    }
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE() {
  if (!await isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    await clearTmdbCredential();
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "تعذّر حذف بيانات TMDB المحفوظة. تأكد من تحديث قاعدة البيانات." }, { status: 503 });
  }
}
