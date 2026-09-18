import { redirect } from "next/navigation";
import { requireChatGPTUser } from "@/app/chatgpt-auth";
import { isAdminEmail } from "@/lib/forum-auth";
import AdminDashboard from "./admin-dashboard";
export const dynamic="force-dynamic";
export default async function AdminPage(){
 const user=await requireChatGPTUser("/admin");
 if(!isAdminEmail(user.email))redirect("/");
 return <AdminDashboard adminName={user.displayName}/>;
}
