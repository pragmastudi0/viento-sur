'use client';

import Link from 'next/link';

/**
 * Aviso de primera capa. No bloquea la navegación: el sitio funciona igual
 * aunque no se responda. “Aceptar” y “Rechazar” tienen la misma jerarquía visual.
 */
export default function CookieBanner({ onAcceptAll, onRejectAll, onConfigure }: {
  onAcceptAll: () => void; onRejectAll: () => void; onConfigure: () => void;
}) {
  return (
    <div
      role="region"
      aria-labelledby="cookie-banner-title"
      className="fixed inset-x-0 bottom-0 z-[60] px-3 pb-3 sm:px-5 sm:pb-5"
      style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom, 0px))' }}
    >
      <div className="mx-auto max-w-3xl animate-fade-in rounded-2xl border border-ink/10 bg-cream p-5 shadow-2xl shadow-ink/20 sm:p-6">
        <h2 id="cookie-banner-title" className="font-display text-lg font-normal text-ink">
          Tu privacidad, tu elección
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-ink/70">
          Usamos tecnologías necesarias para que el sitio funcione (por ejemplo, el carrito) y, solo si lo aceptás,
          herramientas de analítica para entender cómo se usa la web y mejorarla. Podés cambiar tu elección cuando
          quieras desde “Configurar cookies” al pie de la página. Más información en la{' '}
          <Link href="/politica-de-cookies" className="underline underline-offset-2 hover:text-ink">política de cookies</Link>{' '}
          y la{' '}
          <Link href="/politica-de-privacidad" className="underline underline-offset-2 hover:text-ink">política de privacidad</Link>.
        </p>
        <div className="mt-5 flex flex-col-reverse gap-2.5 sm:flex-row sm:items-center sm:justify-end">
          <button type="button" onClick={onConfigure} className="btn-outline btn-md">
            Configurar
          </button>
          <button type="button" onClick={onRejectAll} className="btn-primary btn-md">
            Rechazar no necesarias
          </button>
          <button type="button" onClick={onAcceptAll} className="btn-primary btn-md">
            Aceptar todas
          </button>
        </div>
      </div>
    </div>
  );
}
