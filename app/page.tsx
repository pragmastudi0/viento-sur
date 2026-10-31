import Link from 'next/link';
import Hero from '@/components/Hero';
import ProductGrid from '@/components/ProductGrid';
import CustomProducts from '@/components/CustomProducts';
import WhyVientoSur from '@/components/WhyVientoSur';
import { getPublishedProducts } from '@/lib/catalog';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  let products: Awaited<ReturnType<typeof getPublishedProducts>> = [];
  let catalogError = false;
  try {
    products = await getPublishedProducts();
  } catch (error) {
    catalogError = true;
    console.error('Home catalog unavailable', error);
  }
  return (
    <>
      <Hero />

      <section className="container-page py-16 sm:py-24">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-xl">
            <p className="label">Nuestra colección</p>
            <h2 className="mt-3 font-display text-3xl font-light leading-tight text-ink sm:text-4xl">
              Lámparas que dan carácter al ambiente.
            </h2>
          </div>
          {!catalogError && (
            <Link href="/catalogo" className="link-quiet">
              Ver toda la colección
            </Link>
          )}
        </header>

        <div className="mt-12">
          {catalogError ? (
            <p role="alert" className="text-sm text-ink/70">
              No pudimos cargar la colección. Volvé a intentar en unos minutos.
            </p>
          ) : (
            <ProductGrid products={products} priorityCount={3} />
          )}
        </div>
      </section>

      <CustomProducts />

      <WhyVientoSur />
    </>
  );
}
