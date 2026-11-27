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
  ownerName: 'Bernardo Cima' as string | null,
  /** CUIL del titular (persona humana). */
  taxId: '20-42640808-3' as string | null,
  /** Domicilio legal (calle, número, localidad, provincia). */
  legalAddress: 'Díaz Usandivaras 923, Córdoba Capital, Córdoba' as string | null,
  /** Correo electrónico para consultas y ejercicio de derechos de datos personales. */
  privacyEmail: 'vientosurluz@gmail.com' as string | null,
  /** Período de retención configurado en GA4 (Administrar → Recopilación de datos → Retención). */
  ga4Retention: '14 meses' as string | null,
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

/** Garantía declarada por el titular (texto textual). Se usa en /cuidados-y-garantia y en los términos. */
export const WARRANTY = {
  months: 12,
  text: 'El producto cuenta con una garantía de 12 meses a partir de la fecha de recepción. La cobertura comprende fallas eléctricas, desperfectos de montaje y roturas atribuibles a defectos de fabricación, siempre que se hayan respetado las indicaciones de uso y cuidado del producto.',
} as const;

export const CARE_PAGE = { href: '/cuidados-y-garantia', label: 'Cuidados y garantía' } as const;
export const CARE_MANUAL_PDF = '/manual-de-cuidados-viento-sur.pdf';
