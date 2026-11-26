'use client';

import Link from 'next/link';

/**
 * Aviso de primera capa: franja inferior sobria, sin tarjeta ni sombra. No bloquea la
 * navegación. “Aceptar todas” y “Rechazar las no esenciales” tienen la misma jerarquía visual.
 */
export default function CookieBanner({ onAcceptAll, onRejectAll, onConfigure }: {
  onAcceptAll: () => void; onRejectAll: () => void; onConfigure: () => void;
}) {
  return (
    <div
      role="region"
      aria-labelledby="cookie-banner-title"
      className="fixed inset-x-0 bottom-0 z-[60] animate-fade-in border-t border-ink/15 bg-cream"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="container-page flex flex-col gap-4 py-5 lg:flex-row lg:items-center lg:justify-between lg:gap-10">
        <div className="max-w-2xl">
          <h2 id="cookie-banner-title" className="font-display text-lg font-normal text-ink">
            Tu privacidad, tu elección
          </h2>
          <p className="mt-1.5 text-sm leading-relaxed text-ink/75">
            Usamos almacenamiento necesario para que el sitio funcione (por ejemplo, el carrito) y, solo si lo aceptás,
            herramientas de analítica para entender cómo se usa la web. Podés cambiar tu elección cuando quieras desde
            “Preferencias de cookies” al pie de la página. Más información en la{' '}
            <Link href="/politica-de-cookies" className="underline underline-offset-2 hover:text-ink">política de cookies</Link>.
          </p>
        </div>
        <div className="flex shrink-0 flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:items-center">
          <button type="button" onClick={onRejectAll} className="btn-primary btn-md">
            Rechazar las no esenciales
          </button>
          <button type="button" onClick={onAcceptAll} className="btn-primary btn-md">
            Aceptar todas
          </button>
          <button
            type="button"
            onClick={onConfigure}
            className="py-1.5 text-sm font-medium text-ink/75 underline underline-offset-4 transition-colors hover:text-ink sm:px-2"
          >
            Personalizar
          </button>
        </div>
      </div>
    </div>
  );
}
