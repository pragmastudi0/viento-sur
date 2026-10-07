import { getActiveCategories } from '@/lib/categories';
import type { Category } from '@/lib/category-types';
import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import { SITE } from '@/lib/site';
import { CartProvider } from '@/context/CartContext';
import { ToastProvider } from '@/context/ToastContext';
import SiteChrome from '@/components/SiteChrome';

const display = localFont({
  src: [
    { path: './fonts/fraunces-latin-normal.woff2', weight: '100 900', style: 'normal' },
    { path: './fonts/fraunces-latin-italic.woff2', weight: '100 900', style: 'italic' },
  ],
  display: 'swap',
  variable: '--font-display',
  adjustFontFallback: 'Times New Roman',
});

const sans = localFont({
  src: './fonts/mulish-latin-normal.woff2',
  weight: '200 1000',
  style: 'normal',
  display: 'swap',
  variable: '--font-sans',
});

const script = localFont({
  src: './fonts/caveat-latin-normal.woff2',
  weight: '600 700',
  style: 'normal',
  display: 'swap',
  variable: '--font-script',
});

// Navigation must reflect category changes on every request.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: 'Viento Sur | Lámparas de diseño',
    template: '%s | Viento Sur',
  },
  description: SITE.description,
  keywords: [
    'lámparas de pie',
    'veladores',
    'lámparas de diseño',
    'iluminación',
    'Viento Sur',
    'Argentina',
  ],
  authors: [{ name: 'Viento Sur' }],
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'es_AR',
    siteName: 'Viento Sur',
    title: 'Viento Sur | Lámparas de diseño',
    description: SITE.description,
    url: SITE.url,
    images: [
      {
        url: '/og.jpg',
        width: 1200,
        height: 630,
        alt: 'Viento Sur — Iluminación que transforma espacios',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Viento Sur | Lámparas de diseño',
    description: SITE.description,
    images: ['/og.jpg'],
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let categories: Category[] = []; let categoryError = false;
  try { categories = await getActiveCategories(); } catch { categoryError = true; console.error('Public category navigation unavailable'); }
  return (
    <html
      lang="es"
      className={`${display.variable} ${sans.variable} ${script.variable}`}
    >
      <body className="min-h-screen">
        <ToastProvider>
          <CartProvider>
            <a
              href="#contenido"
              className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[70] focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-sm focus:text-cream"
            >
              Saltar al contenido
            </a>
            <SiteChrome categories={categories} categoryError={categoryError}>{children}</SiteChrome>
          </CartProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
