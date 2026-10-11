"use client";

import { useState, useEffect } from "react";
import type { CSSProperties, MouseEvent, ReactNode } from "react";
import { ArrowDown, ArrowDownRight, ArrowRight, ArrowUpRight, Code2, Cpu, ExternalLink, Globe2, MessageCircle, MonitorCog, Sparkles, Wrench } from "lucide-react";
import type { SiteContent } from "@/lib/content-types";
import { LeadForm } from "@/app/components/lead-form";
import { ScrollEffects } from "@/app/components/scroll-effects";


function visibleSections(content: SiteContent) {
  const projects = content.projectsEnabled && content.projects.some((project) => project.visible);
  return content.sectionsOrder.filter((key) => content.sectionVisibility[key] && (key !== "portfolio" || projects));
}

function Header({ content, sections }: { content: SiteContent; sections: string[] }) {
  const labels: Record<string, string> = { services: "Servicios", about: "Sobre mí", portfolio: "Proyectos", process: "Proceso", faq: "Preguntas", contact: "Contacto" };
  const sectionId: Record<string, string> = { services: "servicios", about: "sobre-mi", portfolio: "proyectos", process: "proceso", faq: "preguntas", contact: "contacto" };
  const closeMobileMenu = (event: MouseEvent<HTMLAnchorElement>) => { const menu = event.currentTarget.closest("details"); if (menu) menu.open = false; };
  return <header className="site-header">
    <a className="brand-lockup" href="#inicio" aria-label={`${content.brandName}, inicio`}>
      <span className="brand-mark">RV<span>.</span></span>
      <span className="brand-name">{content.brandName}</span>
    </a>
    <nav className="desktop-nav" aria-label="Navegación principal">
      {sections.map((section) => <a key={section} href={`#${sectionId[section]}`}>{labels[section]}</a>)}
    </nav>
    <div className="header-actions">
      <a className="header-cta" href="#contacto">Cotizar <ArrowUpRight size={15} aria-hidden="true" /></a>
      <details className="mobile-menu">
        <summary aria-label="Abrir menú de navegación"><span></span><span></span></summary>
        <nav aria-label="Navegación móvil">
          {sections.map((section) => <a key={section} href={`#${sectionId[section]}`} onClick={closeMobileMenu}>{labels[section]}</a>)}
          <a className="mobile-cta" href="#contacto" onClick={closeMobileMenu}>Solicitar cotización <ArrowUpRight size={16} /></a>
        </nav>
      </details>
    </div>
  </header>;
}

function Eyebrow({ children }: { children: ReactNode }) { return <p className="eyebrow"><span className="eyebrow-dot" />{children}</p>; }

function Hero({ content, apiBase }: { content: SiteContent; apiBase: string }) {
  return <section id="inicio" className="hero-section">
    <div className="hero-grid">
      <div className="hero-copy" data-reveal>
        <Eyebrow>{content.heroEyebrow}</Eyebrow>
        <p className="hero-attribution"><span>{content.displayName}</span><span aria-hidden="true"> — </span>{content.role}</p>
        <h1>{content.heroTitle}</h1>
        <p className="hero-description">{content.heroDescription}</p>
        <div className="hero-actions">
          <a className="button button-electric" href="#contacto">{content.heroCta}<ArrowUpRight size={17} aria-hidden="true" /></a>
          <a className="button button-quiet" href="#servicios">Conocer servicios<ArrowDown size={15} aria-hidden="true" /></a>
        </div>
      </div>
      <div className="hero-visual" data-parallax>
        {content.profileImage ? <figure className="hero-portrait">
          <img src={resolveMedia(content.profileImage, apiBase)} alt={content.profileImageAlt || `Retrato de ${content.displayName}`} loading="eager" fetchPriority="high" />
          <figcaption><span>{content.displayName}</span><span>{content.brandName}</span></figcaption>
        </figure> : <div className="hero-poster" role="img" aria-label={`Composición tipográfica de ${content.brandName}`}>
          <span className="poster-index">RV / 01</span>
          <span className="poster-monogram">RV<span>.</span></span>
          <span className="poster-rule" />
          <span className="poster-caption">DESARROLLO<br />Y SOPORTE<br /><b>TECNOLÓGICO</b></span>
          <span className="poster-orbit" />
          <span className="poster-coordinate">{content.displayName.toUpperCase()}</span>
        </div>}
        <div className="hero-visual-meta"><span>{content.brandName}</span><span>DESARROLLO DIGITAL <i /> SOPORTE TÉCNICO</span></div>
      </div>
    </div>
    <div className="hero-bottom"><span>DESARROLLO Y SOPORTE TECNOLÓGICO</span><a href="#servicios" aria-label="Desplazarse a servicios"><ArrowDownRight size={17} /></a></div>
  </section>;
}

function SectionHeader({ kicker, title, text, dark = false }: { kicker: string; title: ReactNode; text?: string; dark?: boolean }) {
  return <div className={`section-heading${dark ? " section-heading-dark" : ""}`} data-reveal><Eyebrow>{kicker}</Eyebrow><h2>{title}</h2>{text && <p>{text}</p>}</div>;
}

const digitalIcons = [Code2, Globe2, Sparkles];
const supportIcons = [Wrench, MonitorCog, Cpu];
function ServiceGroup({ title, note, items, group }: { title: string; note: string; items: SiteContent["services"]["digital"]; group: string }) {
  const icons = group === "digital" ? digitalIcons : supportIcons;
  return <div className={`service-group service-group-${group}`}>
    <div className="service-group-heading" data-reveal><div><span className="group-kicker">{group === "digital" ? "01 / DIGITAL" : "02 / EQUIPOS"}</span><h3>{title}</h3></div><p>{note}</p></div>
    <div className="service-list">
      {items.filter((item) => item.visible).map((item, index) => { const Icon = icons[index % icons.length]; return <article key={item.id} className="service-row" data-reveal style={{ "--reveal-delay": `${index * 75}ms` } as CSSProperties}>
        <span className="service-index">{String(index + 1).padStart(2, "0")}</span>
        <span className="service-icon"><Icon size={19} strokeWidth={1.7} aria-hidden="true" /></span>
        <div className="service-copy"><h4>{item.title}</h4><p>{item.description}</p></div>
        <a href="#contacto" aria-label={`Solicitar información sobre ${item.title}`} className="service-link"><ArrowUpRight size={17} /></a>
      </article>; })}
    </div>
  </div>;
}

function Services({ content }: { content: SiteContent }) {
  return <section id="servicios" className="section section-services">
    <div className="section-shell"><SectionHeader kicker="LO QUE PUEDO HACER POR TI" title={<>Tecnología útil.<br /><span>Trabajo que fluye.</span></>} text="Servicios pensados para resolver necesidades reales, desde una idea digital hasta el equipo que usas todos los días." />
      <ServiceGroup title="Desarrollo digital" note="De la idea a una herramienta clara, rápida y funcional." items={content.services.digital} group="digital" />
      <ServiceGroup title="Soporte a equipos" note="Cuidado y mejoras para que la tecnología te acompañe." items={content.services.equipment} group="equipment" />
    </div>
  </section>;
}

function About({ content, apiBase }: { content: SiteContent; apiBase: string }) {
  return <section id="sobre-mi" className="section section-about">
    <div className="section-shell about-layout">
      <div className="about-art" data-reveal>
        <div className="portrait-frame">
          {content.profileImage ? <img src={resolveMedia(content.profileImage, apiBase)} alt={content.profileImageAlt || `Retrato de ${content.displayName}`} className="portrait-image" loading="lazy" /> : <div className="portrait-placeholder"><div className="portrait-grid" /><span className="portrait-initials">RV<span>.</span></span><span className="portrait-pending">Fotografía por agregar</span></div>}
          <div className="portrait-tag"><span className="status-pulse" />{content.brandName}</div>
        </div>
        <span className="about-orbit about-orbit-one" /><span className="about-orbit about-orbit-two" />
        <span className="about-coordinate">TECNOLOGÍA · DISEÑO · SOPORTE</span>
      </div>
      <div className="about-copy" data-reveal>
        <Eyebrow>UNA PERSONA DETRÁS DE LA SOLUCIÓN</Eyebrow>
        <h2>{content.aboutTitle}</h2>
        <p>{content.aboutText}</p>
        <div className="about-signature"><span className="signature-line" /><div><b>{content.displayName}</b><span>{content.role}</span></div></div>
        <a className="text-link" href="#contacto">Cuéntame qué necesitas <ArrowRight size={16} /></a>
      </div>
    </div>
  </section>;
}

function Portfolio({ content, apiBase }: { content: SiteContent; apiBase: string }) {
  const projects = content.projects.filter((project) => project.visible);
  if (!content.projectsEnabled || !projects.length) return null;
  return <section id="proyectos" className="section section-portfolio"><div className="section-shell"><SectionHeader kicker="PROYECTOS SELECCIONADOS" title={<>Ideas que toman<br /><span>forma digital.</span></>} text="Una selección de proyectos y soluciones desarrolladas." />
    <div className="project-grid">{projects.map((project, index) => <article className="project-card" key={project.id} data-reveal style={{ "--reveal-delay": `${index * 80}ms` } as CSSProperties}>
      <div className="project-image">{project.image ? <img src={resolveMedia(project.image, apiBase)} alt={project.imageAlt || project.title} loading="lazy" /> : <div className="project-image-placeholder"><span>RV / {String(index + 1).padStart(2, "0")}</span></div>}</div>
      <div className="project-copy"><span className="group-kicker">PROYECTO</span><h3>{project.title}</h3><p>{project.description}</p>{project.url && <a href={project.url} target="_blank" rel="noreferrer" className="text-link">Ver proyecto <ExternalLink size={15} /></a>}</div>
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
  return <section id="preguntas" className="section section-faq"><div className="section-shell faq-layout">
    <div><SectionHeader kicker="PREGUNTAS FRECUENTES" title={<>Hablemos claro<br /><span>desde el inicio.</span></>} text="Respuestas breves para ayudarte a dar el siguiente paso." /><a className="text-link faq-contact-link" href="#contacto">¿Tienes otra pregunta? Escríbeme <ArrowRight size={16} /></a></div>
    <div className="faq-list">{content.faqs.filter((item) => item.visible).map((item, index) => <details className="faq-item" key={item.id} data-reveal style={{ "--reveal-delay": `${index * 55}ms` } as CSSProperties}><summary><span>{item.question}</span><span className="faq-plus" aria-hidden="true" /></summary><p>{item.answer}</p></details>)}</div>
  </div></section>;
}

function Contact({ content, apiBase, privacyHref }: { content: SiteContent; apiBase: string; privacyHref: string }) {
  const whatsapp = content.contact.whatsappNumber.replace(/\D/g, "");
  const contactMethods = [
    content.contact.email && { label: "Correo electrónico", value: content.contact.email, href: `mailto:${content.contact.email}`, icon: "mail" },
    content.contact.phone && { label: "Teléfono", value: content.contact.phone, href: `tel:${content.contact.phone.replace(/[^+\d]/g, "")}`, icon: "phone" },
    whatsapp && { label: "WhatsApp", value: "Enviar mensaje", href: `https://wa.me/${whatsapp}`, icon: "whatsapp" },
  ].filter(Boolean) as { label: string; value: string; href: string; icon: string }[];
  return <section id="contacto" className="section section-contact"><div className="section-shell contact-shell">
    <div className="contact-intro" data-reveal><Eyebrow>EL PRIMER PASO ES CONVERSAR</Eyebrow><h2>¿Qué te gustaría<br /><span>hacer posible?</span></h2><p>Cuéntame sobre tu idea o el problema que necesitas resolver. Revisaré tu solicitud y podremos definir el siguiente paso.</p>
      {contactMethods.length > 0 && <div className="contact-methods">{contactMethods.map((item) => <a key={item.label} href={item.href} target={item.icon === "whatsapp" ? "_blank" : undefined} rel={item.icon === "whatsapp" ? "noreferrer" : undefined}><span>{item.icon === "whatsapp" ? <MessageCircle size={17} /> : item.icon === "phone" ? <MonitorCog size={17} /> : <Globe2 size={17} />}</span><span><small>{item.label}</small><b>{item.value}</b></span><ArrowUpRight size={15} className="contact-arrow" /></a>)}</div>}
      <div className="contact-socials">{content.socials.filter((social) => social.visible && social.url).map((social) => <a key={social.id} href={social.url} target="_blank" rel="noreferrer">{social.label}<ArrowUpRight size={13} /></a>)}</div>
    </div>
    <div className="contact-form-wrap" data-reveal><div className="form-heading"><span className="form-number">01 / CONTACTO</span><span className="form-mark">RV.</span></div><LeadForm apiBase={apiBase} privacyHref={privacyHref} services={[...content.services.digital, ...content.services.equipment].filter((item) => item.visible).map((item) => item.title)} /></div>
  </div></section>;
}

function Footer({ content, privacyHref }: { content: SiteContent; privacyHref: string }) {
  const year = new Date().getFullYear();
  return <footer className="site-footer"><div className="footer-main"><a className="brand-lockup footer-brand" href="#inicio"><span className="brand-mark">RV<span>.</span></span><span className="brand-name">{content.brandName}</span></a><p>Desarrollo y soporte tecnológico<br />por {content.displayName}.</p><a className="footer-back" href="#inicio">Volver al inicio <ArrowUpRight size={15} /></a></div><div className="footer-bottom"><span>© {year} {content.brandName}. Todos los derechos reservados.</span><div><a href={privacyHref}>Aviso de privacidad</a><a href="https://www.facebook.com/rolando.victorio/" target="_blank" rel="noreferrer">Redes sociales</a></div></div></footer>;
}

function resolveMedia(path: string, apiBase: string) {
  return apiBase && path.startsWith("/media/") ? `${apiBase}${path}` : path;
}

export function LandingSite({ content, apiBase = "", privacyHref = "/privacidad" }: { content: SiteContent; apiBase?: string; privacyHref?: string }) {
  const [liveContent, setLiveContent] = useState(content);
  const siteOrigin = apiBase || "https://rv-solutions-tecnologia.rolandovictorio.chatgpt.site";
  useEffect(() => { setLiveContent(content); }, [content]);
  const sections = visibleSections(liveContent);
  const sectionComponents: Record<string, ReactNode> = {
    services: <Services content={liveContent} key="services" />,
    about: <About content={liveContent} apiBase={apiBase} key="about" />,
    portfolio: <Portfolio content={liveContent} apiBase={apiBase} key="portfolio" />,
    process: <Process content={liveContent} key="process" />,
    faq: <Faq content={liveContent} key="faq" />,
    contact: <Contact content={liveContent} apiBase={apiBase} privacyHref={privacyHref} key="contact" />,
  };
  const structuredData = { "@context": "https://schema.org", "@type": "Person", name: liveContent.displayName, jobTitle: liveContent.role, url: siteOrigin, brand: { "@type": "Brand", name: liveContent.brandName }, sameAs: liveContent.socials.filter((item) => item.visible && item.url).map((item) => item.url) };
  return <>
    <ScrollEffects />
    <Header content={liveContent} sections={sections} />
    <main><Hero content={liveContent} apiBase={apiBase} />{sections.map((key) => sectionComponents[key])}</main>
    <Footer content={liveContent} privacyHref={privacyHref} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
  </>;
}
