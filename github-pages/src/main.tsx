import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { ArrowLeft } from "lucide-react";
import { LandingSite } from "../../app/components/landing-site";
import { DEFAULT_CONTENT } from "../../lib/default-content";
import type { SiteContent } from "../../lib/content-types";
import "../../app/globals.css";

const API_BASE = "https://rv-solutions-tecnologia.rolandovictorio.chatgpt.site";
const BASE = import.meta.env.BASE_URL;

function usePublicContent() {
  const [content, setContent] = useState<SiteContent>(DEFAULT_CONTENT);
  useEffect(() => {
    let active = true;
    fetch(`${API_BASE}/api/public`, { headers: { Accept: "application/json" } })
      .then((response) => {
        if (!response.ok) throw new Error("No fue posible cargar el contenido actualizado.");
        return response.json() as Promise<{ content?: SiteContent }>;
      })
      .then((result) => {
        if (active && result.content) setContent(result.content);
      })
      .catch(() => undefined);
    return () => { active = false; };
  }, []);
  return content;
}

function PrivacyPage({ content }: { content: SiteContent }) {
  const updated = new Intl.DateTimeFormat("es-MX", { dateStyle: "long", timeZone: "America/Tijuana" }).format(new Date());
  return <main className="privacy-page">
    <header className="privacy-header">
      <a className="brand-lockup" href={BASE} aria-label={`${content.brandName}, inicio`}><span className="brand-mark">RV<span>.</span></span><span className="brand-name">{content.brandName}</span></a>
      <a className="text-link" href={BASE}><ArrowLeft size={16} /> Volver al sitio</a>
    </header>
    <article className="privacy-main">
      <p className="eyebrow"><span className="eyebrow-dot" />TRANSPARENCIA Y DATOS PERSONALES</p>
      <h1>Aviso de privacidad</h1>
      <p className="privacy-updated">Última actualización: {updated}</p>
      <section className="privacy-block"><h2>Responsable y domicilio</h2><p><strong>{content.displayName}</strong>, quien ofrece servicios bajo la marca {content.brandName}, es responsable del tratamiento de los datos personales recabados en este sitio.</p>{content.contact.privacyAddress ? <p>Domicilio para oír y recibir notificaciones: {content.contact.privacyAddress}</p> : <div className="privacy-missing"><strong>Domicilio pendiente de configuración.</strong> Este dato debe agregarse desde el panel de administración.</div>}</section>
      <section className="privacy-block"><h2>Datos que se recaban</h2><p>Al enviar el formulario se pueden recabar nombre, correo electrónico, teléfono si lo proporcionas, servicio de interés y el contenido de tu mensaje. Para prevenir envíos automatizados, el sistema calcula una huella criptográfica temporal a partir de la dirección IP; la dirección IP completa no se guarda en la base de solicitudes.</p><p>No se solicitan datos personales sensibles. Evita incluirlos en el mensaje.</p></section>
      <section className="privacy-block"><h2>Finalidades</h2><ul><li>Responder solicitudes de cotización y contacto.</li><li>Dar seguimiento a los servicios solicitados y mantener el registro de la conversación.</li><li>Prevenir abuso y envíos automatizados al formulario.</li></ul><p>Los datos no se usan para enviar publicidad ni para crear perfiles comerciales.</p></section>
      <section className="privacy-block"><h2>Almacenamiento y transferencias</h2><p>Las solicitudes se guardan en una base de datos accesible únicamente desde el panel de administración protegido por inicio de sesión. La plataforma que aloja el sitio y su almacenamiento procesa técnicamente los datos para prestar este servicio. No se venden los datos ni se comparten para que terceros los utilicen con fines propios.</p></section>
      <section className="privacy-block"><h2>Conservación y seguridad</h2><p>Las solicitudes se conservan para atender y dar seguimiento al contacto. Pueden revisarse y eliminarse desde el panel de administración. Se aplican controles de acceso al panel y validaciones para proteger el formulario; ningún medio de transmisión o almacenamiento garantiza seguridad absoluta.</p></section>
      <section className="privacy-block"><h2>Derechos ARCO y revocación</h2><p>Puedes solicitar acceso, rectificación, cancelación u oposición al tratamiento de tus datos, o pedir la revocación del consentimiento. Para ello, <a href={`${BASE}#contacto`}>utiliza el formulario de contacto</a>, selecciona “Privacidad y datos” y describe tu solicitud. Incluye una forma de contacto para recibir respuesta.</p><p>Para limitar el uso o divulgación, solicita la medida por el mismo medio.</p></section>
      <section className="privacy-block"><h2>Cambios a este aviso</h2><p>Los cambios se publicarán en esta página con su fecha de actualización. Si tienes dudas sobre este aviso, puedes escribir mediante el formulario de contacto del sitio.</p></section>
    </article>
  </main>;
}

function App() {
  const content = usePublicContent();
  const isPrivacyPage = window.location.pathname.endsWith("privacy.html");
  useEffect(() => {
    if (isPrivacyPage) return;
    document.title = content.seo.title;
    const description = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (description) description.content = content.seo.description;
  }, [content, isPrivacyPage]);
  return isPrivacyPage
    ? <PrivacyPage content={content} />
    : <LandingSite content={content} apiBase={API_BASE} privacyHref={`${BASE}privacy.html`} />;
}

createRoot(document.getElementById("root")!).render(<StrictMode><App /></StrictMode>);
