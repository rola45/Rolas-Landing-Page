import { saveSiteContent, siteContentSchema } from "@/lib/site-content";
import { AdminAuthError, authErrorResponse, requireAdminApi, requireSameOrigin } from "@/lib/admin-auth";

export async function PUT(request: Request) {
  if (!requireSameOrigin(request)) return Response.json({ error: "Origen no autorizado." }, { status: 403 });
  try {
    await requireAdminApi();
    const declaredSize = Number(request.headers.get("content-length") || 0);
    if (declaredSize > 100_000) return Response.json({ error: "El contenido supera el tamaño permitido." }, { status: 413 });
    let body: unknown;
    try { body = await request.json(); } catch { return Response.json({ error: "El contenido enviado no es JSON válido." }, { status: 400 }); }
    const parsed = siteContentSchema.safeParse(body);
    if (!parsed.success) return Response.json({ error: "Revisa los campos: algún dato está incompleto o supera el límite permitido.", fields: parsed.error.issues.map((issue) => issue.path.join(".")) }, { status: 400 });
    await saveSiteContent(parsed.data);
    return Response.json({ content: parsed.data }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof Error && error.message.includes("base de datos")) return Response.json({ error: "La base de datos no está disponible." }, { status: 503 });
    if (error instanceof AdminAuthError) return authErrorResponse(error);
    return authErrorResponse(error);
  }
}
