"use client";
import { useEffect, useState } from "react";
import type { Language } from "@/lib/i18n";

type Ad = { id: string; title: string; format: "LINK" | "IMAGE" | "SCRIPT"; placement: "SITE_TOP" | "HOME_INLINE" | "PLAYER_BEFORE" | "DETAIL_BOTTOM"; isActive: boolean; linkUrl: string | null; imageUrl: string | null; scriptCode: string | null; startsAt: string | null; endsAt: string | null };
type Form = { title: string; format: Ad["format"]; placement: Ad["placement"]; isActive: boolean; linkUrl: string; imageUrl: string; scriptCode: string; startsAt: string; endsAt: string };
const blank: Form = { title: "", format: "IMAGE", placement: "SITE_TOP", isActive: false, linkUrl: "", imageUrl: "", scriptCode: "", startsAt: "", endsAt: "" };
export function AdminAds({lang="en"}:{lang?:Language}) {
  const ar = lang === "ar";
  const t = (arabic:string, english:string) => ar ? arabic : english;
  const placements: Array<{ value: Form["placement"]; label: string }> = [
    { value: "SITE_TOP", label: t("شريط أعلى جميع الصفحات","Top of every page") },
    { value: "HOME_INLINE", label: t("داخل الصفحة الرئيسية","Homepage inline") },
    { value: "PLAYER_BEFORE", label: t("قبل مشغّل الفيديو","Before the video player") },
    { value: "DETAIL_BOTTOM", label: t("أسفل تفاصيل العمل","Below title details") }
  ];
  const [ads, setAds] = useState<Ad[]>([]);
  const [form, setForm] = useState<Form>(blank);
  const [editing, setEditing] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function load() {
    const r = await fetch("/api/admin/ads", { cache: "no-store" });
    const d = await r.json();
    if (!r.ok) throw new Error(d.error ?? t("تعذّر تحميل الإعلانات.","Failed to load ads."));
    setAds(d.ads);
  }
  useEffect(() => { load().catch(e => setError(e instanceof Error ? e.message : t("تعذّر تحميل الإعلانات.","Failed to load ads."))); }, []);
  function set<K extends keyof Form>(key: K, value: Form[K]) { setForm(old => ({ ...old, [key]: value })); }
  function edit(ad: Ad) {
    setEditing(ad.id);
    setForm({ title: ad.title, format: ad.format, placement: ad.placement, isActive: ad.isActive, linkUrl: ad.linkUrl ?? "", imageUrl: ad.imageUrl ?? "", scriptCode: ad.scriptCode ?? "", startsAt: ad.startsAt ? ad.startsAt.slice(0, 16) : "", endsAt: ad.endsAt ? ad.endsAt.slice(0, 16) : "" });
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function reset() { setEditing(null); setForm(blank); setError(""); }
  async function save(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setError("");
    const payload = { ...form, linkUrl: form.linkUrl || null, imageUrl: form.imageUrl || null, scriptCode: form.scriptCode || null, startsAt: form.startsAt ? new Date(form.startsAt).toISOString() : null, endsAt: form.endsAt ? new Date(form.endsAt).toISOString() : null };
    try {
      const r = await fetch(editing ? "/api/admin/ads/" + editing : "/api/admin/ads", { method: editing ? "PATCH" : "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
      const d = await r.json(); if (!r.ok) throw new Error(d.error ?? t("تعذّر حفظ الإعلان.","Failed to save the ad."));
      await load(); reset();
    } catch (e) { setError(e instanceof Error ? e.message : t("تعذّر حفظ الإعلان.","Failed to save the ad.")); }
    finally { setBusy(false); }
  }
  async function toggle(ad: Ad) {
    const r = await fetch("/api/admin/ads/" + ad.id, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...ad, linkUrl: ad.linkUrl, imageUrl: ad.imageUrl, scriptCode: ad.scriptCode, startsAt: ad.startsAt, endsAt: ad.endsAt, isActive: !ad.isActive }) });
    const d = await r.json(); if (!r.ok) setError(d.error ?? t("تعذّر تغيير الحالة.","Failed to update ad status.")); else await load();
  }
  async function remove(ad: Ad) {
    if (!confirm(t("حذف الإعلان «","Delete ad “") + ad.title + t("»؟","”?"))) return;
    const r = await fetch("/api/admin/ads/" + ad.id, { method: "DELETE" });
    const d = await r.json(); if (!r.ok) setError(d.error ?? t("تعذّر الحذف.","Failed to delete the ad.")); else { setAds(old => old.filter(x => x.id !== ad.id)); if (editing === ad.id) reset(); }
  }
  return <div className="admin-ads-grid">
    <section className="admin-tools">
      <div className="admin-section-heading"><div><h2>{editing ? t("تعديل الإعلان","Edit ad") : t("إضافة إعلان","Add ad")}</h2><p>{t("الرابط أو الصورة أو كود HTML/JavaScript داخل إطار معزول.","Choose a URL, banner image, or HTML/JavaScript snippet rendered in an isolated frame.")}</p></div>{editing ? <button className="button button-ghost" onClick={reset}>{t("إلغاء","Cancel")}</button> : null}</div>
      <form className="admin-content-form" onSubmit={save}>
        <label>{t("اسم الإعلان","Ad name")}<input value={form.title} onChange={e => set("title", e.target.value)} required minLength={2} maxLength={120} /></label>
        <label>{t("نوع الإعلان","Ad format")}<select value={form.format} onChange={e => set("format", e.target.value as Form["format"])}><option value="IMAGE">{t("صورة مع رابط","Image banner")}</option><option value="LINK">{t("رابط نصي","Text link")}</option><option value="SCRIPT">{t("سكريبت / HTML","Script / HTML")}</option></select></label>
        <label className="admin-full">{t("موضع الإعلان","Ad placement")}<select value={form.placement} onChange={e => set("placement", e.target.value as Form["placement"])}>{placements.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}</select></label>
        {(form.format === "IMAGE" || form.format === "LINK") ? <label className="admin-full">{t("رابط الوجهة HTTPS","Destination URL (HTTPS)")}<input type="url" value={form.linkUrl} onChange={e => set("linkUrl", e.target.value)} placeholder="https://advertiser.example/" required /></label> : null}
        {form.format === "IMAGE" ? <label className="admin-full">{t("رابط صورة الإعلان HTTPS","Banner image URL (HTTPS)")}<input type="url" value={form.imageUrl} onChange={e => set("imageUrl", e.target.value)} placeholder="https://cdn.example/banner.webp" required /></label> : null}
        {form.format === "SCRIPT" ? <label className="admin-full">{t("كود HTML / JavaScript","HTML / JavaScript code")}<textarea rows={9} value={form.scriptCode} onChange={e => set("scriptCode", e.target.value)} placeholder={ar ? '<a href="https://sponsor.example"><img src="https://cdn.example/banner.webp"></a>\n<script>/* كود شبكة إعلانات موثوقة */<\/script>' : '<a href="https://sponsor.example"><img src="https://cdn.example/banner.webp"></a>\n<script>/* trusted ad network code */<\/script>'} required maxLength={20000} /><small>{t("يعمل داخل iframe معزول، ولا يحصل على وصول مباشر إلى صفحات Shineflix. استخدم شبكات إعلانات موثوقة فقط.","Runs in a sandboxed iframe without direct access to Shineflix pages. Use trusted ad networks only.")}</small></label> : null}
        <label>{t("تاريخ البداية (اختياري)","Start date (optional)")}<input type="datetime-local" value={form.startsAt} onChange={e => set("startsAt", e.target.value)} /></label>
        <label>{t("تاريخ الانتهاء (اختياري)","End date (optional)")}<input type="datetime-local" value={form.endsAt} onChange={e => set("endsAt", e.target.value)} /></label>
        <label className="admin-checkbox"><input type="checkbox" checked={form.isActive} onChange={e => set("isActive", e.target.checked)} /> {t("تفعيل الإعلان فور الحفظ","Activate ad after saving")}</label>
        <div className="admin-form-actions"><button className="button button-primary" disabled={busy}>{busy ? t("جارٍ الحفظ…","Saving…") : editing ? t("حفظ التعديلات","Save changes") : t("إضافة الإعلان","Add ad")}</button><button type="button" className="button button-ghost" onClick={reset}>{t("تفريغ النموذج","Reset form")}</button></div>
      </form>
      {error ? <div className="admin-alert" role="alert">{error}</div> : null}
    </section>
    <section className="admin-tools">
      <div className="admin-section-heading"><div><h2>{t("الإعلانات المحفوظة","Saved ads")}</h2><p>{ads.length} {t("إعلانًا — التفعيل والتوقيت يُطبّقان تلقائيًا.","ads — status and schedule are applied automatically.")}</p></div></div>
      {!ads.length ? <div className="admin-empty">{t("لا توجد إعلانات بعد. أضف أول إعلان من النموذج.","No ads yet. Add your first ad using the form.")}</div> : <div className="admin-ad-list">{ads.map(ad => <article className="admin-ad-row" key={ad.id}><div className="admin-ad-info"><strong>{ad.title}</strong><span>{placements.find(p => p.value === ad.placement)?.label} · {ad.format}</span><small>{ad.isActive ? t("مفعّل","Active") : t("متوقف","Paused")}{ad.startsAt ? " · " + t("يبدأ ","Starts ") + new Date(ad.startsAt).toLocaleString(lang === "ar" ? "ar" : "en-US") : ""}{ad.endsAt ? " · " + t("ينتهي ","Ends ") + new Date(ad.endsAt).toLocaleString(lang === "ar" ? "ar" : "en-US") : ""}</small></div><div className="admin-row-actions"><button onClick={() => edit(ad)}>{t("تعديل","Edit")}</button><button onClick={() => toggle(ad)}>{ad.isActive ? t("إيقاف","Pause") : t("تفعيل","Activate")}</button><button className="danger" onClick={() => remove(ad)}>{t("حذف","Delete")}</button></div></article>)}</div>}
    </section>
  </div>;
}
