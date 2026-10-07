import type { Metadata } from 'next';
import CollectionView from './CollectionView';
import { getActiveCategories } from '@/lib/categories';
import { getPublishedProducts } from '@/lib/catalog';
import { categoryHref, type Category } from '@/lib/category-types';

export function categoryMetadata(category: Category): Metadata {
  return { title: category.name, description: category.description || `Conocé ${category.name} de Viento Sur. Diseño artesanal para iluminar tus espacios.`,
    alternates: { canonical: categoryHref(category) },
    robots: category.isActive ? undefined : { index: false, follow: true } };
}
export default async function CategoryCollection({ category }: { category: Category }) {
  if (!category.isActive) return <div className="container-page py-16"><h1 className="font-display text-3xl">{category.name}</h1><p className="mt-4 text-ink/65">Esta colección no está disponible por el momento.</p></div>;
  const [products, categories] = await Promise.all([getPublishedProducts(category.id), getActiveCategories()]);
  return <CollectionView eyebrow="Colección" title={category.name} subtitle={category.description} products={products} categories={categories} categoryId={category.id} />;
}
