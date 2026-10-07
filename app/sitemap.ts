import type { MetadataRoute } from 'next';
import { SITE } from '@/lib/site';
import { getPublishedProducts } from '@/lib/catalog';
export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = SITE.url.replace(/\/$/, '');
  const now = new Date();

  const staticRoutes = [
    '',
    '/catalogo',
    '/lamparas-de-pie',
    '/veladores',
    '/personalizados',
    '/contacto',
  ].map((path) => ({
    url: `${base}${path}`,
    lastModified: now,
  }));

  const productRoutes = (await getPublishedProducts()).map((product) => ({
    url: `${base}/productos/${product.slug}`,
    lastModified: new Date(product.updatedAt),
  }));

  return [...staticRoutes, ...productRoutes];
}
