import Image from 'next/image';

// Detalle real de una pantalla. Reemplazar por una foto del proceso cuando esté disponible.
const STORY_IMAGE = '/products/lanin-2.jpg';

export default function BrandStorySection() {
  return (
    <section aria-labelledby="brand-story-title" className="container-page py-16 sm:py-24">
      <div className="grid gap-8 sm:gap-10 lg:grid-cols-2 lg:items-center lg:gap-x-16">
        <header className="lg:col-start-1 lg:row-start-1">
          <p className="label">Viento Sur</p>
          <h1
            id="brand-story-title"
            className="mt-3 max-w-lg font-display text-3xl font-light leading-tight text-ink sm:text-4xl"
          >
            Diseñadas y fabricadas en Córdoba
          </h1>
        </header>

        <figure className="relative aspect-[4/5] overflow-hidden sm:aspect-[5/4] lg:col-start-2 lg:row-span-3 lg:row-start-1 lg:aspect-[4/5]">
          <Image
            src={STORY_IMAGE}
            alt="Detalle de la textura de una pantalla de lámpara Viento Sur impresa en PLA"
            fill
            sizes="(min-width: 1024px) 45vw, (min-width: 640px) 90vw, 100vw"
            className="object-cover object-[center_35%]"
          />
        </figure>

        <div className="max-w-xl space-y-4 text-base leading-relaxed text-ink/70 lg:col-start-1 lg:row-start-2">
          <p>
            Viento Sur es una marca de iluminación de Córdoba Capital. Diseñamos
            lámparas y objetos de luz que combinan estructuras simples,
            materiales nobles y piezas impresas en 3D.
          </p>
          <p>
            Cada modelo nace de una idea, se desarrolla digitalmente y se fabrica
            localmente, capa por capa. Trabajamos principalmente con PLA y
            distintos materiales para crear formas, texturas y volúmenes que le
            den identidad a cada lámpara.
          </p>
          <p>
            Buscamos hacer piezas funcionales y cálidas, pensadas para acompañar
            distintos ambientes y convertirse en parte del espacio.
          </p>
        </div>

        <p className="border-t border-ink/15 pt-6 font-display text-2xl font-light leading-snug text-ink sm:text-3xl lg:col-start-1 lg:row-start-3">
          <span className="block">Diseñadas en Córdoba.</span>
          <span className="block">Impresas en 3D.</span>
          <span className="block">Fabricadas localmente.</span>
        </p>
      </div>
    </section>
  );
}
