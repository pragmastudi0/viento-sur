# Viento Sur

Catálogo de lámparas con administrador privado. Los pedidos se coordinan por WhatsApp; no hay pagos online. Conserva diseño, categorías, galerías y terminaciones originales.

## Arquitectura

Next.js 16.3.8 con App Router, React 19, TypeScript y Tailwind 3; Supabase PostgreSQL, Auth y Storage. El proyecto original tenía Next.js 14, React 18 y seis productos hardcodeados. Se actualizaron Next.js y React para resolver vulnerabilidades al incorporar sesiones y operaciones privadas.

Las páginas públicas leen productos publicados desde el servidor sin caché persistente. El administrador escribe mediante endpoints protegidos y JWT de usuario; RLS protege también acceso directo a Supabase. Fotos validadas en backend, subidas con clave de servidor. El carrito sigue en localStorage y verifica productos/precios antes de enviar WhatsApp.

## Los SQL para tu proyecto nuevo

1. Crear tu proyecto Supabase y ejecutar `supabase/migrations/202610060001_catalog.sql` en SQL Editor. Crea productos, administradores, registro de fotos, restricciones, RLS y bucket público `catalogo`.
2. Ejecutar localmente `npm run catalog:photos`. Prepara nueve fotos WebP en `catalog-migration/photos/products/legacy`. Subirlas al bucket `catalogo`, dentro de **products/legacy**, conservando nombres.
3. Ejecutar `supabase/catalog-seed.sql` en SQL Editor. Migra las seis lámparas sin sobrescribir registros existentes. Verifica primero que estén las nueve fotos; si falta alguna, aborta toda la transacción y no publica productos sin imagen.
4. Crear/invitar al dueño desde Auth. Para autorizarlo, ejecutar lo siguiente reemplazando el email; la cuenta debe existir primero:

También podés editar el email y ejecutar `supabase/authorize-owner.sql`, que comprueba que la cuenta exista antes de asignarle acceso.

```sql
insert into public.catalog_admins (user_id)
select id from auth.users where lower(email) = lower('EMAIL_DEL_DUEÑO')
on conflict (user_id) do nothing;
```

Nunca agregar permisos de escritura pública ni políticas de Storage abiertas. Las fotos son públicas; ocultar un producto no vuelve privado un enlace de foto previamente compartido.

Alternativa a subir las fotos y ejecutar el seed manualmente: con las variables remotas configuradas, `npm run catalog:migrate` sube/optimiza las fotos y migra productos. Es repetible: conserva IDs, slugs, precios, galerías y especificaciones; omite productos ya existentes sin sobrescribir ediciones. **No hace falta ejecutar ambos métodos.** `npm run catalog:sql` regenera el SQL desde la fuente de migración.

## Configuración de Auth y Vercel

Copiar `.env.example` a `.env.local` y completar URL de Supabase, clave pública, clave service_role solo de servidor y `SITE_URL` con origen público exacto, incluyendo protocolo. Agregar las mismas variables en Vercel. Nunca versionar ni enviar claves por chat. Producción y previews requieren SITE_URL apropiado a cada origen.

En Auth, habilitar login por email/contraseña y desactivar **Allow new users to sign up**. Configurar Site URL con el mismo origen de SITE_URL y permitir la URL exacta `https://TU_DOMINIO/admin/auth/confirm`. Configurar SMTP propio para invitación y recuperación en producción. Copiar al dashboard los templates `supabase/templates/invite.html` y `recovery.html`, que usan TokenHash.

`npm run admin:invite -- email-del-dueño` autoriza una cuenta existente o invita una nueva para elegir contraseña por email. Si falla la asignación del permiso, repetir el comando. No se genera ni imprime una contraseña.

Desplegar en Vercel después de aplicar esquema y migrar. Comprobar `/admin`, recuperación, seis lámparas y flujo completo desde un teléfono antes de dar por terminado el lanzamiento. Si Supabase está sin configurar, se muestra error: no hay fallback a productos hardcodeados.

## Desarrollo local

Requiere Node.js 22.12+, Docker y Supabase CLI. El entorno usa puertos 56320–56329 y no modifica otros proyectos.

```bash
npm ci
supabase start -x realtime,edge-runtime,analytics,vector,studio
npm run setup:local
npm run catalog:migrate
npm run dev -- --webpack -p 3005
```

setup:local escribe credenciales locales directamente en `.env.test.local`, ignorado por git. Crea `.env.local` solo si no existe; nunca reemplaza credenciales reales. La CLI puede mostrar claves locales al iniciar: no publicar su salida. En Auth local, `[auth].enable_signup = false` desactiva registro; `[auth.email].enable_signup = true` mantiene login por email habilitado.

Para usar invitación/recuperación local, configurar `auth.site_url` en `supabase/config.toml` con `http://127.0.0.1:3005` y agregar `http://127.0.0.1:3005/admin/auth/confirm` a `additional_redirect_urls`; reiniciar solamente este proyecto Supabase conservando sus datos. Mailpit recibe los emails locales en `http://127.0.0.1:56324`.

## Tests

```bash
npm run typecheck
npm run lint
npm test
npm run test:integration
npm run test:e2e
npm run build
```

Los tests de integración y E2E exigen Supabase aislado en 127.0.0.1:56321; se niegan a mutar proyectos remotos. Crean/eliminan sus propias cuentas y productos. Playwright comprueba escritorio, celular y tablet; instalar Chromium con `npx playwright install chromium` si hace falta. Inicia servidor en 3005 si no existe. Para comprobar build, usar `npm start -- -p 3005` y repetir E2E contra ese servidor. La cámara física requiere prueba adicional en teléfono real.

## Flujo del dueño

Entrar a `/admin`, iniciar sesión y elegir **+ Agregar lámpara**. Completar nombre, descripción, precio, categoría, foto principal y guardar; publicada por defecto. La misma pantalla edita productos y conserva las fotos que no se cambian. Galería y especificaciones son opcionales.

Se aceptan `85000`, `85.000` y `$ 85.000`; los centavos usan coma, por ejemplo `85.000,50`. El precio se almacena como decimal ARS. Categorías: lámpara de pie y velador. Tres terminaciones comunes: negro, grafito y bronce. Se mantiene orden original y las nuevas se agregan al final; no se agregó stock, promociones u orden manual.

**Ocultar/Publicar** cambia visibilidad sin eliminar datos. Los productos ocultos o eliminados no aparecen en inicio, catálogo, categorías, detalle ni sitemap. **Eliminar** pide confirmación y aplica deleted_at; conserva registro y fotos para recuperación operativa. No hay papelera o restauración desde UI en esta versión.

Los fallos conservan el formulario. Crear usa ID estable para evitar duplicados al reintentar. Editar detecta conflictos por fecha de actualización: copiar cambios y recargar si otra operación modificó el producto.

## Fotos y mantenimiento

Hasta diez fotos JPEG, PNG o WebP, de 15 MB por archivo en el dispositivo. El navegador reduce antes de enviar a 1.600 px y hasta 3 MB. El backend comprueba contenido real, tamaño y límite de píxeles; reorienta, elimina metadata y convierte a WebP. HEIC debe exportarse como JPG. La galería persiste referencias path/alt y la primera es principal.

Visitantes y cuentas autenticadas no pueden escribir archivos directamente en Storage. El backend usa clave de servidor solo después de comprobar administrador. En productos usa JWT del administrador y RLS. Al reemplazar fotos, primero guarda referencias nuevas y después elimina las anteriores sin referencias. La base serializa guardados y limpieza; nunca elimina una foto referenciada por otra lámpara o por un producto eliminado lógicamente.

```bash
npm run catalog:cleanup
```

El comando elimina huérfanos de más de 24 horas tras subidas interrumpidas. Ejecutarlo periódicamente desde un entorno seguro o programarlo en infraestructura operativa. No se provisiona cron externo. No borrar storage.objects mediante SQL; usar la API de Storage.

Para revocar acceso, eliminar la fila de catalog_admins con conexión privilegiada. Los permisos se consultan en cada operación. Configurar backups de PostgreSQL **y** objetos de Storage según el plan contratado; los backups de base no incluyen una copia de los archivos. Restaurar una lámpara requiere revisar sus fotos y poner deleted_at = null mediante conexión autorizada.

## Archivos principales

- app/admin y components/admin: login, recuperación, listado y formulario compartido.
- app/api/admin y proxy.ts: operaciones protegidas y refresco de cookies.
- lib/catalog*, lib/supabase y lib/product-types.ts: lectura, escritura, validación e interfaces.
- supabase/migrations y supabase/catalog-seed.sql: esquema, restricciones, políticas y datos originales.
- scripts: migración, invitación, fotos, SQL, configuración local y limpieza.
- data/legacy-products.ts: únicamente fuente de migración; ninguna página pública la importa.
- Páginas públicas, metadata y sitemap: consultas dinámicas que conservan URLs y diseño.
- lib/site.ts: WhatsApp, marca, Instagram y URL. Hero y personalizados conservan fotos editoriales en public/products.
- tests: dinero y validación, procesamiento de imágenes, CRUD/RLS/storage real, login, responsive y regresión.

## Auditoría y pendientes de operación

`npm audit --omit=dev` revisa dependencias de producción. La auditoría completa también incluye dependencias de desarrollo de Tailwind/ESLint; revisar avisos antes de migrarlas y comprobar estilos/build. No usar npm audit fix --force sin revisar cambios mayores.

Crear proyecto remoto, SMTP, cuenta del dueño, variables Vercel, despliegue y prueba en teléfono físico son pasos de lanzamiento que requieren tu configuración. La comprobación local no acredita por sí sola producción.
