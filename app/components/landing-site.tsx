"use client";

import { cloneElement, createContext, isValidElement, useContext, useMemo, useState, useEffect, useSyncExternalStore } from "react";
import type { CSSProperties, MouseEvent, ReactNode } from "react";
import { ArrowDown, ArrowDownRight, ArrowRight, ArrowUpRight, ChevronDown, Code2, Cpu, ExternalLink, Globe2, MessageCircle, MonitorCog, Moon, Sparkles, Sun, Wrench } from "lucide-react";
import type { SiteContent } from "@/lib/content-types";
import { translateCopy, translateSiteContent, type SiteLanguage } from "@/lib/site-translation";
import { LeadForm } from "@/app/components/lead-form";
import { IdeaPreview } from "@/app/components/idea-preview";
import { ScrollEffects } from "@/app/components/scroll-effects";

type Theme = "light" | "dark";
const SiteLanguageContext = createContext<SiteLanguage>("es");
function useSiteLanguage() { return useContext(SiteLanguageContext); }
function tx(language: SiteLanguage, value: string) { return translateCopy(value, language); }

const preferenceEvent = "rv-solutions-preference-change";
let temporaryTheme: Theme | undefined;
let temporaryLanguage: SiteLanguage | undefined;
function subscribeToPreferences(callback: () => void) {
  const notify = () => {
    document.documentElement.dataset.theme = readThemePreference();
    document.documentElement.lang = readLanguagePreference() === "en" ? "en" : "es-MX";
    callback();
  };
  window.addEventListener("storage", notify);
  window.addEventListener(preferenceEvent, notify);
  return () => { window.removeEventListener("storage", notify); window.removeEventListener(preferenceEvent, notify); };
}
function readThemePreference(): Theme {
  try { return window.localStorage.getItem("rv-solutions-theme") === "dark" ? "dark" : "light"; }
  catch { return temporaryTheme ?? "light"; }
}
function readLanguagePreference(): SiteLanguage {
  try { return window.localStorage.getItem("rv-solutions-language") === "en" ? "en" : "es"; }
  catch { return temporaryLanguage ?? "es"; }
}
function savePreference(key: "rv-solutions-theme" | "rv-solutions-language", value: Theme | SiteLanguage) {
  try {
    window.localStorage.setItem(key, value);
    if (key === "rv-solutions-theme") temporaryTheme = undefined;
    else temporaryLanguage = undefined;
  } catch {
    if (key === "rv-solutions-theme") temporaryTheme = value as Theme;
    else temporaryLanguage = value as SiteLanguage;
  }
  window.dispatchEvent(new Event(preferenceEvent));
}

function translateNode(node: ReactNode, language: SiteLanguage): ReactNode {
  if (typeof node === "string") return tx(language, node);
  if (Array.isArray(node)) return node.map((child) => translateNode(child, language));
  if (!isValidElement<{ children?: ReactNode }>(node) || node.props.children === undefined) return node;
  return cloneElement(node, { children: translateNode(node.props.children, language) });
}

function visibleSections(content: SiteContent) {
  const projects = content.projectsEnabled && content.projects.some((project) => project.visible);
  return content.sectionsOrder.filter((key) => content.sectionVisibility[key] && (key !== "portfolio" || projects));
}

function Header({ content, sections, theme, onThemeToggle, onLanguageToggle }: { content: SiteContent; sections: string[]; theme: Theme; onThemeToggle: () => void; onLanguageToggle: () => void }) {
  const language = useSiteLanguage();
  const labels: Record<string, string> = { services: tx(language, "Servicios"), about: tx(language, "Sobre mí"), portfolio: tx(language, "Proyectos"), process: tx(language, "Proceso"), faq: tx(language, "Preguntas"), contact: tx(language, "Contacto") };
  const sectionId: Record<string, string> = { services: "servicios", about: "sobre-mi", portfolio: "proyectos", process: "proceso", faq: "preguntas", contact: "contacto" };
  const closeMobileMenu = (event: MouseEvent<HTMLAnchorElement>) => { const menu = event.currentTarget.closest("details"); if (menu) menu.open = false; };
  return <header className="site-header">
    <a className="brand-lockup" href="#inicio" aria-label={`${content.brandName}, inicio`}>
      <span className="brand-mark">RV<span>.</span></span>
      <span className="brand-name">{content.brandName}</span>
    </a>
    <nav className="desktop-nav" aria-label={tx(language, "Navegación principal")}>
      {sections.map((section) => <a key={section} href={`#${sectionId[section]}`}>{labels[section]}</a>)}
    </nav>
    <div className="header-actions">
      <div className="header-preferences">
        <button className="preference-button theme-toggle" type="button" onClick={onThemeToggle} aria-label={tx(language, theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro")} aria-pressed={theme === "dark"} title={tx(language, theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro")}>
          <span className="t-icon-swap" data-state={theme === "dark" ? "a" : "b"} aria-hidden="true"><span className="t-icon" data-icon="a"><Sun size={17} /></span><span className="t-icon" data-icon="b"><Moon size={17} /></span></span>
        </button>
        <button className="preference-button language-toggle" type="button" onClick={onLanguageToggle} aria-label={language === "es" ? "Switch to English" : "Switch to Spanish"} title={language === "es" ? "Switch to English" : "Switch to Spanish"}>
          <Globe2 size={15} aria-hidden="true" /><span key={language} className="language-toggle-label">{language === "es" ? "EN" : "ES"}</span>
        </button>
      </div>
      <a className="header-cta" href="#contacto">{tx(language, "Cotizar")} <ArrowUpRight size={15} aria-hidden="true" /></a>
      <details className="mobile-menu">
        <summary aria-label={tx(language, "Abrir menú de navegación")}><span></span><span></span></summary>
        <nav aria-label={tx(language, "Navegación móvil")}>
          {sections.map((section) => <a key={section} href={`#${sectionId[section]}`} onClick={closeMobileMenu}>{labels[section]}</a>)}
          <a className="mobile-cta" href="#contacto" onClick={closeMobileMenu}>{tx(language, "Solicitar cotización")} <ArrowUpRight size={16} /></a>
        </nav>
      </details>
    </div>
  </header>;
}

function Eyebrow({ children }: { children: ReactNode }) { const language = useSiteLanguage(); return <p className="eyebrow"><span className="eyebrow-dot" />{translateNode(children, language)}</p>; }

function Hero({ content, apiBase }: { content: SiteContent; apiBase: string }) {
  const language = useSiteLanguage();
  return <section id="inicio" className="hero-section">
    <div className="hero-grid">
      <div className="hero-copy" data-reveal>
        <Eyebrow>{content.heroEyebrow}</Eyebrow>
        <p className="hero-attribution"><span>{content.displayName}</span><span aria-hidden="true"> — </span>{content.role}</p>
        <h1>{content.heroTitle}</h1>
        <p className="hero-description">{content.heroDescription}</p>
        <div className="hero-actions">
          <a className="button button-electric" href="#contacto">{content.heroCta}<ArrowUpRight size={17} aria-hidden="true" /></a>
          <a className="button button-quiet" href="#servicios">{tx(language, "Conocer servicios")}<ArrowDown size={15} aria-hidden="true" /></a>
          <a className="hero-idea-link" href="#idea-preview"><Sparkles size={14} aria-hidden="true" />{tx(language, "Ver una idea de sitio")}<ArrowRight size={14} aria-hidden="true" /></a>
        </div>
      </div>
      <div className="hero-visual" data-parallax>
        {content.heroImage ? <figure className="hero-portrait">
          <img src={resolveMedia(content.heroImage, apiBase)} alt={content.heroImageAlt || `Retrato de ${content.displayName}`} loading="eager" fetchPriority="high" />
          <figcaption><span>{content.displayName}</span><span>{content.brandName}</span></figcaption>
        </figure> : <div className="hero-poster" role="img" aria-label={`${tx(language, "Composición tipográfica de")} ${content.brandName}`}>
          <span className="poster-index">RV / 01</span>
          <span className="poster-monogram">RV<span>.</span></span>
          <span className="poster-rule" />
          <span className="poster-caption">{language === "en" ? <>DEVELOPMENT<br />&amp; TECH<br /><b>SUPPORT</b></> : <>DESARROLLO<br />Y SOPORTE<br /><b>TECNOLÓGICO</b></>}</span>
          <span className="poster-orbit" />
          <span className="poster-coordinate">{content.displayName.toUpperCase()}</span>
        </div>}
        <div className="hero-visual-meta"><span>{content.brandName}</span><span>{tx(language, "DESARROLLO DIGITAL")} <i /> {tx(language, "SOPORTE TÉCNICO")}</span></div>
      </div>
    </div>
    <div className="hero-bottom"><span>{tx(language, "DESARROLLO Y SOPORTE TECNOLÓGICO")}</span><a href="#servicios" aria-label={tx(language, "Desplazarse a servicios")}><ArrowDownRight size={17} /></a></div>
  </section>;
}

function SectionHeader({ kicker, title, text, dark = false }: { kicker: string; title: ReactNode; text?: string; dark?: boolean }) {
  const language = useSiteLanguage();
  return <div className={`section-heading${dark ? " section-heading-dark" : ""}`} data-reveal><Eyebrow>{kicker}</Eyebrow><h2>{translateNode(title, language)}</h2>{text && <p>{tx(language, text)}</p>}</div>;
}

const digitalIcons = [Code2, Globe2, Sparkles];
const supportIcons = [Wrench, MonitorCog, Cpu];
function ServiceGroup({ title, note, items, group }: { title: string; note: string; items: SiteContent["services"]["digital"]; group: string }) {
  const language = useSiteLanguage();
  const icons = group === "digital" ? digitalIcons : supportIcons;
  return <div className={`service-group service-group-${group}`}>
      <div className="service-group-heading" data-reveal><div><span className="group-kicker">{group === "digital" ? "01 / DIGITAL" : `02 / ${tx(language, "EQUIPOS")}`}</span><h3>{title}</h3></div><p>{note}</p></div>
    <div className="service-list">
      {items.filter((item) => item.visible).map((item, index) => { const Icon = icons[index % icons.length]; return <article key={item.id} className="service-row" data-reveal style={{ "--reveal-delay": `${index * 75}ms` } as CSSProperties}>
        <span className="service-index">{String(index + 1).padStart(2, "0")}</span>
        <span className="service-icon"><Icon size={19} strokeWidth={1.7} aria-hidden="true" /></span>
        <div className="service-copy"><h4>{item.title}</h4><p>{item.description}</p></div>
        <a href="#contacto" aria-label={`${tx(language, "Solicitar información sobre")} ${item.title}`} className="service-link"><ArrowUpRight size={17} /></a>
      </article>; })}
    </div>
  </div>;
}

function Services({ content, apiBase, onRequestQuote }: { content: SiteContent; apiBase: string; onRequestQuote: (summary: string) => void }) {
  const language = useSiteLanguage();
  return <section id="servicios" className="section section-services">
    <div className="section-shell"><SectionHeader kicker="LO QUE PUEDO HACER POR TI" title={<>Tecnología útil.<br /><span>Trabajo que fluye.</span></>} text="Servicios pensados para resolver necesidades reales, desde una idea digital hasta el equipo que usas todos los días." />
      <ServiceGroup title={tx(language, "Desarrollo digital")} note={tx(language, "De la idea a una herramienta clara, rápida y funcional.")} items={content.services.digital} group="digital" />
      <ServiceGroup title={tx(language, "Soporte a equipos")} note={tx(language, "Cuidado y mejoras para que la tecnología te acompañe.")} items={content.services.equipment} group="equipment" />
      <IdeaPreview language={language} apiBase={apiBase} onRequestQuote={onRequestQuote} />
    </div>
  </section>;
}

const technologies = [
  { name: "Next.js", icon: "nextjs" }, { name: "React", icon: "react" },
  { name: "TypeScript", icon: "typescript" }, { name: "Vite", icon: "vite" },
  { name: "Tailwind CSS", icon: "tailwindcss" }, { name: "Python", icon: "python" },
  { name: "FastAPI", icon: "fastapi" }, { name: "NestJS", icon: "nestjs" },
  { name: "Prisma", icon: "prisma" }, { name: "PostgreSQL", icon: "postgresql" },
  { name: "Cloudflare", icon: "cloudflare" }, { name: "Render", icon: "render" },
  { name: "Docker", icon: "docker" }, { name: "Rust", icon: "rust" },
  { name: "Tauri", icon: "tauri" }, { name: "Swift", icon: "swift" },
];

function TechnologyPanel({ assetBase }: { assetBase: string }) {
  const language = useSiteLanguage();
  const base = assetBase.endsWith("/") ? assetBase : `${assetBase}/`;
  return <div className="section-shell technology-panel" data-reveal aria-labelledby="technology-panel-title">
    <div className="technology-panel-copy">
      <Eyebrow>TECNOLOGÍAS EN PROYECTOS</Eyebrow>
      <h3 id="technology-panel-title">{tx(language, "Herramientas para")}<br /><span>{tx(language, "cada tipo de reto.")}</span></h3>
      <p>{tx(language, "Una selección de tecnologías utilizadas en proyectos web, sistemas, infraestructura y aplicaciones de escritorio.")}</p>
      <span className="technology-panel-note">{tx(language, "La combinación se adapta a cada solución.")}</span>
    </div>
    <ul className="technology-grid" aria-label={tx(language, "Tecnologías utilizadas")}>
      {technologies.map((technology) => <li className="technology-card" key={technology.name}>
        <img src={`${base}assets/technology-icons/${technology.icon}.svg`} alt="" aria-hidden="true" loading="lazy" decoding="async" />
        <span>{technology.name}</span>
      </li>)}
    </ul>
  </div>;
}

function About({ content, apiBase, assetBase }: { content: SiteContent; apiBase: string; assetBase: string }) {
  const language = useSiteLanguage();
  return <section id="sobre-mi" className="section section-about">
    <div className="section-shell about-layout">
      <div className="about-art" data-reveal>
        <div className="portrait-frame">
          {content.profileImage ? <img src={resolveMedia(content.profileImage, apiBase)} alt={content.profileImageAlt || `Retrato de ${content.displayName}`} className="portrait-image" loading="lazy" /> : <div className="portrait-placeholder"><div className="portrait-grid" /><span className="portrait-initials">RV<span>.</span></span><span className="portrait-pending">{tx(language, "Fotografía por agregar")}</span></div>}
          <div className="portrait-tag"><span className="status-pulse" />{content.brandName}</div>
        </div>
        <span className="about-orbit about-orbit-one" /><span className="about-orbit about-orbit-two" />
        <span className="about-coordinate">{tx(language, "TECNOLOGÍA · DISEÑO · SOPORTE")}</span>
      </div>
      <div className="about-copy" data-reveal>
        <Eyebrow>UNA PERSONA DETRÁS DE LA SOLUCIÓN</Eyebrow>
        <h2>{content.aboutTitle}</h2>
        <p>{content.aboutText}</p>
        <div className="about-signature"><span className="signature-line" /><div><b>{content.displayName}</b><span>{content.role}</span></div></div>
        <a className="text-link" href="#contacto">{tx(language, "Cuéntame qué necesitas")} <ArrowRight size={16} /></a>
      </div>
    </div>
    <TechnologyPanel assetBase={assetBase} />
  </section>;
}

function Portfolio({ content, apiBase }: { content: SiteContent; apiBase: string }) {
  const language = useSiteLanguage();
  const projects = content.projects.filter((project) => project.visible);
  if (!content.projectsEnabled || !projects.length) return null;
  return <section id="proyectos" className="section section-portfolio"><div className="section-shell"><SectionHeader kicker="PROYECTOS SELECCIONADOS" title={<>Ideas que toman<br /><span>forma digital.</span></>} text="Una selección de proyectos y soluciones desarrolladas." />
    <div className="project-grid">{projects.map((project, index) => <article className="project-card" key={project.id} data-reveal style={{ "--reveal-delay": `${index * 80}ms` } as CSSProperties}>
      <div className="project-image">{project.image ? <img src={resolveMedia(project.image, apiBase)} alt={project.imageAlt || project.title} loading="lazy" /> : <div className="project-image-placeholder"><span>RV / {String(index + 1).padStart(2, "0")}</span></div>}</div>
      <div className="project-copy"><span className="group-kicker">{tx(language, "PROYECTO")}</span><h3>{project.title}</h3><p>{project.description}</p>{project.url && <a href={project.url} target="_blank" rel="noreferrer" className="text-link">{tx(language, "Ver proyecto")} <ExternalLink size={15} /></a>}</div>
    </article>)}</div>
  </div></section>;
}

function Process({ content }: { content: SiteContent }) {
  const steps = content.processSteps.filter((item) => item.visible);
  return <section id="proceso" className="section section-process"><div className="section-shell"><SectionHeader kicker="ASÍ TRABAJAMOS" title={<>Un camino claro,<br /><span>de principio a fin.</span></>} text="Cada proyecto comienza por entender lo que necesitas y avanza con acuerdos claros." />
    <div className="process-track" data-reveal>{steps.map((item, index) => <article className="process-step" key={item.id} style={{ "--reveal-delay": `${index * 90}ms` } as CSSProperties}><div className="process-marker"><span>{String(index + 1).padStart(2, "0")}</span></div><div className="process-copy"><h3>{item.title}</h3><p>{item.description}</p></div></article>)}</div>
  </div></section>;
}

function Faq({ content }: { content: SiteContent }) {
  const language = useSiteLanguage();
  return <section id="preguntas" className="section section-faq"><div className="section-shell faq-layout">
    <div><SectionHeader kicker="PREGUNTAS FRECUENTES" title={<>Hablemos claro<br /><span>desde el inicio.</span></>} text="Respuestas breves para ayudarte a dar el siguiente paso." /><a className="text-link faq-contact-link" href="#contacto">{tx(language, "¿Tienes otra pregunta? Escríbeme")} <ArrowRight size={16} /></a></div>
    <div className="faq-list">{content.faqs.filter((item) => item.visible).map((item, index) => <FaqRow item={item} key={item.id} index={index} />)}</div>
  </div></section>;
}

function FaqRow({ item, index }: { item: SiteContent["faqs"][number]; index: number }) {
  const [open, setOpen] = useState(false);
  const panelId = `faq-panel-${item.id}`;
  return <article className="faq-item t-acc" data-open={open} data-reveal style={{ "--reveal-delay": `${index * 55}ms` } as CSSProperties}>
    <h3 className="faq-question-heading"><button className="faq-question t-acc-head" type="button" aria-expanded={open} aria-controls={panelId} onClick={() => setOpen((value) => !value)}><span>{item.question}</span><span className="faq-chevron t-acc-chevron" aria-hidden="true"><ChevronDown size={17} /></span></button></h3>
    <div className="faq-panel t-acc-panel" id={panelId} aria-hidden={!open}><div className="faq-panel-inner t-acc-panel-inner"><p>{item.answer}</p></div></div>
  </article>;
}

function Contact({ content, apiBase, privacyHref, draftMessage }: { content: SiteContent; apiBase: string; privacyHref: string; draftMessage: string }) {
  const language = useSiteLanguage();
  const whatsapp = content.contact.whatsappNumber.replace(/\D/g, "");
  const contactMethods = [
    content.contact.email && { label: tx(language, "Correo electrónico"), value: content.contact.email, href: `mailto:${content.contact.email}`, icon: "mail" },
    content.contact.phone && { label: tx(language, "Teléfono"), value: content.contact.phone, href: `tel:${content.contact.phone.replace(/[^+\d]/g, "")}`, icon: "phone" },
    whatsapp && { label: "WhatsApp", value: tx(language, "Enviar mensaje"), href: `https://wa.me/${whatsapp}`, icon: "whatsapp" },
  ].filter(Boolean) as { label: string; value: string; href: string; icon: string }[];
  return <section id="contacto" className="section section-contact"><div className="section-shell contact-shell">
    <div className="contact-intro" data-reveal><Eyebrow>EL PRIMER PASO ES CONVERSAR</Eyebrow><h2>{tx(language, "¿Qué te gustaría")}<br /><span>{tx(language, "hacer posible?")}</span></h2><p>{tx(language, "Cuéntame sobre tu idea o el problema que necesitas resolver. Revisaré tu solicitud y podremos definir el siguiente paso.")}</p>
      {contactMethods.length > 0 && <div className="contact-methods">{contactMethods.map((item) => <a key={item.label} href={item.href} target={item.icon === "whatsapp" ? "_blank" : undefined} rel={item.icon === "whatsapp" ? "noreferrer" : undefined}><span>{item.icon === "whatsapp" ? <MessageCircle size={17} /> : item.icon === "phone" ? <MonitorCog size={17} /> : <Globe2 size={17} />}</span><span><small>{item.label}</small><b>{item.value}</b></span><ArrowUpRight size={15} className="contact-arrow" /></a>)}</div>}
      <div className="contact-socials">{content.socials.filter((social) => social.visible && social.url).map((social) => <a key={social.id} href={social.url} target="_blank" rel="noreferrer">{social.label}<ArrowUpRight size={13} /></a>)}</div>
    </div>
      <div className="contact-form-wrap" data-reveal><div className="form-heading"><span className="form-number">01 / {tx(language, "CONTACTO")}</span><span className="form-mark">RV.</span></div><LeadForm language={language} apiBase={apiBase} privacyHref={privacyHref} initialMessage={draftMessage} services={[...content.services.digital, ...content.services.equipment].filter((item) => item.visible).map((item) => item.title)} /></div>
  </div></section>;
}

function Footer({ content, privacyHref }: { content: SiteContent; privacyHref: string }) {
  const language = useSiteLanguage();
  const year = new Date().getFullYear();
  return <footer className="site-footer"><div className="footer-main"><a className="brand-lockup footer-brand" href="#inicio"><span className="brand-mark">RV<span>.</span></span><span className="brand-name">{content.brandName}</span></a><p>{tx(language, "Desarrollo y soporte tecnológico")}<br />{tx(language, "por")} {content.displayName}.</p><a className="footer-back" href="#inicio">{tx(language, "Volver al inicio")} <ArrowUpRight size={15} /></a></div><div className="footer-bottom"><span>© {year} {content.brandName}. {tx(language, "Todos los derechos reservados.")}</span><div><a href={privacyHref}>{tx(language, "Aviso de privacidad")}</a><a href="https://www.facebook.com/rolando.victorio/" target="_blank" rel="noreferrer">{tx(language, "Redes sociales")}</a></div></div></footer>;
}

function resolveMedia(path: string, apiBase: string) {
  return apiBase && path.startsWith("/media/") ? `${apiBase}${path}` : path;
}

export function LandingSite({ content, apiBase = "", privacyHref = "/privacidad", assetBase = "/" }: { content: SiteContent; apiBase?: string; privacyHref?: string; assetBase?: string }) {
  const theme = useSyncExternalStore(subscribeToPreferences, readThemePreference, () => "light" as Theme);
  const language = useSyncExternalStore(subscribeToPreferences, readLanguagePreference, () => "es" as SiteLanguage);
  const [leadDraft, setLeadDraft] = useState("");
  const siteOrigin = apiBase || "https://rv-solutions-tecnologia.rolandovictorio.chatgpt.site";
  const localizedContent = useMemo(() => translateSiteContent(content, language), [content, language]);
  const sections = visibleSections(localizedContent);
  const toggleTheme = () => {
    const nextTheme: Theme = theme === "dark" ? "light" : "dark";
    savePreference("rv-solutions-theme", nextTheme);
  };
  const toggleLanguage = () => {
    const nextLanguage: SiteLanguage = language === "es" ? "en" : "es";
    savePreference("rv-solutions-language", nextLanguage);
  };
  const requestQuoteFromIdea = (summary: string) => {
    setLeadDraft(summary);
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.getElementById("contacto")?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
  };
  const sectionComponents: Record<string, ReactNode> = {
    services: <Services content={localizedContent} apiBase={apiBase} onRequestQuote={requestQuoteFromIdea} key="services" />,
    about: <About content={localizedContent} apiBase={apiBase} assetBase={assetBase} key="about" />,
    portfolio: <Portfolio content={localizedContent} apiBase={apiBase} key="portfolio" />,
    process: <Process content={localizedContent} key="process" />,
    faq: <Faq content={localizedContent} key="faq" />,
    contact: <Contact content={localizedContent} apiBase={apiBase} privacyHref={privacyHref} draftMessage={leadDraft} key="contact" />,
  };
  const structuredData = { "@context": "https://schema.org", "@type": "Person", name: localizedContent.displayName, jobTitle: localizedContent.role, url: siteOrigin, brand: { "@type": "Brand", name: localizedContent.brandName }, sameAs: localizedContent.socials.filter((item) => item.visible && item.url).map((item) => item.url) };
  return <SiteLanguageContext.Provider value={language}>
    <ScrollEffects />
    <Header content={localizedContent} sections={sections} theme={theme} onThemeToggle={toggleTheme} onLanguageToggle={toggleLanguage} />
    <main><Hero content={localizedContent} apiBase={apiBase} />{sections.map((key) => sectionComponents[key])}</main>
    <Footer content={localizedContent} privacyHref={privacyHref} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
  </SiteLanguageContext.Provider>;
}
