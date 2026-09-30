import type { MetadataRoute } from 'next';
import { SITE } from '@/lib/site';
import { getAllSlugs } from '@/data/products';

export default function sitemap(): MetadataRoute.Sitemap {
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

  const productRoutes = getAllSlugs().map((slug) => ({
    url: `${base}/productos/${slug}`,
    lastModified: now,
  }));

  return [...staticRoutes, ...productRoutes];
}
