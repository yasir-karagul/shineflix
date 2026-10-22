import { NextResponse } from "next/server";
import { adminCookieMaxAge,adminCookieName,makeSession,verifyCredentials } from "@/lib/admin-auth";
export async function POST(req:Request){
 const origin=req.headers.get("origin");if(origin&&origin!==new URL(req.url).origin)return NextResponse.json({error:"Invalid origin"},{status:403});
 const b=await req.json().catch(()=>null) as {username?:string;password?:string}|null;
 if(!b||typeof b.username!=="string"||typeof b.password!=="string"||b.username.length>128||b.password.length>512)return NextResponse.json({error:"بيانات الدخول غير صحيحة."},{status:400});
 try{if(!verifyCredentials(b.username,b.password))return NextResponse.json({error:"اسم المستخدم أو كلمة المرور غير صحيحة."},{status:401});const r=NextResponse.json({ok:true});r.cookies.set(adminCookieName,makeSession(b.username),{httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"strict",path:"/",maxAge:adminCookieMaxAge});return r;}catch(e){return NextResponse.json({error:e instanceof Error?e.message:"Server configuration error"},{status:503});}
}
