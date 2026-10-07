import type { Metadata } from 'next';
import CollectionView from '@/components/CollectionView';
import { getPublishedProducts } from '@/lib/catalog';

export const metadata: Metadata = {
  title: 'Catálogo',
  description:
    'Toda la colección de lámparas de pie y veladores de Viento Sur. Diseño artesanal, luz blanca cálida y estructuras en distintas terminaciones.',
  alternates: { canonical: '/catalogo' },
};

export const dynamic = 'force-dynamic';

export default async function CatalogoPage() {
  const products = await getPublishedProducts();
  return (
    <CollectionView
      eyebrow="Colección"
      title="Toda la colección"
      subtitle="Lámparas de pie y veladores, pensados para aportar calidez y diseño a cada ambiente."
      products={products}
    />
  );
}
