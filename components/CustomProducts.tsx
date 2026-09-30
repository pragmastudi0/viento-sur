import Image from 'next/image';
import { waLink, customInquiryMessage } from '@/lib/whatsapp';
import { WhatsAppIcon } from './icons';

export default function CustomProducts() {
  return (
    <section className="bg-sage-tint">
      <div className="container-page grid items-stretch gap-0 py-0 lg:grid-cols-2">
        <div className="relative min-h-[340px] overflow-hidden lg:min-h-[560px]">
          <Image
            src="/products/custom-1.jpg"
            alt="Lámpara de pie de brazo curvo sobre un sillón, junto a cortinas translúcidas"
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
        </div>

        <div className="flex flex-col justify-center px-5 py-14 sm:px-10 lg:px-16 lg:py-20">
          <p className="label">Personalizados</p>
          <h2 className="mt-3 font-display text-3xl font-light leading-tight text-ink sm:text-4xl">
            Hecho para tu espacio.
          </h2>
          <div className="mt-6 space-y-4 text-base leading-relaxed text-ink/70">
            <p>
              Las estructuras de hierro pueden elegirse en{' '}
              <span className="text-ink">negro, grafito o bronce</span>, para
              que cada lámpara acompañe la paleta de tu ambiente.
            </p>
            <p>
              Las pantallas pueden adaptarse tanto para veladores como para
              lámparas de pie, y también realizamos modelos personalizados según
              lo que estés buscando.
            </p>
          </div>
          <div className="mt-8">
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
        </div>
      </div>
    </section>
  );
}
