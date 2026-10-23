"use client";
import { useEffect, useState } from "react";

type Ad = { id: string; title: string; format: "LINK" | "IMAGE" | "SCRIPT"; placement: "SITE_TOP" | "HOME_INLINE" | "PLAYER_BEFORE" | "DETAIL_BOTTOM"; isActive: boolean; linkUrl: string | null; imageUrl: string | null; scriptCode: string | null; startsAt: string | null; endsAt: string | null };
type Form = { title: string; format: Ad["format"]; placement: Ad["placement"]; isActive: boolean; linkUrl: string; imageUrl: string; scriptCode: string; startsAt: string; endsAt: string };
const blank: Form = { title: "", format: "IMAGE", placement: "SITE_TOP", isActive: false, linkUrl: "", imageUrl: "", scriptCode: "", startsAt: "", endsAt: "" };
const placements: Array<{ value: Form["placement"]; label: string }> = [
  { value: "SITE_TOP", label: "شريط أعلى جميع الصفحات" },
  { value: "HOME_INLINE", label: "داخل الصفحة الرئيسية" },
  { value: "PLAYER_BEFORE", label: "قبل مشغّل الفيديو" },
  { value: "DETAIL_BOTTOM", label: "أسفل تفاصيل العمل" }
];
export function AdminAds() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [form, setForm] = useState<Form>(blank);
  const [editing, setEditing] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function load() {
    const r = await fetch("/api/admin/ads", { cache: "no-store" });
    const d = await r.json();
    if (!r.ok) throw new Error(d.error ?? "تعذّر تحميل الإعلانات.");
    setAds(d.ads);
  }
  useEffect(() => { load().catch(e => setError(e instanceof Error ? e.message : "تعذّر تحميل الإعلانات.")); }, []);
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
      const d = await r.json(); if (!r.ok) throw new Error(d.error ?? "تعذّر حفظ الإعلان.");
      await load(); reset();
    } catch (e) { setError(e instanceof Error ? e.message : "تعذّر حفظ الإعلان."); }
    finally { setBusy(false); }
  }
  async function toggle(ad: Ad) {
    const r = await fetch("/api/admin/ads/" + ad.id, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...ad, linkUrl: ad.linkUrl, imageUrl: ad.imageUrl, scriptCode: ad.scriptCode, startsAt: ad.startsAt, endsAt: ad.endsAt, isActive: !ad.isActive }) });
    const d = await r.json(); if (!r.ok) setError(d.error ?? "تعذّر تغيير الحالة."); else await load();
  }
  async function remove(ad: Ad) {
    if (!confirm("حذف الإعلان «" + ad.title + "»؟")) return;
    const r = await fetch("/api/admin/ads/" + ad.id, { method: "DELETE" });
    const d = await r.json(); if (!r.ok) setError(d.error ?? "تعذّر الحذف."); else { setAds(old => old.filter(x => x.id !== ad.id)); if (editing === ad.id) reset(); }
  }
  return <div className="admin-ads-grid">
    <section className="admin-tools">
      <div className="admin-section-heading"><div><h2>{editing ? "تعديل الإعلان" : "إضافة إعلان"}</h2><p>الرابط أو الصورة أو كود HTML/JavaScript داخل إطار معزول.</p></div>{editing ? <button className="button button-ghost" onClick={reset}>إلغاء</button> : null}</div>
      <form className="admin-content-form" onSubmit={save}>
        <label>اسم الإعلان<input value={form.title} onChange={e => set("title", e.target.value)} required minLength={2} maxLength={120} /></label>
        <label>نوع الإعلان<select value={form.format} onChange={e => set("format", e.target.value as Form["format"])}><option value="IMAGE">صورة مع رابط</option><option value="LINK">رابط نصي</option><option value="SCRIPT">سكريبت / HTML</option></select></label>
        <label className="admin-full">موضع الإعلان<select value={form.placement} onChange={e => set("placement", e.target.value as Form["placement"])}>{placements.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}</select></label>
        {(form.format === "IMAGE" || form.format === "LINK") ? <label className="admin-full">رابط الوجهة HTTPS<input type="url" value={form.linkUrl} onChange={e => set("linkUrl", e.target.value)} placeholder="https://advertiser.example/" required /></label> : null}
        {form.format === "IMAGE" ? <label className="admin-full">رابط صورة الإعلان HTTPS<input type="url" value={form.imageUrl} onChange={e => set("imageUrl", e.target.value)} placeholder="https://cdn.example/banner.webp" required /></label> : null}
        {form.format === "SCRIPT" ? <label className="admin-full">كود HTML / JavaScript<textarea rows={9} value={form.scriptCode} onChange={e => set("scriptCode", e.target.value)} placeholder={'<a href="https://sponsor.example"><img src="https://cdn.example/banner.webp"></a>\n<script>/* كود شبكة إعلانات موثوقة */<\/script>'} required maxLength={20000} /><small>يعمل داخل iframe معزول، ولا يحصل على وصول مباشر إلى صفحات Shineflix. استخدم شبكات إعلانات موثوقة فقط.</small></label> : null}
        <label>تاريخ البداية (اختياري)<input type="datetime-local" value={form.startsAt} onChange={e => set("startsAt", e.target.value)} /></label>
        <label>تاريخ الانتهاء (اختياري)<input type="datetime-local" value={form.endsAt} onChange={e => set("endsAt", e.target.value)} /></label>
        <label className="admin-checkbox"><input type="checkbox" checked={form.isActive} onChange={e => set("isActive", e.target.checked)} /> تفعيل الإعلان فور الحفظ</label>
        <div className="admin-form-actions"><button className="button button-primary" disabled={busy}>{busy ? "جارٍ الحفظ…" : editing ? "حفظ التعديلات" : "إضافة الإعلان"}</button><button type="button" className="button button-ghost" onClick={reset}>تفريغ النموذج</button></div>
      </form>
      {error ? <div className="admin-alert" role="alert">{error}</div> : null}
    </section>
    <section className="admin-tools">
      <div className="admin-section-heading"><div><h2>الإعلانات المحفوظة</h2><p>{ads.length} إعلانًا — التفعيل والتوقيت يُطبّقان تلقائيًا.</p></div></div>
      {!ads.length ? <div className="admin-empty">لا توجد إعلانات بعد. أضف أول إعلان من النموذج.</div> : <div className="admin-ad-list">{ads.map(ad => <article className="admin-ad-row" key={ad.id}><div className="admin-ad-info"><strong>{ad.title}</strong><span>{placements.find(p => p.value === ad.placement)?.label} · {ad.format}</span><small>{ad.isActive ? "مفعّل" : "متوقف"}{ad.startsAt ? " · يبدأ " + new Date(ad.startsAt).toLocaleString("ar") : ""}{ad.endsAt ? " · ينتهي " + new Date(ad.endsAt).toLocaleString("ar") : ""}</small></div><div className="admin-row-actions"><button onClick={() => edit(ad)}>تعديل</button><button onClick={() => toggle(ad)}>{ad.isActive ? "إيقاف" : "تفعيل"}</button><button className="danger" onClick={() => remove(ad)}>حذف</button></div></article>)}</div>}
    </section>
  </div>;
}
