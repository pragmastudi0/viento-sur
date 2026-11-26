import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import { WhatsAppIcon } from '@/components/icons';
import { CARE_MANUAL_PDF, CARE_PAGE, LEGAL, WARRANTY } from '@/lib/legal';
import { breadcrumbJsonLd, pageMetadata } from '@/lib/seo';
import { generalInquiryMessage, waLink } from '@/lib/whatsapp';

export const metadata: Metadata = pageMetadata({
  title: CARE_PAGE.label,
  description: `Garantía de ${WARRANTY.months} meses e indicaciones de uso y cuidado de las lámparas y veladores Viento Sur: calor, cableado, sol, focos LED, instalación y limpieza.`,
  path: CARE_PAGE.href,
});

/** Contenido textual del “Manual de cuidados” entregado por Viento Sur (public/manual-de-cuidados-viento-sur.pdf). */
const CARE = [
  {
    title: 'Temperatura y fuentes de calor',
    body: ['Mantené la lámpara alejada de fuentes de calor directo como hogares, estufas, radiadores o calefactores.'],
  },
  {
    title: 'Cuidado del cableado',
    body: [
      'Desenchufá siempre tomando la ficha del tomacorriente, no tires del cable.',
      'Procurá que el cable no sea aplastado, pisado u obstruido debajo de muebles u objetos pesados.',
    ],
  },
  {
    title: 'Exposición solar y efecto lupa',
    body: [
      'Ubicá tu lámpara en espacios donde reciba luz solar indirecta o filtrada (mediante cortinas).',
      'Evitá rotundamente la exposición a la luz solar directa, especialmente a través de vidrios o ventanas, para prevenir el efecto lupa, el cual acelera el sobrecalentamiento y deterioro de la pantalla.',
    ],
  },
  {
    title: 'Elección y cambio de foco',
    body: [
      'Realizá el cambio de foco siempre con la lámpara desenchufada.',
      'En los modelos Lanín y Traful, sujetá firmemente el portalámparas con una mano al girar el foco, así evitás girar el cable.',
      'Utilizá exclusivamente focos LED. No son recomendadas las bombillas incandescentes ni halógenas.',
    ],
  },
  {
    title: 'Instalación eléctrica',
    body: ['Asegurá que la conexión de 220 V donde se enchufe la lámpara cuente con protección de llave termomagnética y disyuntor diferencial.'],
  },
  {
    title: 'Limpieza y mantenimiento',
    body: [
      'Para el polvo diario, limpiá con un plumero suave, paño de microfibra seco o pincel de cerdas blandas.',
      'Para manchas leves, usá un paño apenas humedecido con agua fría o tibia y jabón neutro o Cif crema. No utilices alcohol, acetona ni productos abrasivos o solventes.',
    ],
  },
];

export default function CarePage() {
  return (
    <article className="container-page py-16 sm:py-20">
      <JsonLd data={breadcrumbJsonLd([{ name: 'Inicio', path: '/' }, { name: CARE_PAGE.label, path: CARE_PAGE.href }])} />

      <header className="max-w-3xl">
        <p className="label">Postventa</p>
        <h1 className="mt-3 font-display text-3xl font-light leading-tight text-ink sm:text-4xl">
          ¿Cómo cuidar tus lámparas y veladores?
        </h1>
        <p className="mt-5 text-base leading-relaxed text-ink/70">
          ¡Gracias por elegir nuestras lámparas! Cada pieza está fabricada y pensada para que puedas iluminar y aportar
          calidez a tus ambientes. Para garantizar su durabilidad y correcto funcionamiento, tené en cuenta las siguientes
          recomendaciones.
        </p>
      </header>

      <section aria-labelledby="garantia" className="mt-12 max-w-3xl border-y border-ink/10 py-8">
        <p className="label">{WARRANTY.months} meses</p>
        <h2 id="garantia" className="mt-2 font-display text-2xl font-light text-ink">Garantía</h2>
        <p className="mt-3 text-base leading-relaxed text-ink/75">{WARRANTY.text}</p>
        <p className="mt-3 text-base leading-relaxed text-ink/75">
          Para hacer una consulta de garantía, escribinos por WhatsApp
          {LEGAL.privacyEmail && (
            <> o a <a href={`mailto:${LEGAL.privacyEmail}`} className="underline underline-offset-2 hover:text-ink">{LEGAL.privacyEmail}</a></>
          )}
          .
        </p>
        <a
          href={waLink(generalInquiryMessage())}
          target="_blank"
          rel="noopener noreferrer"
          data-analytics-location="care_page"
          className="btn-whatsapp btn-md mt-5"
        >
          <WhatsAppIcon size={16} />
          Consultar por WhatsApp
        </a>
      </section>

      <section aria-labelledby="indicaciones" className="mt-12">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <h2 id="indicaciones" className="font-display text-2xl font-light text-ink">Indicaciones de uso y cuidado</h2>
          <a href={CARE_MANUAL_PDF} download className="btn-outline btn-md self-start sm:self-auto">
            Descargar el manual (PDF)
          </a>
        </div>
        <ol className="mt-8 grid gap-x-12 border-t border-ink/10 md:grid-cols-2">
          {CARE.map((item, index) => (
            <li key={item.title} className="border-b border-ink/10 py-7">
              <div className="flex gap-5">
                <span aria-hidden="true" className="font-display text-sm text-sage-deep">{String(index + 1).padStart(2, '0')}</span>
                <div>
                  <h3 className="font-display text-xl font-light text-ink">{item.title}</h3>
                  <div className="mt-2.5 space-y-2 text-[0.95rem] leading-relaxed text-ink/70">
                    {item.body.map(text => <p key={text}>{text}</p>)}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </article>
  );
}
