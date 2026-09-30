import type { Metadata } from 'next';
import CollectionView from '@/components/CollectionView';
import { products } from '@/data/products';

export const metadata: Metadata = {
  title: 'Catálogo',
  description:
    'Toda la colección de lámparas de pie y veladores de Viento Sur. Diseño artesanal, luz blanca cálida y estructuras en distintas terminaciones.',
  alternates: { canonical: '/catalogo' },
};

export default function CatalogoPage() {
  return (
    <CollectionView
      eyebrow="Colección"
      title="Toda la colección"
      subtitle="Lámparas de pie y veladores, pensados para aportar calidez y diseño a cada ambiente."
      products={products}
    />
  );
}
