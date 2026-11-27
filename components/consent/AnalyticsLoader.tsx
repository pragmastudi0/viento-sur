'use client';

import { useEffect } from 'react';
import { Analytics } from '@vercel/analytics/next';
import { isAnalyticsEnabled, markGaReady } from '@/lib/analytics';

const GA_SCRIPT_ID = 'ga4-gtag';
let gaConfigured = false;

/**
 * Se monta SOLO con consentimiento analítico (ver ConsentProvider).
 * - GA4: inyecta gtag.js una única vez por carga de página. La navegación SPA de
 *   Next se mide con la opción “Cambios de página basados en el historial del
 *   navegador” de la medición mejorada de GA4 (activa por defecto), por eso no se
 *   envían page_view manuales: evitaría duplicados.
 * - Vercel Web Analytics: el componente oficial, con un guardián `beforeSend`
 *   que descarta eventos si el consentimiento se retiró durante la visita.
 */
export default function AnalyticsLoader({ gaId }: { gaId: string | null }) {
  useEffect(() => {
    if (!gaId || gaConfigured || typeof window.gtag !== 'function') return;
    gaConfigured = true;
    window.gtag('js', new Date());
    window.gtag('config', gaId, {
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
    });
    if (!document.getElementById(GA_SCRIPT_ID)) {
      const script = document.createElement('script');
      script.id = GA_SCRIPT_ID;
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`;
      document.head.appendChild(script);
    }
    markGaReady();
  }, [gaId]);

  return <Analytics beforeSend={event => (isAnalyticsEnabled() ? event : null)} />;
}
