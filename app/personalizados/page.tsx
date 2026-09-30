import type { Metadata } from 'next';
import CustomProducts from '@/components/CustomProducts';
import { waLink, customInquiryMessage } from '@/lib/whatsapp';
import { WhatsAppIcon } from '@/components/icons';

export const metadata: Metadata = {
  title: 'Personalizados',
  description:
    'Lámparas personalizadas Viento Sur: elegí la terminación de la estructura y adaptamos las pantallas a tu espacio. También realizamos modelos especiales a pedido.',
  alternates: { canonical: '/personalizados' },
};

const STEPS = [
  {
    title: 'Elegís la estructura',
    text: 'Las estructuras de hierro pueden terminarse en negro, grafito o bronce, según la paleta de tu ambiente.',
  },
  {
    title: 'Adaptamos la pantalla',
    text: 'Las pantallas pueden ajustarse tanto para veladores como para lámparas de pie, según la escala que necesites.',
  },
  {
    title: 'Creamos modelos a medida',
    text: 'Si buscás algo distinto, realizamos modelos personalizados a partir de tu idea o referencia.',
  },
];

export default function PersonalizadosPage() {
  return (
    <>
      <section className="container-page py-16 sm:py-20">
        <header className="max-w-2xl">
          <p className="label">Personalizados</p>
          <h1 className="mt-3 font-display text-3xl font-light leading-tight text-ink sm:text-4xl">
            Una lámpara pensada para tu espacio.
          </h1>
          <p className="mt-4 text-base leading-relaxed text-ink/65">
            Cada pieza puede ajustarse para acompañar tu ambiente: desde la
            terminación de la estructura hasta la pantalla. Contanos qué estás
            buscando y lo resolvemos juntos.
          </p>
        </header>

        <div className="mt-12 grid gap-x-10 gap-y-10 sm:grid-cols-3">
          {STEPS.map((step) => (
            <div key={step.title} className="border-t border-ink/15 pt-5">
              <h2 className="font-display text-lg font-normal text-ink">
                {step.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-ink/65">
                {step.text}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-12">
          <a
            href={waLink(customInquiryMessage())}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-whatsapp btn-lg"
          >
            <WhatsAppIcon />
            Consultar modelo personalizado
          </a>
        </div>
      </section>

      <CustomProducts />
    </>
  );
}
