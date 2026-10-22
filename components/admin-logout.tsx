"use client";
export function AdminLogout(){return <button className="button button-ghost" onClick={async()=>{await fetch("/api/admin/logout",{method:"POST"});location.href="/admin/login";}}>تسجيل الخروج</button>}
