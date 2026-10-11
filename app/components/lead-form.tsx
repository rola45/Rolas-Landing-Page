"use client";

import { useEffect, useState, type FormEvent } from "react";
import { ArrowUpRight, LoaderCircle } from "lucide-react";

type LeadFormProps = { services: string[]; apiBase?: string; privacyHref?: string };

export function LeadForm({ services, apiBase = "", privacyHref = "/privacidad" }: LeadFormProps) {
  const [startedAt, setStartedAt] = useState(0);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [complete, setComplete] = useState(false);
  useEffect(() => setStartedAt(Date.now()), []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    setPending(true);
    setMessage("");
    const form = new FormData(formElement);
    const payload = {
      name: form.get("name"), email: form.get("email"), phone: form.get("phone"),
      service: form.get("service"), message: form.get("message"), consent: form.get("consent") === "on",
      website: form.get("website"), startedAt,
    };
    try {
      const response = await fetch(`${apiBase}/api/leads`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "No fue posible enviar tu solicitud.");
      setComplete(true);
      setMessage("Gracias. Tu solicitud quedó registrada y podré revisarla.");
      formElement.reset();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No fue posible enviar tu solicitud. Intenta de nuevo.");
    } finally { setPending(false); }
  }

  if (complete) return <div className="form-success" role="status"><span className="success-check">✓</span><h3>Solicitud recibida.</h3><p>{message}</p><button className="text-link" onClick={() => { setComplete(false); setMessage(""); setStartedAt(Date.now()); }}>Enviar otra solicitud <ArrowUpRight size={15} /></button></div>;

  return <form className="lead-form" onSubmit={submit}>
    <div className="form-row"><label>Nombre completo<input name="name" autoComplete="name" required minLength={2} maxLength={100} placeholder="¿Cómo te llamas?" /></label><label>Correo electrónico<input name="email" type="email" autoComplete="email" required maxLength={254} placeholder="tunombre@correo.com" /></label></div>
    <div className="form-row"><label>Teléfono <span className="optional">OPCIONAL</span><input name="phone" type="tel" autoComplete="tel" maxLength={40} placeholder="Tu número de contacto" /></label><label>¿Qué necesitas?<select name="service" defaultValue=""><option value="">Selecciona un servicio</option>{services.map((service) => <option key={service} value={service}>{service}</option>)}<option value="Privacidad y datos">Privacidad y datos</option><option value="Consulta general">Otro / Consulta general</option></select></label></div>
    <label>Cuéntame un poco más<textarea name="message" required minLength={10} maxLength={2000} rows={4} placeholder="¿Qué te gustaría resolver o desarrollar?" /></label>
    <label className="consent-row"><input name="consent" type="checkbox" required /><span>Autorizo el uso de estos datos para responder mi solicitud. Consulta el <a href={privacyHref} target="_blank" rel="noreferrer">Aviso de privacidad</a>.</span></label>
    <div className="honeypot" aria-hidden="true"><label htmlFor="website-field">Deja este campo vacío</label><input id="website-field" name="website" tabIndex={-1} autoComplete="off" /></div>
    <input type="hidden" name="startedAt" value={startedAt} />
    <div className="form-submit-row"><button className="button button-electric form-submit" type="submit" disabled={pending}>{pending ? <>Enviando <LoaderCircle size={16} className="spin" /></> : <>Enviar solicitud <ArrowUpRight size={17} /></>}</button><span>Todos los campos con * son obligatorios</span></div>
    <p className="form-status" aria-live="polite" data-error={message && !complete ? "true" : undefined}>{message}</p>
  </form>;
}
