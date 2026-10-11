# RV Solutions

Landing page profesional de Rolando Victorio para presentar servicios de desarrollo y soporte tecnológico, recibir solicitudes de cotización y editar el contenido desde un panel privado.

## Publicación

- GitHub Pages: `https://rola45.github.io/Rolas-Landing-Page/`
- Sitio con panel y API: `https://rv-solutions-tecnologia.rolandovictorio.chatgpt.site/`
- Administración: agregar `/admin` al sitio con panel e iniciar sesión con la cuenta propietaria autorizada.
- Aviso de privacidad: disponible desde el pie de página de ambos sitios.

El sitio en GitHub Pages comparte el contenido y el formulario con la API del sitio principal. El panel, las solicitudes y las imágenes usan almacenamiento persistente en D1 y R2.

## Desarrollo

- Requiere Node.js 22 o posterior.
- `npm ci` instala las dependencias.
- `npm run dev` inicia la vista previa local.
- `npm run build` prepara el sitio y su API para RV Sites.
- `npm run build:pages` crea `pages-dist/` para GitHub Pages.
- `npm run db:generate` genera migraciones SQL a partir de `db/schema.ts`.

GitHub Actions publica GitHub Pages al actualizar `main`. La base de la landing de Pages es `/Rolas-Landing-Page/`.

## Primeros pasos en el panel

Después de iniciar sesión, agrega una fotografía real y tus datos de contacto. El campo de WhatsApp permanece vacío hasta configurar el número. Los proyectos están ocultos hasta que agregues uno real y lo publiques. Completa también el domicilio pendiente del aviso de privacidad desde los datos editables.
