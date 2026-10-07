import type { Metadata } from 'next';
import CollectionView from '@/components/CollectionView';
import { getActiveCategories } from '@/lib/categories';
import { getPublishedProducts } from '@/lib/catalog';

export const metadata: Metadata = {
  title: 'Catálogo',
  description:
    'Toda la colección de lámparas de Viento Sur. Diseño artesanal, luz blanca cálida y estructuras en distintas terminaciones.',
  alternates: { canonical: '/catalogo' },
};

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
