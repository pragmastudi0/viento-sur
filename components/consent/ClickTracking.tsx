'use client';

import { useEffect } from 'react';
import { trackEvent } from '@/lib/analytics';

/**
 * Medición delegada de clics (un único listener, sin convertir componentes de
 * servidor en cliente). Se monta solo con consentimiento analítico.
 *
 *  - Enlaces a WhatsApp (wa.me)   → `contact` { method, link_location, inquiry_type }
 *  - Elementos con [data-cta]     → `click_cta` { cta_id, link_location }
 *
 * Nunca se envía la URL de WhatsApp ni el texto del mensaje.
 */
export default function ClickTracking() {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = event.target instanceof Element ? event.target.closest('a, button') : null;
      if (!target) return;
      const location = target.closest<HTMLElement>('[data-analytics-location]')?.dataset.analyticsLocation;
      const href = target instanceof HTMLAnchorElement ? target.href : '';
      if (href.startsWith('https://wa.me/')) {
        trackEvent('contact', {
          method: 'whatsapp',
          link_location: location ?? 'unknown',
          inquiry_type: (target as HTMLElement).dataset.inquiry ?? 'general',
        });
        return;
      }
      const cta = (target as HTMLElement).dataset.cta;
      if (cta) trackEvent('click_cta', { cta_id: cta, link_location: location ?? 'unknown' });
    };
    document.addEventListener('click', onClick, { capture: true });
    return () => document.removeEventListener('click', onClick, { capture: true });
  }, []);
  return null;
}
