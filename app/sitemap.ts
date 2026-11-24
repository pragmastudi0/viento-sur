import type { MetadataRoute } from 'next';
import { SITE } from '@/lib/site';
import { LEGAL, LEGAL_LINKS } from '@/lib/legal';
import { getActiveCategories } from '@/lib/categories';
import { categoryHref } from '@/lib/category-types';
import { getPublishedProducts } from '@/lib/catalog';
export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = SITE.url.replace(/\/$/, '');

  // Sin lastModified en rutas estáticas: una fecha “ahora” en cada request es una señal falsa para los buscadores.
  const staticPaths = ['', '/catalogo', '/nosotros', '/personalizados', '/contacto'];
  // Las páginas legales entran al sitemap recién cuando dejan de estar en revisión (antes son noindex).
  if (!LEGAL.pendingReview) staticPaths.push(...LEGAL_LINKS.map(link => link.href));
  const staticRoutes: MetadataRoute.Sitemap = staticPaths.map(path => ({ url: `${base}${path}` }));

  try {
    const [products, categories] = await Promise.all([getPublishedProducts(), getActiveCategories()]);
    const categoryRoutes = categories.map(category => ({ url: `${base}${categoryHref(category)}`, lastModified: new Date(category.updatedAt) }));
    const productRoutes = products.map(product => ({
      url: `${base}/productos/${product.slug}`,
      lastModified: new Date(product.updatedAt),
      images: product.images.map(image => image.src),
    }));
    return [...staticRoutes, ...categoryRoutes, ...productRoutes];
  } catch (error) {
    // Si el catálogo no responde, se sirve al menos el sitemap estático en lugar de un 500.
    console.error('Sitemap catalog unavailable', error);
    return staticRoutes;
  }
}
