import type { Metadata } from 'next';
import CollectionView from '@/components/CollectionView';
import { getActiveCategories } from '@/lib/categories';
import { getPublishedProducts } from '@/lib/catalog';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Catálogo de lámparas de diseño',
  description:
    'Toda la colección de lámparas de Viento Sur, diseñadas y fabricadas en Córdoba: lámparas de pie y veladores con luz cálida y estructuras en negro, grafito o bronce.',
  path: '/catalogo',
});

export const dynamic = 'force-dynamic';

export default async function CatalogoPage() {
  const [products, categories] = await Promise.all([getPublishedProducts(), getActiveCategories()]);
  return (
    <CollectionView
      eyebrow="Colección"
      title="Toda la colección"
      subtitle="Lámparas pensadas para aportar calidez y diseño a cada ambiente."
      products={products}
      categories={categories}
    />
  );
}
