import { env } from "cloudflare:workers";
import { z } from "zod";
import { DEFAULT_CONTENT } from "./default-content";
import type { SiteContent } from "./content-types";
export { DEFAULT_CONTENT } from "./default-content";
export type { SiteContent, ServiceItem, ProjectItem, FaqItem, ProcessStep } from "./content-types";

const safeImage = z.string().max(500).refine((v) => !v || v.startsWith("/media/images/") || /^https:\/\//i.test(v));
const serviceSchema = z.object({ id: z.string().min(1).max(80), title: z.string().trim().min(1).max(100), description: z.string().trim().max(500), visible: z.boolean() }).strict();
const idText = z.string().min(1).max(100);
const httpsOrEmpty = z.string().max(500).refine((v) => !v || /^https:\/\//i.test(v));

export const siteContentSchema = z.object({
  brandName: z.string().trim().min(1).max(80),
  displayName: z.string().trim().min(1).max(100),
  role: z.string().trim().min(1).max(120),
  heroEyebrow: z.string().trim().max(120),
  heroTitle: z.string().trim().min(1).max(160),
  heroDescription: z.string().trim().min(1).max(600),
  heroCta: z.string().trim().min(1).max(80),
  aboutTitle: z.string().trim().min(1).max(160),
  aboutText: z.string().trim().min(1).max(1400),
  profileImage: safeImage,
  profileImageAlt: z.string().trim().max(180),
  contact: z.object({
    email: z.union([z.literal(""), z.string().email().max(254)]),
    phone: z.string().max(40).regex(/^[+0-9()\s.-]*$/),
    whatsappNumber: z.string().max(30).regex(/^[0-9\s+()-]*$/),
    privacyAddress: z.string().trim().max(400),
  }).strict(),
  socials: z.array(z.object({ id: idText, label: z.string().trim().min(1).max(60), url: httpsOrEmpty, visible: z.boolean() }).strict()).max(12),
  services: z.object({ digital: z.array(serviceSchema).max(20), equipment: z.array(serviceSchema).max(20) }).strict(),
  projects: z.array(z.object({ id: idText, title: z.string().trim().min(1).max(120), description: z.string().trim().max(700), image: safeImage, imageAlt: z.string().trim().max(180), url: httpsOrEmpty, visible: z.boolean() }).strict()).max(30),
  projectsEnabled: z.boolean(),
  processSteps: z.array(z.object({ id: idText, title: z.string().trim().min(1).max(100), description: z.string().trim().max(500), visible: z.boolean() }).strict()).max(10),
  faqs: z.array(z.object({ id: idText, question: z.string().trim().min(1).max(240), answer: z.string().trim().min(1).max(900), visible: z.boolean() }).strict()).max(40),
  sectionVisibility: z.object({ services: z.boolean(), about: z.boolean(), portfolio: z.boolean(), process: z.boolean(), faq: z.boolean(), contact: z.boolean() }).strict(),
  sectionsOrder: z.array(z.enum(["services", "about", "portfolio", "process", "faq", "contact"])).length(6),
  seo: z.object({ title: z.string().trim().min(1).max(160), description: z.string().trim().min(1).max(320) }).strict(),
}).strict().refine((value) => new Set(value.sectionsOrder).size === 6, { message: "El orden de secciones contiene valores repetidos." });

export async function getSiteContent(): Promise<SiteContent> {
  try {
    const row = await env.DB?.prepare("SELECT payload FROM site_content WHERE id = ?")
      .bind("main").first<{ payload: string }>();
    if (!row?.payload) return DEFAULT_CONTENT;
    const parsed = siteContentSchema.safeParse(JSON.parse(row.payload));
    return parsed.success ? parsed.data : DEFAULT_CONTENT;
  } catch {
    return DEFAULT_CONTENT;
  }
}

export async function saveSiteContent(content: SiteContent): Promise<void> {
  if (!env.DB) throw new Error("La base de datos no está disponible.");
  await env.DB.prepare("INSERT INTO site_content (id, payload, updated_at) VALUES (?, ?, ?) ON CONFLICT(id) DO UPDATE SET payload = excluded.payload, updated_at = excluded.updated_at")
    .bind("main", JSON.stringify(content), new Date().toISOString()).run();
}
