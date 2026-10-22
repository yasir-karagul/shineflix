import Link from "next/link";
export default function NotFound(){return <div className="page-shell not-found"><span className="eyebrow">404 · صفحة غير موجودة</span><h1>يبدو أن هذه <span>الحكاية ضاعت.</span></h1><p>الرابط الذي تبحث عنه غير متاح أو تم نقله.</p><Link className="button button-primary" href="/anime">العودة إلى المكتبة ←</Link></div>}
