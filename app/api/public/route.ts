import { getSiteContent } from "@/lib/site-content";
import { corsHeaders, preflight } from "@/lib/public-api";

export function OPTIONS(request: Request) { return preflight(request, "GET, OPTIONS", true); }

export async function GET(request: Request) {
  const headers = corsHeaders(request, "GET, OPTIONS", true);
  if (request.headers.get("origin") && !headers.has("Access-Control-Allow-Origin")) {
    return Response.json({ error: "Origen no autorizado." }, { status: 403 });
  }
  headers.set("Content-Type", "application/json; charset=utf-8");
  headers.set("Cache-Control", "no-store");
  headers.set("X-Content-Type-Options", "nosniff");
  return new Response(JSON.stringify({ content: await getSiteContent() }), { status: 200, headers });
}
