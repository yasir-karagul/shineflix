"use client";
import { useState } from "react";
import Link from "next/link";
import type { Language } from "@/lib/i18n";

const errorCopy: Record<string,string> = {
  "بيانات الدخول غير صحيحة.": "Invalid login details.",
  "اسم المستخدم أو كلمة المرور غير صحيحة.": "Incorrect username or password.",
  "Server configuration error": "Server configuration error"
};

export function AdminLoginForm({lang="en"}:{lang?:Language}) {
  const ar=lang==="ar";
  const [username,U]=useState("");
  const [password,P]=useState("");
  const [error,E]=useState("");
  const [busy,B]=useState(false);
  function showError(message:string) {
    E(ar ? message : (errorCopy[message] ?? (message==="حدث خطأ" ? "Something went wrong." : message)));
  }
  async function submit(e:React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); B(true); E("");
    try {
      const r=await fetch("/api/admin/login",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({username,password})});
      const d=await r.json();
      if(!r.ok) throw new Error(d.error);
      location.href="/admin";
    } catch(e) { showError(e instanceof Error ? e.message : "حدث خطأ"); }
    finally { B(false); }
  }
  return <main className="admin-login page-shell"><div className="admin-login-card">
    <Link href="/" className="brand"><span className="brand-mark">S<span>✦</span></span><span className="brand-name">SHINE<span>FLIX</span></span></Link>
    <span className="eyebrow">{ar?"لوحة الإدارة":"ADMINISTRATION"}</span>
    <h1>{ar?"مرحبًا بعودتك":"Welcome back"}</h1>
    <p>{ar?"سجّل الدخول لإدارة مكتبة Shineflix.":"Sign in to manage the Shineflix library."}</p>
    <form onSubmit={submit}>
      <label>{ar?"اسم المستخدم":"Username"}<input autoComplete="username" value={username} onChange={e=>U(e.target.value)} required maxLength={128}/></label>
      <label>{ar?"كلمة المرور":"Password"}<input type="password" autoComplete="current-password" value={password} onChange={e=>P(e.target.value)} required maxLength={512}/></label>
      {error&&<p className="admin-error">{error}</p>}
      <button className="button button-primary" disabled={busy}>{busy?(ar?"جارٍ التحقق…":"Signing in…"):(ar?"تسجيل الدخول":"Sign in")}</button>
    </form>
  </div></main>;
}
