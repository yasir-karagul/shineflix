import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
const COOKIE="shineflix_admin", MAX_AGE=28800;
function secret(){const s=process.env.ADMIN_SESSION_SECRET;if(!s||s.length<32)throw new Error("Set ADMIN_SESSION_SECRET to a random secret of at least 32 characters.");return s;}
function eq(a:string,b:string){const x=Buffer.from(a),y=Buffer.from(b);return x.length===y.length&&timingSafeEqual(x,y);}
function sign(p:string){return createHmac("sha256",secret()).update(p).digest("hex");}
export function verifyCredentials(u:string,p:string){const eu=process.env.ADMIN_USERNAME,ep=process.env.ADMIN_PASSWORD;if(!eu||!ep)throw new Error("Configure ADMIN_USERNAME and ADMIN_PASSWORD.");return eq(u,eu)&&eq(p,ep);}
export function makeSession(username:string){const p=Buffer.from(JSON.stringify({username,exp:Math.floor(Date.now()/1000)+MAX_AGE})).toString("base64url");return p+"."+sign(p);}
export function isValidSession(v?:string){if(!v)return false;const [p,s]=v.split(".");if(!p||!s)return false;try{if(!eq(sign(p),s))return false;const d=JSON.parse(Buffer.from(p,"base64url").toString());return typeof d.username==="string"&&d.exp>Math.floor(Date.now()/1000);}catch{return false;}}
export async function isAdmin(){const c=await cookies();return isValidSession(c.get(COOKIE)?.value);}
export async function requireAdminPage(){if(!await isAdmin())redirect("/admin/login");}
export const adminCookieName=COOKIE, adminCookieMaxAge=MAX_AGE;
