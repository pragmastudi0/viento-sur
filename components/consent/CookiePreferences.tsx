'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** Panel de preferencias (segunda capa). Modal accesible: foco atrapado, Escape cierra y devuelve el foco. */
export default function CookiePreferences({ initialAnalytics, onSave, onClose }: {
  initialAnalytics: boolean; onSave: (analytics: boolean) => void; onClose: () => void;
}) {
  const [analytics, setAnalytics] = useState(initialAnalytics);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  useEffect(() => { closeRef.current = onClose; }, [onClose]);

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    dialogRef.current?.querySelector<HTMLElement>(FOCUSABLE)?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.stopPropagation(); closeRef.current(); return; }
      if (event.key !== 'Tab' || !dialogRef.current) return;
      const items = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (!items.length) return;
      const first = items[0]; const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('keydown', onKey); previous?.focus?.(); };
  }, []);

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center overflow-y-auto bg-ink-deep/40 p-3 backdrop-blur-sm sm:items-center sm:p-6">
      <div className="absolute inset-0" aria-hidden="true" onClick={onClose} />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cookie-prefs-title"
        aria-describedby="cookie-prefs-desc"
        className="relative w-full max-w-lg animate-fade-in rounded-2xl bg-cream p-5 shadow-2xl sm:p-7"
      >
        <div className="flex items-start justify-between gap-4">
          <h2 id="cookie-prefs-title" className="font-display text-xl font-normal text-ink">Configurar cookies</h2>
          <button type="button" onClick={onClose} aria-label="Cerrar configuración de cookies"
            className="-mr-2 -mt-1 grid h-9 w-9 shrink-0 place-items-center rounded-full text-ink/50 transition-colors hover:text-ink">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <p id="cookie-prefs-desc" className="mt-2 text-sm leading-relaxed text-ink/65">
          Elegí qué tecnologías opcionales permitís. Rechazarlas no afecta la navegación ni el carrito. Detalle completo en la{' '}
          <Link href="/politica-de-cookies" onClick={onClose} className="underline underline-offset-2 hover:text-ink">política de cookies</Link>.
        </p>

        <ul className="mt-5 divide-y divide-ink/10 border-y border-ink/10">
          <li className="py-4">
            <div className="flex items-center justify-between gap-4">
              <h3 id="cookie-cat-necessary" className="text-sm font-semibold text-ink">Necesarias</h3>
              <span className="text-xs font-medium text-ink/55">Siempre activas</span>
            </div>
            <p className="mt-1.5 text-sm leading-relaxed text-ink/65">
              Guardan el carrito en tu navegador y recuerdan tu elección sobre cookies. Sin ellas el sitio no puede funcionar correctamente.
            </p>
          </li>
          <li className="py-4">
            <div className="flex items-center justify-between gap-4">
              <h3 id="cookie-cat-analytics" className="text-sm font-semibold text-ink">Analíticas</h3>
              <button
                type="button"
                role="switch"
                aria-checked={analytics}
                aria-labelledby="cookie-cat-analytics"
                aria-describedby="cookie-cat-analytics-desc"
                onClick={() => setAnalytics(value => !value)}
                className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink ${analytics ? 'bg-sage-deep' : 'bg-ink/25'}`}
              >
                <span className="sr-only">{analytics ? 'Activadas' : 'Desactivadas'}</span>
                <span aria-hidden="true" className={`inline-block h-5 w-5 rounded-full bg-cream shadow transition-transform ${analytics ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
            <p id="cookie-cat-analytics-desc" className="mt-1.5 text-sm leading-relaxed text-ink/65">
              Google Analytics 4 y Vercel Web Analytics: nos permiten medir visitas y consultas de forma agregada para mejorar el sitio.
              No usamos cookies publicitarias.
            </p>
          </li>
        </ul>

        <div className="mt-6 flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
          <button type="button" onClick={() => onSave(false)} className="btn-primary btn-md">Rechazar no necesarias</button>
          <button type="button" onClick={() => onSave(analytics)} className="btn-outline btn-md">Guardar preferencias</button>
          <button type="button" onClick={() => onSave(true)} className="btn-primary btn-md">Aceptar todas</button>
        </div>
      </div>
    </div>
  );
}
