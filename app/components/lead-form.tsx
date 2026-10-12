"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowUpRight, LoaderCircle } from "lucide-react";
import { translateCopy, type SiteLanguage } from "@/lib/site-translation";

type LeadFormProps = { services: string[]; language?: SiteLanguage; apiBase?: string; privacyHref?: string; initialMessage?: string };

export function LeadForm({ services, language = "es", apiBase = "", privacyHref = "/privacidad", initialMessage = "" }: LeadFormProps) {
  const t = (value: string) => translateCopy(value, language);
  const startedAt = useRef(0);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [draftState, setDraftState] = useState({ source: initialMessage, value: initialMessage });
  const draftMessage = draftState.source === initialMessage ? draftState.value : initialMessage;
  const [complete, setComplete] = useState(false);
  useEffect(() => { startedAt.current = Date.now(); }, []);
  if (draftState.source !== initialMessage) setDraftState({ source: initialMessage, value: initialMessage });

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    setPending(true);
    setMessage("");
    const form = new FormData(formElement);
    const payload = {
      name: form.get("name"), email: form.get("email"), phone: form.get("phone"),
      service: form.get("service"), message: form.get("message"), consent: form.get("consent") === "on",
      website: form.get("website"), startedAt: startedAt.current,
    };
    try {
      const response = await fetch(`${apiBase}/api/leads`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await response.json().catch(() => ({})) as { error?: string };
      if (!response.ok) throw new Error(data.error || "No fue posible enviar tu solicitud.");
      setComplete(true);
      setMessage("Gracias. Tu solicitud quedó registrada y podré revisarla.");
      setDraftState({ source: initialMessage, value: "" });
      formElement.reset();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No fue posible enviar tu solicitud. Intenta de nuevo.");
    } finally { setPending(false); }
  }

  if (complete) return <div className="form-success" role="status"><span className="success-check">✓</span><h3>{t("Solicitud recibida.")}</h3><p>{t(message)}</p><button className="text-link" onClick={() => { setComplete(false); setMessage(""); startedAt.current = Date.now(); }}>{t("Enviar otra solicitud")} <ArrowUpRight size={15} /></button></div>;

  return <form className="lead-form" onSubmit={submit}>
    <div className="form-row"><label>{t("Nombre completo")}<input name="name" autoComplete="name" required minLength={2} maxLength={100} placeholder={t("¿Cómo te llamas?")} /></label><label>{t("Correo electrónico")}<input name="email" type="email" autoComplete="email" required maxLength={254} placeholder={t("tunombre@correo.com")} /></label></div>
    <div className="form-row"><label>{t("Teléfono")} <span className="optional">{t("OPCIONAL")}</span><input name="phone" type="tel" autoComplete="tel" maxLength={40} placeholder={t("Tu número de contacto")} /></label><label>{t("¿Qué necesitas?")}<select name="service" defaultValue=""><option value="">{t("Selecciona un servicio")}</option>{services.map((service) => <option key={service} value={service}>{service}</option>)}<option value={t("Privacidad y datos")}>{t("Privacidad y datos")}</option><option value={t("Otro / Consulta general")}>{t("Otro / Consulta general")}</option></select></label></div>
    <label>{t("Cuéntame un poco más")}<textarea name="message" required minLength={10} maxLength={2000} rows={4} value={draftMessage} onChange={(event) => setDraftState({ source: initialMessage, value: event.target.value })} placeholder={t("¿Qué te gustaría resolver o desarrollar?")} /></label>
    <label className="consent-row"><input name="consent" type="checkbox" required /><span>{t("Autorizo el uso de estos datos para responder mi solicitud.")} {t("Consulta el")} <a href={privacyHref} target="_blank" rel="noreferrer">{t("Aviso de privacidad")}</a>.</span></label>
    <div className="honeypot" aria-hidden="true"><label htmlFor="website-field">{t("Deja este campo vacío")}</label><input id="website-field" name="website" tabIndex={-1} autoComplete="off" /></div>
    <div className="form-submit-row"><button className="button button-electric form-submit" type="submit" disabled={pending}>{pending ? <>{t("Enviando")} <LoaderCircle size={16} className="spin" /></> : <>{t("Enviar solicitud")} <ArrowUpRight size={17} /></>}</button><span>{t("Todos los campos con * son obligatorios")}</span></div>
    <p className="form-status" aria-live="polite" data-error={message && !complete ? "true" : undefined}>{t(message)}</p>
  </form>;
}
