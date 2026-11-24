/**
 * Datos legales del titular del sitio.
 *
 * ⚠️ COMPLETAR ANTES DE PUBLICAR LAS POLÍTICAS. No se inventan datos: cada campo
 * en `null` se muestra en las páginas legales como “[A completar por el titular]”.
 * Los textos son una base técnica y deben ser revisados por un profesional
 * del derecho antes de considerarse definitivos.
 */
export const LEGAL = {
  /** Nombre completo o razón social del responsable del tratamiento. */
  ownerName: null as string | null,
  /** CUIT / CUIL del titular. */
  taxId: null as string | null,
  /** Domicilio legal (calle, número, localidad, provincia). */
  legalAddress: null as string | null,
  /** Correo electrónico para consultas y ejercicio de derechos de datos personales. */
  privacyEmail: null as string | null,
  /** Período de retención configurado en GA4 (Administrar → Recopilación de datos → Retención). */
  ga4Retention: null as string | null,
  /** Fecha de última actualización de los documentos legales. */
  updatedAt: '24 de noviembre de 2026',
  /**
   * Mientras sea `true`, las páginas legales se sirven con `noindex` y quedan fuera
   * del sitemap. Pasar a `false` cuando estén completas y revisadas.
   */
  pendingReview: true,
} as const;

export const LEGAL_PLACEHOLDER = '[A completar por el titular]';

export const LEGAL_LINKS = [
  { href: '/politica-de-privacidad', label: 'Política de privacidad' },
  { href: '/politica-de-cookies', label: 'Política de cookies' },
  { href: '/terminos-y-condiciones', label: 'Términos y condiciones' },
] as const;
