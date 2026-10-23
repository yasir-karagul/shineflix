"use client";

import { useEffect, useState } from "react";

type Status = { configured: boolean; source: "dashboard" | "environment" | null };

export function AdminTmdbSettings() {
  const [mode, setMode] = useState<"bearer" | "api_key">("bearer");
  const [credential, setCredential] = useState("");
  const [status, setStatus] = useState<Status>({ configured: false, source: null });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function refresh() {
    try {
      const response = await fetch("/api/admin/settings/tmdb", { cache: "no-store" });
      const data = await response.json();
      if (response.ok) setStatus({ configured: Boolean(data.configured), source: data.source ?? null });
      else setError(data.error ?? "Could not read TMDB configuration.");
    } catch { setError("Could not read TMDB configuration."); }
  }
  useEffect(() => { void refresh(); }, []);

  async function save(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setMessage(""); setError("");
    try {
      const response = await fetch("/api/admin/settings/tmdb", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ mode, credential })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Could not validate TMDB credentials.");
      setCredential(""); setStatus({ configured: true, source: "dashboard" });
      setMessage("تم التحقق من بيانات TMDB وحفظها مشفّرة. / TMDB credentials validated and stored encrypted.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not save TMDB credentials.");
    } finally { setBusy(false); }
  }
  async function clear() {
    if (!confirm("حذف بيانات TMDB المحفوظة من لوحة التحكم؟ / Remove the TMDB credential saved in the dashboard?")) return;
    setBusy(true); setMessage(""); setError("");
    try {
      const response = await fetch("/api/admin/settings/tmdb", { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Could not remove TMDB credentials.");
      setMessage("تم حذف بيانات لوحة التحكم. / Dashboard credential removed.");
      await refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not remove TMDB credentials.");
    } finally { setBusy(false); }
  }

  return <main className="admin-page page-shell">
    <div className="admin-top"><div><span className="eyebrow">SHINEFLIX / SETTINGS</span><h1>TMDB integration</h1><p>إعداد مصادقة TMDB الرسمية من جهة الخادم. / Configure the official server-side TMDB API integration.</p></div><a href="/admin" className="button button-ghost">← Back to dashboard</a></div>
    <section className="admin-tools">
      <h2>API credentials</h2>
      <p>الأفضل استخدام <strong>API Read Access Token</strong> من إعدادات API في حساب TMDB؛ يُرسل في ترويسة Authorization: Bearer ولا يظهر للمتصفح بعد حفظه. / Prefer the API Read Access Token from your TMDB account settings.</p>
      <div className="tmdb-settings-status"><strong>{status.configured ? "Configured / مهيأ" : "Not configured / غير مهيأ"}</strong>{status.source ? <span>{status.source === "dashboard" ? "Saved in dashboard / محفوظ في لوحة التحكم" : "Environment variable / متغير بيئة"}</span> : null}</div>
      <form className="admin-content-form tmdb-settings-form" onSubmit={save}>
        <label>Credential type / نوع بيانات الاعتماد<select value={mode} onChange={event => setMode(event.target.value as "bearer" | "api_key")}><option value="bearer">API Read Access Token (Bearer) — recommended</option><option value="api_key">TMDB v3 API Key</option></select></label>
        <label className="admin-full">TMDB credential<input autoComplete="new-password" type="password" value={credential} onChange={event => setCredential(event.target.value)} placeholder={mode === "bearer" ? "Paste API Read Access Token" : "Paste v3 API Key"} minLength={10} required /><small>لن تُعرض القيمة الحالية؛ أدخل قيمة جديدة لتغييرها. / The saved value is never returned; enter a new value to replace it.</small></label>
        <div className="admin-form-actions"><button className="button button-primary" disabled={busy || credential.trim().length < 10}>{busy ? "Checking…" : "Validate and save / تحقق واحفظ"}</button><button type="button" className="button button-ghost" disabled={busy || status.source !== "dashboard"} onClick={clear}>Remove saved credential / حذف</button></div>
      </form>
      {message ? <p className="tmdb-settings-message" role="status">{message}</p> : null}
      {error ? <p className="tmdb-settings-error" role="alert">{error}</p> : null}
    </section>
    <section className="admin-tools"><h2>How the integration works / آلية التكامل</h2><p>يُرسل Shineflix الطلبات من الخادم إلى <code>api.themoviedb.org/3</code>، ويُخزَّن المفتاح في قاعدة البيانات مشفّرًا باستخدام <code>ADMIN_SESSION_SECRET</code>. لا تضع الرمز في متغير يبدأ بـ <code>NEXT_PUBLIC_</code> ولا تشاركه في رسائل الخطأ أو السجلات.</p><p>إذا غيّرت <code>ADMIN_SESSION_SECRET</code>، أعد إدخال بيانات TMDB في هذه الصفحة لأن السر نفسه يُستخدم لاشتقاق مفتاح التشفير. يمكن أيضًا ضبط <code>TMDB_API_READ_ACCESS_TOKEN</code> كمتغير بيئة احتياطي في Vercel.</p></section>
  </main>;
}
