'use client';

import { useEffect, useRef } from 'react';
import { ANALYTICS_READY_EVENT, canTrack, trackEvent, type AnalyticsItem } from '@/lib/analytics';

/**
 * `view_item` (evento recomendado de GA4 para comercio) una vez por ficha.
 * Si la persona acepta analíticas estando en la ficha, se registra en ese momento.
 */
export default function ProductViewTracker({ item }: { item: AnalyticsItem }) {
  const sent = useRef<string | null>(null);
  useEffect(() => {
    const send = () => {
      if (sent.current === item.item_id || !canTrack()) return;
      sent.current = item.item_id;
      trackEvent('view_item', { currency: 'ARS', value: item.price, items: [{ ...item }] });
    };
    // Si GA4 ya está listo (navegación interna) se envía ahora; si no, al quedar listo.
    send();
    window.addEventListener(ANALYTICS_READY_EVENT, send);
    return () => window.removeEventListener(ANALYTICS_READY_EVENT, send);
  }, [item]);
  return null;
}
