import type { Metadata } from "next";
import { env } from "cloudflare:workers";
import { redirect } from "next/navigation";
import { chatGPTSignInPath, getChatGPTUser } from "@/app/chatgpt-auth";
import { AdminEditor } from "@/app/components/admin-editor";
import { getSiteContent } from "@/lib/site-content";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Administración · RV Solutions", robots: { index: false, follow: false, noarchive: true } };

export default async function AdminPage() {
  const user = await getChatGPTUser();
  if (!user) redirect(chatGPTSignInPath("/admin"));
  const allowedEmail = env.ADMIN_EMAIL?.trim().toLowerCase();
  if (!allowedEmail) return <main className="not-found-admin"><div><h1>Panel no configurado</h1><p>El acceso seguro al panel aún no está conectado. Revisa la configuración de administración del sitio.</p></div></main>;
  if (user.email.trim().toLowerCase() !== allowedEmail) return <main className="not-found-admin"><div><h1>Acceso restringido</h1><p>Esta cuenta inició sesión correctamente, pero no está autorizada para administrar RV Solutions.</p><a href="/signout-with-chatgpt?return_to=/admin" target="_top">Cerrar sesión</a></div></main>;
  return <AdminEditor initialContent={await getSiteContent()} displayEmail={user.email} />;
}
