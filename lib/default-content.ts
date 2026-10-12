import type { SiteContent, ServiceItem, FaqItem, ProcessStep, TechnologyItem } from "./content-types";

const service = (id: string, title: string, description: string): ServiceItem => ({ id, title, description, visible: true });
const faq = (id: string, question: string, answer: string): FaqItem => ({ id, question, answer, visible: true });
const step = (id: string, title: string, description: string): ProcessStep => ({ id, title, description, visible: true });
const technology = (id: TechnologyItem["icon"], name: string): TechnologyItem => ({ id, name, icon: id, visible: true });
const bilingual = (es: string, en: string) => ({ es, en });

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
  technologies: [
    technology("nextjs", "Next.js"), technology("react", "React"), technology("typescript", "TypeScript"), technology("vite", "Vite"),
    technology("tailwindcss", "Tailwind CSS"), technology("python", "Python"), technology("fastapi", "FastAPI"), technology("nestjs", "NestJS"),
    technology("prisma", "Prisma"), technology("postgresql", "PostgreSQL"), technology("cloudflare", "Cloudflare"), technology("render", "Render"),
    technology("docker", "Docker"), technology("rust", "Rust"), technology("tauri", "Tauri"), technology("swift", "Swift"),
  ],
  pageCopy: {
    services: {
      kicker: bilingual("LO QUE PUEDO HACER POR TI", "WHAT I CAN DO FOR YOU"),
      titlePrimary: bilingual("Tecnología útil.", "Useful technology."),
      titleSecondary: bilingual("Trabajo que fluye.", "Work that flows."),
      description: bilingual("Servicios pensados para resolver necesidades reales, desde una idea digital hasta el equipo que usas todos los días.", "Services designed to solve real needs, from a digital idea to the equipment you use every day."),
      digitalLabel: bilingual("01 / DIGITAL", "01 / DIGITAL"),
      digitalTitle: bilingual("Desarrollo digital", "Digital development"),
      digitalDescription: bilingual("De la idea a una herramienta clara, rápida y funcional.", "From idea to a clear, fast, and useful tool."),
      equipmentLabel: bilingual("02 / EQUIPOS", "02 / DEVICES"),
      equipmentTitle: bilingual("Soporte a equipos", "Device support"),
      equipmentDescription: bilingual("Cuidado y mejoras para que la tecnología te acompañe.", "Care and upgrades to keep your technology working for you."),
    },
    technologies: {
      kicker: bilingual("TECNOLOGÍAS EN PROYECTOS", "TECHNOLOGIES IN PROJECTS"),
      titlePrimary: bilingual("Herramientas para", "Tools for"),
      titleSecondary: bilingual("cada tipo de reto.", "every kind of challenge."),
      description: bilingual("Una selección de tecnologías utilizadas en proyectos web, sistemas, infraestructura y aplicaciones de escritorio.", "A selection of technologies used in web projects, systems, infrastructure, and desktop applications."),
      note: bilingual("La combinación se adapta a cada solución.", "The technology stack adapts to each solution."),
    },
    about: {
      kicker: bilingual("UNA PERSONA DETRÁS DE LA SOLUCIÓN", "A PERSON BEHIND THE SOLUTION"),
      action: bilingual("Cuéntame qué necesitas", "Tell me what you need"),
      artLabel: bilingual("TECNOLOGÍA · DISEÑO · SOPORTE", "TECHNOLOGY · DESIGN · SUPPORT"),
    },
    portfolio: {
      kicker: bilingual("PROYECTOS SELECCIONADOS", "SELECTED PROJECTS"),
      titlePrimary: bilingual("Ideas que toman", "Ideas taking"),
      titleSecondary: bilingual("forma digital.", "digital shape."),
      description: bilingual("Una selección de proyectos y soluciones desarrolladas.", "A selection of projects and solutions developed."),
    },
    process: {
      kicker: bilingual("ASÍ TRABAJAMOS", "HOW WE WORK"),
      titlePrimary: bilingual("Un camino claro,", "A clear path,"),
      titleSecondary: bilingual("de principio a fin.", "from start to finish."),
      description: bilingual("Cada proyecto comienza por entender lo que necesitas y avanza con acuerdos claros.", "Every project starts by understanding what you need and moves forward with clear agreements."),
    },
    faq: {
      kicker: bilingual("PREGUNTAS FRECUENTES", "FREQUENTLY ASKED QUESTIONS"),
      titlePrimary: bilingual("Hablemos claro", "Let's be clear"),
      titleSecondary: bilingual("desde el inicio.", "from the start."),
      description: bilingual("Respuestas breves para ayudarte a dar el siguiente paso.", "Straightforward answers to help you take the next step."),
      action: bilingual("¿Tienes otra pregunta? Escríbeme", "Have another question? Get in touch"),
    },
    contact: {
      kicker: bilingual("EL PRIMER PASO ES CONVERSAR", "THE FIRST STEP IS A CONVERSATION"),
      titlePrimary: bilingual("¿Qué te gustaría", "What would you like"),
      titleSecondary: bilingual("hacer posible?", "to make possible?"),
      description: bilingual("Cuéntame sobre tu idea o el problema que necesitas resolver. Revisaré tu solicitud y podremos definir el siguiente paso.", "Tell me about your idea or the problem you need to solve. I’ll review your request and we can decide on the next step."),
      qrEyebrow: bilingual("ACCESO RÁPIDO", "QUICK ACCESS"),
      qrTitle: bilingual("¿Vas a continuar desde otro dispositivo?", "Picking this up on another device?"),
      qrAction: bilingual("Escanea y solicita una cotización", "Scan to request a quote"),
    },
    footer: {
      tagline: bilingual("Desarrollo y soporte tecnológico", "Technology development and support"),
      backToTop: bilingual("Volver al inicio", "Back to top"),
      privacy: bilingual("Aviso de privacidad", "Privacy notice"),
      socials: bilingual("Redes sociales", "Social media"),
    },
  },
  accentColor: "#3778f6",
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

