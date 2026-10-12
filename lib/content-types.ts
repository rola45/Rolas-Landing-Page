export type ServiceItem = { id: string; title: string; description: string; visible: boolean };
export type ProjectItem = { id: string; title: string; description: string; image: string; imageAlt: string; url: string; visible: boolean };
export type FaqItem = { id: string; question: string; answer: string; visible: boolean };
export type ProcessStep = { id: string; title: string; description: string; visible: boolean };
export type LocalizedText = { es: string; en: string };
export type TechnologyIcon = "nextjs" | "react" | "typescript" | "vite" | "tailwindcss" | "python" | "fastapi" | "nestjs" | "prisma" | "postgresql" | "cloudflare" | "render" | "docker" | "rust" | "tauri" | "swift";
export type TechnologyItem = { id: string; name: string; icon: TechnologyIcon; visible: boolean };

export type PageCopy = {
  services: { kicker: LocalizedText; titlePrimary: LocalizedText; titleSecondary: LocalizedText; description: LocalizedText; digitalLabel: LocalizedText; digitalTitle: LocalizedText; digitalDescription: LocalizedText; equipmentLabel: LocalizedText; equipmentTitle: LocalizedText; equipmentDescription: LocalizedText };
  technologies: { kicker: LocalizedText; titlePrimary: LocalizedText; titleSecondary: LocalizedText; description: LocalizedText; note: LocalizedText };
  about: { kicker: LocalizedText; action: LocalizedText; artLabel: LocalizedText };
  portfolio: { kicker: LocalizedText; titlePrimary: LocalizedText; titleSecondary: LocalizedText; description: LocalizedText };
  process: { kicker: LocalizedText; titlePrimary: LocalizedText; titleSecondary: LocalizedText; description: LocalizedText };
  faq: { kicker: LocalizedText; titlePrimary: LocalizedText; titleSecondary: LocalizedText; description: LocalizedText; action: LocalizedText };
  contact: { kicker: LocalizedText; titlePrimary: LocalizedText; titleSecondary: LocalizedText; description: LocalizedText; qrEyebrow: LocalizedText; qrTitle: LocalizedText; qrAction: LocalizedText };
  footer: { tagline: LocalizedText; backToTop: LocalizedText; privacy: LocalizedText; socials: LocalizedText };
};

export type SiteContent = {
  brandName: string;
  displayName: string;
  role: string;
  heroEyebrow: string;
  heroTitle: string;
  heroDescription: string;
  heroCta: string;
  aboutTitle: string;
  aboutText: string;
  profileImage: string;
  profileImageAlt: string;
  heroImage: string;
  heroImageAlt: string;
  contact: { email: string; phone: string; whatsappNumber: string; privacyAddress: string };
  socials: { id: string; label: string; url: string; visible: boolean }[];
  services: { digital: ServiceItem[]; equipment: ServiceItem[] };
  technologies: TechnologyItem[];
  pageCopy: PageCopy;
  accentColor: string;
  projects: ProjectItem[];
  projectsEnabled: boolean;
  processSteps: ProcessStep[];
  faqs: FaqItem[];
  sectionVisibility: Record<"services" | "about" | "portfolio" | "process" | "faq" | "contact", boolean>;
  sectionsOrder: ("services" | "about" | "portfolio" | "process" | "faq" | "contact")[];
  seo: { title: string; description: string };
};

