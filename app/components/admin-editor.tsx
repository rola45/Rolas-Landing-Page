"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ExternalLink, Eye, EyeOff, ImagePlus, Inbox, LayoutDashboard, Link2, LoaderCircle, LogOut, Plus, Save, Settings2, Trash2 } from "lucide-react";
import type { FaqItem, ProcessStep, ProjectItem, ServiceItem, SiteContent } from "@/lib/site-content";

type Tab = "overview" | "content" | "services" | "projects" | "process" | "faq" | "contact" | "leads";
type Lead = { id: string; name: string; email: string; phone: string | null; service: string; message: string; status: "new" | "read" | "archived"; created_at: string };

function TextField({ label, value, onChange, multiline = false, hint, type = "text", maxLength }: { label: string; value: string; onChange: (value: string) => void; multiline?: boolean; hint?: string; type?: string; maxLength?: number }) {
  return <label className="admin-field"><span>{label}</span>{multiline ? <textarea value={value} onChange={(e) => onChange(e.target.value)} maxLength={maxLength} /> : <input type={type} value={value} onChange={(e) => onChange(e.target.value)} maxLength={maxLength} />}{hint && <small>{hint}</small>}</label>;
}

function Toggle({ label, checked, onChange, hint }: { label: string; checked: boolean; onChange: (checked: boolean) => void; hint?: string }) {
  return <label className="admin-toggle"><span><b>{label}</b>{hint && <small>{hint}</small>}</span><input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} /><i aria-hidden="true" /></label>;
}

function ImageUpload({ value, alt, onUpload, onAlt, label }: { value: string; alt: string; onUpload: (url: string) => void; onAlt: (value: string) => void; label: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function upload(file?: File) {
    if (!file) return;
    setBusy(true); setError("");
    const body = new FormData(); body.append("file", file);
    try {
      const response = await fetch("/api/upload", { method: "POST", body });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "No se pudo subir la imagen.");
      onUpload(data.url);
    } catch (err) { setError(err instanceof Error ? err.message : "No se pudo subir la imagen."); }
    finally { setBusy(false); }
  }
  return <div className="admin-upload"><span className="admin-upload-label">{label}</span><div className="admin-upload-row">{value ? <img src={value} alt="" /> : <span className="admin-upload-empty"><ImagePlus size={18} /></span>}<div><label className="admin-button admin-button-light">{busy ? <><LoaderCircle size={15} className="spin" /> Subiendo</> : <><ImagePlus size={15} /> Elegir imagen</>}<input type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} onChange={(e) => upload(e.target.files?.[0])} /></label>{value && <button type="button" className="admin-plain-button" onClick={() => onUpload("")}>Quitar imagen</button>}<small>JPG, PNG o WebP. Máximo 5 MB.</small></div></div><TextField label="Texto alternativo" value={alt} onChange={onAlt} maxLength={180} />{error && <p className="admin-error">{error}</p>}</div>;
}

const tabItems: { id: Tab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "overview", label: "Resumen", icon: LayoutDashboard }, { id: "content", label: "Página", icon: Settings2 },
  { id: "services", label: "Servicios", icon: Settings2 }, { id: "projects", label: "Proyectos", icon: Eye },
  { id: "process", label: "Proceso", icon: Link2 }, { id: "faq", label: "Preguntas", icon: Settings2 },
  { id: "contact", label: "Contacto y redes", icon: Link2 }, { id: "leads", label: "Solicitudes", icon: Inbox },
];

export function AdminEditor({ initialContent, displayEmail }: { initialContent: SiteContent; displayEmail: string }) {
  const [content, setContent] = useState(initialContent);
  const [tab, setTab] = useState<Tab>("overview");
  const [savedSnapshot, setSavedSnapshot] = useState(JSON.stringify(initialContent));
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [leadError, setLeadError] = useState("");
  const dirty = useMemo(() => JSON.stringify(content) !== savedSnapshot, [content, savedSnapshot]);

  const update = (next: SiteContent) => { setContent(next); setSaveMessage(""); };
  const addFaq = () => update({ ...content, faqs: [...content.faqs, { id: crypto.randomUUID(), question: "Nueva pregunta", answer: "Escribe la respuesta.", visible: true }] });
  const addService = (group: "digital" | "equipment") => update({ ...content, services: { ...content.services, [group]: [...content.services[group], { id: crypto.randomUUID(), title: "Nuevo servicio", description: "Describe este servicio.", visible: true }] } });
  const addProject = () => update({ ...content, projects: [...content.projects, { id: crypto.randomUUID(), title: "Nombre del proyecto", description: "Describe un proyecto real.", image: "", imageAlt: "", url: "", visible: true }] });

  async function save() {
    setSaving(true); setSaveMessage("");
    try {
      const response = await fetch("/api/content", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(content) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "No se pudieron guardar los cambios.");
      setContent(data.content); setSavedSnapshot(JSON.stringify(data.content)); setSaveMessage("Cambios guardados y publicados en la página.");
    } catch (error) { setSaveMessage(error instanceof Error ? error.message : "No se pudieron guardar los cambios."); }
    finally { setSaving(false); }
  }

  async function refreshLeads() {
    setLeadError("");
    try {
      const response = await fetch("/api/leads", { cache: "no-store" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "No fue posible consultar las solicitudes.");
      setLeads(data.leads);
    } catch (error) { setLeadError(error instanceof Error ? error.message : "No fue posible consultar las solicitudes."); }
  }

  async function setLeadStatus(lead: Lead, status: Lead["status"]) {
    const response = await fetch(`/api/leads/${lead.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) { setLeadError(data.error || "No fue posible actualizar la solicitud."); return; }
    setLeads((current) => current.map((item) => item.id === lead.id ? { ...item, status } : item));
  }

  async function deleteLead(lead: Lead) {
    if (!window.confirm(`¿Eliminar la solicitud de ${lead.name}? Esta acción no se puede deshacer.`)) return;
    const response = await fetch(`/api/leads/${lead.id}`, { method: "DELETE" });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) { setLeadError(data.error || "No fue posible eliminar la solicitud."); return; }
    setLeads((current) => current.filter((item) => item.id !== lead.id));
  }

  useEffect(() => { if (tab === "leads") void refreshLeads(); }, [tab]);

  const activeTab = tabItems.find((item) => item.id === tab)!;
  const setVisibility = (key: keyof SiteContent["sectionVisibility"], value: boolean) => update({ ...content, sectionVisibility: { ...content.sectionVisibility, [key]: value } });
  const moveSection = (index: number, direction: -1 | 1) => {
    const nextIndex = index + direction; if (nextIndex < 0 || nextIndex >= content.sectionsOrder.length) return;
    const order = [...content.sectionsOrder]; [order[index], order[nextIndex]] = [order[nextIndex], order[index]]; update({ ...content, sectionsOrder: order });
  };
  const sectionLabels: Record<SiteContent["sectionsOrder"][number], string> = { services: "Servicios", about: "Sobre mí", portfolio: "Portafolio", process: "Proceso", faq: "Preguntas frecuentes", contact: "Contacto" };

  return <div className="admin-layout">
    <aside className="admin-sidebar"><div className="admin-sidebar-brand"><span className="admin-logo">RV<span>.</span></span><div><b>{content.brandName}</b><small>Administración del sitio</small></div></div>
      <nav className="admin-nav" aria-label="Secciones del panel">{tabItems.map((item) => { const Icon = item.icon; return <button type="button" key={item.id} className={tab === item.id ? "active" : ""} onClick={() => setTab(item.id)}><Icon size={17} /><span>{item.label}</span>{item.id === "leads" && leads.some((lead) => lead.status === "new") && <i aria-label="Nuevas solicitudes" />}</button>; })}</nav>
      <div className="admin-sidebar-bottom"><a href="/" target="_blank" rel="noreferrer"><ExternalLink size={15} /> Ver página pública</a><span className="admin-account">{displayEmail}</span><a href="/signout-with-chatgpt?return_to=/admin" target="_top"><LogOut size={15} /> Cerrar sesión</a></div>
    </aside>
    <main className="admin-main"><header className="admin-topbar"><div><span className="admin-overline">RV SOLUTIONS / PANEL</span><h1>{activeTab.label}</h1></div><div className="admin-top-actions"><span className={`admin-save-state ${dirty ? "is-dirty" : ""}`}>{dirty ? "Cambios sin guardar" : "Todo guardado"}</span><button type="button" className="admin-button admin-button-primary" onClick={save} disabled={!dirty || saving}>{saving ? <LoaderCircle className="spin" size={15} /> : <Save size={15} />}{saving ? "Guardando" : "Guardar cambios"}</button></div></header>
      {saveMessage && <div className={`admin-message ${saveMessage.includes("guardados") ? "success" : "error"}`} role="status">{saveMessage}</div>}
      {tab === "overview" && <section className="admin-panel-content"><div className="admin-welcome"><span className="admin-welcome-icon"><LayoutDashboard size={21} /></span><div><h2>Hola, {content.displayName}</h2><p>Desde aquí puedes editar la página y revisar las solicitudes que lleguen desde el formulario.</p></div></div>
        <div className="admin-stats"><article><span>Servicios visibles</span><b>{[...content.services.digital, ...content.services.equipment].filter((item) => item.visible).length}</b><small>En desarrollo y soporte</small></article><article><span>Proyectos publicados</span><b>{content.projectsEnabled ? content.projects.filter((item) => item.visible).length : 0}</b><small>{content.projectsEnabled && content.projects.some((item) => item.visible) ? "Visibles en la página" : "Portafolio oculto"}</small></article><article><span>Solicitudes nuevas</span><b>{leads.filter((lead) => lead.status === "new").length}</b><small>Consultas por revisar</small></article></div>
        <div className="admin-panel-card"><div className="admin-card-title"><div><span className="admin-overline">ESTRUCTURA PÚBLICA</span><h2>Secciones de la página</h2></div><p>Activa, oculta o cambia el orden de las secciones. Los proyectos solo se muestran si agregas uno real.</p></div><div className="admin-section-list">{content.sectionsOrder.map((key, index) => <div className="admin-section-row" key={key}><span className="admin-section-grip">⠿</span><span className="admin-section-name">{sectionLabels[key]}</span>{key === "portfolio" ? <span className="admin-muted-pill">{content.projectsEnabled && content.projects.some((project) => project.visible) ? "Con proyectos" : "Oculto hasta agregar proyectos"}</span> : <button className={`admin-eye ${content.sectionVisibility[key] ? "on" : ""}`} type="button" onClick={() => setVisibility(key, !content.sectionVisibility[key])} aria-label={`${content.sectionVisibility[key] ? "Ocultar" : "Mostrar"} ${sectionLabels[key]}`}>{content.sectionVisibility[key] ? <Eye size={16} /> : <EyeOff size={16} />}</button>}<div className="admin-order"><button type="button" disabled={index === 0} onClick={() => moveSection(index, -1)} aria-label={`Subir ${sectionLabels[key]}`}><ArrowUp size={15} /></button><button type="button" disabled={index === content.sectionsOrder.length - 1} onClick={() => moveSection(index, 1)} aria-label={`Bajar ${sectionLabels[key]}`}><ArrowDown size={15} /></button></div></div>)}</div></div>
        <div className="admin-panel-card admin-draft-note"><b>Contenido inicial editable</b><p>Revisa y personaliza los textos de presentación, descripción profesional y servicios antes de compartir el sitio.</p></div>
      </section>}

      {tab === "content" && <section className="admin-panel-content"><div className="admin-panel-card"><div className="admin-card-title"><div><span className="admin-overline">PRESENTACIÓN PRINCIPAL</span><h2>Nombre y propuesta</h2></div><p>El contenido aquí aparece en la portada. Usa información real y concreta.</p></div><div className="admin-fields-grid"><TextField label="Nombre de la marca" value={content.brandName} onChange={(v) => update({ ...content, brandName: v })} /><TextField label="Nombre de presentación" value={content.displayName} onChange={(v) => update({ ...content, displayName: v })} /><TextField label="Especialidad" value={content.role} onChange={(v) => update({ ...content, role: v })} /><TextField label="Etiqueta sobre el título" value={content.heroEyebrow} onChange={(v) => update({ ...content, heroEyebrow: v })} /><TextField label="Título principal" value={content.heroTitle} onChange={(v) => update({ ...content, heroTitle: v })} /><TextField label="Texto del botón principal" value={content.heroCta} onChange={(v) => update({ ...content, heroCta: v })} /><TextField label="Descripción principal" value={content.heroDescription} multiline onChange={(v) => update({ ...content, heroDescription: v })} /></div></div>
        <div className="admin-panel-card"><div className="admin-card-title"><div><span className="admin-overline">SOBRE MÍ</span><h2>Descripción profesional</h2></div><p>Sin datos provisionales: ajusta este texto con tu trayectoria y enfoque.</p></div><div className="admin-fields-grid"><TextField label="Título" value={content.aboutTitle} onChange={(v) => update({ ...content, aboutTitle: v })} /><TextField label="Descripción" value={content.aboutText} multiline onChange={(v) => update({ ...content, aboutText: v })} /><ImageUpload label="Fotografía profesional" value={content.profileImage} alt={content.profileImageAlt} onUpload={(url) => update({ ...content, profileImage: url })} onAlt={(v) => update({ ...content, profileImageAlt: v })} /></div></div>
        <div className="admin-panel-card"><div className="admin-card-title"><div><span className="admin-overline">BUSCADORES</span><h2>Título y descripción SEO</h2></div><p>Se utilizan en los resultados de búsqueda y vistas previas al compartir el enlace.</p></div><div className="admin-fields-grid"><TextField label="Título SEO" value={content.seo.title} onChange={(v) => update({ ...content, seo: { ...content.seo, title: v } })} maxLength={160} /><TextField label="Descripción SEO" value={content.seo.description} onChange={(v) => update({ ...content, seo: { ...content.seo, description: v } })} multiline maxLength={320} /></div></div>
      </section>}

      {tab === "services" && <section className="admin-panel-content">{(["digital", "equipment"] as const).map((group) => <div className="admin-panel-card" key={group}><div className="admin-card-title"><div><span className="admin-overline">{group === "digital" ? "DESARROLLO DIGITAL" : "SOPORTE A EQUIPOS"}</span><h2>{group === "digital" ? "Servicios digitales" : "Servicios técnicos"}</h2></div><button className="admin-button admin-button-light" onClick={() => addService(group)}><Plus size={15} /> Agregar servicio</button></div><div className="admin-edit-list">{content.services[group].map((item, index) => <div className="admin-edit-item" key={item.id}><div className="admin-item-title"><span>{String(index + 1).padStart(2, "0")}</span><Toggle label="Visible en la página" checked={item.visible} onChange={(v) => update({ ...content, services: { ...content.services, [group]: content.services[group].map((entry) => entry.id === item.id ? { ...entry, visible: v } : entry) } })} /></div><div className="admin-fields-grid"><TextField label="Nombre del servicio" value={item.title} onChange={(v) => update({ ...content, services: { ...content.services, [group]: content.services[group].map((entry) => entry.id === item.id ? { ...entry, title: v } : entry) } })} /><TextField label="Descripción" value={item.description} multiline onChange={(v) => update({ ...content, services: { ...content.services, [group]: content.services[group].map((entry) => entry.id === item.id ? { ...entry, description: v } : entry) } })} /></div><button className="admin-plain-button danger" onClick={() => update({ ...content, services: { ...content.services, [group]: content.services[group].filter((entry) => entry.id !== item.id) } })}><Trash2 size={14} /> Eliminar</button></div>)}</div></div>)}</section>}

      {tab === "projects" && <section className="admin-panel-content"><div className="admin-panel-card"><div className="admin-card-title"><div><span className="admin-overline">PORTAFOLIO</span><h2>Proyectos reales</h2></div><button className="admin-button admin-button-light" onClick={addProject}><Plus size={15} /> Agregar proyecto</button></div><Toggle label="Publicar portafolio" checked={content.projectsEnabled} onChange={(v) => update({ ...content, projectsEnabled: v })} hint="Se mostrará cuando exista por lo menos un proyecto visible." />{content.projects.length === 0 && <div className="admin-empty"><EyeOff size={19} /><p>El portafolio está oculto hasta que agregues proyectos reales.</p></div>}
        <div className="admin-edit-list">{content.projects.map((project, index) => <div className="admin-edit-item" key={project.id}><div className="admin-item-title"><span>PROYECTO {String(index + 1).padStart(2, "0")}</span><Toggle label="Visible" checked={project.visible} onChange={(v) => update({ ...content, projects: content.projects.map((entry) => entry.id === project.id ? { ...entry, visible: v } : entry) })} /></div><div className="admin-fields-grid"><TextField label="Nombre" value={project.title} onChange={(v) => update({ ...content, projects: content.projects.map((entry) => entry.id === project.id ? { ...entry, title: v } : entry) })} /><TextField label="Descripción" value={project.description} multiline onChange={(v) => update({ ...content, projects: content.projects.map((entry) => entry.id === project.id ? { ...entry, description: v } : entry) })} /><TextField label="Enlace público del proyecto" value={project.url} type="url" onChange={(v) => update({ ...content, projects: content.projects.map((entry) => entry.id === project.id ? { ...entry, url: v } : entry) })} hint="Debe iniciar con https://" /><ImageUpload label="Imagen del proyecto" value={project.image} alt={project.imageAlt} onUpload={(url) => update({ ...content, projects: content.projects.map((entry) => entry.id === project.id ? { ...entry, image: url } : entry) })} onAlt={(v) => update({ ...content, projects: content.projects.map((entry) => entry.id === project.id ? { ...entry, imageAlt: v } : entry) })} /></div><button className="admin-plain-button danger" onClick={() => update({ ...content, projects: content.projects.filter((entry) => entry.id !== project.id) })}><Trash2 size={14} /> Eliminar proyecto</button></div>)}</div></div></section>}

      {tab === "process" && <section className="admin-panel-content"><div className="admin-panel-card"><div className="admin-card-title"><div><span className="admin-overline">PROCESO DE TRABAJO</span><h2>Pasos del proyecto</h2></div><button className="admin-button admin-button-light" onClick={() => update({ ...content, processSteps: [...content.processSteps, { id: crypto.randomUUID(), title: "Nuevo paso", description: "Describe esta etapa.", visible: true }] })}><Plus size={15} /> Agregar paso</button></div><div className="admin-edit-list">{content.processSteps.map((item: ProcessStep, index) => <div className="admin-edit-item" key={item.id}><div className="admin-item-title"><span>ETAPA {String(index + 1).padStart(2, "0")}</span><Toggle label="Visible" checked={item.visible} onChange={(v) => update({ ...content, processSteps: content.processSteps.map((entry) => entry.id === item.id ? { ...entry, visible: v } : entry) })} /></div><div className="admin-fields-grid"><TextField label="Título" value={item.title} onChange={(v) => update({ ...content, processSteps: content.processSteps.map((entry) => entry.id === item.id ? { ...entry, title: v } : entry) })} /><TextField label="Descripción" value={item.description} multiline onChange={(v) => update({ ...content, processSteps: content.processSteps.map((entry) => entry.id === item.id ? { ...entry, description: v } : entry) })} /></div><button className="admin-plain-button danger" onClick={() => update({ ...content, processSteps: content.processSteps.filter((entry) => entry.id !== item.id) })}><Trash2 size={14} /> Eliminar paso</button></div>)}</div></div></section>}

      {tab === "faq" && <section className="admin-panel-content"><div className="admin-panel-card"><div className="admin-card-title"><div><span className="admin-overline">CONTENIDO EDITABLE</span><h2>Preguntas frecuentes</h2></div><button className="admin-button admin-button-light" onClick={addFaq}><Plus size={15} /> Agregar pregunta</button></div><div className="admin-edit-list">{content.faqs.map((item: FaqItem, index) => <div className="admin-edit-item" key={item.id}><div className="admin-item-title"><span>PREGUNTA {String(index + 1).padStart(2, "0")}</span><Toggle label="Visible" checked={item.visible} onChange={(v) => update({ ...content, faqs: content.faqs.map((entry) => entry.id === item.id ? { ...entry, visible: v } : entry) })} /></div><div className="admin-fields-grid"><TextField label="Pregunta" value={item.question} onChange={(v) => update({ ...content, faqs: content.faqs.map((entry) => entry.id === item.id ? { ...entry, question: v } : entry) })} /><TextField label="Respuesta" value={item.answer} multiline onChange={(v) => update({ ...content, faqs: content.faqs.map((entry) => entry.id === item.id ? { ...entry, answer: v } : entry) })} /></div><button className="admin-plain-button danger" onClick={() => update({ ...content, faqs: content.faqs.filter((entry) => entry.id !== item.id) })}><Trash2 size={14} /> Eliminar pregunta</button></div>)}</div></div></section>}

      {tab === "contact" && <section className="admin-panel-content"><div className="admin-panel-card"><div className="admin-card-title"><div><span className="admin-overline">CANALES DE CONTACTO</span><h2>Datos de contacto</h2></div><p>Los campos vacíos no se mostrarán en la página pública.</p></div><div className="admin-fields-grid"><TextField label="Correo electrónico" value={content.contact.email} type="email" onChange={(v) => update({ ...content, contact: { ...content.contact, email: v } })} hint="Se mostrará públicamente." /><TextField label="Teléfono" value={content.contact.phone} type="tel" onChange={(v) => update({ ...content, contact: { ...content.contact, phone: v } })} hint="Se mostrará públicamente." /><TextField label="WhatsApp" value={content.contact.whatsappNumber} type="tel" onChange={(v) => update({ ...content, contact: { ...content.contact, whatsappNumber: v } })} hint="Formato internacional con código de país. El botón aparece al configurar este campo." /><TextField label="Domicilio para aviso de privacidad" value={content.contact.privacyAddress} onChange={(v) => update({ ...content, contact: { ...content.contact, privacyAddress: v } })} hint="Dato requerido para completar el aviso. No se publica en otra sección." /></div>{!content.contact.privacyAddress && <div className="admin-warning"><b>Falta completar el domicilio del responsable</b><p>El aviso público indicará que este dato está pendiente. Completa el campo antes de promover el formulario.</p></div>}</div>
        <div className="admin-panel-card"><div className="admin-card-title"><div><span className="admin-overline">PERFILES PÚBLICOS</span><h2>Redes sociales</h2></div><button className="admin-button admin-button-light" onClick={() => update({ ...content, socials: [...content.socials, { id: crypto.randomUUID(), label: "Red social", url: "", visible: true }] })}><Plus size={15} /> Agregar enlace</button></div><div className="admin-edit-list">{content.socials.map((social, index) => <div className="admin-edit-item" key={social.id}><div className="admin-item-title"><span>ENLACE {String(index + 1).padStart(2, "0")}</span><Toggle label="Visible" checked={social.visible} onChange={(v) => update({ ...content, socials: content.socials.map((entry) => entry.id === social.id ? { ...entry, visible: v } : entry) })} /></div><div className="admin-fields-grid"><TextField label="Nombre" value={social.label} onChange={(v) => update({ ...content, socials: content.socials.map((entry) => entry.id === social.id ? { ...entry, label: v } : entry) })} /><TextField label="URL pública" type="url" value={social.url} onChange={(v) => update({ ...content, socials: content.socials.map((entry) => entry.id === social.id ? { ...entry, url: v } : entry) })} hint="Solo se aceptan enlaces https://" /></div><button className="admin-plain-button danger" onClick={() => update({ ...content, socials: content.socials.filter((entry) => entry.id !== social.id) })}><Trash2 size={14} /> Eliminar enlace</button></div>)}</div></div></section>}

      {tab === "leads" && <section className="admin-panel-content"><div className="admin-panel-card"><div className="admin-card-title"><div><span className="admin-overline">FORMULARIO PÚBLICO</span><h2>Solicitudes recibidas</h2></div><button className="admin-button admin-button-light" onClick={refreshLeads}><Inbox size={15} /> Actualizar</button></div><p className="admin-lead-intro">Las consultas enviadas desde el formulario se guardan aquí. Solo esta cuenta puede revisarlas.</p>{leadError && <div className="admin-message error">{leadError}</div>}{leads.length === 0 ? <div className="admin-empty"><Inbox size={20} /><p>Aún no hay solicitudes.</p></div> : <div className="admin-lead-list">{leads.map((lead) => <article key={lead.id} className={`admin-lead ${lead.status === "new" ? "is-new" : ""}`}><div className="admin-lead-top"><div><span className={`lead-status ${lead.status}`}>{lead.status === "new" ? "Nueva" : lead.status === "read" ? "Revisada" : "Archivada"}</span><time dateTime={lead.created_at}>{new Date(lead.created_at).toLocaleString("es-MX", { dateStyle: "medium", timeStyle: "short" })}</time></div><button type="button" className="admin-plain-button danger" onClick={() => deleteLead(lead)}><Trash2 size={14} /> Eliminar</button></div><h3>{lead.name}</h3><div className="admin-lead-contact"><a href={`mailto:${lead.email}`}>{lead.email}</a>{lead.phone && <a href={`tel:${lead.phone}`}>{lead.phone}</a>}<span>{lead.service}</span></div><p className="admin-lead-message">{lead.message}</p><div className="admin-lead-actions"><label>Estado <select value={lead.status} onChange={(e) => setLeadStatus(lead, e.target.value as Lead["status"])}><option value="new">Nueva</option><option value="read">Revisada</option><option value="archived">Archivada</option></select></label></div></article>)}</div>}</div></section>}
    </main>
  </div>;
}
