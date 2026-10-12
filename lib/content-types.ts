export type ServiceItem = { id: string; title: string; description: string; visible: boolean };
export type ProjectItem = { id: string; title: string; description: string; image: string; imageAlt: string; url: string; visible: boolean };
export type FaqItem = { id: string; question: string; answer: string; visible: boolean };
export type ProcessStep = { id: string; title: string; description: string; visible: boolean };

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
  projects: ProjectItem[];
  projectsEnabled: boolean;
  processSteps: ProcessStep[];
  faqs: FaqItem[];
  sectionVisibility: Record<"services" | "about" | "portfolio" | "process" | "faq" | "contact", boolean>;
  sectionsOrder: ("services" | "about" | "portfolio" | "process" | "faq" | "contact")[];
  seo: { title: string; description: string };
};

