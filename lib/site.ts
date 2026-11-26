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
    'Iluminación de diseño creada y fabricada en Córdoba. Lámparas impresas en 3D para darle calidez y personalidad a cada espacio.',
  /** URL pública oficial (metadata, canonical, sitemap y Open Graph). En Vercel, SITE_URL debe coincidir. */
  url: process.env.SITE_URL || 'https://www.vientosurluz.com',
  /**
   * Instagram: dejar como null si no hay una URL real.
   * Si se completa con una URL, el enlace aparece automáticamente en el footer.
   */
  instagram: 'https://www.instagram.com/vientosurluz/',
  instagramHandle: '@vientosurluz',
  /**
   * Crédito del desarrollo en el footer. Si `url` es null se muestra solo el nombre,
   * sin enlace (no se inventa una dirección).
   */
  developer: { name: 'Pragma', url: 'https://pragmastudio.com.ar' as string | null },
  /** Localización comercial declarada por la marca (sin domicilio público). */
  locality: 'Córdoba',
  region: 'Córdoba',
  country: 'AR',
} as const;
