"use client";
import { useEffect } from "react";
import type { Language } from "@/lib/i18n";
import { LanguageSwitcher } from "@/components/language-switcher";

export function RedirectLanding({lang,target}:{lang:Language;target:string}) {
  const ar=lang==="ar";
  useEffect(()=>{
    const timer=window.setTimeout(()=>{window.location.assign(target);},4500);
    return ()=>window.clearTimeout(timer);
  },[target]);
  return <main className="page-shell redirect-page">
    <section className="redirect-card">
      <div className="redirect-language"><LanguageSwitcher lang={lang}/></div>
      <span className="brand-mark">S<span>✦</span></span>
      <span className="eyebrow">{ar?"وجهتك إلى Shineflix":"YOUR SHINEFLIX DESTINATION"}</span>
      <h1>{ar?<>أنت على بُعد خطوة من <span>Shineflix.</span></>:<>You're one step away from <span>Shineflix.</span></>}</h1>
      <p>{ar?"هذه صفحة التوجيه الرسمية. سيتم نقلك إلى موقع Shineflix الأساسي خلال لحظات.":"This is the official Shineflix redirect page. You'll be forwarded to the main site in a moment."}</p>
      <a className="button button-primary" href={target}>{ar?"الانتقال إلى الموقع الأساسي":"Continue to the main site"} <span>↗</span></a>
      <p className="redirect-small">{ar?"إذا لم يتم تحويلك تلقائيًا، اضغط الزر أعلاه.":"If you are not redirected automatically, use the button above."}</p>
    </section>
  </main>;
}
