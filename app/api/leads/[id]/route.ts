import { env } from "cloudflare:workers";
import { z } from "zod";
import { AdminAuthError, authErrorResponse, requireAdminApi, requireSameOrigin } from "@/lib/admin-auth";

const statusSchema = z.object({ status: z.enum(["new", "read", "archived"]) }).strict();
type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: Context) {
  if (!requireSameOrigin(request)) return Response.json({ error: "Origen no autorizado." }, { status: 403 });
  try {
    await requireAdminApi();
    const parsed = statusSchema.safeParse(await request.json());
    if (!parsed.success) return Response.json({ error: "Estado de solicitud no válido." }, { status: 400 });
    const { id } = await context.params;
    if (!env.DB) return Response.json({ error: "La base de datos no está disponible." }, { status: 503 });
    await env.DB.prepare("UPDATE leads SET status = ? WHERE id = ?").bind(parsed.data.status, id).run();
    return Response.json({ ok: true });
  } catch (error) { return error instanceof AdminAuthError ? authErrorResponse(error) : authErrorResponse(error); }
}

export async function DELETE(request: Request, context: Context) {
  if (!requireSameOrigin(request)) return Response.json({ error: "Origen no autorizado." }, { status: 403 });
  try {
    await requireAdminApi();
    const { id } = await context.params;
    if (!env.DB) return Response.json({ error: "La base de datos no está disponible." }, { status: 503 });
    await env.DB.prepare("DELETE FROM leads WHERE id = ?").bind(id).run();
    return Response.json({ ok: true });
  } catch (error) { return authErrorResponse(error); }
}
