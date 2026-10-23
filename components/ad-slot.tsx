import { prisma } from "@/lib/prisma";

type Placement = "SITE_TOP" | "HOME_INLINE" | "PLAYER_BEFORE" | "DETAIL_BOTTOM";
type AdRecord = { id: string; title: string; format: "LINK" | "IMAGE" | "SCRIPT"; linkUrl: string | null; imageUrl: string | null; scriptCode: string | null };

export async function AdSlot({ placement }: { placement: Placement }) {
  let ads: AdRecord[] = [];
  try {
    const now = new Date();
    ads = await prisma.ad.findMany({
      where: { placement, isActive: true, AND: [
        { OR: [{ startsAt: null }, { startsAt: { lte: now } }] },
        { OR: [{ endsAt: null }, { endsAt: { gte: now } }] }
      ] },
      select: { id: true, title: true, format: true, linkUrl: true, imageUrl: true, scriptCode: true },
      orderBy: { updatedAt: "desc" },
      take: 3
    }) as AdRecord[];
  } catch { return null; }
  if (!ads.length) return null;
  return <aside className={"ad-slot ad-slot-" + placement.toLowerCase()} aria-label="إعلانات">
    {ads.map(ad => <div className={"ad-unit ad-format-" + ad.format.toLowerCase()} key={ad.id}>
      <span className="ad-label">إعلان</span>
      {ad.format === "LINK" && ad.linkUrl ? <a href={ad.linkUrl} target="_blank" rel="sponsored noopener noreferrer">{ad.title}</a> : null}
      {ad.format === "IMAGE" && ad.imageUrl && ad.linkUrl ? <a href={ad.linkUrl} target="_blank" rel="sponsored noopener noreferrer" aria-label={ad.title}><img src={ad.imageUrl} alt={ad.title} loading="lazy" /></a> : null}
      {ad.format === "SCRIPT" && ad.scriptCode ? <iframe title={ad.title} loading="lazy" sandbox="allow-scripts allow-popups" referrerPolicy="strict-origin-when-cross-origin" srcDoc={ad.scriptCode} /> : null}
    </div>)}
  </aside>;
}
