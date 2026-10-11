import type { Metadata } from "next";
import { getSiteContent } from "@/lib/site-content";
import { LandingSite } from "@/app/components/landing-site";

const siteOrigin = "https://rv-solutions-tecnologia.rolandovictorio.chatgpt.site";
export const dynamic = "force-dynamic";
export async function generateMetadata(): Promise<Metadata> {
  const content = await getSiteContent();
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
  const content = await getSiteContent();
  return <LandingSite content={content} />;
}
