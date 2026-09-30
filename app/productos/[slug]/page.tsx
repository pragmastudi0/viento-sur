import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ProductGallery from '@/components/ProductGallery';
import ProductDetails from '@/components/ProductDetails';
import { waLink, customInquiryMessage } from '@/lib/whatsapp';
import { WhatsAppIcon } from '@/components/icons';
import { getProductBySlug, getAllSlugs, CATEGORIES } from '@/data/products';

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  const product = getProductBySlug(params.slug);
  if (!product) {
    return { title: 'Producto no encontrado' };
  }
  return {
    title: product.name,
    description: product.description,
    alternates: { canonical: `/productos/${product.slug}` },
    openGraph: {
      title: `${product.name} | Viento Sur`,
      description: product.description,
      images: [{ url: product.images[0].src }],
    },
  };
}

const CATEGORY_HREF: Record<string, string> = {
  'lampara-de-pie': '/lamparas-de-pie',
  velador: '/veladores',
};

export default function ProductPage({
  params,
}: {
  params: { slug: string };
}) {
  const product = getProductBySlug(params.slug);
  if (!product) {
    notFound();
  }

  const category = CATEGORIES.find((c) => c.slug === product.category);
  const categoryHref = CATEGORY_HREF[product.category] ?? '/catalogo';

  return (
    <div className="container-page py-8 sm:py-12">
      {/* Breadcrumb */}
      <nav aria-label="Migas de pan" className="text-sm text-ink/50">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li>
            <Link href="/" className="transition-colors hover:text-ink">
              Inicio
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link href={categoryHref} className="transition-colors hover:text-ink">
              {category?.plural ?? 'Catálogo'}
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="text-ink/80">{product.name}</li>
        </ol>
      </nav>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
        <ProductGallery images={product.images} />
        <div className="lg:pt-4">
          <ProductDetails product={product} />
        </div>
      </div>

      {/* CTA personalizados */}
      <section className="mt-20 border-t border-ink/10 pt-12 sm:mt-28">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-xl">
            <h2 className="font-display text-2xl font-light text-ink">
              ¿Buscás algo diferente?
            </h2>
            <p className="mt-2 text-base leading-relaxed text-ink/65">
              Podemos adaptar la terminación de la estructura y las pantallas, o
              crear un modelo a medida para tu espacio.
            </p>
          </div>
          <a
            href={waLink(customInquiryMessage())}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-whatsapp btn-lg shrink-0"
          >
            <WhatsAppIcon />
            Consultar personalizado
          </a>
        </div>
      </section>
    </div>
  );
}
