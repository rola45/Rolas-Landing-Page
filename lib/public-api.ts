import { env } from "cloudflare:workers";

export function isAllowedWriteOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    const parsed = new URL(origin).origin;
    const siteOrigin = new URL(request.url).origin;
    const pagesOrigin = env.PUBLIC_SITE_ORIGIN ? new URL(env.PUBLIC_SITE_ORIGIN).origin : "";
    return parsed === siteOrigin || (!!pagesOrigin && parsed === pagesOrigin);
  } catch { return false; }
}

export function corsHeaders(request: Request, methods = "GET, OPTIONS") {
  const origin = request.headers.get("origin");
  const allowed = isAllowedWriteOrigin(request);
  const headers = new Headers({ "Vary": "Origin", "Access-Control-Allow-Methods": methods, "Access-Control-Allow-Headers": "Content-Type", "Access-Control-Max-Age": "600" });
  if (allowed && origin) headers.set("Access-Control-Allow-Origin", origin);
  return headers;
}

export function preflight(request: Request, methods: string) {
  if (!isAllowedWriteOrigin(request)) return new Response(null, { status: 403 });
  return new Response(null, { status: 204, headers: corsHeaders(request, methods) });
}
