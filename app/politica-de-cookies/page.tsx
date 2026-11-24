import type { Metadata } from 'next';
import Link from 'next/link';
import LegalPage from '@/components/legal/LegalPage';
import CookieSettingsButton from '@/components/consent/CookieSettingsButton';
import { LEGAL } from '@/lib/legal';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Política de cookies',
  description: 'Qué cookies y tecnologías similares usa el sitio de Viento Sur, para qué sirven y cómo configurar tu consentimiento.',
  path: '/politica-de-cookies',
  noindex: LEGAL.pendingReview,
});

/** Inventario real del sitio. Mantener sincronizado con lib/consent.ts y el código. */
const INVENTORY = [
  { name: 'viento-sur-cart', type: 'Almacenamiento local', provider: 'Viento Sur (propia)', purpose: 'Guardar los productos del carrito entre visitas.', duration: 'Hasta que vacíes el carrito o borres los datos del sitio.', category: 'Necesaria' },
  { name: 'viento-sur-consent', type: 'Almacenamiento local', provider: 'Viento Sur (propia)', purpose: 'Recordar tu elección sobre cookies y su versión.', duration: 'Hasta que borres los datos del sitio. Se vuelve a consultar si cambia esta política.', category: 'Necesaria' },
  { name: 'sb-…-auth-token', type: 'Cookie', provider: 'Supabase (propia)', purpose: 'Mantener la sesión del panel de administración. Solo se crea al iniciar sesión en /admin; no afecta a visitantes.', duration: 'Hasta cerrar sesión (máximo 400 días).', category: 'Necesaria' },
  { name: '_ga', type: 'Cookie', provider: 'Google Analytics 4', purpose: 'Distinguir visitantes de forma seudónima para estadísticas.', duration: '2 años', category: 'Analítica' },
  { name: '_ga_<ID>', type: 'Cookie', provider: 'Google Analytics 4', purpose: 'Mantener el estado de la sesión de medición.', duration: '2 años', category: 'Analítica' },
  { name: '—', type: 'Sin cookies', provider: 'Vercel Web Analytics', purpose: 'Contar visitas de forma agregada. No usa cookies: identifica la visita con un hash de la solicitud que se descarta a las 24 horas.', duration: 'No aplica', category: 'Analítica' },
];

export default function CookiePolicyPage() {
  return (
    <LegalPage
      current="/politica-de-cookies"
      title="Política de cookies"
      intro={<p>Te contamos qué cookies y tecnologías similares usamos, con qué finalidad y cómo podés aceptarlas, rechazarlas o cambiar tu elección en cualquier momento.</p>}
    >
      <div className="rounded-2xl border border-ink/10 bg-sage-tint/60 p-5">
        <p className="text-sm text-ink/75">Podés revisar o cambiar tu elección ahora mismo.</p>
        <CookieSettingsButton className="btn-primary btn-md mt-3 !no-underline">Configurar cookies</CookieSettingsButton>
      </div>

      <h2>1. Qué son las cookies</h2>
      <p>Las cookies son pequeños archivos que un sitio guarda en tu navegador. Tecnologías similares, como el almacenamiento local (localStorage), cumplen funciones parecidas. Algunas son imprescindibles para que el sitio funcione; otras son opcionales y solo se activan si las aceptás.</p>

      <h2>2. Categorías que usamos</h2>
      <ul>
        <li><strong>Necesarias:</strong> permiten el funcionamiento básico, como el carrito y recordar tu elección de cookies. No pueden desactivarse desde el panel, aunque podés borrarlas desde tu navegador.</li>
        <li><strong>Analíticas (opcionales):</strong> nos ayudan a entender cómo se usa el sitio para mejorarlo. Solo se cargan si las aceptás.</li>
      </ul>
      <p>No usamos cookies publicitarias, de redes sociales ni de seguimiento entre sitios. En Google Consent Mode, los permisos publicitarios (<code>ad_storage</code>, <code>ad_user_data</code>, <code>ad_personalization</code>) permanecen siempre denegados.</p>

      <h2>3. Detalle de cookies y tecnologías</h2>
      <div className="-mx-5 overflow-x-auto px-5 sm:mx-0 sm:px-0">
        <table className="w-full min-w-[640px] border-collapse text-left text-sm">
          <caption className="sr-only">Inventario de cookies y tecnologías similares</caption>
          <thead>
            <tr className="border-b border-ink/20 text-ink">
              <th scope="col" className="py-2 pr-4 font-semibold">Nombre</th>
              <th scope="col" className="py-2 pr-4 font-semibold">Proveedor</th>
              <th scope="col" className="py-2 pr-4 font-semibold">Finalidad</th>
              <th scope="col" className="py-2 pr-4 font-semibold">Duración</th>
              <th scope="col" className="py-2 font-semibold">Categoría</th>
            </tr>
          </thead>
          <tbody>
            {INVENTORY.map(row => (
              <tr key={`${row.provider}-${row.name}`} className="border-b border-ink/10 align-top">
                <td className="py-3 pr-4"><code className="break-all text-ink">{row.name}</code><span className="block text-xs text-ink/50">{row.type}</span></td>
                <td className="py-3 pr-4">{row.provider}</td>
                <td className="py-3 pr-4">{row.purpose}</td>
                <td className="py-3 pr-4">{row.duration}</td>
                <td className="py-3">{row.category}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-sm">Las duraciones de Google Analytics corresponden a la configuración predeterminada documentada por Google. Más información: <a href="https://developers.google.com/tag-platform/security/concepts/cookies" target="_blank" rel="noopener noreferrer">cookies de Google</a> y <a href="https://vercel.com/docs/analytics/privacy-policy" target="_blank" rel="noopener noreferrer">privacidad de Vercel Web Analytics</a>.</p>

      <h2>4. Cómo aceptar, rechazar o cambiar tu elección</h2>
      <p>En tu primera visita te mostramos un aviso con tres opciones de igual relevancia: <strong>Aceptar todas</strong>, <strong>Rechazar no necesarias</strong> o <strong>Configurar</strong>. Hasta que aceptes, no se carga ninguna herramienta de analítica. Rechazar no limita la navegación ni el uso del carrito.</p>
      <p>Podés cambiar o retirar tu consentimiento cuando quieras desde el enlace “Configurar cookies” al pie de cada página. Si retirás el consentimiento, dejamos de medir y eliminamos las cookies de Google Analytics de este sitio.</p>

      <h2>5. Cómo eliminar cookies desde el navegador</h2>
      <p>También podés borrar las cookies y los datos de sitios desde la configuración de tu navegador:</p>
      <ul>
        <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer">Google Chrome</a></li>
        <li><a href="https://support.mozilla.org/kb/clear-cookies-and-site-data-firefox" target="_blank" rel="noopener noreferrer">Mozilla Firefox</a></li>
        <li><a href="https://support.apple.com/guide/safari/manage-cookies-sfri11471/mac" target="_blank" rel="noopener noreferrer">Safari</a></li>
      </ul>
      <p>Google ofrece además un <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer">complemento de inhabilitación de Google Analytics</a>.</p>

      <h2>6. Más información</h2>
      <p>Para saber cómo tratamos los datos personales, consultá la <Link href="/politica-de-privacidad">política de privacidad</Link>.</p>
    </LegalPage>
  );
}
