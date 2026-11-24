/**
 * Gestión de consentimiento de cookies (sin dependencias externas).
 *
 * Modelo: Google Consent Mode v2 en modo BÁSICO. Las etiquetas de Google
 * (gtag.js) y Vercel Web Analytics recién se cargan cuando la persona acepta la
 * categoría “Analíticas”. Antes de eso no se envía ningún ping a Google.
 *
 * Categorías en uso (no se declaran categorías que el sitio no utiliza):
 *  - necessary: carrito (localStorage), registro de la elección de cookies y,
 *    solo en /admin, la sesión de Supabase. Siempre activas.
 *  - analytics: Google Analytics 4 y Vercel Web Analytics. Opcional.
 * No hay tecnologías de marketing: ad_storage, ad_user_data y ad_personalization
 * permanecen siempre en `denied`.
 */

/** Incrementar cuando cambien las finalidades, proveedores o la política: invalida decisiones previas. */
export const CONSENT_VERSION = 1;
export const CONSENT_STORAGE_KEY = 'viento-sur-consent';
export const CONSENT_EVENT = 'viento-sur:consent';

export interface ConsentState {
  version: number;
  analytics: boolean;
  /** ISO 8601. Registro de cuándo se tomó la decisión. */
  updatedAt: string;
}

export type ConsentModeValue = 'granted' | 'denied';
export interface ConsentModeState {
  analytics_storage: ConsentModeValue;
  ad_storage: 'denied';
  ad_user_data: 'denied';
  ad_personalization: 'denied';
}

export function parseConsent(raw: string | null | undefined): ConsentState | null {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw) as Partial<ConsentState>;
    if (value?.version !== CONSENT_VERSION || typeof value.analytics !== 'boolean' || typeof value.updatedAt !== 'string') return null;
    return { version: value.version, analytics: value.analytics, updatedAt: value.updatedAt };
  } catch {
    return null;
  }
}

export function createConsent(analytics: boolean, now = new Date()): ConsentState {
  return { version: CONSENT_VERSION, analytics, updatedAt: now.toISOString() };
}

export function consentModeState(analytics: boolean): ConsentModeState {
  return { analytics_storage: analytics ? 'granted' : 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' };
}

const GA_ID_PATTERN = /^G-[A-Z0-9]{4,20}$/;

/** Measurement ID de GA4 (público por diseño). Si falta o es inválido, GA4 queda desactivado. */
export function gaMeasurementId(value = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID): string | null {
  const id = value?.trim().toUpperCase();
  return id && GA_ID_PATTERN.test(id) ? id : null;
}

/**
 * Script inline que se ejecuta en <head> antes de cualquier etiqueta: define
 * dataLayer/gtag, fija los valores por defecto (todo denegado) y, si existe una
 * decisión válida guardada, aplica la actualización antes de que cargue gtag.js.
 */
export function consentBootstrapScript(): string {
  const defaults = JSON.stringify(consentModeState(false));
  const granted = JSON.stringify({ analytics_storage: 'granted' });
  return [
    'window.dataLayer=window.dataLayer||[];',
    'function gtag(){dataLayer.push(arguments);}window.gtag=window.gtag||gtag;',
    `gtag('consent','default',${defaults});`,
    "gtag('set','ads_data_redaction',true);",
    'try{',
    `var c=JSON.parse(localStorage.getItem(${JSON.stringify(CONSENT_STORAGE_KEY)})||'null');`,
    `if(c&&c.version===${CONSENT_VERSION}&&c.analytics===true){gtag('consent','update',${granted});}`,
    '}catch(e){}',
  ].join('');
}

/** Nombres de cookies propias de GA4 que se eliminan al retirar el consentimiento. */
export function isAnalyticsCookie(name: string): boolean {
  return name === '_ga' || name.startsWith('_ga_') || name === '_gid' || name === '_gat' || name.startsWith('_gat_');
}

/** Dominios candidatos donde GA pudo haber escrito cookies (host y dominios padre). */
export function cookieDomainsFor(hostname: string): string[] {
  const parts = hostname.split('.');
  const domains = [''];
  for (let i = 0; i < parts.length - 1; i++) domains.push(`.${parts.slice(i).join('.')}`);
  return domains;
}
