import Image from 'next/image';
import Link from 'next/link';
import { SITE } from '@/lib/site';
import { waLink, generalInquiryMessage } from '@/lib/whatsapp';
import { WhatsAppIcon } from './icons';

export default function Hero() {
  return (
    <section className="relative flex h-[88vh] min-h-[560px] max-h-[900px] w-full items-end overflow-hidden">
      <Image
        src="/products/hero.jpg"
        alt="Lámpara de pie Lanin encendida junto a un sillón en un ambiente cálido"
        fill
        priority
        sizes="100vw"
        className="object-cover object-[60%_center]"
      />
      {/* Overlay sutil solo para legibilidad del texto, anclado abajo/izquierda. */}
      <div className="absolute inset-0 bg-gradient-to-t from-ink-deep/70 via-ink-deep/10 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-ink-deep/40 to-transparent" />

      <div className="container-page relative z-10 pb-14 sm:pb-20">
        <div className="max-w-xl animate-fade-up">
          <h1 className="font-display text-4xl font-light leading-[1.05] text-cream sm:text-5xl lg:text-6xl">
            {SITE.tagline}
          </h1>
          <p className="mt-5 max-w-md text-base leading-relaxed text-cream/85 sm:text-lg">
            Lámparas diseñadas para aportar calidez, diseño y personalidad a
            cada ambiente.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href="/catalogo" className="btn bg-cream text-ink hover:bg-white btn-lg">
              Ver colección
            </Link>
            <a
              href={waLink(generalInquiryMessage())}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-lg border border-cream/40 text-cream hover:bg-cream hover:text-ink"
            >
              <WhatsAppIcon />
              Consultar por WhatsApp
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
