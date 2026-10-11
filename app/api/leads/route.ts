import { env } from "cloudflare:workers";
import { z } from "zod";
import { AdminAuthError, authErrorResponse, requireAdminApi } from "@/lib/admin-auth";
import { corsHeaders, isAllowedWriteOrigin, preflight } from "@/lib/public-api";

const leadSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(254),
  phone: z.string().trim().max(40).optional().default(""),
  service: z.string().trim().max(120).optional().default("Consulta general"),
  message: z.string().trim().min(10).max(2000),
  consent: z.literal(true),
  website: z.string().max(200).optional().default(""),
  startedAt: z.number().int().positive(),
}).strict();

export function OPTIONS(request: Request) { return preflight(request, "GET, POST, OPTIONS"); }

export async function POST(request: Request) {
  const headers = corsHeaders(request, "GET, POST, OPTIONS");
  const fail = (error: string, status: number) => Response.json({ error }, { status, headers });
  if (!isAllowedWriteOrigin(request)) return fail("Origen no autorizado.", 403);
  const length = Number(request.headers.get("content-length") || 0);
  if (length > 12_000) return fail("La solicitud supera el tamaño permitido.", 413);
  let raw: unknown;
  try { raw = await request.json(); } catch { return fail("Revisa los datos del formulario.", 400); }
  const parsed = leadSchema.safeParse(raw);
  if (!parsed.success) return fail("Revisa tu nombre, correo, mensaje y autorización de privacidad.", 400);
  if (parsed.data.website) return Response.json({ ok: true }, { status: 201, headers });
  const elapsed = Date.now() - parsed.data.startedAt;
  if (elapsed < 2500 || elapsed > 24 * 60 * 60 * 1000) return fail("No se pudo validar el envío. Recarga la página e inténtalo de nuevo.", 400);
  if (!env.DB || !env.RATE_LIMIT_SALT) return fail("El formulario no está disponible temporalmente.", 503);

  try {
    const clientIp = request.headers.get("cf-connecting-ip") || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`${env.RATE_LIMIT_SALT}:${clientIp}`));
    const clientHash = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
    const now = Date.now();
    const cutoff = now - 15 * 60 * 1000;
    const limit = await env.DB.prepare("INSERT INTO request_limits (client_hash, window_start, count) VALUES (?, ?, 1) ON CONFLICT(client_hash) DO UPDATE SET count = CASE WHEN request_limits.window_start <= ? THEN 1 ELSE request_limits.count + 1 END, window_start = CASE WHEN request_limits.window_start <= ? THEN excluded.window_start ELSE request_limits.window_start END RETURNING count")
      .bind(clientHash, now, cutoff, cutoff).first<{ count: number }>();
    if ((limit?.count ?? 1) > 4) return fail("Se alcanzó el límite temporal de solicitudes. Inténtalo más tarde.", 429);
    const id = crypto.randomUUID();
    await env.DB.prepare("INSERT INTO leads (id, name, email, phone, service, message, status, created_at) VALUES (?, ?, ?, ?, ?, ?, 'new', ?)")
      .bind(id, parsed.data.name, parsed.data.email, parsed.data.phone || null, parsed.data.service || "Consulta general", parsed.data.message, new Date().toISOString()).run();
    if (Math.random() < 0.03) await env.DB.prepare("DELETE FROM request_limits WHERE window_start < ?").bind(now - 24 * 60 * 60 * 1000).run();
    return Response.json({ ok: true }, { status: 201, headers });
  } catch {
    return fail("No fue posible guardar tu solicitud. Intenta de nuevo más tarde.", 503);
  }
}

export async function GET() {
  try {
    await requireAdminApi();
    if (!env.DB) return Response.json({ error: "La base de datos no está disponible." }, { status: 503 });
    const result = await env.DB.prepare("SELECT id, name, email, phone, service, message, status, created_at FROM leads ORDER BY created_at DESC LIMIT 200").all();
    return Response.json({ leads: result.results }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return authErrorResponse(error); }
}
