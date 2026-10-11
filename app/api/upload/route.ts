import { env } from "cloudflare:workers";
import { AdminAuthError, authErrorResponse, requireAdminApi, requireSameOrigin } from "@/lib/admin-auth";

function imageType(bytes: Uint8Array): { type: string; extension: string } | null {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return { type: "image/jpeg", extension: "jpg" };
  if (bytes.length >= 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47 && bytes[4] === 0x0d && bytes[5] === 0x0a && bytes[6] === 0x1a && bytes[7] === 0x0a) return { type: "image/png", extension: "png" };
  if (bytes.length >= 12 && new TextDecoder().decode(bytes.subarray(0, 4)) === "RIFF" && new TextDecoder().decode(bytes.subarray(8, 12)) === "WEBP") return { type: "image/webp", extension: "webp" };
  return null;
}

export async function POST(request: Request) {
  if (!requireSameOrigin(request)) return Response.json({ error: "Origen no autorizado." }, { status: 403 });
  try {
    await requireAdminApi();
    if (!env.BUCKET) return Response.json({ error: "El almacenamiento de imágenes no está disponible." }, { status: 503 });
    const declaredSize = Number(request.headers.get("content-length") || 0);
    if (declaredSize > 5_500_000) return Response.json({ error: "La imagen supera el límite de 5 MB." }, { status: 413 });
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return Response.json({ error: "Selecciona una imagen." }, { status: 400 });
    if (file.size < 1 || file.size > 5 * 1024 * 1024) return Response.json({ error: "La imagen debe pesar menos de 5 MB." }, { status: 413 });
    const bytes = new Uint8Array(await file.arrayBuffer());
    const detected = imageType(bytes);
    if (!detected) return Response.json({ error: "Solo se admiten imágenes JPG, PNG o WebP válidas." }, { status: 415 });
    const key = `images/${crypto.randomUUID()}.${detected.extension}`;
    await env.BUCKET.put(key, bytes, { httpMetadata: { contentType: detected.type, cacheControl: "public, max-age=31536000, immutable" } });
    return Response.json({ url: `/media/${key}` }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof AdminAuthError) return authErrorResponse(error);
    return Response.json({ error: "No se pudo guardar la imagen." }, { status: 500 });
  }
}
