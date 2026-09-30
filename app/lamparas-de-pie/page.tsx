import type { Metadata } from 'next';
import CollectionView from '@/components/CollectionView';
import { getProductsByCategory } from '@/data/products';

export const metadata: Metadata = {
  title: 'Lámparas de pie',
  description:
    'Lámparas de pie de diseño Viento Sur: estructuras de hierro y pantallas que difunden una luz blanca cálida, ideales para acompañar sillones y rincones de lectura.',
  alternates: { canonical: '/lamparas-de-pie' },
};

export default function LamparasDePiePage() {
  return (
    <CollectionView
      eyebrow="Colección"
      title="Lámparas de pie"
      subtitle="Piezas de gran presencia para iluminar y acompañar los espacios de estar."
      products={getProductsByCategory('lampara-de-pie')}
    />
  );
}
