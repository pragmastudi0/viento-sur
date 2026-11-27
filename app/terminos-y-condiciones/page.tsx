import type { Metadata } from 'next';
import Link from 'next/link';
import LegalPage, { LegalValue } from '@/components/legal/LegalPage';
import { CARE_PAGE, LEGAL, WARRANTY } from '@/lib/legal';
import { SITE } from '@/lib/site';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Términos y condiciones',
  description: 'Condiciones de uso del sitio de Viento Sur y de los pedidos coordinados por WhatsApp.',
  path: '/terminos-y-condiciones',
  noindex: LEGAL.pendingReview,
});

export default function TermsPage() {
  return (
    <LegalPage
      current="/terminos-y-condiciones"
      title="Términos y condiciones"
      intro={<p>Estos términos regulan el uso de este sitio y la forma en que se inician los pedidos de productos {SITE.name}. Al navegar el sitio o enviarnos un pedido, aceptás estas condiciones.</p>}
    >
      <h2>1. Titular del sitio</h2>
      <ul>
        <li><strong>Titular:</strong> <LegalValue value={LEGAL.ownerName} hint="nombre o razón social" /></li>
        <li><strong>CUIL:</strong> <LegalValue value={LEGAL.taxId} /></li>
        <li><strong>Domicilio:</strong> <LegalValue value={LEGAL.legalAddress} /></li>
        <li><strong>Contacto:</strong> WhatsApp (ver <Link href="/contacto">contacto</Link>) · <LegalValue value={LEGAL.privacyEmail} hint="correo electrónico" /></li>
      </ul>

      <h2>2. Productos y precios</h2>
      <p>El sitio presenta el catálogo de lámparas {SITE.name}, diseñadas y fabricadas en Córdoba. Los precios se expresan en pesos argentinos (ARS). Antes de enviar un pedido, el sitio verifica precios y disponibilidad contra el catálogo vigente.</p>

      <h2>3. Cómo se realiza un pedido</h2>
      <p>El sitio no procesa pagos. Al usar “Enviar pedido por WhatsApp”, se genera un mensaje con los productos elegidos que podés enviarnos desde tu cuenta de WhatsApp. El pedido queda confirmado recién cuando te confirmamos por ese medio la disponibilidad, el tiempo de entrega y la forma de pago.</p>

      <h2>4. Envíos, pagos, cambios y garantía</h2>
      <h3>Envíos</h3>
      <ul>
        <li><strong>Córdoba Capital:</strong> envío sin cargo en compras que superen los $130.000.</li>
        <li><strong>Localidades aledañas</strong> (hasta 40 km de nuestro depósito): envío sin cargo en compras que superen los $160.000.</li>
        <li>En los demás casos, el costo del envío se define según la distancia y el monto de la compra, y te lo informamos al coordinar el pedido.</li>
      </ul>
      <h3>Pagos</h3>
      <p>Aceptamos transferencia bancaria o efectivo. La forma de pago se acuerda al confirmar el pedido por WhatsApp.</p>
      <h3>Plazos de fabricación, cambios y devoluciones</h3>
      <p><LegalValue value={null} hint="detallar plazos de fabricación y entrega, y la política de cambios y devoluciones" /></p>
      <h3>Garantía</h3>
      <p>{WARRANTY.text} Las indicaciones de uso y cuidado están disponibles en <Link href={CARE_PAGE.href}>{CARE_PAGE.label.toLowerCase()}</Link>.</p>

      <h2>5. Derecho de revocación</h2>
      <p>En las compras realizadas a distancia, quien compra como consumidor tiene derecho a revocar la aceptación dentro de los 10 días corridos contados desde la entrega del producto o la celebración del contrato, lo último que ocurra, conforme al artículo 34 de la Ley 24.240 de Defensa del Consumidor y el artículo 1110 del Código Civil y Comercial de la Nación. <LegalValue value={null} hint="indicar el procedimiento para solicitarlo" /></p>

      <h2>6. Propiedad intelectual</h2>
      <p>Los diseños de los productos, la marca {SITE.name}, el logotipo, las fotografías y los textos del sitio pertenecen a su titular o se usan con autorización. No pueden reproducirse ni utilizarse con fines comerciales sin permiso previo y por escrito.</p>

      <h2>7. Uso del sitio y responsabilidad</h2>
      <p>Nos esforzamos por mantener la información actualizada y el sitio disponible, pero pueden existir interrupciones técnicas o errores involuntarios, que corregiremos apenas los detectemos. Los enlaces a sitios de terceros (WhatsApp, Instagram) se rigen por las condiciones de esos servicios.</p>

      <h2>8. Datos personales</h2>
      <p>El tratamiento de datos personales se describe en la <Link href="/politica-de-privacidad">política de privacidad</Link> y el uso de cookies en la <Link href="/politica-de-cookies">política de cookies</Link>.</p>

      <h2>9. Modificaciones</h2>
      <p>Podemos actualizar estos términos. La versión vigente es la publicada en esta página, con su fecha de actualización. Los cambios no afectan pedidos ya confirmados.</p>

      <h2>10. Ley aplicable</h2>
      <p>Estos términos se rigen por las leyes de la República Argentina, incluidas las normas de defensa del consumidor cuando correspondan.</p>
    </LegalPage>
  );
}
