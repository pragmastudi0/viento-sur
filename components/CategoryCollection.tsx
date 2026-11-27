import type { Metadata } from 'next';
import CollectionView from './CollectionView';
import { getActiveCategories } from '@/lib/categories';
import { getPublishedProducts } from '@/lib/catalog';
import { categoryHref, type Category } from '@/lib/category-types';
import { breadcrumbJsonLd, pageMetadata } from '@/lib/seo';
import JsonLd from './JsonLd';

export function categoryMetadata(category: Category): Metadata {
  return pageMetadata({
    title: category.name,
    description: category.description || `${category.name} de diseño de Viento Sur, fabricadas en Córdoba. Elegí la terminación de la estructura y consultá por WhatsApp.`,
    path: categoryHref(category),
    noindex: !category.isActive,
  });
}
export default async function CategoryCollection({ category }: { category: Category }) {
  if (!category.isActive) return <div className="container-page py-16"><h1 className="font-display text-3xl">{category.name}</h1><p className="mt-4 text-ink/65">Esta colección no está disponible por el momento.</p></div>;
  const [products, categories] = await Promise.all([getPublishedProducts(category.id), getActiveCategories()]);
  const breadcrumb = breadcrumbJsonLd([{ name: 'Inicio', path: '/' }, { name: 'Catálogo', path: '/catalogo' }, { name: category.name, path: categoryHref(category) }]);
  return <><JsonLd data={breadcrumb} /><CollectionView eyebrow="Colección" title={category.name} subtitle={category.description} products={products} categories={categories} categoryId={category.id} /></>;
}
