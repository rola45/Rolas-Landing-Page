"use client";

import { useEffect, useRef, useState, type CSSProperties, type FormEvent } from "react";
import { ArrowRight, Check, ChevronRight, LayoutTemplate, LoaderCircle, Monitor, Smartphone, Sparkles, Tablet } from "lucide-react";
import { translateCopy, type SiteLanguage } from "@/lib/site-translation";

type Goal = "present" | "inquiries" | "workflow";
type VisualStyle = "minimal" | "technical" | "editorial" | "botanical" | "violet" | "coral" | "monochrome";
type PreviewPage = "home" | "services" | "about" | "contact";
type PreviewLayout = "editorial" | "visual" | "cards";
type PreviewDevice = "desktop" | "tablet" | "mobile";
type Concept = { headline: string; description: string; cta: string; recommendation: string; sections: { title: string; description: string }[] };

const goals: { id: Goal; title: string; description: string }[] = [
  { id: "present", title: "Presentar mi negocio", description: "Explicar servicios y generar confianza." },
  { id: "inquiries", title: "Recibir solicitudes", description: "Facilitar que las personas me contacten." },
  { id: "workflow", title: "Organizar un proceso", description: "Explorar un sistema web para mi operación." },
];

const visualStyles: { id: VisualStyle; title: string; description: string; colors: string[]; theme: { paper: string; surface: string; ink: string; muted: string; accent: string; accentSoft: string } }[] = [
  { id: "minimal", title: "Azul limpio", description: "Blanco, azul sereno y mucho aire.", colors: ["#edf3ff", "#ffffff", "#2866e8"], theme: { paper: "#f1f5fc", surface: "#ffffff", ink: "#17263b", muted: "#65738a", accent: "#2866e8", accentSoft: "#e6eeff" } },
  { id: "technical", title: "Grafito eléctrico", description: "Grafito profundo y azul eléctrico.", colors: ["#151a22", "#26313f", "#72a8ff"], theme: { paper: "#151a22", surface: "#202a37", ink: "#f4f7fc", muted: "#c1cad7", accent: "#72a8ff", accentSoft: "#2a3a52" } },
  { id: "editorial", title: "Arena editorial", description: "Arena, marfil y verde petróleo.", colors: ["#f3efe7", "#fffdf8", "#547b84"], theme: { paper: "#f3efe7", surface: "#fffdf8", ink: "#293b40", muted: "#647579", accent: "#547b84", accentSoft: "#e3ecea" } },
  { id: "botanical", title: "Verde bosque", description: "Salvia clara con acentos naturales.", colors: ["#eaf2eb", "#ffffff", "#34765a"], theme: { paper: "#edf4ee", surface: "#ffffff", ink: "#21382a", muted: "#62776a", accent: "#34765a", accentSoft: "#dfece1" } },
  { id: "violet", title: "Lavanda digital", description: "Lavanda suave y violeta nítido.", colors: ["#f1effb", "#ffffff", "#7557bf"], theme: { paper: "#f3f0fd", surface: "#ffffff", ink: "#2c2342", muted: "#746989", accent: "#7557bf", accentSoft: "#ebe5fb" } },
  { id: "coral", title: "Terracota cálida", description: "Marfil cálido con acento terracota.", colors: ["#f7ede7", "#fffaf6", "#b85539"], theme: { paper: "#f7efe9", surface: "#fffaf6", ink: "#3d2b27", muted: "#806d65", accent: "#b85539", accentSoft: "#f4ded4" } },
  { id: "monochrome", title: "Monocromática", description: "Carbón, blanco y grises limpios.", colors: ["#17191d", "#f4f4f1", "#686d75"], theme: { paper: "#f1f2f1", surface: "#ffffff", ink: "#20242a", muted: "#68707a", accent: "#343a40", accentSoft: "#e5e7e8" } },
];

const previewPages: { id: PreviewPage; label: string }[] = [
  { id: "home", label: "Inicio" },
  { id: "services", label: "Servicios" },
  { id: "about", label: "Sobre el proyecto" },
  { id: "contact", label: "Contacto" },
];

const previewLayouts: { id: PreviewLayout; title: string; description: string }[] = [
  { id: "editorial", title: "Editorial", description: "Titular amplio y lectura serena." },
  { id: "visual", title: "Visual", description: "Composición asimétrica con foco gráfico." },
  { id: "cards", title: "En bloques", description: "Tarjetas compactas y lectura directa." },
];

const previewDevices: { id: PreviewDevice; title: string }[] = [
  { id: "desktop", title: "Escritorio" },
  { id: "tablet", title: "Tableta" },
  { id: "mobile", title: "Móvil" },
];

const goalContent: Record<Goal, { headline: string; description: string; sections: string[]; recommendation: string }> = {
  present: {
    headline: "Una presencia clara para {name}",
    description: "Presenta qué haces, para quién y cómo empezar una conversación.",
    sections: ["Inicio", "Servicios", "Sobre el negocio", "Contacto"],
    recommendation: "Conviene priorizar una propuesta fácil de entender, una lista breve de servicios y una forma directa de contacto.",
  },
  inquiries: {
    headline: "Más fácil pasar de visita a conversación",
    description: "Pon al frente los servicios y el siguiente paso para solicitar información.",
    sections: ["Inicio y propuesta", "Servicios", "Preguntas frecuentes", "Formulario"],
    recommendation: "Conviene repetir una llamada a la acción clara, reducir campos del formulario y resolver dudas antes del contacto.",
  },
  workflow: {
    headline: "Un sistema alrededor de tu proceso",
    description: "Empieza por explicar la necesidad y visualizar cómo podría fluir el trabajo.",
    sections: ["Necesidad", "Flujo de trabajo", "Funciones clave", "Siguiente paso"],
    recommendation: "Conviene mapear primero quién lo usará, qué información manejará y qué pasos se quieren simplificar.",
  },
};

function templateConcept(goal: Goal): Concept {
  const details = goalContent[goal];
  return {
    headline: details.headline,
    description: details.description,
    cta: goal === "inquiries" ? "Solicitar información" : goal === "workflow" ? "Conocer la solución" : "Conocer servicios",
    recommendation: details.recommendation,
    sections: details.sections.slice(1, 4).map((title) => ({ title, description: details.description })),
  };
}

export function IdeaPreview({ language, apiBase, onRequestQuote }: { language: SiteLanguage; apiBase: string; onRequestQuote: (summary: string) => void }) {
  const t = (value: string) => translateCopy(value, language);
  const [goal, setGoal] = useState<Goal | "">("");
  const [style, setStyle] = useState<VisualStyle>("minimal");
  const [layout, setLayout] = useState<PreviewLayout>("editorial");
  const [device, setDevice] = useState<PreviewDevice>("desktop");
  const [activePreviewPage, setActivePreviewPage] = useState<PreviewPage>("home");
  const [projectName, setProjectName] = useState("");
  const [audience, setAudience] = useState("");
  const [concept, setConcept] = useState<Concept | null>(null);
  const [conceptMode, setConceptMode] = useState<"ai" | "template">("template");
  const [generationNotice, setGenerationNotice] = useState("");
  const [generationError, setGenerationError] = useState("");
  const [generating, setGenerating] = useState(false);
  const startedAt = useRef(0);
  const [honeypot, setHoneypot] = useState("");
  const [resultOpen, setResultOpen] = useState(false);
  const goalDetail = goal ? goalContent[goal] : undefined;
  const chosenStyle = visualStyles.find((option) => option.id === style) ?? visualStyles[0];
  const chosenLayout = previewLayouts.find((option) => option.id === layout) ?? previewLayouts[0];
  const chosenDevice = previewDevices.find((option) => option.id === device) ?? previewDevices[0];
  const name = projectName.trim() || t("Tu proyecto");
  const conceptHeadline = conceptMode === "ai" ? concept?.headline ?? "" : t(concept?.headline ?? "").replace("{name}", name);
  const conceptDescription = conceptMode === "ai" ? concept?.description ?? "" : t(concept?.description ?? "");
  const conceptCta = conceptMode === "ai" ? concept?.cta ?? "" : t(concept?.cta ?? "");
  const previewContactCta = t("Solicitar información");
  const previewPageLabel = (page: PreviewPage) => page === "services" && goal === "workflow"
    ? t("Funciones")
    : t(previewPages.find((item) => item.id === page)?.label ?? "Inicio");
  const sectionPageHeadline = goal === "workflow"
    ? t("Funciones alrededor de tu proceso.")
    : goal === "inquiries"
      ? t("Información clara para dar el siguiente paso.")
      : t("Servicios claros, organizados para tu audiencia.");
  useEffect(() => { startedAt.current = Date.now(); }, []);

  async function generate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!goal || generating) return;
    setGenerating(true);
    setGenerationError("");
    setGenerationNotice("");
    setResultOpen(false);
    setActivePreviewPage("home");
    try {
      const response = await fetch(`${apiBase}/api/idea-preview`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ goal, style, projectName, audience, language, website: honeypot, startedAt: startedAt.current }),
      });
      const result = await response.json().catch(() => ({})) as { concept?: Concept; mode?: "ai"; code?: string };
      if (response.ok && result.concept) {
        setConcept(result.concept);
        setConceptMode("ai");
      } else if (result.code === "NOT_CONFIGURED") {
        setConcept(templateConcept(goal));
        setConceptMode("template");
        setGenerationNotice(t("La maqueta base está disponible; falta configurar el servicio de generación personalizada."));
      } else {
        const errorText = result.code === "RATE_LIMITED"
          ? "Alcanzaste el límite temporal. Inténtalo más tarde."
          : "No se pudo preparar la vista ahora. Revisa tu conexión e inténtalo de nuevo.";
        setGenerationError(t(errorText));
        setConcept(null);
        return;
      }
      requestAnimationFrame(() => setResultOpen(true));
    } catch {
      setGenerationError(t("No se pudo preparar la vista ahora. Revisa tu conexión e inténtalo de nuevo."));
      setConcept(null);
    } finally {
      setGenerating(false);
    }
  }

  function requestQuote() {
    if (!goal || !concept) return;
    const summary = language === "en"
      ? `Website idea: ${projectName.trim() || "My project"}. Goal: ${t(goals.find((option) => option.id === goal)?.title ?? "")}. Audience: ${audience.trim() || "not specified"}. Preferred colors: ${t(chosenStyle.title)}. Page layout: ${t(chosenLayout.title)}. Priority screen: ${t(chosenDevice.title)}. Suggested structure: ${concept.sections.map((section) => t(section.title)).join(", ")}.`
      : `Idea de sitio web: ${projectName.trim() || "Mi proyecto"}. Objetivo: ${goals.find((option) => option.id === goal)?.title ?? ""}. Audiencia: ${audience.trim() || "por definir"}. Paleta preferida: ${chosenStyle.title}. Diseño de página: ${chosenLayout.title}. Pantalla prioritaria: ${chosenDevice.title}. Estructura sugerida: ${concept.sections.map((section) => section.title).join(", ")}.`;
    onRequestQuote(summary);
  }

  return <div id="idea-preview" className="idea-experience" data-reveal>
    <div className="idea-intro">
      <div>
        <p className="eyebrow"><span className="eyebrow-dot" />{t("EXPLORA UNA IDEA")}</p>
        <h3>{t("Imagina el siguiente paso.")}<br /><span>{t("La primera dirección empieza aquí.")}</span></h3>
        <p>{t("Cuéntame para qué necesitas la página y qué estilo te gusta. Recibirás una orientación y una vista conceptual para iniciar la conversación.")}</p>
      </div>
      <span className="idea-intro-mark" aria-hidden="true"><Sparkles size={25} strokeWidth={1.5} /></span>
    </div>

    <div className="idea-workspace">
      <form className="idea-form" onSubmit={generate}>
        <div className="idea-form-heading"><span>{t("UNA IDEA, TRES PASOS CORTOS")}</span><span><i /> {t("Sin compromiso")}</span></div>
        <fieldset className="idea-fieldset">
          <legend><span className="idea-step">01</span>{t("¿Para qué quieres la página?")}</legend>
          <div className="idea-goal-options">
            {goals.map((option) => <button key={option.id} className="idea-choice" type="button" aria-pressed={goal === option.id} onClick={() => { setGoal(option.id); setConcept(null); setGenerationNotice(""); setGenerationError(""); setResultOpen(false); setActivePreviewPage("home"); }}>
              <span className="idea-choice-icon" aria-hidden="true">{option.id === "present" ? <LayoutTemplate size={17} /> : option.id === "inquiries" ? <ArrowRight size={17} /> : <Monitor size={17} />}</span>
              <span><b>{t(option.title)}</b><small>{t(option.description)}</small></span>
              <span className="idea-choice-check" aria-hidden="true"><Check size={13} /></span>
            </button>)}
          </div>
        </fieldset>

        <div className="idea-fields-row">
          <label>{t("¿Qué negocio o proyecto quieres presentar?")} <span>{t("OPCIONAL")}</span>
            <input value={projectName} maxLength={70} onChange={(event) => { setProjectName(event.target.value); setConcept(null); setGenerationNotice(""); setResultOpen(false); setActivePreviewPage("home"); }} placeholder={t("Ej. Estudio, tienda o servicio local")} />
          </label>
          <label>{t("¿A quién quieres llegar?")} <span>{t("OPCIONAL")}</span>
            <input value={audience} maxLength={90} onChange={(event) => { setAudience(event.target.value); setConcept(null); setGenerationNotice(""); setResultOpen(false); setActivePreviewPage("home"); }} placeholder={t("Ej. clientes de mi ciudad")} />
          </label>
        </div>

        <fieldset className="idea-fieldset idea-style-fieldset">
          <legend><span className="idea-step">02</span>{t("¿Qué estilo se acerca más a tu gusto?")}</legend>
          <div className="idea-style-options">
            {visualStyles.map((option) => <button key={option.id} className="idea-style-choice" type="button" aria-pressed={style === option.id} onClick={() => setStyle(option.id)}>
              <span className="idea-swatches" aria-hidden="true">{option.colors.map((color) => <i key={color} style={{ backgroundColor: color }} />)}</span>
              <span className="idea-style-copy"><b>{t(option.title)}</b><small>{t(option.description)}</small></span>
              {style === option.id && <Check className="idea-style-selected" size={14} aria-hidden="true" />}
            </button>)}
          </div>
        </fieldset>

        <button className="button button-electric idea-generate" type="submit" disabled={!goal || generating}>{generating ? <>{t("Preparando la vista")} <LoaderCircle size={15} className="spin" /></> : <>{t("Ver recomendación y ejemplo")} <ArrowRight size={16} /></>}</button>
        <p className="idea-privacy-note">{t("Cuando la generación personalizada está activa, tus respuestas se envían a Gemini. No incluyas datos personales ni información confidencial; no se guardan como solicitud.")}</p>
        <div className="idea-honeypot" aria-hidden="true"><label htmlFor="idea-website">{t("Deja este campo vacío")}</label><input id="idea-website" value={honeypot} onChange={(event) => setHoneypot(event.target.value)} tabIndex={-1} autoComplete="off" /></div>
        {generationError && <p className="idea-error" role="alert">{generationError}</p>}
      </form>

      <div className="idea-preview-column" aria-live="polite">
        {!concept || !goalDetail ? <div className="idea-empty-preview">
          <span className="idea-empty-icon"><LayoutTemplate size={22} /></span>
          <span className="group-kicker">{t("VISTA PREVIA")}</span>
          <h4>{t("Tu idea toma forma al otro lado.")}</h4>
          <p>{t("Elige un objetivo y un estilo para ver una posible estructura de página.")}</p>
          <div className="idea-empty-lines" aria-hidden="true"><i /><i /><i /></div>
        </div> : <div key={`${goal}-${style}`} className="idea-generated t-panel-slide" data-open={resultOpen} data-style={style}>
          <div className="idea-preview-label"><span><i />{conceptMode === "ai" ? t("VISTA PERSONALIZADA") : t("VISTA CONCEPTUAL")}</span><span>{t("EJEMPLO, NO ES UN PROYECTO REAL")}</span></div>
          {generationNotice && <p className="idea-notice" role="status">{generationNotice}</p>}
          <div className="idea-preview-controls">
            <div className="idea-layout-picker">
              <span className="idea-layout-picker-label">{t("DISEÑO DE PÁGINA")}</span>
              <div className="idea-layout-options" role="group" aria-label={t("Variantes de diseño")}>
                {previewLayouts.map((option) => <button key={option.id} type="button" aria-pressed={layout === option.id} title={t(option.description)} onClick={() => setLayout(option.id)}>
                  <span className="idea-layout-glyph" data-layout={option.id} aria-hidden="true"><i /><i /><i /><i /></span>
                  <span><b>{t(option.title)}</b><small>{t(option.description)}</small></span>
                </button>)}
              </div>
            </div>
            <div className="idea-device-picker">
              <span className="idea-layout-picker-label">{t("VISTA ADAPTABLE")}</span>
              <div className="idea-device-options" role="group" aria-label={t("Tamaño de vista previa")}>
                {previewDevices.map((option) => <button key={option.id} type="button" aria-pressed={device === option.id} title={t(option.title)} onClick={() => setDevice(option.id)}>
                  {option.id === "desktop" ? <Monitor size={13} aria-hidden="true" /> : option.id === "tablet" ? <Tablet size={13} aria-hidden="true" /> : <Smartphone size={13} aria-hidden="true" />}
                  <span>{t(option.title)}</span>
                </button>)}
              </div>
            </div>
          </div>
          <div className="idea-device-stage">
          <div className="idea-browser-frame" data-device={device}>
            <div className="idea-browser-top"><span><i /><i /><i /></span><b>{t("VISTA DEL SITIO")}</b><span>↗</span></div>
            <div className="idea-page-tabs" role="group" aria-label={t("Páginas de ejemplo")}>
              {previewPages.map((page) => <button key={page.id} type="button" aria-pressed={activePreviewPage === page.id} onClick={() => setActivePreviewPage(page.id)}>{previewPageLabel(page.id)}</button>)}
            </div>
            <div className="idea-browser-page" data-layout={layout} data-device={device} style={{
              "--demo-paper": chosenStyle.theme.paper,
              "--demo-white": chosenStyle.theme.surface,
              "--demo-ink": chosenStyle.theme.ink,
              "--demo-muted": chosenStyle.theme.muted,
              "--demo-accent": chosenStyle.theme.accent,
              "--demo-accent-soft": chosenStyle.theme.accentSoft,
            } as CSSProperties}>
              <div className="idea-demo-nav"><b>{name}</b><span>{previewPageLabel(activePreviewPage)}</span><span className="idea-demo-nav-cta">{conceptCta}</span></div>
              {activePreviewPage === "home" && <section key="home" className="idea-demo-screen">
                <div className="idea-demo-home">
                  <div className="idea-demo-hero">
                    <span className="idea-demo-eyebrow">{t("UNA PROPUESTA PARA")}</span>
                    <h4>{conceptHeadline}</h4>
                    <p>{conceptDescription}{audience.trim() && conceptMode === "template" ? ` ${t("Pensada para")}: ${audience.trim()}.` : ""}</p>
                    <span className="idea-demo-cta">{conceptCta} <ArrowRight size={13} /></span>
                  </div>
                  <div className="idea-demo-art" aria-hidden="true">
                    <div className="idea-demo-art-orbit" />
                    <div className="idea-demo-art-window"><i /><i /><i /><span /><span /><b /></div>
                    <div className="idea-demo-art-badge"><Sparkles size={14} /></div>
                  </div>
                </div>
                <div className="idea-demo-blocks">{concept.sections.map((section, index) => <div key={`${section.title}-${index}`}><i>0{index + 1}</i><b>{conceptMode === "ai" ? section.title : t(section.title)}</b><span>{conceptMode === "ai" ? section.description : t(section.description)}</span></div>)}</div>
              </section>}
              {activePreviewPage === "services" && <section key="services" className="idea-demo-screen">
                <div className="idea-demo-page-heading"><span className="idea-demo-eyebrow">{t("UNA ESTRUCTURA PARA PRESENTAR LO QUE HACES")}</span><h4>{sectionPageHeadline}</h4><p>{conceptDescription}</p></div>
                <div className="idea-demo-service-grid">{concept.sections.map((section, index) => <article key={`${section.title}-${index}`}><span>0{index + 1}</span><h5>{conceptMode === "ai" ? section.title : t(section.title)}</h5><p>{conceptMode === "ai" ? section.description : t(section.description)}</p><i aria-hidden="true" /></article>)}</div>
              </section>}
              {activePreviewPage === "about" && <section key="about" className="idea-demo-screen idea-demo-about">
                <div className="idea-demo-about-visual" aria-hidden="true"><span>{t("ESPACIO PARA TU HISTORIA")}</span><div><i /><i /><i /></div></div>
                <div className="idea-demo-about-copy"><span className="idea-demo-eyebrow">{t("SOBRE EL PROYECTO")}</span><h4>{t("Una página para contar quién está detrás de {name}").replace("{name}", name)}</h4><p>{t("Este espacio se completa contigo: tu historia, experiencia y forma de trabajo.")}</p><ul><li>{t("Tu recorrido")}</li><li>{t("Tu forma de trabajar")}</li><li>{t("Qué te distingue")}</li></ul></div>
              </section>}
              {activePreviewPage === "contact" && <section key="contact" className="idea-demo-screen idea-demo-contact">
                <div className="idea-demo-contact-copy"><span className="idea-demo-eyebrow">{t("UN SIGUIENTE PASO CLARO")}</span><h4>{t("Conversemos sobre tu proyecto.")}</h4><p>{conceptDescription}</p><span className="idea-demo-cta">{previewContactCta} <ArrowRight size={13} /></span></div>
                <div className="idea-demo-form" role="group" aria-label={t("Formulario de ejemplo")}><b>{t("Formulario de contacto")}</b><span>{t("Nombre")}</span><i /><span>{t("Correo electrónico")}</span><i /><span>{t("¿Qué necesitas?")}</span><i className="idea-demo-form-message" /><strong>{previewContactCta}</strong><small>{t("Vista de ejemplo, no envía información.")}</small></div>
              </section>}
            </div>
          </div>
          </div>
          <div className="idea-recommendation">
            <div className="idea-recommendation-heading"><span><Sparkles size={15} />{t("RECOMENDACIÓN INICIAL")}</span><span className="idea-style-chip">{t(chosenStyle.title)}</span></div>
            <p>{conceptMode === "ai" ? concept.recommendation : t(concept.recommendation)}</p>
            {audience.trim() && <p className="idea-audience-note">{t("Audiencia indicada")}: <b>{audience.trim()}</b></p>}
            <div className="idea-section-tags"><span>{t("Estructura sugerida")}</span>{concept.sections.map((section, index) => <i key={`${section.title}-${index}`}>{conceptMode === "ai" ? section.title : t(section.title)}</i>)}</div>
            <button type="button" className="idea-quote-link" onClick={requestQuote}>{t("Llevar esta idea a una cotización")} <ChevronRight size={16} /></button>
          </div>
        </div>}
      </div>
    </div>
  </div>;
}
