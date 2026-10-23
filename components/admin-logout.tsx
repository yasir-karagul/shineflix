"use client";
import type { Language } from "@/lib/i18n";
export function AdminLogout({lang="en"}:{lang?:Language}){const ar=lang==="ar";return <button className="button button-ghost" onClick={async()=>{await fetch("/api/admin/logout",{method:"POST"});location.href="/admin/login";}}>{ar?"تسجيل الخروج":"Sign out"}</button>}
