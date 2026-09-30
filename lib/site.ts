/**
 * Configuración central del sitio.
 *
 * ─────────────────────────────────────────────────────────────
 *  NÚMERO DE WHATSAPP  ← CAMBIAR AQUÍ (y en ningún otro lugar)
 * ─────────────────────────────────────────────────────────────
 * Formato internacional para Argentina, sin "+", espacios ni guiones:
 *   54  → código de país (Argentina)
 *   9   → prefijo obligatorio para celulares desde el exterior / wa.me
 *   351 → característica (Córdoba)
 *   7681444 → número
 *
 * Número publicado por la marca: 3517681444  →  5493517681444
 */
export const WHATSAPP_NUMBER = '5493517681444';

/** Número tal como se muestra a los visitantes. */
export const WHATSAPP_DISPLAY = '351 768 1444';

export const SITE = {
  name: 'Viento Sur',
  tagline: 'Iluminación que transforma espacios.',
  description:
    'Lámparas de pie y veladores de diseño, hechos en Argentina. Estructuras de hierro y pantallas que difunden una luz blanca cálida.',
  /** URL pública del sitio (se usa en metadata, sitemap y Open Graph). Actualizar tras el deploy. */
  url: 'https://vientosur.vercel.app',
  /**
   * Instagram: dejar como null si no hay una URL real.
   * Si se completa con una URL, el enlace aparece automáticamente en el footer.
   */
  instagram: null as string | null,
} as const;
