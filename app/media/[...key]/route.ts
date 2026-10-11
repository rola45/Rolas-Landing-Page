import { env } from "cloudflare:workers";

type Context = { params: Promise<{ key: string[] }> };

export async function GET(_request: Request, context: Context) {
  const { key: pieces } = await context.params;
  const key = pieces.join("/");
  if (!/^images\/[0-9a-f-]{36}\.(jpg|png|webp)$/.test(key) || !env.BUCKET) return new Response("No encontrado", { status: 404 });
  const object = await env.BUCKET.get(key);
  if (!object) return new Response("No encontrado", { status: 404 });
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("ETag", object.httpEtag);
  headers.set("Cache-Control", "public, max-age=31536000, immutable");
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("Content-Security-Policy", "default-src 'none'; sandbox");
  return new Response(object.body, { headers });
}
