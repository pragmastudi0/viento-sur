import type { Metadata } from 'next';
import Link from 'next/link';
import BrandStorySection from '@/components/BrandStorySection';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Nosotros: lámparas diseñadas en Córdoba',
  description:
    'Viento Sur diseña y fabrica lámparas en Córdoba Capital. Conocé nuestras piezas impresas en 3D y el cuidado por sus formas, materiales y texturas.',
  path: '/nosotros',
});

export default function NosotrosPage() {
  return (
    <>
      <BrandStorySection />
      <section className="container-page pb-16 sm:pb-24">
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/catalogo" data-cta="nosotros_ver_coleccion" className="btn-primary btn-lg">Ver la colección</Link>
          <Link href="/personalizados" data-cta="nosotros_personalizados" className="btn-outline btn-lg">Lámparas personalizadas</Link>
        </div>
      </section>
    </>
  );
}
