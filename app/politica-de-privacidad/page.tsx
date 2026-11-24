import type { Metadata } from 'next';
import Link from 'next/link';
import LegalPage, { LegalValue } from '@/components/legal/LegalPage';
import CookieSettingsButton from '@/components/consent/CookieSettingsButton';
import { LEGAL } from '@/lib/legal';
import { SITE } from '@/lib/site';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Política de privacidad',
  description: 'Cómo Viento Sur trata los datos personales de quienes visitan el sitio y realizan consultas o pedidos por WhatsApp.',
  path: '/politica-de-privacidad',
  noindex: LEGAL.pendingReview,
});

export default function PrivacyPolicyPage() {
  return (
    <LegalPage
      current="/politica-de-privacidad"
      title="Política de privacidad"
      intro={<p>En esta política explicamos qué datos personales tratamos cuando visitás {SITE.url.replace(/^https?:\/\//, '')} o nos escribís por WhatsApp, para qué los usamos y cómo podés ejercer tus derechos. Se elaboró conforme a la Ley 25.326 de Protección de los Datos Personales de la República Argentina y su normativa complementaria.</p>}
    >
      <h2>1. Responsable del tratamiento</h2>
      <ul>
        <li><strong>Titular:</strong> <LegalValue value={LEGAL.ownerName} hint="nombre o razón social" /> (marca comercial “{SITE.name}”).</li>
        <li><strong>CUIT:</strong> <LegalValue value={LEGAL.taxId} /></li>
        <li><strong>Domicilio:</strong> <LegalValue value={LEGAL.legalAddress} /></li>
        <li><strong>Correo electrónico para temas de privacidad:</strong> <LegalValue value={LEGAL.privacyEmail} /></li>
      </ul>

      <h2>2. Qué datos tratamos</h2>
      <h3>a) Navegación en el sitio</h3>
      <p>El sitio no tiene formularios de registro ni cuentas de clientes. Al navegar, nuestro proveedor de alojamiento procesa datos técnicos necesarios para entregar las páginas (como la dirección IP, el tipo de navegador y la página solicitada).</p>
      <h3>b) Carrito de compras</h3>
      <p>Los productos que agregás al carrito se guardan únicamente en tu navegador (almacenamiento local). Antes de enviar el pedido, el sitio consulta al servidor solo los identificadores de los productos para verificar precios y disponibilidad en el catálogo; no se envían ni guardan datos personales.</p>
      <h3>c) Consultas y pedidos por WhatsApp</h3>
      <p>Cuando hacés clic en un botón de WhatsApp, se abre esa aplicación con un mensaje prearmado. Si decidís enviarlo, recibimos tu número de teléfono, el nombre de tu perfil y el contenido de la conversación (por ejemplo, los productos elegidos y, si los compartís, tu nombre, dirección o provincia para coordinar la entrega).</p>
      <h3>d) Analítica (solo con tu consentimiento)</h3>
      <p>Si aceptás las cookies analíticas, usamos Google Analytics 4 y Vercel Web Analytics para obtener estadísticas agregadas: páginas visitadas, dispositivo, ubicación aproximada (país o ciudad), origen de la visita e interacciones como consultas por WhatsApp o productos agregados al carrito. No enviamos a estas herramientas tu nombre, teléfono, correo ni el contenido de tus mensajes. Las señales publicitarias de Google están desactivadas.</p>

      <h2>3. Para qué usamos los datos y con qué base</h2>
      <ul>
        <li><strong>Mostrar el sitio y mantenerlo seguro</strong> (datos técnicos de navegación): necesario para prestar el servicio que solicitás.</li>
        <li><strong>Responder consultas y gestionar pedidos</strong> (WhatsApp): tu consentimiento al escribirnos y la relación precontractual o contractual que se genera con el pedido (art. 5 de la Ley 25.326).</li>
        <li><strong>Medir y mejorar el sitio</strong> (analítica): tu consentimiento, que podés retirar en cualquier momento.</li>
      </ul>
      <p>No vendemos ni cedemos tus datos a terceros con fines comerciales, no realizamos publicidad personalizada y no tomamos decisiones automatizadas con efectos sobre vos.</p>

      <h2>4. Proveedores que intervienen</h2>
      <ul>
        <li><strong>Vercel Inc.</strong> (Estados Unidos): alojamiento del sitio y, con tu consentimiento, Vercel Web Analytics. <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer">Política de privacidad</a>.</li>
        <li><strong>Supabase Inc.</strong>: base de datos del catálogo y acceso del panel de administración. No almacena datos de visitantes. <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer">Política de privacidad</a>.</li>
        <li><strong>Google LLC</strong> (Estados Unidos): Google Analytics 4, solo con tu consentimiento. <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Política de privacidad</a>.</li>
        <li><strong>WhatsApp (Meta Platforms)</strong>: canal de mensajería que elegís usar para contactarnos; trata tus datos bajo sus propias condiciones. <a href="https://www.whatsapp.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer">Política de privacidad</a>.</li>
      </ul>
      <p>Los enlaces a Instagram llevan a una plataforma de terceros con su propia política de privacidad.</p>

      <h2>5. Transferencias internacionales</h2>
      <p>Algunos de estos proveedores procesan datos fuera de la Argentina, principalmente en Estados Unidos. Estas transferencias se realizan en el marco de los servicios contratados y de las garantías que cada proveedor ofrece en sus condiciones. <LegalValue value={null} hint="validar con asesoría legal el mecanismo de transferencia aplicable según la Ley 25.326" /></p>

      <h2>6. Plazos de conservación</h2>
      <ul>
        <li><strong>Carrito:</strong> permanece en tu navegador hasta que lo vacíes o borres los datos del sitio.</li>
        <li><strong>Conversaciones de WhatsApp:</strong> <LegalValue value={null} hint="definir plazo de conservación de consultas y pedidos" /></li>
        <li><strong>Google Analytics 4:</strong> los datos a nivel de usuario y evento se conservan durante <LegalValue value={LEGAL.ga4Retention} hint="período configurado en GA4" />; los informes agregados pueden mantenerse por más tiempo.</li>
        <li><strong>Datos técnicos de alojamiento:</strong> según los plazos del proveedor de hosting.</li>
      </ul>

      <h2>7. Tus derechos</h2>
      <p>Podés solicitar el acceso, la rectificación, la actualización y la supresión de tus datos personales, así como retirar el consentimiento otorgado. Para retirar el consentimiento de analítica alcanza con usar <CookieSettingsButton className="underline underline-offset-2 hover:text-ink">Configurar cookies</CookieSettingsButton>.</p>
      <p>Para ejercer los demás derechos, escribinos a <LegalValue value={LEGAL.privacyEmail} hint="correo de contacto" /> o por WhatsApp indicando qué solicitás. Podemos pedirte que acredites tu identidad. Responderemos dentro de los plazos legales: 10 días corridos para el acceso y 5 días hábiles para la rectificación, actualización o supresión (arts. 14 y 16 de la Ley 25.326).</p>
      <p>El titular de los datos personales tiene la facultad de ejercer el derecho de acceso a los mismos en forma gratuita a intervalos no inferiores a seis meses, salvo que se acredite un interés legítimo al efecto conforme lo establecido en el artículo 14, inciso 3 de la Ley N° 25.326. La AGENCIA DE ACCESO A LA INFORMACIÓN PÚBLICA, en su carácter de Órgano de Control de la Ley N° 25.326, tiene la atribución de atender las denuncias y reclamos que interpongan quienes resulten afectados en sus derechos por incumplimiento de las normas vigentes en materia de protección de datos personales. Más información en <a href="https://www.argentina.gob.ar/aaip" target="_blank" rel="noopener noreferrer">argentina.gob.ar/aaip</a>.</p>

      <h2>8. Seguridad</h2>
      <p>El sitio se sirve exclusivamente por HTTPS, el panel de administración requiere autenticación y está excluido de los buscadores, y las claves de servicio se guardan solo del lado del servidor. Ningún sistema es completamente infalible, pero aplicamos medidas razonables para proteger la información.</p>

      <h2>9. Menores de edad</h2>
      <p>El sitio no está dirigido a menores de 18 años y no recopilamos intencionalmente sus datos. Los pedidos deben ser realizados por personas mayores de edad.</p>

      <h2>10. Cambios en esta política</h2>
      <p>Podemos actualizar esta política. Publicaremos la versión vigente en esta página con su fecha de actualización. Si cambian las finalidades o las herramientas de analítica, te volveremos a pedir tu consentimiento.</p>

      <h2>11. Contacto</h2>
      <p>Por consultas sobre privacidad: <LegalValue value={LEGAL.privacyEmail} hint="correo de contacto" />. También podés escribirnos desde la página de <Link href="/contacto">contacto</Link>. Para el detalle de cookies, consultá la <Link href="/politica-de-cookies">política de cookies</Link>.</p>
    </LegalPage>
  );
}
