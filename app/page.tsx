import type { Metadata } from "next";
import { getSiteContent, siteContentSchema } from "@/lib/site-content";
import { LandingSite } from "@/app/components/landing-site";

const siteOrigin = "https://rv-solutions-tecnologia.rolandovictorio.chatgpt.site";
export const dynamic = "force-dynamic";

async function getLandingContent() {
  if (process.env.NODE_ENV !== "development") return getSiteContent();
  try {
    const response = await fetch(`${siteOrigin}/api/public`, { cache: "no-store" });
    if (!response.ok) return getSiteContent();
    const result = await response.json() as { content?: unknown };
    const parsed = siteContentSchema.safeParse(result.content);
    if (!parsed.success) return getSiteContent();
    const remoteMedia = (path: string) => path.startsWith("/media/") ? `${siteOrigin}${path}` : path;
    return {
      ...parsed.data,
      profileImage: remoteMedia(parsed.data.profileImage),
      projects: parsed.data.projects.map((project) => ({ ...project, image: remoteMedia(project.image) })),
    };
  } catch {
    return getSiteContent();
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const content = await getLandingContent();
  return {
    title: content.seo.title,
    description: content.seo.description,
    metadataBase: new URL(siteOrigin),
    alternates: { canonical: "/" },
    openGraph: { title: content.seo.title, description: content.seo.description, type: "website", locale: "es_MX", siteName: content.brandName },
    twitter: { card: "summary_large_image", title: content.seo.title, description: content.seo.description },
  };
}
export default async function Home() {
  const content = await getLandingContent();
  return <LandingSite content={content} />;
}
