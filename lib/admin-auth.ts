import { env } from "cloudflare:workers";
import { getChatGPTUser } from "@/app/chatgpt-auth";

export class AdminAuthError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export async function requireAdminApi() {
  const user = await getChatGPTUser();
  if (!user) throw new AdminAuthError(401, "Inicia sesión para continuar.");
  const allowedEmail = env.ADMIN_EMAIL?.trim().toLowerCase();
  if (!allowedEmail) throw new AdminAuthError(503, "El acceso de administración aún no está configurado.");
  if (user.email.trim().toLowerCase() !== allowedEmail) {
    throw new AdminAuthError(403, "Esta cuenta no tiene acceso al panel.");
  }
  return user;
}

export function requireSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    return new URL(origin).origin === new URL(request.url).origin;
  } catch {
    return false;
  }
}

export function authErrorResponse(error: unknown) {
  if (error instanceof AdminAuthError) {
    return Response.json({ error: error.message }, { status: error.status, headers: { "Cache-Control": "no-store" } });
  }
  return Response.json({ error: "No fue posible completar la solicitud." }, { status: 500, headers: { "Cache-Control": "no-store" } });
}
