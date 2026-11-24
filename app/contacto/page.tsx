import type { Metadata } from 'next';
import { SITE, WHATSAPP_DISPLAY } from '@/lib/site';
import { waLink, generalInquiryMessage } from '@/lib/whatsapp';
import { WhatsAppIcon } from '@/components/icons';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Contacto',
  description:
    'Comunicate con Viento Sur por WhatsApp para consultas sobre lámparas, pedidos, tiempos de entrega y formas de pago. Diseñamos y fabricamos en Córdoba, Argentina.',
  path: '/contacto',
});

export default function ContactoPage() {
  return (
    <section className="container-page py-16 sm:py-24">
      <div className="max-w-2xl">
        <p className="label">Contacto</p>
        <h1 className="mt-3 font-display text-3xl font-light leading-tight text-ink sm:text-4xl">
          Hablemos sobre tu próxima lámpara.
        </h1>
        <p className="mt-4 text-base leading-relaxed text-ink/65">
          Escribinos por WhatsApp para consultar por cualquier modelo, coordinar
          un pedido o resolver dudas sobre tiempos de entrega y formas de pago.
          Te respondemos a la brevedad.
        </p>
        <p className="mt-3 text-base leading-relaxed text-ink/65">
          Diseñamos y fabricamos nuestras lámparas en Córdoba Capital, Argentina.
        </p>

        <div className="mt-8 flex flex-col items-start gap-4" data-analytics-location="contact_page">
          <a
            href={waLink(generalInquiryMessage())}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-whatsapp btn-lg"
          >
            <WhatsAppIcon />
            Escribir por WhatsApp
          </a>
          <p className="text-sm text-ink/60">
            WhatsApp:{' '}
            <span className="text-ink">{WHATSAPP_DISPLAY}</span>
          </p>
          {SITE.instagram && (
            <p className="text-sm text-ink/60">
              Instagram:{' '}
              <a
                href={SITE.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="link-quiet"
              >
                {SITE.instagramHandle}
              </a>
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
