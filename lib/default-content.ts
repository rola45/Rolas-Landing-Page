import type { SiteContent, ServiceItem, FaqItem, ProcessStep } from "./content-types";

const service = (id: string, title: string, description: string): ServiceItem => ({ id, title, description, visible: true });
const faq = (id: string, question: string, answer: string): FaqItem => ({ id, question, answer, visible: true });
const step = (id: string, title: string, description: string): ProcessStep => ({ id, title, description, visible: true });

export const DEFAULT_CONTENT: SiteContent = {
  brandName: "RV Solutions",
  displayName: "Rolando Victorio",
  role: "Desarrollo y soporte tecnológico",
  heroEyebrow: "TECNOLOGÍA CON PROPÓSITO",
  heroTitle: "Soluciones digitales hechas para avanzar.",
  heroDescription: "Desarrollo de aplicaciones, sitios y sistemas web a medida, además de soporte tecnológico para que tus equipos sigan funcionando.",
  heroCta: "Solicitar cotización",
  aboutTitle: "Tecnología clara, soluciones a tu medida.",
  aboutText: "Soy Rolando Victorio. Me dedico al desarrollo de aplicaciones, sitios y sistemas web, así como al soporte y mantenimiento de equipos de cómputo. Primero entiendo lo que necesitas; después, propongo una solución práctica y te acompaño durante el proceso.",
  profileImage: "",
  profileImageAlt: "Retrato de Rolando Victorio",
  heroImage: "",
  heroImageAlt: "Retrato de Rolando Victorio",
  contact: { email: "", phone: "", whatsappNumber: "", privacyAddress: "" },
  socials: [
    { id: "facebook", label: "Facebook", url: "https://www.facebook.com/rolando.victorio/", visible: true },
    { id: "linkedin", label: "LinkedIn", url: "https://www.linkedin.com/in/jose-rolando-victorio-lopez-981062151/", visible: true },
  ],
  services: {
    digital: [
      service("apps", "Aplicaciones", "Desarrollo de aplicaciones pensadas alrededor de una necesidad concreta."),
      service("websites", "Páginas web", "Diseño y desarrollo de sitios claros, rápidos y adaptables a cada pantalla."),
      service("systems", "Sistemas web a medida", "Herramientas web creadas para organizar procesos y facilitar el trabajo diario."),
    ],
    equipment: [
      service("support", "Soporte y mantenimiento", "Atención preventiva y correctiva para equipos de cómputo."),
      service("software", "Programas y licencias", "Instalación y configuración de programas con licencias válidas."),
      service("updates", "Actualización de equipos", "Mejoras de hardware y software de acuerdo con las necesidades del equipo."),
    ],
  },
  projects: [],
  projectsEnabled: false,
  processSteps: [
    step("diagnostico", "Diagnóstico", "Conversamos sobre tu necesidad, el equipo o el proceso que quieres resolver."),
    step("propuesta", "Propuesta", "Definimos alcance, prioridades y una ruta de trabajo clara."),
    step("implementacion", "Implementación", "Desarrollamos o atendemos la solución acordada."),
    step("seguimiento", "Seguimiento", "Revisamos el resultado y atendemos los siguientes pasos."),
  ],
  faqs: [
    faq("cotizacion", "¿Cómo solicito una cotización?", "Cuéntame qué necesitas en el formulario de contacto. Con esa información podremos conversar sobre el alcance adecuado."),
    faq("soporte", "¿Puedo solicitar soporte para mi equipo?", "Sí. Describe el equipo y el problema que presenta para valorar el tipo de atención que necesitas."),
    faq("licencias", "¿Instalas cualquier programa?", "La instalación y configuración se realiza con licencias válidas. Comparte el programa que necesitas para revisar el alcance."),
    faq("proyectos", "¿Puedo pedir un sistema web para mi proceso?", "Sí. Los sistemas web a medida forman parte de los servicios. El primer paso es entender el proceso y lo que quieres mejorar."),
  ],
  sectionVisibility: { services: true, about: true, portfolio: false, process: true, faq: true, contact: true },
  sectionsOrder: ["services", "about", "portfolio", "process", "faq", "contact"],
  seo: {
    title: "RV Solutions | Rolando Victorio — Desarrollo y soporte tecnológico",
    description: "Desarrollo de aplicaciones, páginas y sistemas web a medida, soporte técnico, mantenimiento y actualización de equipos.",
  },
};

