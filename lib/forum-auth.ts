import { getChatGPTUser } from "@/app/chatgpt-auth";
import { getDb } from "@/db";
import { members } from "@/db/schema";
import { eq } from "drizzle-orm";
import { env } from "cloudflare:workers";
export function isAdminEmail(email:string){return Boolean(env.ADMIN_EMAIL&&email.toLowerCase()===env.ADMIN_EMAIL.toLowerCase())}
export async function requireApiUser(){
 const user=await getChatGPTUser(); if(!user)return {error:Response.json({error:"Sign in required"},{status:401})};
 const db=getDb(),now=Date.now();
 await db.insert(members).values({userId:user.userId,email:user.email,displayName:user.displayName,role:isAdminEmail(user.email)?"admin":"member",status:"active",joinedAt:now,lastSeenAt:now}).onConflictDoUpdate({target:members.userId,set:{email:user.email,displayName:user.displayName,role:isAdminEmail(user.email)?"admin":"member",lastSeenAt:now}});
 const [member]=await db.select().from(members).where(eq(members.userId,user.userId)).limit(1);
 if(member?.status==="banned")return {error:Response.json({error:"This account is suspended"},{status:403})};
 return {user,member,db};
}
export async function requireAdmin(){const auth=await requireApiUser();if("error" in auth)return auth;if(!isAdminEmail(auth.user.email)&&auth.member?.role!=="admin")return {error:Response.json({error:"Administrator access required"},{status:403})};return auth;}
