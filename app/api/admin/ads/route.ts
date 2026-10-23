import { NextResponse } from "next/server";
import { z } from "zod";
import { isAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

const httpsUrl = z.string().url().max(2000).refine(value => {
  try { return new URL(value).protocol === "https:"; } catch { return false; }
}, "يجب استخدام رابط HTTPS.");
const schema = z.object({
  title: z.string().trim().min(2).max(120),
  format: z.enum(["LINK", "IMAGE", "SCRIPT"]),
  placement: z.enum(["SITE_TOP", "HOME_INLINE", "PLAYER_BEFORE", "DETAIL_BOTTOM"]),
  isActive: z.boolean().default(false),
  linkUrl: httpsUrl.optional().nullable(),
  imageUrl: httpsUrl.optional().nullable(),
  scriptCode: z.string().max(20000).optional().nullable(),
  startsAt: z.string().datetime().optional().nullable(),
  endsAt: z.string().datetime().optional().nullable()
}).superRefine((value, ctx) => {
  if (value.format === "LINK" && !value.linkUrl) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["linkUrl"], message: "أدخل رابط الإعلان." });
  if (value.format === "IMAGE" && (!value.imageUrl || !value.linkUrl)) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["imageUrl"], message: "إعلان الصورة يحتاج رابط صورة ورابط وجهة." });
  if (value.format === "SCRIPT" && !value.scriptCode?.trim()) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["scriptCode"], message: "أدخل كود الإعلان." });
  if (value.startsAt && value.endsAt && new Date(value.endsAt) <= new Date(value.startsAt)) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["endsAt"], message: "تاريخ الانتهاء يجب أن يكون بعد البداية." });
});

export async function GET() {
  if (!await isAdmin()) return NextResponse.json({ error: "غير مصرح." }, { status: 401 });
  try {
    const ads = await prisma.ad.findMany({ orderBy: { updatedAt: "desc" } });
    return NextResponse.json({ ads });
  } catch {
    return NextResponse.json({ error: "قاعدة البيانات غير جاهزة. نفّذ npm run db:push." }, { status: 503 });
  }
}

export async function POST(req: Request) {
  if (!await isAdmin()) return NextResponse.json({ error: "غير مصرح." }, { status: 401 });
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "بيانات الإعلان غير صحيحة." }, { status: 400 });
  try {
    const data = parsed.data;
    const ad = await prisma.ad.create({ data: { ...data, startsAt: data.startsAt ? new Date(data.startsAt) : null, endsAt: data.endsAt ? new Date(data.endsAt) : null } });
    return NextResponse.json({ ad }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "تعذّر حفظ الإعلان." }, { status: 400 });
  }
}
