import {NextResponse} from "next/server";import {z} from "zod";import {isAdmin} from "@/lib/admin-auth";import {prisma} from "@/lib/prisma";import {isAllowedEmbedUrl} from "@/lib/embed";
const schema=z.object({episodeNumber:z.number().int().min(1).max(10000),title:z.string().min(1).max(240),synopsis:z.string().max(12000).default(""),runtimeMinutes:z.number().int().min(1).max(1000).optional().nullable(),releaseDate:z.string().datetime().optional().nullable(),embedUrl:z.string().url().max(2000).optional().nullable().refine(v=>v==null||isAllowedEmbedUrl(v),"رابط التضمين غير مسموح به."),isPublished:z.boolean().default(false),imdbId:z.string().max(32).optional().nullable()});
export async function POST(req:Request,ctx:{params:Promise<{id:string}>}){if(!await isAdmin())return NextResponse.json({error:"Unauthorized"},{status:401});const {id}=await ctx.params;const p=schema.safeParse(await req.json().catch(()=>null));if(!p.success)return NextResponse.json({error:p.error.issues[0]?.message??"Invalid episode"},{status:400});try{return NextResponse.json({episode:await prisma.episode.create({data:{...p.data,seasonId:id,releaseDate:p.data.releaseDate?new Date(p.data.releaseDate):null}})},{status:201});}catch{return NextResponse.json({error:"تعذّر حفظ الحلقة. تحقق من الموسم ورقم الحلقة."},{status:400});}}

export async function DELETE(req:Request,ctx:{params:Promise<{id:string}>}) {
  if(!await isAdmin()) return NextResponse.json({error:"Unauthorized"},{status:401});
  const {id:seasonId}=await ctx.params;
  const episodeId=new URL(req.url).searchParams.get("episodeId");
  if(!episodeId) return NextResponse.json({error:"معرّف الحلقة مطلوب."},{status:400});
  try {
    const existing=await prisma.episode.findFirst({where:{id:episodeId,seasonId},select:{id:true}});
    if(!existing) return NextResponse.json({error:"الحلقة غير موجودة."},{status:404});
    await prisma.episode.delete({where:{id:existing.id}});
    return NextResponse.json({ok:true});
  } catch {
    return NextResponse.json({error:"تعذّر حذف الحلقة."},{status:400});
  }
}
