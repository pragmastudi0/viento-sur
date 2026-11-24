import { getActiveCategories } from '@/lib/categories';
import type { Category } from '@/lib/category-types';
import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import { SITE } from '@/lib/site';
import { DEFAULT_SOCIAL_IMAGE } from '@/lib/seo';
import { consentBootstrapScript, gaMeasurementId } from '@/lib/consent';
import { ConsentProvider } from '@/components/consent/ConsentProvider';
import { CartProvider } from '@/context/CartContext';
import { ToastProvider } from '@/context/ToastContext';
import SiteChrome from '@/components/SiteChrome';

const HOME_TITLE = 'Viento Sur | Lámparas de diseño hechas en Córdoba';
const GA_ID = gaMeasurementId();
const GOOGLE_SITE_VERIFICATION = process.env.GOOGLE_SITE_VERIFICATION?.trim() || undefined;

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

// Valores por defecto del sitio. El canonical NO se define acá: cada página
// declara el suyo (ver lib/seo.ts) para no heredar el de la home.
export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: HOME_TITLE,
    template: '%s | Viento Sur',
  },
  description: SITE.description,
  applicationName: SITE.name,
  authors: [{ name: SITE.name }],
  creator: SITE.name,
  formatDetection: { telephone: false, email: false, address: false },
  verification: GOOGLE_SITE_VERIFICATION ? { google: GOOGLE_SITE_VERIFICATION } : undefined,
  openGraph: {
    type: 'website',
    locale: 'es_AR',
    siteName: SITE.name,
    title: HOME_TITLE,
    description: SITE.description,
    images: [DEFAULT_SOCIAL_IMAGE],
  },
  twitter: {
    card: 'summary_large_image',
    title: HOME_TITLE,
    description: SITE.description,
    images: [DEFAULT_SOCIAL_IMAGE.url],
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
      lang="es-AR"
      className={`${display.variable} ${sans.variable} ${script.variable}`}
    >
      <head>
        {/* Consent Mode v2: valores por defecto ANTES de cualquier etiqueta de Google. */}
        <script id="consent-default" dangerouslySetInnerHTML={{ __html: consentBootstrapScript() }} />
      </head>
      <body className="min-h-screen">
        <ConsentProvider gaId={GA_ID}>
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
        </ConsentProvider>
      </body>
    </html>
  );
}
