# RV Solutions

Código privado del sitio principal de Rolando Victorio: panel de administración, almacenamiento de contenido y solicitudes de cotización.

- Landing pública: https://rola45.github.io/rv-solutions/
- Interfaz pública estática: https://github.com/rola45/rv-solutions
- Sitio principal, panel y API: https://rv-solutions-tecnologia.rolandovictorio.chatgpt.site/
- Panel: agrega `/admin` al dominio principal e inicia sesión con la cuenta autorizada.

La landing estática usa la API del sitio principal para mostrar el contenido editado desde el CMS y registrar solicitudes. El repositorio público contiene únicamente los archivos de la interfaz pública; el panel y la API permanecen en este repositorio privado.

## Desarrollo

Requiere Node.js 22 o posterior. Ejecuta `npm ci`, `npm run dev`, `npm run build` y `npm run build:pages` según necesites. `npm run db:generate` crea migraciones SQL a partir de `db/schema.ts`.

Completa desde el panel la fotografía, los datos de contacto y el domicilio pendiente del aviso de privacidad. El enlace de WhatsApp y los proyectos permanecen ocultos hasta que agregues datos reales.
