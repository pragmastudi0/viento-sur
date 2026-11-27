/**
 * Envío de eventos a GA4 respetando el consentimiento.
 *
 * Los eventos solo se envían si la categoría “Analíticas” está aceptada en este
 * momento. Nunca se encolan eventos previos al consentimiento: gtag ya existe
 * desde el <head> (Consent Mode) y lo que se empuje al dataLayer se procesaría
 * al cargar gtag.js, por eso el control se hace acá.
 */

type ParamValue = string | number | boolean | undefined;
export type EventParams = Record<string, ParamValue | Record<string, ParamValue>[]>;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export const ANALYTICS_READY_EVENT = 'viento-sur:analytics-ready';

let analyticsEnabled = false;
let gaReady = false;

export function setAnalyticsEnabled(value: boolean) {
  analyticsEnabled = value;
  if (value && gaReady) window.dispatchEvent(new Event(ANALYTICS_READY_EVENT));
}

export function isAnalyticsEnabled() {
  return analyticsEnabled;
}

/** GA4 configurado (gtag('config') ya emitido): recién ahí se envían eventos. */
export function markGaReady() {
  gaReady = true;
  if (analyticsEnabled) window.dispatchEvent(new Event(ANALYTICS_READY_EVENT));
}

export function canTrack() {
  return analyticsEnabled && gaReady;
}

const EMAIL = /[^\s@]+@[^\s@]+\.[^\s@]+/;
const PHONE = /\d[\d\s().-]{6,}\d/;

/** Descarta valores que parezcan datos personales y limita la longitud (GA4: 100 caracteres). */
export function sanitizeParams(params: EventParams): EventParams {
  const clean: EventParams = {};
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined) continue;
    if (Array.isArray(value)) {
      clean[key] = value.map(item => sanitizeParams(item) as Record<string, ParamValue>);
      continue;
    }
    if (typeof value === 'string') {
      if (EMAIL.test(value) || PHONE.test(value)) continue;
      clean[key] = value.slice(0, 100);
      continue;
    }
    clean[key] = value;
  }
  return clean;
}

export function trackEvent(name: string, params: EventParams = {}) {
  if (typeof window === 'undefined' || !canTrack() || typeof window.gtag !== 'function') return;
  window.gtag('event', name, sanitizeParams(params));
}

export interface AnalyticsItem {
  item_id: string;
  item_name: string;
  item_category?: string;
  item_variant?: string;
  price?: number;
  quantity?: number;
}
