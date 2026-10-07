import type { MetadataRoute } from 'next';
import { SITE } from '@/lib/site';
import { getActiveCategories } from '@/lib/categories';
import { categoryHref } from '@/lib/category-types';
import { getPublishedProducts } from '@/lib/catalog';
export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = SITE.url.replace(/\/$/, '');
  const now = new Date();

  const staticRoutes = [
    '',
    '/catalogo',
    '/personalizados',
    '/contacto',
  ].map((path) => ({
    url: `${base}${path}`,
    lastModified: now,
  }));

  const [products, categories] = await Promise.all([getPublishedProducts(), getActiveCategories()]);
  const categoryRoutes = categories.map(category => ({ url: `${base}${categoryHref(category)}`, lastModified: new Date(category.updatedAt) }));
  const productRoutes = products.map((product) => ({
    url: `${base}/productos/${product.slug}`,
    lastModified: new Date(product.updatedAt),
  }));

  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}
