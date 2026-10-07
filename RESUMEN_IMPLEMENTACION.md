# Viento Sur — Resumen de implementación

Fecha: 7 de octubre de 2026.

El catálogo de lámparas pasó de productos definidos en el código a una base de datos persistente, administrable desde un panel privado. El dueño puede cargar y actualizar lámparas sin modificar el código fuente. Se conservaron el diseño público, las categorías, galerías, URLs y pedidos por WhatsApp.

## Arquitectura

La aplicación original utilizaba Next.js 14, React 18, App Router, TypeScript y Tailwind 3. Tenía seis lámparas hardcodeadas en `data/products.ts`, fotos en `public/products` y carrito en localStorage. No tenía base de datos, autenticación ni almacenamiento para fotos cargadas por el dueño.

La implementación conserva App Router, TypeScript, Tailwind y los componentes existentes. Next.js se actualizó a 16.3.8 y React a 19 para corregir vulnerabilidades del stack anterior. Se incorporaron:

- Supabase PostgreSQL para productos, administradores y registro de imágenes.
- Supabase Auth para sesiones y login por email/contraseña.
- Supabase Storage para las fotos del catálogo.
- Endpoints de Next.js con autorización y validación en servidor.

Flujo de datos:

```text
Dueño → /admin → endpoints protegidos → PostgreSQL / Storage
Catálogo público → consultas en servidor → productos publicados
Carrito → verificación de disponibilidad y precios → pedido por WhatsApp
```

## Panel administrador

Acceso: `/admin`. Login directo: `/admin/login`.

- Listado con imagen, nombre, precio, estado, fecha de actualización y acciones.
- Contadores de lámparas activas: total, publicadas y ocultas.
- Creación y edición mediante el mismo formulario.
- Nombre, descripción, precio, categoría, imágenes, especificaciones y estado.
- Publicación por defecto y acción rápida para ocultar o volver a publicar.
- Eliminación con confirmación y borrado lógico; se conservan registro y fotos.
- Preview de imágenes, reemplazo antes de guardar y conservación de las fotos que no se cambian.
- Estados de carga y mensajes de éxito/error en español.
- Interfaz responsive para escritorio, celular y tablet.

El formulario conserva los datos ante fallos. La creación utiliza un ID estable para evitar duplicados al reintentar; un reintento con datos distintos devuelve conflicto. La edición detecta cambios simultáneos mediante la fecha de actualización.

Los precios aceptan formatos argentinos como `85000`, `85.000`, `$ 85.000` y `85.000,50`. Se almacenan numéricamente, con hasta dos decimales.

## Base compartida y modelo de datos

Todas las tablas propias llevan el prefijo `viento_sur_`:

- `public.viento_sur_products`: lámparas.
- `public.viento_sur_catalog_admins`: cuentas autorizadas.
- `public.viento_sur_catalog_assets`: referencias de fotos verificadas.
- `public.viento_sur_categories`: categorías administrables.
- `public.viento_sur_category_slugs`: registro de slugs actuales y anteriores.

Funciones, políticas, índices, trigger y secuencia también usan el prefijo. El bucket exclusivo es `viento_sur_catalogo`. Las tablas de Supabase Auth y Storage conservan sus nombres originales.

Cada lámpara almacena ID, slug, nombre, descripción, precio, categoría, estado, galería de imágenes, especificaciones, destacado, orden de visualización, fechas de creación/actualización y fecha de eliminación lógica. La primera imagen de la galería es la principal. Se preservan los slugs al editar.

Se comprobó localmente que la migración y las operaciones del catálogo prefijado no modifican los datos ni las fotos de las tablas y bucket sin prefijo existentes.

## Imágenes

Se aceptan JPEG, PNG y WebP, hasta diez fotos por lámpara. El archivo original puede pesar hasta 15 MB. El navegador reduce la foto a un máximo de 1.600 px y 3 MB antes de enviarla.

El servidor comprueba el contenido real, tipo, tamaño y límite de píxeles; corrige orientación, elimina metadata y convierte a WebP. La base guarda referencias de Storage, no rutas locales del dispositivo.

Al reemplazar una foto, primero se guarda el producto y después se limpia la imagen anterior si ya no tiene referencias. No se borran fotos compartidas o referenciadas por registros eliminados lógicamente. La base coordina guardados y limpieza para evitar carreras.

`npm run catalog:cleanup` permite limpiar huérfanos de más de 24 horas. No se configuró un cron remoto. HEIC requiere exportar la foto como JPEG.

## Catálogo público y seguridad

Inicio, catálogo, categorías, detalle de producto y sitemap consultan la base de datos desde el servidor. Solo muestran lámparas publicadas, no eliminadas y con categoría activa; el detalle de una lámpara oculta devuelve 404. Se mantienen diseño, metadata, URLs y las terminaciones comunes negro, grafito y bronce.

El carrito permanece en localStorage y verifica disponibilidad y precios actuales antes de preparar el pedido por WhatsApp.

La protección del administrador incluye sesión verificada en servidor, comprobación del permiso en cada operación, políticas RLS, restricciones de base de datos, validación de origen y validación de datos/imágenes. Ocultar botones no es la barrera de seguridad.

Las cuentas sin autorización no pueden modificar productos. La escritura directa de fotos mediante claves públicas o sesiones de usuario está bloqueada en el esquema probado; las subidas pasan por el backend autorizado. La clave privada de Supabase se usa exclusivamente en servidor y no está versionada.

Auth, SMTP y plantillas son globales en un proyecto compartido: cualquier cambio debe coordinarse con las otras aplicaciones. Las fotos del bucket son públicas; ocultar una lámpara no vuelve privada una URL de imagen previamente compartida.

## Migración y archivos entregados

Se preservaron las seis lámparas originales —Lanin, Lanin XL, Traful, Piedra Mora, Manly y Kids— y sus nueve fotos, junto con IDs, slugs, precios, categorías, galerías y especificaciones.

- [Esquema, permisos y bucket](supabase/migrations/202610060001_catalog.sql).
- [Carga inicial de productos](supabase/catalog-seed.sql).
- [Autorización del dueño](supabase/authorize-owner.sql).
- `catalog-migration/viento-sur-catalogo.zip`: paquete local con tres SQL, nueve fotos WebP e instrucciones. Está ignorado por Git y no forma parte del repositorio remoto.

La carga inicial verifica que estén las fotos antes de insertar productos; si falta alguna, aborta la transacción. Es repetible y no sobrescribe productos existentes. Como alternativa, `npm run catalog:migrate` sube las imágenes y carga los productos.

El usuario confirmó que aplicó la migración en su proyecto remoto. La comprobación del sitio publicado muestra las seis lámparas originales.

## Archivos y componentes principales

- `app/admin/` y `components/admin/`: login, recuperación, listado y formulario.
- `app/api/admin/`: operaciones de autenticación, productos e imágenes.
- `app/api/catalogo/carrito/`: verificación pública del carrito.
- `lib/catalog.ts`, `lib/catalog-write.ts` y `lib/catalog-validation.ts`: lectura, escritura y validaciones.
- `lib/admin.ts`, `lib/supabase/` y `proxy.ts`: autorización y sesiones.
- `lib/browser-image.ts` y `lib/image-processing.ts`: procesamiento de fotos.
- `data/legacy-products.ts`: fuente de migración; no alimenta el catálogo público.
- `scripts/`: migración, exportación de SQL, preparación/limpieza de fotos, invitación y entorno local.
- `supabase/`: esquema, carga inicial, autorización y plantillas de correo.
- `app/layout.tsx` y `app/fonts/`: tipografías locales y licencias.
- `tests/`: validación, imágenes, integración y E2E.
- [README](README.md): instalación, variables, operación y mantenimiento.

## Pruebas y resultados

Durante la implementación y la adaptación a prefijos se verificaron:

- **51 tests unitarios:** precios, validaciones, carrito y procesamiento de imágenes.
- **15 tests de integración:** CRUD, visibilidad, permisos/RLS, restricciones, reintentos y protección de Storage contra Supabase local real.
- **21 pruebas E2E:** siete escenarios en escritorio, celular y tablet; incluyen login, CRUD completo, preview/reemplazo, errores de subida, endpoints no autorizados, recuperación y regresión pública.
- **Lint, TypeScript y build de producción:** aprobados.
- **Migración repetida:** sin sobrescribir los registros existentes.
- **Verificación de aislamiento:** datos de tablas y bucket sin prefijo permanecieron idénticos.
- **Auditoría de producción:** `npm audit --omit=dev` reportó cero vulnerabilidades en la comprobación realizada. La auditoría completa registró nueve avisos en dependencias de desarrollo.
- **Revisión de secretos:** sin claves privadas en los archivos versionados ni en el bundle del navegador revisado.

Las pruebas de integración y E2E se ejecutan únicamente contra Supabase local aislado; no mutan proyectos remotos.

## Administración dinámica de categorías — 7/10/2026

Se reemplazaron las categorías estáticas del frontend y el enum de validación por una entidad persistente y `viento_sur_products.category_id` con FK. El texto anterior se conserva para transición. La auditoría local detectó Lámparas de pie (4 productos) y Veladores (2); la migración usa las categorías reales de la base destino, no esos conteos como supuesto.

El dueño accede desde el enlace **Categorías** del panel a `/admin/categorias`: lista nombre, slug, conteo, estado, orden, actualización y acciones. Puede crear/editar categorías, definir orden numérico, activar/desactivar y borrar únicamente las vacías. Las categorías con referencias, incluso productos eliminados lógicamente, no se borran. Hay formularios simples, loading/error/empty, confirmaciones, controles de concurrencia y diseño responsive.

Los productos usan un selector dinámico. No se asignan categorías inactivas nuevas; una edición conserva la categoría inactiva actual. Desactivarla oculta sus productos públicos sin cambiar estados individuales; reactivarla restaura los que siguen publicados. RLS aplica esta regla también en consultas directas. El carrito verifica la disponibilidad antes de preparar WhatsApp, sin cambios en sus componentes.

Navegación, filtros, páginas, breadcrumbs, metadata y sitemap leen categorías de la base y respetan el orden. Se conservan `/lamparas-de-pie`, `/veladores` y todos los slugs de productos. Las categorías nuevas tienen `/categorias/[slug]`; los slugs anteriores quedan reservados y redirigen 308. Una categoría inactiva muestra un aviso con `noindex`; sus detalles de producto devuelven 404.

### Migración para producción existente

1. Respaldo y [`categories-preflight.sql`](supabase/categories-preflight.sql) de solo lectura en la base real. Alternativa complementaria: `npm run categories:audit` con variables de la base destino; informa slugs y colisiones sin escribir.
2. Revisar categorías detectadas, cantidad de productos y divergencias del esquema.
3. Ejecutar [`202610070001_categories.sql`](supabase/migrations/202610070001_categories.sql), sin repetir seed ni migración inicial. Agrega dos tablas propias, FK, restricciones, políticas y triggers exclusivos de Viento Sur. Transacción conservadora con comprobación de todos los campos anteriores y preservación de timestamps.
4. Desplegar el código actualizado y probar login → crear categoría → crear producto → catálogo → desactivar/reactivar → bloqueo de eliminación. Los SQL de categorías **no se ejecutaron remotamente** durante esta tarea.

No se cambiaron dependencias, Storage, Auth, carrito, WhatsApp ni objetos de otras aplicaciones. Los scripts de importación inicial/seed se adaptaron para instalaciones nuevas que ya tengan ambas migraciones.

### Archivos de esta ampliación

Creados: `lib/category-types.ts`, `lib/category-validation.ts`, `lib/categories.ts`, `lib/category-write.ts`; `components/admin/CategoryForm.tsx`, `CategoryManager.tsx`, `components/CategoryCollection.tsx`; las páginas de `app/admin/categorias/`, endpoints `app/api/admin/categories/` y `app/categorias/[slug]/page.tsx`; auditoría `scripts/audit-categories.ts`, bootstrap `scripts/legacy-categories.ts`; preflight y migración SQL; tests unitarios de categorías e integración de categorías/migración.

Modificados: páginas/formularios/queries/API de productos; `lib/product-types.ts`, `lib/nav.ts`, validación y escritura de catálogo; layout, Header, MobileMenu, Footer, SiteChrome, CollectionView; catálogo, páginas históricas, detalle y sitemap; datos tipados de importación, scripts/seed, tests de catálogo/E2E, `package.json` (solo script), README y este resumen. El diff completo de Git contiene la lista exacta.

### Riesgos y pendientes reales

Aplicar preflight y SQL en producción, desplegar, comprobar allí con el dueño y probar cámara física. Los resultados locales no acreditan los datos o permisos del Supabase compartido remoto. La migración bloquea brevemente la tabla de productos dentro de su transacción. No retirar todavía `category`, `legacy_key` ni el registro de alias: preservan compatibilidad.

## Corrección del build de Vercel

El despliegue falló en `next/font/google` al intentar extraer la extensión de una URL de fuente. Se incluyeron los mismos archivos WOFF2 Latin de Fraunces, Mulish y Caveat con sus licencias SIL OFL, y se cambió la carga a `next/font/local`.

Se verificó un build limpio sin la caché anterior y con las descargas HTTP por proxy bloqueadas. También se repitieron lint, TypeScript, los 33 tests unitarios y la regresión E2E del catálogo. Chromium comprobó ambas variantes de Fraunces, Mulish y Caveat 600/700, servidas localmente con HTTP 200 en inicio y login.

## Estado y pendientes

- [PR #2 — Administrador y prefijos](https://github.com/pragmastudi0/viento-sur/pull/2): fusionado.
- [PR #3 — Corrección de fuentes](https://github.com/pragmastudi0/viento-sur/pull/3): fusionado; su verificación de Vercel fue exitosa.
- [Catálogo publicado](https://viento-sur-nu.vercel.app/catalogo): HTTP 200 y seis lámparas originales verificadas al preparar este resumen.
- [Login publicado](https://viento-sur-nu.vercel.app/admin/login): HTTP 200 y formulario de email/contraseña verificado al preparar este resumen.

Queda comprobar con la cuenta real del dueño el flujo completo en producción, la recuperación y entrega real de correos, y la carga desde la cámara de un teléfono físico. No se verificaron directamente las variables, políticas de otras aplicaciones ni la configuración SMTP del proyecto remoto compartido.

No se incorporaron pagos online, stock, promociones, drag & drop, papelera/restauración desde UI ni automatización remota de limpieza. El foco de la implementación es administrar el catálogo y mantener los pedidos por WhatsApp.
