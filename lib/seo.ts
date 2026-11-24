import type { Metadata } from 'next';
import { SITE } from './site';

export const DEFAULT_SOCIAL_IMAGE = {
  url: '/og/viento-sur-og.jpg',
  width: 1200,
  height: 630,
  alt: 'Lámpara de pie Viento Sur encendida en un ambiente cálido',
  type: 'image/jpeg',
};

export function absoluteUrl(path = '/'): string {
  return new URL(path, SITE.url).toString();
}

interface PageMetadataInput {
  /** Título sin la marca: el template del layout agrega " | Viento Sur". */
  title: string;
  description: string;
  path: string;
  image?: { url: string; alt: string; width?: number; height?: number };
  noindex?: boolean;
  /** Título completo para usar en redes (por defecto, `${title} | Viento Sur`). */
  socialTitle?: string;
}

/**
 * Metadata completa por página: canonical, Open Graph y Twitter propios.
 * Next reemplaza (no fusiona) los objetos openGraph/twitter del layout, así que
 * cada página indexable debe declararlos para no heredar URL y título de la home.
 */
export function pageMetadata({ title, description, path, image, noindex, socialTitle }: PageMetadataInput): Metadata {
  const url = absoluteUrl(path);
  const fullTitle = socialTitle ?? `${title} | ${SITE.name}`;
  const images = [image ?? DEFAULT_SOCIAL_IMAGE];
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { type: 'website', locale: 'es_AR', siteName: SITE.name, title: fullTitle, description, url, images },
    twitter: { card: 'summary_large_image', title: fullTitle, description, images: images.map(i => i.url) },
    robots: noindex ? { index: false, follow: true } : undefined,
  };
}

/* ───────────── Datos estructurados (Schema.org JSON-LD) ───────────── */

const ORG_ID = () => absoluteUrl('/#organization');

export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': ORG_ID(),
    name: SITE.name,
    url: absoluteUrl('/'),
    logo: absoluteUrl('/brand/logo-wordmark-navy.png'),
    description: SITE.description,
    address: { '@type': 'PostalAddress', addressLocality: SITE.locality, addressRegion: SITE.region, addressCountry: SITE.country },
    sameAs: SITE.instagram ? [SITE.instagram] : undefined,
  };
}

export function websiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': absoluteUrl('/#website'),
    name: SITE.name,
    url: absoluteUrl('/'),
    inLanguage: 'es-AR',
    publisher: { '@id': ORG_ID() },
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem', position: index + 1, name: item.name, item: absoluteUrl(item.path),
    })),
  };
}

interface ProductJsonLdInput {
  name: string; slug: string; description: string; price: number; images: string[]; category: string;
}

/**
 * Product + Offer. No se declara `availability` ni reseñas: el sitio no publica
 * stock ni opiniones verificables (la disponibilidad se confirma por WhatsApp).
 */
export function productJsonLd(product: ProductJsonLdInput) {
  const url = absoluteUrl(`/productos/${product.slug}`);
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${url}#product`,
    name: product.name,
    description: product.description,
    image: product.images,
    category: product.category,
    url,
    brand: { '@type': 'Brand', name: SITE.name },
    manufacturer: { '@id': ORG_ID() },
    offers: {
      '@type': 'Offer',
      url,
      price: product.price.toFixed(2),
      priceCurrency: 'ARS',
      seller: { '@id': ORG_ID() },
    },
  };
}

/** Serializa JSON-LD escapando `<` para que no pueda cerrar el <script>. */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
