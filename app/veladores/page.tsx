import type { Metadata } from 'next';
import CollectionView from '@/components/CollectionView';
import { getPublishedProducts } from '@/lib/catalog';

export const metadata: Metadata = {
  title: 'Veladores',
  description:
    'Veladores de diseño Viento Sur: lámparas de mesa con base de hierro y luz blanca cálida, perfectas para mesas de luz, escritorios y ambientes íntimos.',
  alternates: { canonical: '/veladores' },
};

export const dynamic = 'force-dynamic';

export default async function VeladoresPage() {
  const products = await getPublishedProducts('velador');
  return (
    <CollectionView
      eyebrow="Colección"
      title="Veladores"
      subtitle="Lámparas de mesa que suman una luz cálida y cercana a cualquier rincón."
      products={products}
    />
  );
}
