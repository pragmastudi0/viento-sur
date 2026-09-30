# Viento Sur — Sitio web

Sitio de catálogo para **Viento Sur**, marca argentina de lámparas de pie y veladores. Landing + catálogo + páginas de producto + carrito. El pedido **no se paga online**: se cierra por WhatsApp con el mensaje ya armado.

Hecho con **Next.js 14** (App Router), **React**, **TypeScript** y **Tailwind CSS**. Sin backend ni base de datos. Listo para desplegar en **Vercel**.

---

## Cómo correrlo en tu computadora

Necesitás [Node.js](https://nodejs.org) 18.17 o superior.

```bash
npm install      # instala las dependencias (una sola vez)
npm run dev      # modo desarrollo → http://localhost:3000
npm run build    # build de producción
npm start        # sirve el build de producción
```

---

## Lo más importante: dónde editar

### 1. Número de WhatsApp
Un solo lugar: **`lib/site.ts`**.

```ts
export const WHATSAPP_NUMBER = '5493517681444'; // formato internacional, sin + ni espacios
export const WHATSAPP_DISPLAY = '351 768 1444';  // cómo se muestra en pantalla
```

El formato para Argentina es `54` + `9` + característica + número. Cambiá los dos valores y todo el sitio (hero, contacto, footer, botón flotante, formulario de pedido) queda actualizado.

### 2. Productos y precios
Un solo archivo: **`data/products.ts`**. Cada lámpara es un objeto:

```ts
{
  id: 'lanin',
  slug: 'lanin',                    // define la URL: /productos/lanin
  name: 'Lanin',
  category: 'lampara-de-pie',       // 'lampara-de-pie' | 'velador'
  categoryLabel: 'Lámpara de pie',
  price: 78000,                     // solo el número, sin puntos ni símbolo
  images: [
    { src: '/products/lanin-1.jpg', alt: 'Descripción de la foto' },
  ],
  description: '...',
  specifications: ['Base de hierro redonda', 'Altura 1,7 m'],
  variants: STRUCTURE_VARIANTS,     // negro / grafito / bronce (compartidas)
  featured: true,                   // aparece destacada en el inicio
}
```

- **Precio:** se escribe como número entero (`78000`) y se muestra formateado automáticamente (`$78.000`).
- **Agregar un producto:** copiá un bloque, cambiá `id`, `slug`, datos y fotos.
- **Quitar un producto:** borrá su bloque.
- **Terminaciones de estructura:** son las mismas para todos y se definen una vez en `STRUCTURE_VARIANTS` (arriba del listado).

### 3. Fotos
Van en **`public/products/`**. Referencialas desde `data/products.ts` como `/products/nombre.jpg`.

Recomendación: subir imágenes ya optimizadas (ancho máximo ~1500 px, formato JPG). Se muestran recortadas en proporción vertical (4:5).

- **Foto principal del inicio (hero):** `public/products/hero.jpg`
- **Imagen para compartir en redes (Open Graph):** `public/og.jpg`

### 4. Textos de secciones
- **Inicio:** `app/page.tsx`
- **"Hecho para tu espacio" (personalizados):** `components/CustomProducts.tsx` y `app/personalizados/page.tsx`
- **"Por qué Viento Sur":** `components/WhyVientoSur.tsx`
- **Contacto:** `app/contacto/page.tsx`
- **Tagline y descripción del sitio:** `lib/site.ts`

### 5. Instagram (opcional)
En `lib/site.ts`, `instagram` está en `null`. Si ponés una URL real, el enlace aparece solo en el footer y en contacto:

```ts
instagram: 'https://instagram.com/tucuenta',
```

---

## Desplegar en Vercel

1. Subí el proyecto a un repositorio de GitHub (o GitLab/Bitbucket).
2. Entrá a [vercel.com](https://vercel.com), **Add New → Project** e importá el repositorio.
3. Vercel detecta Next.js solo. No hace falta configurar nada: **Deploy**.
4. Cuando tengas el dominio final, actualizá `SITE.url` en `lib/site.ts` (se usa en el sitemap y en los datos para compartir en redes) y volvé a desplegar.

Cada vez que hagas un cambio y lo subas al repositorio, Vercel republica el sitio automáticamente.

---

## Estructura del proyecto

```
app/                     Páginas (App Router)
  page.tsx               Inicio
  catalogo/              Toda la colección
  lamparas-de-pie/       Categoría
  veladores/             Categoría
  personalizados/        Personalizados
  contacto/              Contacto
  productos/[slug]/      Página de cada producto (se genera sola desde data/products.ts)
  layout.tsx             Estructura común (header, footer, carrito)
  globals.css            Estilos base y utilidades
components/              Componentes de interfaz (carrito, tarjetas, hero, etc.)
context/                 Estado del carrito y de los avisos (toasts)
data/products.ts         ← EL CATÁLOGO
lib/
  site.ts                ← WHATSAPP Y DATOS DEL SITIO
  whatsapp.ts            Armado de los mensajes de WhatsApp
  currency.ts            Formato de precios ($)
  nav.ts                 Enlaces del menú
public/
  products/              Fotos de los productos
  brand/                 Logo (marca)
  og.jpg                 Imagen para compartir en redes
```

---

## Cómo funciona el pedido

1. La persona agrega productos al carrito (se guarda en su navegador con `localStorage`, así no se pierde al recargar).
2. En el carrito toca **Continuar pedido** y completa nombre y localidad (teléfono y comentarios son opcionales).
3. Al enviar, se abre WhatsApp con el mensaje del pedido ya redactado (detalle, cantidades y total).
4. El cierre —disponibilidad, envío y pago— se coordina por WhatsApp.

> El carrito **no** se vacía solo después de enviar, por si la persona quiere ajustar algo y reenviar.

---

## Preparado para el futuro

La estructura permite sumar más adelante, sin rehacer el sitio: base de datos y control de stock, panel de administración para cargar productos, o pagos online. Hoy nada de eso está activo: el catálogo se edita en `data/products.ts` y el pedido se cierra por WhatsApp.
