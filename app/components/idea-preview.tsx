"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowRight, Check, ChevronRight, LayoutTemplate, LoaderCircle, Monitor, Sparkles } from "lucide-react";
import { translateCopy, type SiteLanguage } from "@/lib/site-translation";

type Goal = "present" | "inquiries" | "workflow";
type VisualStyle = "minimal" | "technical" | "editorial";
type Concept = { headline: string; description: string; cta: string; recommendation: string; sections: { title: string; description: string }[] };

const goals: { id: Goal; title: string; description: string }[] = [
  { id: "present", title: "Presentar mi negocio", description: "Explicar servicios y generar confianza." },
  { id: "inquiries", title: "Recibir solicitudes", description: "Facilitar que las personas me contacten." },
  { id: "workflow", title: "Organizar un proceso", description: "Explorar un sistema web para mi operación." },
];

const visualStyles: { id: VisualStyle; title: string; description: string; colors: string[] }[] = [
  { id: "minimal", title: "Clara y elegante", description: "Espacio, orden y lectura fácil.", colors: ["#f7f9fc", "#ffffff", "#2866e8"] },
  { id: "technical", title: "Tecnológica", description: "Grafito, contraste y acentos eléctricos.", colors: ["#11151b", "#1b2430", "#5790ff"] },
  { id: "editorial", title: "Cálida y editorial", description: "Tonos suaves y una voz cercana.", colors: ["#f4f0e8", "#fffdf8", "#547b84"] },
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
  const name = projectName.trim() || t("Tu proyecto");
  useEffect(() => { startedAt.current = Date.now(); }, []);

  async function generate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!goal || generating) return;
    setGenerating(true);
    setGenerationError("");
    setGenerationNotice("");
    setResultOpen(false);
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
      ? `Website idea: ${projectName.trim() || "My project"}. Goal: ${t(goals.find((option) => option.id === goal)?.title ?? "")}. Audience: ${audience.trim() || "not specified"}. Preferred style: ${t(chosenStyle.title)}. Suggested structure: ${concept.sections.map((section) => t(section.title)).join(", ")}.`
      : `Idea de sitio web: ${projectName.trim() || "Mi proyecto"}. Objetivo: ${goals.find((option) => option.id === goal)?.title ?? ""}. Audiencia: ${audience.trim() || "por definir"}. Estilo preferido: ${chosenStyle.title}. Estructura sugerida: ${concept.sections.map((section) => section.title).join(", ")}.`;
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
            {goals.map((option) => <button key={option.id} className="idea-choice" type="button" aria-pressed={goal === option.id} onClick={() => { setGoal(option.id); setConcept(null); setGenerationNotice(""); setGenerationError(""); setResultOpen(false); }}>
              <span className="idea-choice-icon" aria-hidden="true">{option.id === "present" ? <LayoutTemplate size={17} /> : option.id === "inquiries" ? <ArrowRight size={17} /> : <Monitor size={17} />}</span>
              <span><b>{t(option.title)}</b><small>{t(option.description)}</small></span>
              <span className="idea-choice-check" aria-hidden="true"><Check size={13} /></span>
            </button>)}
          </div>
        </fieldset>

        <div className="idea-fields-row">
          <label>{t("¿Qué negocio o proyecto quieres presentar?")} <span>{t("OPCIONAL")}</span>
            <input value={projectName} maxLength={70} onChange={(event) => { setProjectName(event.target.value); setConcept(null); setGenerationNotice(""); setResultOpen(false); }} placeholder={t("Ej. Estudio, tienda o servicio local")} />
          </label>
          <label>{t("¿A quién quieres llegar?")} <span>{t("OPCIONAL")}</span>
            <input value={audience} maxLength={90} onChange={(event) => { setAudience(event.target.value); setConcept(null); setGenerationNotice(""); setResultOpen(false); }} placeholder={t("Ej. clientes de mi ciudad")} />
          </label>
        </div>

        <fieldset className="idea-fieldset idea-style-fieldset">
          <legend><span className="idea-step">02</span>{t("¿Qué estilo se acerca más a tu gusto?")}</legend>
          <div className="idea-style-options">
            {visualStyles.map((option) => <button key={option.id} className="idea-style-choice" type="button" aria-pressed={style === option.id} data-style={option.id} onClick={() => { setStyle(option.id); setConcept(null); setGenerationNotice(""); setResultOpen(false); }}>
              <span className="idea-swatches" aria-hidden="true">{option.colors.map((color) => <i key={color} style={{ backgroundColor: color }} />)}</span>
              <b>{t(option.title)}</b><small>{t(option.description)}</small>
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
          <div className="idea-browser-frame">
            <div className="idea-browser-top"><span><i /><i /><i /></span><b>{t("PÁGINA DE EJEMPLO")}</b><span>↗</span></div>
            <div className="idea-browser-page">
              <div className="idea-demo-nav"><b>{name}</b><span>{t("Servicios")}</span><span>{t("Contacto")}</span><span className="idea-demo-nav-cta">{t("Hablemos")}</span></div>
              <div className="idea-demo-hero">
                <span className="idea-demo-eyebrow">{t("UNA PROPUESTA PARA")}</span>
                <h4>{conceptMode === "ai" ? concept.headline : t(concept.headline).replace("{name}", name)}</h4>
                <p>{conceptMode === "ai" ? concept.description : t(concept.description)}{audience.trim() && conceptMode === "template" ? ` ${t("Pensada para")}: ${audience.trim()}.` : ""}</p>
                <span className="idea-demo-cta">{conceptMode === "ai" ? concept.cta : t(concept.cta)} <ArrowRight size={12} /></span>
              </div>
              <div className="idea-demo-blocks">{concept.sections.map((section, index) => <div key={`${section.title}-${index}`} title={conceptMode === "ai" ? section.description : t(section.description)}><i>0{index + 1}</i><b>{conceptMode === "ai" ? section.title : t(section.title)}</b><span /></div>)}</div>
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
